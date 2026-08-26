# EduCast database — PostgreSQL 16
FROM postgres:16-alpine

# The schema is executed automatically on first startup (empty data dir).
# Files in /docker-entrypoint-initdb.d run against the DB named by POSTGRES_DB.
COPY backend/migrations/001_initial_schema_postgres.sql /docker-entrypoint-initdb.d/001_initial_schema.sql
COPY backend/migrations/002_bid_scheduling_and_reviews.sql /docker-entrypoint-initdb.d/002_bid_scheduling_and_reviews.sql
COPY backend/migrations/003_bid_negotiation.sql /docker-entrypoint-initdb.d/003_bid_negotiation.sql

EXPOSE 5432
