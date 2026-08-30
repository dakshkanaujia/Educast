# EduCast — Final Project Report

**A Demand-Driven, Real-Time Academic Support Marketplace**

---

## Title Page

| Field | Detail |
|---|---|
| **Project Title** | EduCast — A Reverse-Auction Tutoring Marketplace |
| **Author** | Utkersh Basnet |
| **Student ID / Email** | 2023ebcs010@online.bits-pilani.ac.in |
| **Programme** | BITS Pilani — B.E. Computer Science (Online) |
| **Supervisor** | _____________________________ |
| **Academic Year** | 2025–2026 |
| **Date of Submission** | 30 August 2026 |
| **Version** | 1.0 |

> **Supervisor sign-off** (required before viva): This report has been reviewed and approved by the project supervisor.
>
> Supervisor Name: _____________________________
> Signature: _____________________________  Date: ____________

---

## Table of Contents

1. Executive Summary
2. Unique Value Proposition (UVP)
3. Problem Statement & Motivation
4. Objectives & Scope
5. User Personas
6. Functional Requirements
7. Non-Functional Requirements
8. System Architecture
9. Technology Stack
10. Data Model & Database Schema
11. API Design
12. Real-Time Layer (WebSocket)
13. Security Design
14. Core Workflow (End-to-End)
15. Implementation Highlights
16. Testing & Validation (Summary)
17. Deployment (Docker)
18. Limitations
19. Future Work
20. Conclusion
21. References
22. Appendix — Repository Structure

---

## 1. Executive Summary

Traditional e-learning platforms (Udemy, Coursera, YouTube) are **supply-driven**: educators publish content speculatively and learners hope the right material exists for their exact problem. This model fails the learner who is stuck on one specific thing — a particular derivative, a specific bug, a niche concept — and needs targeted help now.

**EduCast inverts the model.** It is a **demand-driven, reverse-auction marketplace** for academic help. A student posts a specific problem as a **bounty** with a budget; mentors see it instantly and compete by placing **bids**; the two sides may **negotiate** the price through counter-offers; the student **accepts** the best bid, which atomically creates a private **session room**; after the session the student **marks it complete and rates** the mentor, releasing the (simulated) escrow payment.

The system is built as a Go + Gin REST API backed by PostgreSQL, with a Gorilla WebSocket hub delivering real-time events (new bounties, incoming bids, acceptances, completions, live presence). The client is a React Native (Expo) application. The whole stack is containerised with Docker Compose.

This report documents the problem, the design, the implementation, and the testing/validation of the EduCast prototype.

## 2. Unique Value Proposition (UVP)

> **EduCast is the only tutoring experience where the student names the problem and the price, and qualified mentors compete for the work in real time — turning "I'm stuck right now" into a live, negotiated, one-to-one session in minutes, instead of scrolling a catalogue of generic courses that were never made for your exact question.**

What makes it distinct:

- **Demand-first, not supply-first** — learning starts from the learner's specific need, not a pre-recorded catalogue.
- **Reverse auction** — mentors bid *down* to compete, giving the student price discovery and choice instead of a fixed sticker price.
- **Negotiation built in** — either side can counter-offer, so the final price reflects a real agreement.
- **Real-time throughout** — bounties, bids, acceptances and completions propagate instantly over WebSockets; no refresh, no waiting.
- **Accountability by design** — atomic acceptance prevents double-booking a mentor, escrow is simulated end-to-end, and every completed session produces a persisted rating and review that builds the mentor's public profile.

## 3. Problem Statement & Motivation

- **For learners:** generic course libraries do not help when you are blocked on one specific thing. There is no fast way to *request* help for an exact topic and have experts respond.
- **For mentors:** producing content speculatively is high-effort and low-certainty. Mentors want targeted, well-paid work matched to their expertise.
- **For both:** once a deal is struck, both sides need trust and accountability — no double-booking, a tracked session, and a fair rating afterwards.

EduCast addresses all three with a single real-time marketplace loop.

## 4. Objectives & Scope

**Objectives**
1. Build a working demand-driven marketplace where students post bounties and mentors bid.
2. Support real-time propagation of marketplace events over WebSockets.
3. Support price negotiation via counter-offers.
4. Guarantee safe, atomic bid acceptance (no double-booking).
5. Simulate an escrow → release payment lifecycle.
6. Persist ratings/reviews and expose mentor profiles.
7. Containerise the full stack for one-command startup.

