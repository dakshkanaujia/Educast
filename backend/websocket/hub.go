package websocket

import (
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
		clients:    make(map[uint]*Client),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		broadcast:  make(chan *Message, 256),
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

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client.UserID]; ok {
				delete(h.clients, client.UserID)
				close(client.send)
				log.Printf("Client unregistered: UserID=%d", client.UserID)
			}
			h.mu.Unlock()

		case message := <-h.broadcast:
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
