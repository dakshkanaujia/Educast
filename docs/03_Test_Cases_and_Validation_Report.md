# EduCast — Test Cases & Validation Report

| | |
|---|---|
| **Project** | EduCast — Demand-Driven Tutoring Marketplace |
| **Author** | Utkersh Basnet (2023ebcs010@online.bits-pilani.ac.in) |
| **Date of Test Run** | 30 August 2026 |
| **Build Under Test** | Dockerised stack (`docker compose up`) — backend Go/Gin + PostgreSQL 16 |
| **Test Type** | Black-box API / functional / validation testing |
| **Overall Result** | **33 / 33 PASSED — 0 FAILED** |

---

## 1. Objective

To verify that the EduCast backend correctly implements the specified functional requirements and enforces its validation and access-control rules, by exercising every REST endpoint against a running instance and comparing actual HTTP responses to expected outcomes.

## 2. Test Environment

| Component | Detail |
|---|---|
| Backend | Go 1.25 + Gin, running in Docker (`educast-backend`), port 8080 |
| Database | PostgreSQL 16 in Docker (`educast-db`), port 5432 |
| Test harness | `scripts/api_test.sh` (curl + python3 for JSON parsing) |
| Host | macOS (Docker Desktop) |
| Method | Each case issues a real HTTP request; the returned status code (or presence of an expected field) is compared to the expected value. |

## 3. How to Reproduce

```bash
# 1. Start the stack
docker compose up -d

# 2. Wait for the backend to be healthy
curl http://localhost:8080/health   # -> {"status":"ok"}

# 3. Run the suite
./scripts/api_test.sh
# -> prints PASS/FAIL per case and a final tally; exit code 0 on all-pass
```

The script creates fresh, uniquely-named users on each run (timestamp-suffixed emails), so it is safe to run repeatedly without data collisions.

## 4. Test Cases & Results

### 4.1 Authentication

| ID | Test Case | Steps / Input | Expected | Actual | Result |
|---|---|---|---|---|---|
| TC-01 | Sign up as Student | POST `/auth/signup` valid Student payload | 201 Created + token | 201 | **PASS** |
| TC-02 | Sign up as Mentor | POST `/auth/signup` valid Mentor payload | 201 Created + token | 201 | **PASS** |
| TC-03 | Reject duplicate email | Sign up again with existing email | 409 Conflict | 409 | **PASS** |
| TC-04 | Reject invalid email | `email:"bad"` | 400 Bad Request | 400 | **PASS** |
| TC-05 | Reject short password | `password:"1"` (min 4) | 400 Bad Request | 400 | **PASS** |
| TC-06 | Reject invalid role | `role:"Admin"` | 400 Bad Request | 400 | **PASS** |
| TC-07 | Reject wrong password | POST `/auth/login` wrong password | 401 Unauthorized | 401 | **PASS** |
| TC-08 | Login returns JWT | POST `/auth/login` valid creds | Non-empty token | token | **PASS** |

### 4.2 Authorisation / Role-Based Access Control

| ID | Test Case | Steps / Input | Expected | Actual | Result |
|---|---|---|---|---|---|
| TC-09 | Block missing token | GET `/api/bounties` no header | 401 Unauthorized | 401 | **PASS** |
| TC-10 | Block invalid token | GET `/api/bounties` bad bearer | 401 Unauthorized | 401 | **PASS** |
| TC-11 | Mentor cannot post bounty | POST `/api/bounties` as Mentor | 403 Forbidden | 403 | **PASS** |

### 4.3 Bounty Lifecycle

| ID | Test Case | Steps / Input | Expected | Actual | Result |
|---|---|---|---|---|---|
| TC-12 | Reject incomplete bounty | POST `/api/bounties` `{title}` only | 400 Bad Request | 400 | **PASS** |
| TC-13 | Reject non-positive budget | `budget:0` | 400 Bad Request | 400 | **PASS** |
| TC-14 | Create valid bounty | Full valid payload as Student | Created, valid id | id returned | **PASS** |
| TC-15 | Fetch bounty by id | GET `/api/bounties/:id` | 200 OK | 200 | **PASS** |
| TC-16 | Fetch missing bounty | GET `/api/bounties/99999999` | 404 Not Found | 404 | **PASS** |

### 4.4 Bidding

| ID | Test Case | Steps / Input | Expected | Actual | Result |
|---|---|---|---|---|---|
| TC-17 | Student cannot bid | POST `/api/bounties/:id/bids` as Student | 403 Forbidden | 403 | **PASS** |
| TC-18 | Mentor places bid | POST bid with price/note/duration/time | Created, valid id | id returned | **PASS** |
| TC-19 | Non-owner cannot view bids | GET `/api/bounties/:id/bids` as Mentor | 403 Forbidden | 403 | **PASS** |
| TC-20 | Owner views bids | GET `/api/bounties/:id/bids` as owner Student | 200 OK | 200 | **PASS** |