**In scope:** authentication, role-based access, bounty/bid lifecycle, negotiation, acceptance, session creation, text chat, completion + rating, mentor directory/profiles, price insight, real-time events, Docker deployment.

**Out of scope (prototype):** real payment processing, live video/audio streaming (the session room is a text/collaboration space), push notifications, and production hardening (rate limiting, secret management, HTTPS/WSS).

## 5. User Personas

- **The Learner (Student):** wants specific knowledge quickly; posts bounties, compares bids, negotiates, accepts, learns, and rates.
- **The Expert (Mentor):** wants targeted, well-paid work; browses the live feed, bids, negotiates, delivers the session, and builds a public rating/reputation.

## 6. Functional Requirements

| ID | Requirement |
|---|---|
| FR-1 | Users can sign up and log in as either a **Student** or a **Mentor**. |
| FR-2 | Passwords are stored only as bcrypt hashes; sessions use JWT. |
| FR-3 | Students can create bounties (title, description, subject tag, budget). |
| FR-4 | Mentors see all OPEN bounties; students see their own bounties. |
| FR-5 | Newly created bounties are pushed to online mentors in real time. |
| FR-6 | Mentors can place bids (price, note, optional duration and preferred time). |
| FR-7 | New bids are pushed to the owning student in real time. |
| FR-8 | Either party can propose a counter-offer; the other can accept or decline. |
| FR-9 | A user cannot counter their own pending counter-offer. |
| FR-10 | Students can accept a bid; acceptance is atomic and creates a session room. |
| FR-11 | Accepting a bid records an ESCROW transaction and marks the bounty IN_PROGRESS. |
| FR-12 | Once accepted, no further bids can be placed on that bounty. |
| FR-13 | A bid cannot be accepted twice. |
| FR-14 | Student and mentor can exchange text chat messages in the session. |
| FR-15 | Students can mark a bounty complete and submit a 1–5 rating with a comment. |
| FR-16 | Completion records a RELEASE transaction, updates the mentor's average rating, and persists a review. |
| FR-17 | Both sides are notified of completion in real time. |
| FR-18 | A mentor directory and public mentor profiles show real computed stats (completed sessions, expertise, reviews). |
| FR-19 | A price-insight endpoint returns real accepted-bid pricing stats per subject. |

## 7. Non-Functional Requirements

- **Concurrency:** Go's goroutine model + a channel-based WebSocket hub handle many simultaneous connections.
- **Data integrity:** bid acceptance runs inside a database transaction; reviews are unique per bounty.
- **Portability:** the entire stack runs via Docker Compose on any machine with Docker.
- **Maintainability:** clear separation into config / controllers / middleware / models / websocket packages.
- **Usability:** cross-platform Expo client (web / iOS / Android from one codebase).

## 8. System Architecture

```
                     ┌──────────────────────────────┐
                     │   React Native (Expo) Client  │
                     │  Student app  │  Mentor app    │
                     └───────┬───────────────┬────────┘
                    REST (Axios) │       │ WebSocket
                                 ▼       ▼
                     ┌──────────────────────────────┐
                     │        Go + Gin Backend        │
                     │  ┌────────────┐  ┌──────────┐  │
                     │  │Controllers │  │ WS Hub    │  │
                     │  │(REST logic)│  │(real-time)│  │
                     │  └─────┬──────┘  └────┬─────┘  │
                     │  Middleware: JWT auth + RBAC    │
                     │        GORM (data layer)        │
                     └───────────────┬────────────────┘
                                     ▼
                     ┌──────────────────────────────┐
                     │        PostgreSQL 16           │
                     │ users · bounties · bids ·      │
                     │ transactions · reviews         │
                     └──────────────────────────────┘
```

Three containers, orchestrated by `docker-compose.yml`:
- **db** — PostgreSQL 16; schema applied from `backend/migrations/` on first boot.
- **backend** — Go binary serving REST + WebSocket on port 8080.
- **frontend** — Expo web dev server on port 8081.

## 9. Technology Stack

