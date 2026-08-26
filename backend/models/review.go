package models

import (
	"time"
)

type Review struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	BountyID  uint      `json:"bounty_id" gorm:"not null;uniqueIndex"`
	MentorID  uint      `json:"mentor_id" gorm:"not null"`
	StudentID uint      `json:"student_id" gorm:"not null"`
	Rating    int       `json:"rating" gorm:"not null"`
	Comment   string    `json:"comment" gorm:"type:text"`
	CreatedAt time.Time `json:"created_at"`

	Student User `json:"student,omitempty" gorm:"foreignKey:StudentID"`
}

func (Review) TableName() string {
	return "reviews"
}
