-- Migration 003: bid counter-offer negotiation fields
-- Additive only — safe to run against an existing database.

ALTER TABLE bids ADD COLUMN IF NOT EXISTS counter_price NUMERIC(10, 2);
ALTER TABLE bids ADD COLUMN IF NOT EXISTS counter_note TEXT;
ALTER TABLE bids ADD COLUMN IF NOT EXISTS counter_by VARCHAR(20);
