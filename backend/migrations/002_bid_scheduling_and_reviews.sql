-- Migration 002: bid scheduling fields + mentor reviews
-- Additive only — safe to run against an existing database.

ALTER TABLE bids ADD COLUMN IF NOT EXISTS duration_minutes INT;
ALTER TABLE bids ADD COLUMN IF NOT EXISTS preferred_time VARCHAR(255);

CREATE TABLE IF NOT EXISTS reviews (
    id         SERIAL PRIMARY KEY,
    bounty_id  INT NOT NULL UNIQUE REFERENCES bounties(id) ON DELETE CASCADE,
    mentor_id  INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating     INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment    TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_reviews_mentor ON reviews(mentor_id);
