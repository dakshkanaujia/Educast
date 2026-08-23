-- PostgreSQL schema for EduCast
-- The database itself is created by the postgres image via POSTGRES_DB,
-- so this file only defines tables/indexes and runs inside that database.

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20)  NOT NULL CHECK (role IN ('Student', 'Mentor')),
    rating_avg    DOUBLE PRECISION DEFAULT 0.0,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Bounties table
CREATE TABLE IF NOT EXISTS bounties (
    id          SERIAL PRIMARY KEY,
    student_id  INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    subject_tag VARCHAR(100),
    budget      NUMERIC(10, 2) NOT NULL,
    status      VARCHAR(20) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'CLOSED')),
    room_id     VARCHAR(255),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_bounties_student ON bounties(student_id);
CREATE INDEX IF NOT EXISTS idx_bounties_status ON bounties(status);
CREATE INDEX IF NOT EXISTS idx_bounties_created ON bounties(created_at);

-- Bids table
CREATE TABLE IF NOT EXISTS bids (
    id          SERIAL PRIMARY KEY,
    bounty_id   INT NOT NULL REFERENCES bounties(id) ON DELETE CASCADE,
    mentor_id   INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    price_offer NUMERIC(10, 2) NOT NULL,
    note        TEXT,
    is_accepted BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_bids_bounty ON bids(bounty_id);
CREATE INDEX IF NOT EXISTS idx_bids_mentor ON bids(mentor_id);
CREATE INDEX IF NOT EXISTS idx_bids_accepted ON bids(is_accepted);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id         SERIAL PRIMARY KEY,
    bounty_id  INT NOT NULL REFERENCES bounties(id) ON DELETE CASCADE,
    amount     NUMERIC(10, 2) NOT NULL,
    type       VARCHAR(20) NOT NULL CHECK (type IN ('ESCROW', 'RELEASE', 'REFUND')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_transactions_bounty ON transactions(bounty_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
