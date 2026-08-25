package controllers

import (
	"educast/config"
	"educast/models"
	"educast/websocket"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func AcceptBid(c *gin.Context) {
	bidID := c.Param("id")
	userID := c.GetUint("user_id")

	// Start database transaction for atomic operation
	err := config.DB.Transaction(func(tx *gorm.DB) error {
		// Lock and load bid with bounty
		var bid models.Bid
		if err := tx.Clauses().Preload("Bounty").Preload("Mentor").First(&bid, bidID).Error; err != nil {
			return err
		}

		// Verify bounty belongs to the student
		if bid.Bounty.StudentID != userID {
			c.JSON(http.StatusForbidden, gin.H{"error": "You can only accept bids for your own bounties"})
			return gorm.ErrInvalidTransaction
		}

		// Verify bounty is still OPEN
		if bid.Bounty.Status != "OPEN" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Bounty is no longer open"})
			return gorm.ErrInvalidTransaction
		}

		// Verify bid is not already accepted
		if bid.IsAccepted {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Bid already accepted"})
			return gorm.ErrInvalidTransaction
		}

		// Generate room ID
		roomID := uuid.New().String()

		// Update bounty status and room ID
		if err := tx.Model(&bid.Bounty).Updates(map[string]interface{}{
			"status":  "IN_PROGRESS",
			"room_id": roomID,
		}).Error; err != nil {
			return err
		}

		// Mark bid as accepted
		if err := tx.Model(&bid).Update("is_accepted", true).Error; err != nil {
			return err
		}

		// Create escrow transaction
		transaction := models.Transaction{
			BountyID: bid.BountyID,
			Amount:   bid.PriceOffer,
			Type:     "ESCROW",
		}
		if err := tx.Create(&transaction).Error; err != nil {
			return err
		}

		// Broadcast to WebSocket
		websocket.GlobalHub.BroadcastBidAccepted(bid.ID, bid.BountyID, bid.MentorID, bid.Bounty.StudentID, roomID)

		// Return success response
		c.JSON(http.StatusOK, gin.H{
			"message":    "Bid accepted successfully",
			"room_id":    roomID,
			"bid":        bid,
			"student_id": bid.Bounty.StudentID,
			"mentor_id":  bid.MentorID,
		})

		return nil
	})

	if err != nil && err != gorm.ErrInvalidTransaction {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to accept bid"})
	}
}
