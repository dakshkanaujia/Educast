package controllers

import (
	"educast/config"
	"educast/models"
	"educast/websocket"
	"net/http"

	"github.com/gin-gonic/gin"
)

type CreateBountyRequest struct {
	Title       string  `json:"title" binding:"required"`
	Description string  `json:"description" binding:"required"`
	SubjectTag  string  `json:"subject_tag"`
	Budget      float64 `json:"budget" binding:"required,gt=0"`
}

func CreateBounty(c *gin.Context) {
	var req CreateBountyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := c.GetUint("user_id")

	bounty := models.Bounty{
		StudentID:   userID,
		Title:       req.Title,
		Description: req.Description,
		SubjectTag:  req.SubjectTag,
		Budget:      req.Budget,
		Status:      "OPEN",
	}

	if err := config.DB.Create(&bounty).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create bounty"})
		return
	}

	// Load student relation
	config.DB.Preload("Student").First(&bounty, bounty.ID)

	// Broadcast to WebSocket
	websocket.BroadcastBountyCreated(bounty)

	c.JSON(http.StatusCreated, bounty)
}

func GetBounties(c *gin.Context) {
	userID := c.GetUint("user_id")
	role := c.GetString("role")

	var bounties []models.Bounty

	if role == "Student" {
		// Students see only their own bounties. Bids are preloaded so the
		// client can group "needs your attention" vs "waiting for bids".
		config.DB.Where("student_id = ?", userID).
			Preload("Student").
			Preload("Bids").
			Order("created_at DESC").
			Find(&bounties)
	} else {
		// Mentors see all OPEN bounties
		config.DB.Where("status = ?", "OPEN").
			Preload("Student").
			Order("created_at DESC").
			Find(&bounties)
	}

	c.JSON(http.StatusOK, bounties)
}

func GetBountyByID(c *gin.Context) {
	bountyID := c.Param("id")

	var bounty models.Bounty
	if err := config.DB.Preload("Student").Preload("Bids.Mentor").First(&bounty, bountyID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Bounty not found"})
		return
	}

	c.JSON(http.StatusOK, bounty)
}
