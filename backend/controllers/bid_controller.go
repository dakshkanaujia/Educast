package controllers

import (
	"educast/config"
	"educast/models"
	"educast/websocket"
	"net/http"

	"github.com/gin-gonic/gin"
)

type CreateBidRequest struct {
	PriceOffer      float64 `json:"price_offer" binding:"required,gt=0"`
	Note            string  `json:"note"`
	DurationMinutes *int    `json:"duration_minutes"`
	PreferredTime   string  `json:"preferred_time"`
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
		BountyID:        bounty.ID,
		MentorID:        mentorID,
		PriceOffer:      req.PriceOffer,
		Note:            req.Note,
		DurationMinutes: req.DurationMinutes,
		PreferredTime:   req.PreferredTime,
		IsAccepted:      false,
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

type PriceInsightResponse struct {
	Subject    string  `json:"subject"`
	SampleSize int64   `json:"sample_size"`
	MinPrice   float64 `json:"min_price"`
	MaxPrice   float64 `json:"max_price"`
	AvgPrice   float64 `json:"avg_price"`
}

// GetPriceInsight returns real accepted-bid pricing stats for a subject,
// so a mentor can see what similar sessions actually went for before
// naming a price. Purely a query over existing data — no fabricated numbers.
func GetPriceInsight(c *gin.Context) {
	subject := c.Query("subject")
	if subject == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "subject is required"})
		return
	}

	var result struct {
		Count int64
		Min   float64
		Max   float64
		Avg   float64
	}

	config.DB.Model(&models.Bid{}).
		Joins("JOIN bounties ON bounties.id = bids.bounty_id").
		Where("LOWER(bounties.subject_tag) = LOWER(?) AND bids.is_accepted = ?", subject, true).
		Select("COUNT(*) as count, COALESCE(MIN(bids.price_offer),0) as min, COALESCE(MAX(bids.price_offer),0) as max, COALESCE(AVG(bids.price_offer),0) as avg").
		Scan(&result)

	c.JSON(http.StatusOK, PriceInsightResponse{
		Subject:    subject,
		SampleSize: result.Count,
		MinPrice:   result.Min,
		MaxPrice:   result.Max,
		AvgPrice:   result.Avg,
	})
}
