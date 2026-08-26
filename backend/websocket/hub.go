package websocket

import (
	"educast/config"
	"educast/models"
	"encoding/json"
	"log"
	"sync"
)

type Hub struct {
	// Registered clients by user ID
	clients map[uint]*Client

	// Register requests from clients
	register chan *Client

	// Unregister requests from clients
	unregister chan *Client

	// Broadcast messages to specific users
	broadcast chan *Message

	// Mutex for thread-safe operations
	mu sync.RWMutex

	// bountyID -> set of mentor user IDs currently viewing/preparing a bid
	bountyViewers map[uint]map[uint]bool
}

type Message struct {
	Type      string      `json:"type"`
	Payload   interface{} `json:"payload"`
	TargetID  uint        `json:"target_id,omitempty"` // Added for p2p WebRTC signaling
	SenderID  uint        `json:"sender_id,omitempty"` // Added for p2p WebRTC signaling
	TargetIDs []uint      `json:"-"`                   // User IDs to send to (empty = broadcast to all)
}

var GlobalHub *Hub

func NewHub() *Hub {
	return &Hub{
		clients:       make(map[uint]*Client),
		register:      make(chan *Client),
		unregister:    make(chan *Client),
		broadcast:     make(chan *Message, 256),
		bountyViewers: make(map[uint]map[uint]bool),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client.UserID] = client
			h.mu.Unlock()
			log.Printf("Client registered: UserID=%d, Role=%s", client.UserID, client.Role)
			h.broadcastPlatformActivity()

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client.UserID]; ok {
				delete(h.clients, client.UserID)
				close(client.send)
				log.Printf("Client unregistered: UserID=%d", client.UserID)
			}
			affected := make([]uint, 0)
			for bountyID, viewers := range h.bountyViewers {
				if viewers[client.UserID] {
					delete(viewers, client.UserID)
					affected = append(affected, bountyID)
				}
			}
			h.mu.Unlock()
			for _, bountyID := range affected {
				h.broadcastPresenceToMentors(bountyID)
				h.notifyBountyOwner(bountyID)
			}
			h.broadcastPlatformActivity()

		case message := <-h.broadcast:
			if message.Type == "bounty_presence" {
				h.handleBountyPresence(message)
				continue
			}

			messageBytes, err := json.Marshal(message)
			if err != nil {
				log.Printf("Error marshaling message: %v", err)
				continue
			}

			h.mu.RLock()

			targets := message.TargetIDs
			if message.TargetID > 0 {
				targets = append(targets, message.TargetID)
			}

			if len(targets) > 0 {
				// Send to specific users
				for _, userID := range targets {
					if client, ok := h.clients[userID]; ok {
						select {
						case client.send <- messageBytes:
						default:
							close(client.send)
							delete(h.clients, userID)
						}
					}
				}
			} else {
				// Broadcast to all clients
				for userID, client := range h.clients {
					select {
					case client.send <- messageBytes:
					default:
						close(client.send)
						delete(h.clients, userID)
					}
				}
			}
			h.mu.RUnlock()
		}
	}
}

// handleBountyPresence updates the live "who's preparing a bid" set for a
// bounty and re-broadcasts the current count to every mentor plus the
// bounty's own student (via the incoming message's TargetID, which the
// client already sets to the bounty owner).
func (h *Hub) handleBountyPresence(msg *Message) {
	payload, ok := msg.Payload.(map[string]interface{})
	if !ok {
		return
	}
	bountyIDFloat, ok := payload["bounty_id"].(float64)
	if !ok {
		return
	}
	bountyID := uint(bountyIDFloat)
	viewing, _ := payload["viewing"].(bool)

	h.mu.Lock()
	if h.bountyViewers[bountyID] == nil {
		h.bountyViewers[bountyID] = make(map[uint]bool)
	}
	if viewing {
		h.bountyViewers[bountyID][msg.SenderID] = true
	} else {
		delete(h.bountyViewers[bountyID], msg.SenderID)
	}
	h.mu.Unlock()

	h.broadcastPresenceToMentors(bountyID)

	if msg.TargetID > 0 {
		h.sendPresenceTo(bountyID, msg.TargetID)
	}
}

func (h *Hub) presenceUpdateBytes(bountyID uint) []byte {
	h.mu.RLock()
	count := len(h.bountyViewers[bountyID])
	h.mu.RUnlock()

	update := Message{
		Type: "bounty_presence_update",
		Payload: map[string]interface{}{
			"bounty_id": bountyID,
			"count":     count,
		},
	}
	b, err := json.Marshal(update)
	if err != nil {
		return nil
	}
	return b
}