**Backend**
- Go 1.25, [Gin](https://github.com/gin-gonic/gin) HTTP framework
- [GORM](https://gorm.io) ORM with the PostgreSQL driver
- [Gorilla WebSocket](https://github.com/gorilla/websocket) for real-time events
- `golang-jwt/jwt/v5` for JWT auth; `golang.org/x/crypto/bcrypt` for password hashing
- `google/uuid` for session room IDs

**Database**
- PostgreSQL 16

**Frontend**
- React Native via Expo (SDK 54), React Navigation, Context API, Axios, AsyncStorage

**Infrastructure**
- Docker & Docker Compose

## 10. Data Model & Database Schema

Five tables (see `backend/migrations/001–003`):

**users** — `id, name, email (unique), password_hash, role (Student|Mentor), rating_avg, created_at, updated_at`

**bounties** — `id, student_id → users, title, description, subject_tag, budget, status (OPEN|IN_PROGRESS|CLOSED), room_id, created_at, updated_at`

**bids** — `id, bounty_id → bounties, mentor_id → users, price_offer, note, duration_minutes, preferred_time, counter_price, counter_note, counter_by, is_accepted, created_at, updated_at`

**transactions** — `id, bounty_id → bounties, amount, type (ESCROW|RELEASE|REFUND), created_at`

**reviews** — `id, bounty_id → bounties (unique), mentor_id → users, student_id → users, rating (1–5), comment, created_at`

Relationships: a user (student) has many bounties; a bounty has many bids; a bid belongs to one mentor; a completed bounty has exactly one review; transactions log the monetary lifecycle of a bounty.

## 11. API Design

Base URL: `http://localhost:8080`. All `/api/*` routes require `Authorization: Bearer <JWT>`.

| Method | Path | Role | Purpose |
|---|---|---|---|
| POST | `/auth/signup` | public | Create account, returns JWT |
| POST | `/auth/login` | public | Log in, returns JWT |
| POST | `/api/bounties` | Student | Create a bounty |
| GET | `/api/bounties` | any | List bounties (own for students, OPEN for mentors) |
| GET | `/api/bounties/:id` | any | Bounty detail (with bids + mentors) |
| POST | `/api/bounties/:id/complete` | Student | Complete + rate |
| POST | `/api/bounties/:id/bids` | Mentor | Place a bid |
| GET | `/api/bounties/:id/bids` | Student (owner) | List bids on a bounty |
| POST | `/api/bids/:id/accept` | Student | Accept a bid (atomic) |
| POST | `/api/bids/:id/counter` | party | Propose a counter-offer |
| POST | `/api/bids/:id/counter/accept` | party | Accept a counter-offer |
| POST | `/api/bids/:id/counter/decline` | party | Decline a counter-offer |
| GET | `/api/my-bids` | Mentor | Mentor's own bids |
| GET | `/api/mentors` | any | Mentor directory (`?search=`, `?subject=`) |
| GET | `/api/mentors/:id` | any | Public mentor profile |
| GET | `/api/price-insight` | any | Accepted-bid pricing stats (`?subject=`) |
| GET | `/health` | public | Liveness check |
| GET | `/ws?token=JWT` | any | WebSocket connection |

Full request/response reference is in `API_DOCUMENTATION.md`.

## 12. Real-Time Layer (WebSocket)

A single central `Hub` (goroutine + channels) tracks connected clients by user ID and role. Server → client event types:

- `bounty_created` — pushed to all online mentors.
- `bid_created` — pushed to the owning student.
- `bid_accepted` — pushed to the winning mentor (carries `room_id`).
- `bid_countered` / `bid_counter_resolved` — negotiation updates to the other party.
- `bounty_completed` — pushed to both student and mentor.
- `bounty_presence_update` — live count of mentors preparing a bid on a bounty.
- `platform_activity` — live count of students/mentors online.
- `chat_message` — peer-to-peer text chat, relayed by the hub to the target user (ephemeral, not persisted).

## 13. Security Design

- **Password storage:** bcrypt with default cost; plaintext passwords are never stored or returned (`password_hash` is `json:"-"`).
- **Authentication:** stateless JWT (HS256), 24-hour expiry, verified by `AuthMiddleware` on every `/api/*` request and on the WebSocket handshake (token via query string).
- **Authorisation:** `RequireRole` middleware enforces Student/Mentor separation; ownership checks ensure a student can only view/act on their own bounties and a party can only negotiate a bid they belong to.
- **Atomic acceptance:** bid acceptance runs in a GORM transaction that re-checks the bounty is still OPEN and the bid is not already accepted, preventing double-booking.

Known prototype gaps are listed in §18 (Limitations).

## 14. Core Workflow (End-to-End)

1. **Post** — Student creates a bounty → persisted, broadcast to online mentors.
2. **Bid** — Mentor places a bid → broadcast to the student.
3. **Negotiate (optional)** — Either side counters; the other accepts/declines; on acceptance the bid price updates.
4. **Accept** — Student accepts a bid → atomic transaction: bounty → IN_PROGRESS, `room_id` generated, ESCROW transaction created, mentor notified.
5. **Collaborate** — Both join the session room and exchange chat messages.
6. **Complete** — Student marks complete + rates → bounty → CLOSED, RELEASE transaction created, mentor `rating_avg` updated, review persisted, both sides notified in real time.

## 15. Implementation Highlights

- **Channel-based hub** avoids explicit locking on the hot path and cleanly supports targeted vs broadcast delivery.
- **Negotiation guard** (`loadNegotiableBid`) centralises the "who is allowed to act on this bid and is it still open" logic used by all three negotiation endpoints.
- **Real computed stats** — mentor completed-session counts and expertise tags are derived from actual accepted/closed bounty history rather than stored vanity fields.
- **Idempotent migrations** — `002` and `003` use `IF NOT EXISTS`, so they are safe to apply to an existing database.

## 16. Testing & Validation (Summary)

A black-box API test suite (`scripts/api_test.sh`) exercises 33 test cases across authentication, RBAC, bounty lifecycle, bidding, negotiation, acceptance, completion, and directory/profile/insight endpoints, run against the live Dockerised stack.

**Result: 33 / 33 passed (0 failures).**

Full test cases, expected vs actual results, and the reproduction procedure are documented in `docs/03_Test_Cases_and_Validation_Report.md`.

## 17. Deployment (Docker)

`docker compose up --build` starts all three services. PostgreSQL applies the schema on first boot; the backend waits for the database to be healthy before starting. See `docs/06_Installation_Guide.md` for full instructions and the migration caveat for existing volumes.

## 18. Limitations

- **No real payments** — escrow/release/refund are simulated as database rows.
- **No live video/audio** — the session room is a text/collaboration space (WebRTC not implemented).
- **No push notifications** — real-time events are delivered only to currently-connected clients; offline users miss them (no persisted notification inbox).
- **Chat is ephemeral** — `chat_message` events are relayed, not stored.
- **A mentor may place multiple bids** on the same bounty (no uniqueness guard).
- **Production hardening pending** — default JWT secret, permissive CORS, no rate limiting, HTTP/WS (not HTTPS/WSS).
- **Schema migrations** apply automatically only to a fresh DB volume; existing volumes need manual application (documented).

## 19. Future Work

- Migration runner (golang-migrate/goose) that tracks and applies versions on startup.
- Persistent notification inbox with unread counts.
- Persisted chat history.
- WebRTC live sessions with the existing signaling fields.
- Bounty upvoting (demand signalling) and search/pagination on the feed.
- Real payment gateway integration and a user wallet/balance.
- Automated Go unit/integration tests in CI.

## 20. Conclusion

EduCast delivers a working, real-time, demand-driven tutoring marketplace covering the full loop from posting a bounty to a rated, completed session, with atomic acceptance, price negotiation, simulated escrow, and live mentor reputation. All 33 validation test cases pass against the containerised stack. The prototype validates the core UVP — a reverse-auction, negotiated, real-time alternative to supply-driven course catalogues — and lays a clear path toward production features (real payments, live video, notifications).

## 21. References

- Gin — https://github.com/gin-gonic/gin
- GORM — https://gorm.io
- Gorilla WebSocket — https://github.com/gorilla/websocket
- golang-jwt — https://github.com/golang-jwt/jwt
- Expo — https://expo.dev
- PostgreSQL — https://www.postgresql.org
- Docker Compose — https://docs.docker.com/compose/

## 22. Appendix — Repository Structure

```
Educast/
├── backend/          # Go + Gin API
│   ├── config/       # config + DB connection
│   ├── controllers/  # auth, bounty, bid, negotiation, accept, completion, mentor
│   ├── middleware/   # JWT auth + role guards
│   ├── models/       # User, Bounty, Bid, Transaction, Review
│   ├── websocket/    # hub + client (real-time)
│   ├── migrations/   # versioned Postgres schema
│   └── main.go
├── frontend/         # React Native (Expo) client
├── db/               # Postgres Dockerfile
├── scripts/          # start/stop backend, api_test.sh
├── docs/             # project report, summary, test report, manuals
└── docker-compose.yml
```
