# EduCast — Project Summary

**For the viva supervisor — a short overview to read before the viva.**

| | |
|---|---|
| **Project** | EduCast — A Demand-Driven, Real-Time Tutoring Marketplace |
| **Author** | Utkersh Basnet (2023ebcs010@online.bits-pilani.ac.in) |
| **Supervisor** | _____________________________ |
| **Date** | 30 August 2026 |

---

## Unique Value Proposition (UVP)

> **EduCast is the only tutoring experience where the student names the problem *and* the price, and qualified mentors compete for the work in real time — turning "I'm stuck right now" into a live, negotiated, one-to-one session in minutes, instead of scrolling a catalogue of generic courses that were never made for your exact question.**

Traditional platforms (Udemy, Coursera, YouTube) are **supply-driven** — educators upload content and hope the right learner finds it. **EduCast flips this into a demand-driven, reverse-auction model**: the learner posts the exact need, and experts bid to fulfil it.

**Five things that make EduCast distinct:**

1. **Demand-first** — the loop starts from the student's specific problem, not a pre-recorded catalogue.
2. **Reverse auction** — mentors compete on price and quality, giving students choice and price discovery.
3. **Negotiation built in** — either side can counter-offer until they agree.
4. **Real-time everywhere** — bounties, bids, acceptances and completions propagate instantly over WebSockets.
5. **Accountability by design** — atomic acceptance (no double-booking), simulated escrow, and persisted ratings that build a mentor's public reputation.

## The Problem

- **Learners** get stuck on one *specific* thing (a derivative, a bug, a concept). A generic course library doesn't help; there's no fast way to *request* targeted, live help.
- **Mentors** want well-paid, targeted work matched to their skills — not speculative content production.
- **Both** need trust once a deal is struck: no double-booking, a tracked session, a fair rating.

## The Solution — Core Flow

1. **Student posts a bounty** — title, description, subject, budget.
2. **Mentors see it live** and place bids; either side can **negotiate** via counter-offers.
3. **Student accepts a bid** — done under a database lock so a mentor can't be double-booked; a private **session room** is created and escrow is held (simulated).
4. **Both collaborate** in the session room (with text chat).
5. **Student marks it complete and rates** the mentor — escrow is released (simulated), the review is stored, and both screens update live.

## Technology at a Glance

- **Backend:** Go + Gin, GORM, PostgreSQL, Gorilla WebSocket, JWT auth with role-based access.
- **Frontend:** React Native (Expo) — one codebase for web, iOS and Android.
- **Infrastructure:** Docker Compose runs Postgres + backend + frontend with one command.

## What Was Built (Scope Delivered)

- Signup/login with Student and Mentor roles (bcrypt + JWT).
- Full bounty lifecycle: create → bid → negotiate → accept → complete.
- Real-time events: new bounties, incoming bids, acceptances, completions, live presence and online counts.
- Atomic bid acceptance with simulated escrow → release transactions.
- Persisted ratings/reviews, mentor directory and public profiles with real computed stats.
- Price-insight endpoint giving real accepted-bid pricing per subject.
- Text chat within a session; fully containerised deployment.

## Validation

A 33-case black-box API test suite (`scripts/api_test.sh`) was run against the live Dockerised stack covering authentication, access control, the full bounty/bid/negotiation/acceptance/completion lifecycle, and the directory/profile/insight endpoints.

**Result: 33 / 33 test cases passed (0 failures).** Details in `docs/03_Test_Cases_and_Validation_Report.md`.

## Honest Limitations (Prototype)

Payments and escrow are **simulated** (database rows, no real gateway); there is **no live video/audio** yet (the session room is a text/collaboration space); real-time events reach only connected users (no persisted notification inbox); and production hardening (secret management, rate limiting, HTTPS/WSS) is future work.

## Why It Matters

EduCast demonstrates a genuinely different shape for online learning — one that serves the urgent, specific, individual need that catalogues cannot — and proves the full real-time marketplace loop works end-to-end, with the accountability mechanisms (atomic acceptance, escrow lifecycle, persisted reputation) that make such a marketplace trustworthy.
