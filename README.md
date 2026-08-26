# EduCast

**EduCast is a reverse-auction tutoring marketplace.** Traditional e-learning is supply-driven — creators upload content and hope the right student finds it. EduCast flips that: a student posts a specific problem as a **bounty** with a budget, mentors compete for it by placing **bids**, the student picks the best one, and the two move into a live session together. It's demand-driven, real-time, and built around a simple loop: **Ask → Compare → Accept → Learn**.

## What it solves

- **"I need help with this one specific thing, right now"** — a generic course library doesn't help when you're stuck on a specific derivative, a specific bug, a specific concept. EduCast lets a student describe the exact problem and a budget, and get competing offers from mentors instead of scrolling a catalog.
- **Mentors want targeted, well-paid work** — instead of producing content speculatively, mentors browse live requests that match what they're good at and bid on the ones worth their time.
- **Trust and accountability once the deal is struck** — bids can be negotiated (counter-offers), acceptance is atomic (no double-booking a mentor's time on the same bounty), the session is tracked through completion, and mentors are rated afterward.

### Core flow

1. **Student posts a bounty** — title, description, subject tag, budget.
2. **Mentors see it instantly** (pushed over WebSocket) and place bids, optionally negotiating price via counter-offers.
3. **Student accepts a bid** — the acceptance is done under a database lock so a mentor can't be double-booked, and a session room is created.
4. **Student and mentor collaborate** in the session room.
5. **Student marks the bounty complete** and rates the mentor — this closes the loop for both sides in real time (both the student's and mentor's screens update live via WebSocket, no refresh needed).

## Tech stack

**Backend**
- Go + [Gin](https://github.com/gin-gonic/gin) — HTTP API
- [GORM](https://gorm.io) + PostgreSQL — data layer
- [Gorilla WebSocket](https://github.com/gorilla/websocket) — real-time bounty/bid/session events, backed by a central hub that can target specific users or broadcast to all
- JWT (`golang-jwt/jwt`) — authentication, with role-based middleware (Student vs Mentor)

**Frontend**
- React Native via [Expo](https://expo.dev) (web-targeted, also runs on iOS/Android)
- React Navigation (stack navigator, role-specific navigators for Student/Mentor)
- Context API for auth (`AuthContext`) and the live WebSocket connection (`WebSocketContext`)
- Axios for the REST client

**Infra**
- Docker Compose spins up Postgres, the Go backend, and the Expo web frontend together
- SQL migrations in `backend/migrations/` (applied automatically to the `db` container on first boot)

## Project structure

```
Bits-Study-Project/
├── backend/
│   ├── config/          # DB connection setup
│   ├── controllers/     # auth, bounty, bid, negotiation, acceptance, completion, mentor
│   ├── middleware/       # JWT auth + role guards
│   ├── models/           # User, Bounty, Bid, Transaction, Review
│   ├── websocket/        # hub (fan-out/targeted messaging) + client (per-connection pump)
│   ├── migrations/       # versioned Postgres schema
│   └── main.go
├── frontend/
│   └── src/
│       ├── context/      # AuthContext, WebSocketContext
│       ├── navigation/   # role-aware app navigator
│       ├── screens/      # auth/, student/, mentor/, shared session & messaging screens
│       ├── components/   # shared design system (Card, Button, Badge, AppHeader, ...)
│       ├── theme/        # colors, typography, web animation keyframes
│       └── services/     # REST API clients
├── db/                   # Postgres Dockerfile (loads migrations on first boot)
├── scripts/               # start-backend.sh / stop-backend.sh for local dev
└── docker-compose.yml
```

## Running it locally

You can run everything with Docker, or run each piece natively. Docker is the fastest path to a working stack; native is better if you're actively developing the backend or frontend.

### Option A — Docker Compose (whole stack)

Requires Docker and Docker Compose.

```bash
docker compose up --build
```

This starts:
- Postgres on `localhost:5432` (schema applied automatically from `backend/migrations/`)
- The Go backend on `http://localhost:8080`
- The Expo web frontend on `http://localhost:8081`

### Option B — Native (recommended while developing)

**Prerequisites**
- Go 1.25+
- Node.js 18+ and npm
- Postgres 16, or just run `docker compose up -d db` to get Postgres alone in a container

**1. Database**

```bash
docker compose up -d db
# or, if you have a local Postgres install, create a `educast` database and
# apply backend/migrations/*.sql in order yourself
```

**2. Backend**

```bash
cd backend
cp .env.example .env      # edit DB credentials / JWT secret if needed
go mod download
go run main.go
```

The API comes up on `http://localhost:8080`. Check it with `curl http://localhost:8080/health`.

There are also helper scripts at the repo root for backing the server with a detached process during local dev:

```bash
./scripts/start-backend.sh   # builds and runs the backend in the background, waits for Postgres to be healthy
./scripts/stop-backend.sh    # stops it
```

**3. Frontend**

```bash
cd frontend
npm install
npm run web       # or: npm start, then press `w`
```

This opens the Expo dev server; press `w` for web, or scan the QR code with Expo Go for a device. If you're testing on a physical device, point `frontend/src/services/config.js` at your machine's LAN IP instead of `localhost`.

### Trying it out

1. Sign up two accounts — one as **Student**, one as **Mentor**.
2. As the student, post a bounty (title, description, subject tag, budget).
3. As the mentor (in another browser/tab), watch it appear live in the feed and place a bid.
4. As the student, accept the bid — a session is created for both sides.
5. As the student, mark the bounty complete and leave a rating — both screens update live.

## API overview

- `POST /auth/signup`, `POST /auth/login` — account creation and login
- `POST /api/bounties`, `GET /api/bounties`, `GET /api/bounties/:id` — bounty lifecycle
- `POST /api/bounties/:id/bids`, `GET /api/bounties/:id/bids` — bidding
- `POST /api/bids/:id/accept`, plus counter-offer endpoints — negotiation and acceptance
- `POST /api/bounties/:id/complete` — completion + rating, broadcasts to both student and mentor
- `GET /ws?token=JWT` — WebSocket connection for live events (`bounty_created`, `bid_created`, `bid_accepted`, `bounty_completed`, etc.)

See `API_DOCUMENTATION.md` for the full request/response reference and `DEMO_WORKFLOW.md` for a scripted end-to-end walkthrough.

## Status

This is an actively evolving prototype, not production-hardened. Payments are simulated (no real payment processor), there's no video/audio streaming yet (the session room is a collaboration space, not a call), and it hasn't been security-reviewed for production use (default JWT secret, no rate limiting, etc. — see `.env.example` and change secrets before deploying anywhere real).
