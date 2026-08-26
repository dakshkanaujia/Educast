package controllers

import (
	"educast/config"
	"educast/models"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

type ReviewResponse struct {
	StudentName string `json:"student_name"`
	Rating      int    `json:"rating"`
	Comment     string `json:"comment"`
	CreatedAt   string `json:"created_at"`
}

type MentorProfileResponse struct {
	ID                uint             `json:"id"`
	Name              string           `json:"name"`
	Role              string           `json:"role"`
	RatingAvg         float64          `json:"rating_avg"`
	MemberSince       string           `json:"member_since"`
	CompletedSessions int64            `json:"completed_sessions"`
	Expertise         []string         `json:"expertise"`
	Reviews           []ReviewResponse `json:"reviews"`
}

type MentorSummaryResponse struct {
	ID                uint     `json:"id"`
	Name              string   `json:"name"`
	RatingAvg         float64  `json:"rating_avg"`
	MemberSince       string   `json:"member_since"`
	CompletedSessions int64    `json:"completed_sessions"`
	Expertise         []string `json:"expertise"`
}

// GetMentors lists mentors for the browse/directory screen, with the same
// real computed stats used on the profile screen. Optional ?search=
// filters by name, ?subject= filters to mentors with that expertise tag.
func GetMentors(c *gin.Context) {
	search := c.Query("search")
	subject := c.Query("subject")

	query := config.DB.Model(&models.User{}).Where("role = ?", "Mentor")
	if search != "" {
		query = query.Where("LOWER(name) LIKE LOWER(?)", "%"+search+"%")
	}

	var mentors []models.User
	query.Order("rating_avg DESC, created_at ASC").Find(&mentors)

	results := make([]MentorSummaryResponse, 0, len(mentors))
	for _, mentor := range mentors {
		var completedSessions int64
		config.DB.Model(&models.Bid{}).
			Joins("JOIN bounties ON bounties.id = bids.bounty_id").
			Where("bids.mentor_id = ? AND bids.is_accepted = ? AND bounties.status = ?", mentor.ID, true, "CLOSED").
			Count(&completedSessions)

		var expertise []string
		config.DB.Model(&models.Bid{}).
			Joins("JOIN bounties ON bounties.id = bids.bounty_id").
			Where("bids.mentor_id = ? AND bids.is_accepted = ? AND bounties.subject_tag <> ''", mentor.ID, true).
			Distinct().
			Order("bounties.subject_tag").
			Pluck("bounties.subject_tag", &expertise)

		if subject != "" {
			matches := false
			for _, tag := range expertise {
				if strings.EqualFold(tag, subject) {
					matches = true
					break
				}
			}
			if !matches {
				continue
			}
		}

		results = append(results, MentorSummaryResponse{
			ID:                mentor.ID,
			Name:              mentor.Name,
			RatingAvg:         mentor.RatingAvg,
			MemberSince:       mentor.CreatedAt.Format("Jan 2006"),
			CompletedSessions: completedSessions,
			Expertise:         expertise,
		})
	}

	c.JSON(http.StatusOK, results)
}

// GetMentorProfile returns public profile info for a mentor, computed from
// real bid/bounty/review history — no fabricated fields.
func GetMentorProfile(c *gin.Context) {
	mentorID := c.Param("id")

	var mentor models.User
	if err := config.DB.First(&mentor, mentorID).Error; err != nil || mentor.Role != "Mentor" {
		c.JSON(http.StatusNotFound, gin.H{"error": "Mentor not found"})
		return
	}

	var completedSessions int64
	config.DB.Model(&models.Bid{}).
		Joins("JOIN bounties ON bounties.id = bids.bounty_id").
		Where("bids.mentor_id = ? AND bids.is_accepted = ? AND bounties.status = ?", mentor.ID, true, "CLOSED").
		Count(&completedSessions)

	var expertise []string
	config.DB.Model(&models.Bid{}).
		Joins("JOIN bounties ON bounties.id = bids.bounty_id").
		Where("bids.mentor_id = ? AND bids.is_accepted = ? AND bounties.subject_tag <> ''", mentor.ID, true).
		Distinct().
		Order("bounties.subject_tag").
		Pluck("bounties.subject_tag", &expertise)

	var reviews []models.Review
	config.DB.Preload("Student").
		Where("mentor_id = ?", mentor.ID).
		Order("created_at DESC").
		Limit(20).
		Find(&reviews)

	reviewResponses := make([]ReviewResponse, 0, len(reviews))
	for _, r := range reviews {
		reviewResponses = append(reviewResponses, ReviewResponse{
			StudentName: r.Student.Name,
			Rating:      r.Rating,
			Comment:     r.Comment,
			CreatedAt:   r.CreatedAt.Format("Jan 2006"),
		})
	}

	c.JSON(http.StatusOK, MentorProfileResponse{
		ID:                mentor.ID,
		Name:              mentor.Name,
		Role:              mentor.Role,
		RatingAvg:         mentor.RatingAvg,
		MemberSince:       mentor.CreatedAt.Format("Jan 2006"),
		CompletedSessions: completedSessions,
		Expertise:         expertise,
		Reviews:           reviewResponses,
	})
}