func (h *Hub) broadcastPresenceToMentors(bountyID uint) {
	b := h.presenceUpdateBytes(bountyID)
	if b == nil {
		return
	}
	h.mu.RLock()
	defer h.mu.RUnlock()
	for _, client := range h.clients {
		if client.Role == "Mentor" {
			select {
			case client.send <- b:
			default:
			}
		}
	}
}

// notifyBountyOwner looks up who posted a bounty and sends them the
// current presence count directly. Used on disconnect cleanup, where — unlike
// an explicit presence ping — there's no client-supplied target ID to reuse.
func (h *Hub) notifyBountyOwner(bountyID uint) {
	var bounty models.Bounty
	if err := config.DB.Select("student_id").First(&bounty, bountyID).Error; err != nil {
		return
	}
	h.sendPresenceTo(bountyID, bounty.StudentID)
}

func (h *Hub) sendPresenceTo(bountyID uint, userID uint) {
	b := h.presenceUpdateBytes(bountyID)
	if b == nil {
		return
	}
	h.mu.RLock()
	defer h.mu.RUnlock()
	if client, ok := h.clients[userID]; ok {
		select {
		case client.send <- b:
		default:
		}
	}
}

// broadcastPlatformActivity sends a live "who's around right now" count to
// everyone connected — a real, cheap liveness signal (not a vanity metric)
// that makes the marketplace's own growth visible to its users.
func (h *Hub) broadcastPlatformActivity() {
	h.mu.RLock()
	students := 0
	mentors := 0
	for _, client := range h.clients {
		if client.Role == "Student" {
			students++
		} else if client.Role == "Mentor" {
			mentors++
		}
	}
	h.mu.RUnlock()

	update := Message{
		Type: "platform_activity",
		Payload: map[string]interface{}{
			"students_online": students,
			"mentors_online":  mentors,
		},
	}
	b, err := json.Marshal(update)
	if err != nil {
		return
	}

	h.mu.RLock()
	defer h.mu.RUnlock()
	for _, client := range h.clients {
		select {
		case client.send <- b:
		default:
		}
	}
}

// Broadcast bounty created event to all mentors
func (h *Hub) BroadcastBountyCreated(bounty models.Bounty) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	message := Message{
		Type:    "bounty_created",
		Payload: bounty,
	}

	messageBytes, _ := json.Marshal(message)

	// Send only to mentors
	for _, client := range h.clients {
		if client.Role == "Mentor" {
			select {
			case client.send <- messageBytes:
			default:
				// Client buffer full, skip
			}
		}
	}
}

// Broadcast bid created event to specific student
func (h *Hub) BroadcastBidCreated(bid models.Bid, studentID uint) {
	message := &Message{
		Type:      "bid_created",
		Payload:   bid,
		TargetIDs: []uint{studentID},
	}

	h.broadcast <- message
}

// Broadcast bid accepted event to specific mentor
func (h *Hub) BroadcastBidAccepted(bidID uint, bountyID uint, mentorID uint, studentID uint, roomID string) {
	message := &Message{
		Type: "bid_accepted",
		Payload: map[string]interface{}{
			"bid_id":     bidID,
			"bounty_id":  bountyID,
			"student_id": studentID,
			"room_id":    roomID,
		},
		TargetIDs: []uint{mentorID},
	}

	h.broadcast <- message
}

// BroadcastBidCountered notifies one user that the other side proposed a
// new price on a bid they're party to.
func (h *Hub) BroadcastBidCountered(bid models.Bid, targetUserID uint) {
	message := &Message{
		Type:      "bid_countered",
		Payload:   bid,
		TargetIDs: []uint{targetUserID},
	}
	h.broadcast <- message
}

// BroadcastCounterResolved notifies the side that proposed a counter-offer
// that it was accepted or declined.
func (h *Hub) BroadcastCounterResolved(bid models.Bid, targetUserID uint, accepted bool) {
	message := &Message{
		Type: "bid_counter_resolved",
		Payload: map[string]interface{}{
			"bid":      bid,
			"accepted": accepted,
		},
		TargetIDs: []uint{targetUserID},
	}
	h.broadcast <- message
}

// BroadcastBountyCompleted notifies both sides of a session that the
// student has marked the bounty complete, so the mentor's session view
// and feeds resolve in real time instead of only after a manual reload.
func (h *Hub) BroadcastBountyCompleted(bounty models.Bounty, mentorID uint, studentID uint) {
	message := &Message{
		Type: "bounty_completed",
		Payload: map[string]interface{}{
			"bounty_id": bounty.ID,
			"bounty":    bounty,
		},
		TargetIDs: []uint{mentorID, studentID},
	}
	h.broadcast <- message
}
