# EduCast — User Manual

A guide to using the EduCast application as a **Student** or a **Mentor**.

| | |
|---|---|
| **Application** | EduCast — Demand-Driven Tutoring Marketplace |
| **Audience** | End users (students and mentors) |
| **Access** | Web browser at `http://localhost:8081` (or the deployed URL); also runs on iOS/Android via Expo |

> For setup/installation, see `docs/06_Installation_Guide.md`. This manual assumes the app is already running.

---

## 1. What is EduCast?

EduCast is a marketplace where **students post specific academic problems as "bounties"** (with a budget) and **mentors compete by placing bids**. The student picks the best bid — optionally after negotiating the price — and the two move into a private session to solve the problem together. After the session, the student rates the mentor.

There are two roles:
- **Student** — posts bounties, reviews bids, negotiates, accepts, and rates.
- **Mentor** — browses live bounties, bids, negotiates, delivers help, and builds a reputation.

## 2. Getting Started

### 2.1 Open the app
Go to `http://localhost:8081` in your browser (or open it in Expo Go on your phone).

### 2.2 Create an account
1. On the welcome/login screen, choose **Sign Up**.
2. Enter your **name**, **email**, and a **password** (at least 4 characters).
3. Choose your role: **Student** or **Mentor**.
4. Submit. You are logged in automatically and taken to your home screen.

> Your role is fixed for the account. To use both roles, create one Student account and one Mentor account (useful for a demo — use two browser tabs/windows).

### 2.3 Log in / log out
- **Log in:** enter your email and password.
- **Log out:** use the log-out option in the app header/menu. Your session (JWT) is stored locally and cleared on logout.

## 3. Student Guide

### 3.1 Post a bounty
1. From the Student home screen, tap **Post a Bounty** (or the "+" action).
2. Fill in:
   - **Title** — a short summary (e.g. "Help with Calculus derivatives").
   - **Description** — the details of what you're stuck on.
   - **Subject tag** — a category (e.g. "Math", "Physics", "Go").
   - **Budget** — the amount you're willing to pay (must be greater than 0).
3. Submit. Your bounty appears in your list and is instantly pushed to online mentors.

### 3.2 Review incoming bids
- Open your bounty to see bids as they arrive (they appear in real time — no refresh needed).
- Each bid shows the mentor, their **price**, an optional **note**, and (if provided) a **duration** and **preferred time**.
- Tap a mentor's name to view their **profile** — average rating, completed sessions, expertise, and past reviews — to help you choose.

### 3.3 Negotiate (optional)
- On a bid, choose **Counter-offer** and propose a different price (with an optional note).
- The mentor is notified and can **accept** or **decline** your counter.
- You cannot send a second counter until the mentor responds to your last one.
- If the mentor counters back, you can accept or decline theirs.

### 3.4 Accept a bid
1. When you're happy with a bid (original or negotiated price), tap **Accept**.
2. The bounty moves to **In Progress**, a private **session room** is created, escrow is held (simulated), and the mentor is notified instantly.
3. You're taken into the session.

### 3.5 The session
- The session screen shows the bounty details and a **chat** to message your mentor.
- Use it to coordinate and work through the problem.

### 3.6 Complete and rate
1. When the problem is solved, tap **Mark Complete**.
2. Give a **rating from 1 to 5 stars** and an optional **comment**.
3. Submit. The bounty is **Closed**, the (simulated) payment is released to the mentor, your review is saved to the mentor's profile, and both screens update live.

## 4. Mentor Guide

### 4.1 Browse the live feed
- From the Mentor home/feed, you see all **open bounties**. New ones appear instantly as students post them.
- Open a bounty to read the full description, subject, and budget.

### 4.2 Place a bid
1. On a bounty, tap **Place a Bid**.
2. Enter your **price offer** and an optional **note** explaining why you're a good fit. You may also add a **duration** (minutes) and a **preferred time**.
3. Submit. The student is notified in real time.

### 4.3 Negotiate (optional)
- If the student sends a **counter-offer**, you'll be notified. You can **accept** it (your bid price updates) or **decline** it (your original price stands).
- You may also send your own counter-offer, subject to the same "wait for a response before countering again" rule.

### 4.4 Track your bids
- The **My Bids** screen lists every bid you've placed and its status.

### 4.5 Get accepted & run the session
- When a student accepts your bid, you're notified instantly and can **join the session room**.
- Use the in-session **chat** to help the student solve their problem.

### 4.6 After completion
- When the student marks the bounty complete, your session resolves in real time, the (simulated) payment is released, and the student's **rating and review** are added to your public profile — improving your standing in the mentor directory.

## 5. Shared Features

- **Mentor directory** — browse mentors, search by name, or filter by subject/expertise. Each entry shows real stats (rating, completed sessions, expertise).
- **Mentor profiles** — average rating, member-since date, completed sessions, expertise tags, and recent reviews.
- **Live presence** — students can see how many mentors are currently preparing a bid on their bounty; everyone sees a live count of students/mentors online.
- **Price insight** — where shown, this reflects real average/min/max accepted-bid prices for a subject, to help set a fair budget or bid.

## 6. Tips for a Smooth Demo

- Use **two browser windows** (or one normal + one incognito): sign in as a Student in one and a Mentor in the other to see real-time events flow between them.
- Post a bounty as the Student and watch it appear instantly in the Mentor feed.
- Place a bid as the Mentor and watch it appear instantly for the Student.

## 7. Troubleshooting (User-Level)

| Symptom | Likely cause | What to do |
|---|---|---|
| "Invalid credentials" on login | Wrong email/password | Re-check credentials; sign up if you have no account |
| New bounties/bids don't appear live | Lost connection | Refresh the page; ensure the backend is running |
| Can't post a bounty | You're logged in as a Mentor | Only Students can post bounties |
| Can't place a bid | You're logged in as a Student | Only Mentors can bid |
| Can't accept a bid / it's gone | Bounty no longer open | A bid may already have been accepted |

For technical/setup issues, see the Installation Guide's troubleshooting section.
