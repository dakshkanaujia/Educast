package controllers

import (
	"educast/config"
	"educast/models"
	"educast/websocket"
	"net/http"

	"github.com/gin-gonic/gin"
)

type CreateBidRequest struct {
	PriceOffer float64 `json:"price_offer" binding:"required,gt=0"`
	Note       string  `json:"note"`
}

func CreateBid(c *gin.Context) {
	bountyID := c.Param("id")
	mentorID := c.GetUint("user_id")

	var req CreateBidRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Verify bounty exists and is OPEN
	var bounty models.Bounty
	if err := config.DB.First(&bounty, bountyID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Bounty not found"})
		return
	}

	if bounty.Status != "OPEN" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bounty is not open for bidding"})
		return
	}

	// Create bid
	bid := models.Bid{
		BountyID:   bounty.ID,
		MentorID:   mentorID,
		PriceOffer: req.PriceOffer,
		Note:       req.Note,
		IsAccepted: false,
	}

	if err := config.DB.Create(&bid).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create bid"})
		return
	}

	// Load mentor relation
	config.DB.Preload("Mentor").First(&bid, bid.ID)

	// Broadcast to WebSocket
	websocket.BroadcastBidCreated(bid, bounty.StudentID)

	c.JSON(http.StatusCreated, bid)
}

func GetBidsForBounty(c *gin.Context) {
	bountyID := c.Param("id")
	userID := c.GetUint("user_id")

	// Verify bounty exists and user is the owner
	var bounty models.Bounty
	if err := config.DB.First(&bounty, bountyID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Bounty not found"})
		return
	}

	if bounty.StudentID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only view bids for your own bounties"})
		return
	}

	var bids []models.Bid
	config.DB.Where("bounty_id = ?", bountyID).
		Preload("Mentor").
		Order("created_at DESC").
		Find(&bids)

	c.JSON(http.StatusOK, bids)
}

// GetMyBids returns all bids placed by the authenticated mentor
func GetMyBids(c *gin.Context) {
	mentorID := c.GetUint("user_id")

	var bids []models.Bid
	config.DB.Where("mentor_id = ?", mentorID).
		Preload("Bounty").
		Preload("Bounty.Student").
		Order("created_at DESC").
		Find(&bids)

	c.JSON(http.StatusOK, bids)
}
