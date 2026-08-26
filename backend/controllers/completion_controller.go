package controllers

import (
	"educast/config"
	"educast/models"
	"educast/websocket"
	"net/http"

	"github.com/gin-gonic/gin"
)

type CompleteBountyRequest struct {
	Rating  int    `json:"rating" binding:"required,min=1,max=5"`
	Comment string `json:"comment"`
}

func CompleteBounty(c *gin.Context) {
	bountyID := c.Param("id")
	userID := c.GetUint("user_id")

	var req CompleteBountyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Load bounty with accepted bid
	var bounty models.Bounty
	if err := config.DB.Preload("Bids").First(&bounty, bountyID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Bounty not found"})
		return
	}

	// Verify bounty belongs to student
	if bounty.StudentID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only complete your own bounties"})
		return
	}

	// Verify bounty is IN_PROGRESS
	if bounty.Status != "IN_PROGRESS" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bounty must be in progress to complete"})
		return
	}

	// Find accepted bid
	var acceptedBid models.Bid
	for _, bid := range bounty.Bids {
		if bid.IsAccepted {
			acceptedBid = bid
			break
		}
	}

	if acceptedBid.ID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No accepted bid found"})
		return
	}

	// Update bounty status to CLOSED
	if err := config.DB.Model(&bounty).Update("status", "CLOSED").Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update bounty status"})
		return
	}
	bounty.Status = "CLOSED"

	// Notify both sides in real time so the session resolves for the
	// mentor too, instead of only after they manually reload.
	websocket.BroadcastBountyCompleted(bounty, acceptedBid.MentorID, bounty.StudentID)

	// Create RELEASE transaction
	transaction := models.Transaction{
		BountyID: bounty.ID,
		Amount:   acceptedBid.PriceOffer,
		Type:     "RELEASE",
	}
	if err := config.DB.Create(&transaction).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create transaction"})
		return
	}

	// Update mentor rating
	var mentor models.User
	if err := config.DB.First(&mentor, acceptedBid.MentorID).Error; err == nil {
		// Calculate new average rating
		var totalRatings int64
		config.DB.Model(&models.Bid{}).
			Where("mentor_id = ? AND is_accepted = ?", mentor.ID, true).
			Count(&totalRatings)

		newAvg := ((mentor.RatingAvg * float64(totalRatings-1)) + float64(req.Rating)) / float64(totalRatings)
		config.DB.Model(&mentor).Update("rating_avg", newAvg)
	}

	// Store the review (one per bounty) so it can be shown on the mentor's profile
	review := models.Review{
		BountyID:  bounty.ID,
		MentorID:  acceptedBid.MentorID,
		StudentID: userID,
		Rating:    req.Rating,
		Comment:   req.Comment,
	}
	config.DB.Create(&review)

	c.JSON(http.StatusOK, gin.H{
		"message": "Bounty completed successfully",
		"bounty":  bounty,
	})
}
