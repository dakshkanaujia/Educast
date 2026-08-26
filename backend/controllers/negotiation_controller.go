package controllers

import (
	"educast/config"
	"educast/models"
	"educast/websocket"
	"net/http"

	"github.com/gin-gonic/gin"
)

type CounterBidRequest struct {
	Price float64 `json:"price" binding:"required,gt=0"`
	Note  string  `json:"note"`
}

// loadNegotiableBid loads a bid with its bounty and verifies the caller is
// either the bidding mentor or the bounty's owning student, and that the
// bid is still open for negotiation. Returns the bid and the other party's
// user ID (who should be notified), or writes an error response and
// returns ok=false.
func loadNegotiableBid(c *gin.Context, bidID string, userID uint) (bid models.Bid, otherPartyID uint, ok bool) {
	if err := config.DB.Preload("Bounty").Preload("Mentor").First(&bid, bidID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Bid not found"})
		return bid, 0, false
	}

	isMentor := userID == bid.MentorID
	isStudent := userID == bid.Bounty.StudentID
	if !isMentor && !isStudent {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not part of this negotiation"})
		return bid, 0, false
	}

	if bid.IsAccepted || bid.Bounty.Status != "OPEN" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "This bid is no longer open for negotiation"})
		return bid, 0, false
	}

	if isMentor {
		otherPartyID = bid.Bounty.StudentID
	} else {
		otherPartyID = bid.MentorID
	}
	return bid, otherPartyID, true
}

// CounterBid lets either side of a bid propose a new price. It's only
// valid when there is no pending counter, or the existing pending counter
// was made by the other side (you can't counter your own counter).
func CounterBid(c *gin.Context) {
	bidID := c.Param("id")
	userID := c.GetUint("user_id")
	role := c.GetString("role")

	var req CounterBidRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	bid, otherPartyID, ok := loadNegotiableBid(c, bidID, userID)
	if !ok {
		return
	}

	if bid.CounterPrice != nil && bid.CounterBy == role {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Waiting for a response to your last offer"})
		return
	}

	updates := map[string]interface{}{
		"counter_price": req.Price,
		"counter_note":  req.Note,
		"counter_by":    role,
	}
	if err := config.DB.Model(&bid).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send counter-offer"})
		return
	}

	config.DB.Preload("Bounty").Preload("Mentor").First(&bid, bid.ID)
	websocket.BroadcastBidCountered(bid, otherPartyID)

	c.JSON(http.StatusOK, bid)
}

// AcceptCounter lets the receiving side of a pending counter-offer agree to
// it. This updates the bid's price to the countered amount and clears the
// negotiation state — the student still finalizes the deal via the normal
// accept-bid endpoint, now at the new price.
func AcceptCounter(c *gin.Context) {
	bidID := c.Param("id")
	userID := c.GetUint("user_id")
	role := c.GetString("role")

	bid, otherPartyID, ok := loadNegotiableBid(c, bidID, userID)
	if !ok {
		return
	}

	if bid.CounterPrice == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "There is no pending counter-offer"})
		return
	}
	if bid.CounterBy == role {
		c.JSON(http.StatusBadRequest, gin.H{"error": "You can't accept your own counter-offer"})
		return
	}

	updates := map[string]interface{}{
		"price_offer":   *bid.CounterPrice,
		"counter_price": nil,
		"counter_note":  "",
		"counter_by":    "",
	}
	if err := config.DB.Model(&bid).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to accept counter-offer"})
		return
	}

	config.DB.Preload("Bounty").Preload("Mentor").First(&bid, bid.ID)
	websocket.BroadcastCounterResolved(bid, otherPartyID, true)

	c.JSON(http.StatusOK, bid)
}

// DeclineCounter clears a pending counter-offer without changing the
// bid's original price.
func DeclineCounter(c *gin.Context) {
	bidID := c.Param("id")
	userID := c.GetUint("user_id")
	role := c.GetString("role")

	bid, otherPartyID, ok := loadNegotiableBid(c, bidID, userID)
	if !ok {
		return
	}

	if bid.CounterPrice == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "There is no pending counter-offer"})
		return
	}
	if bid.CounterBy == role {
		c.JSON(http.StatusBadRequest, gin.H{"error": "You can't decline your own counter-offer"})
		return
	}

	updates := map[string]interface{}{
		"counter_price": nil,
		"counter_note":  "",
		"counter_by":    "",
	}
	if err := config.DB.Model(&bid).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decline counter-offer"})
		return
	}

	config.DB.Preload("Bounty").Preload("Mentor").First(&bid, bid.ID)
	websocket.BroadcastCounterResolved(bid, otherPartyID, false)

	c.JSON(http.StatusOK, bid)
}