### 4.5 Negotiation (Counter-Offers)

| ID | Test Case | Steps / Input | Expected | Actual | Result |
|---|---|---|---|---|---|
| TC-21 | Student counters bid | POST `/api/bids/:id/counter` `{price:350}` | 200 OK | 200 | **PASS** |
| TC-22 | Cannot counter own counter | Student counters again immediately | 400 Bad Request | 400 | **PASS** |
| TC-23 | Mentor accepts counter | POST `/api/bids/:id/counter/accept` as Mentor | 200 OK | 200 | **PASS** |

### 4.6 Acceptance / Session Creation

| ID | Test Case | Steps / Input | Expected | Actual | Result |
|---|---|---|---|---|---|
| TC-24 | Accept bid creates room | POST `/api/bids/:id/accept` as Student | Non-empty `room_id` | room_id | **PASS** |
| TC-25 | No bids on non-open bounty | POST a bid after acceptance | 400 Bad Request | 400 | **PASS** |
| TC-26 | Double-accept prevented | POST accept the same bid again | 400 Bad Request | 400 | **PASS** |

### 4.7 Completion & Review

| ID | Test Case | Steps / Input | Expected | Actual | Result |
|---|---|---|---|---|---|
| TC-27 | Reject invalid rating | POST complete `{rating:9}` (1–5 only) | 400 Bad Request | 400 | **PASS** |
| TC-28 | Complete + rate | POST complete `{rating:5, comment}` | 200 OK | 200 | **PASS** |
| TC-29 | Cannot re-complete | POST complete on CLOSED bounty | 400 Bad Request | 400 | **PASS** |

### 4.8 Directory / Profile / Insight

| ID | Test Case | Steps / Input | Expected | Actual | Result |
|---|---|---|---|---|---|
| TC-30 | Mentor directory | GET `/api/mentors` | 200 OK | 200 | **PASS** |
| TC-31 | Mentor profile | GET `/api/mentors/:id` | 200 OK | 200 | **PASS** |
| TC-32 | Price insight | GET `/api/price-insight?subject=Math` | 200 OK | 200 | **PASS** |
| TC-33 | Health check | GET `/health` | 200 OK | 200 | **PASS** |

## 5. Requirements Traceability

| Requirement | Covered by |
|---|---|
| FR-1, FR-2 (auth, hashing/JWT) | TC-01, TC-02, TC-07, TC-08 |
| Input validation | TC-04, TC-05, TC-06, TC-12, TC-13, TC-27 |
| FR-4, FR-10, FR-12, FR-13 (RBAC + lifecycle guards) | TC-09–TC-11, TC-17, TC-19, TC-25, TC-26 |
| FR-3, FR-6 (bounty/bid creation) | TC-14, TC-18 |
| FR-8, FR-9 (negotiation) | TC-21, TC-22, TC-23 |
| FR-10, FR-11 (atomic acceptance + escrow) | TC-24 |
| FR-15, FR-16 (completion + rating + review) | TC-28, TC-29 |
| FR-18, FR-19 (directory, profile, insight) | TC-30, TC-31, TC-32 |
| Liveness | TC-33 |

## 6. Validation Summary

| Category | Cases | Passed | Failed |
|---|---|---|---|
| Authentication | 8 | 8 | 0 |
| Authorisation / RBAC | 3 | 3 | 0 |
| Bounty lifecycle | 5 | 5 | 0 |
| Bidding | 4 | 4 | 0 |
| Negotiation | 3 | 3 | 0 |
| Acceptance / session | 3 | 3 | 0 |
| Completion / review | 3 | 3 | 0 |
| Directory / profile / insight | 4 | 4 | 0 |
| **Total** | **33** | **33** | **0** |

**Pass rate: 100%.**

## 7. Observations & Notes

- All functional requirements exercised by the suite behave as specified.
- Validation rules (email format, password length, role enum, budget > 0, rating 1–5) are enforced by the framework's binding layer and confirmed here.
- Access-control boundaries (role separation and resource ownership) are correctly enforced.
- The atomic-acceptance guarantee is confirmed indirectly (TC-25/TC-26: no bids and no re-accept after acceptance).

### Known behaviours not treated as failures (see report §18 Limitations)

- A mentor can currently place more than one bid on the same bounty (no uniqueness constraint) — not exercised as a failing case because it is a known, documented limitation rather than a violated requirement.
- Real-time WebSocket events (e.g. `bounty_created`, `bid_accepted`) are validated manually via the end-to-end demo (`DEMO_WORKFLOW.md`); the automated suite covers the REST surface.

## 8. Conclusion

The EduCast backend passed **all 33** automated black-box validation cases against the live Dockerised build, covering the complete marketplace loop and its validation/access-control rules. The suite is reproducible via `scripts/api_test.sh`.
