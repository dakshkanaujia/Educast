package models

import (
	"time"
)

type Bid struct {
	ID              uint      `json:"id" gorm:"primaryKey"`
	BountyID        uint      `json:"bounty_id" gorm:"not null"`
	MentorID        uint      `json:"mentor_id" gorm:"not null"`
	PriceOffer      float64   `json:"price_offer" gorm:"type:decimal(10,2);not null"`
	Note            string    `json:"note" gorm:"type:text"`
	DurationMinutes *int      `json:"duration_minutes"`
	PreferredTime   string    `json:"preferred_time"`
	CounterPrice    *float64  `json:"counter_price"`
	CounterNote     string    `json:"counter_note"`
	CounterBy       string    `json:"counter_by"`
	IsAccepted      bool      `json:"is_accepted" gorm:"default:false"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`

	// Relations
	Bounty Bounty `json:"bounty,omitempty" gorm:"foreignKey:BountyID"`
	Mentor User   `json:"mentor,omitempty" gorm:"foreignKey:MentorID"`
}

func (Bid) TableName() string {
	return "bids"
}
