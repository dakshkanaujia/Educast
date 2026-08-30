#!/usr/bin/env python3
"""Generate the EduCast Final Project Report as a PDF that follows the
BITS capstone Document-format template (structure + formatting rules)."""
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph,
                                Spacer, PageBreak, Table, TableStyle, Preformatted)
from reportlab.platypus.tableofcontents import TableOfContents

OUT = "docs/EduCast_Project_Report.pdf"
PAGE = A4
M = inch  # 1 inch margins all sides

# ---------- Styles (Times New Roman = Times-*) ----------
body = ParagraphStyle("body", fontName="Times-Roman", fontSize=12, leading=18,
                      alignment=TA_JUSTIFY, spaceAfter=6)
bodyL = ParagraphStyle("bodyL", parent=body, alignment=TA_LEFT)
bullet = ParagraphStyle("bullet", parent=body, leftIndent=22, bulletIndent=8,
                        spaceAfter=3)
h1 = ParagraphStyle("h1", fontName="Times-Bold", fontSize=14, leading=21,
                    spaceBefore=14, spaceAfter=8, keepWithNext=1)
h2 = ParagraphStyle("h2", fontName="Times-Bold", fontSize=13, leading=20,
                    spaceBefore=10, spaceAfter=6, keepWithNext=1)
h3 = ParagraphStyle("h3", fontName="Times-Bold", fontSize=12, leading=18,
                    spaceBefore=8, spaceAfter=4, keepWithNext=1)
code = ParagraphStyle("code", fontName="Courier", fontSize=8.5, leading=11,
                      leftIndent=10, backColor=colors.whitesmoke, spaceAfter=6)
center = ParagraphStyle("center", parent=body, alignment=TA_CENTER)
cvTitle = ParagraphStyle("cvTitle", fontName="Times-Bold", fontSize=24,
                         leading=30, alignment=TA_CENTER, spaceAfter=10)
cvSub = ParagraphStyle("cvSub", fontName="Times-Italic", fontSize=14,
                       leading=20, alignment=TA_CENTER, spaceAfter=6)
cvField = ParagraphStyle("cvField", fontName="Times-Roman", fontSize=13,
                         leading=22, alignment=TA_CENTER)
tcell = ParagraphStyle("tcell", fontName="Times-Roman", fontSize=9.5, leading=12)
thcell = ParagraphStyle("thcell", fontName="Times-Bold", fontSize=9.5, leading=12,
                        textColor=colors.white)

story = []


def H(text, style, level, toc=True):
    p = Paragraph(text, style)
    if toc:
        p._tocentry = (level, text)
    story.append(p)


def P(text, style=body):
    story.append(Paragraph(text, style))


def B(text):
    story.append(Paragraph(text, bullet, bulletText="•"))


def SP(h=6):
    story.append(Spacer(1, h))


def tbl(data, colw, header=True, fs=9.5):
    ts = [
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]
    if header:
        ts += [("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2f4b7c")),
               ("REPEATROWS", (0, 0), (0, 0))]
    t = Table(data, colWidths=colw, repeatRows=1 if header else 0)
    t.setStyle(TableStyle(ts))
    story.append(t)


def cell(txt, hdr=False):
    return Paragraph(str(txt), thcell if hdr else tcell)


# ================= COVER PAGE =================
SP(40)
P("EduCast", cvTitle)
P("A Demand-Driven, Real-Time Academic Support Marketplace", cvSub)
SP(30)
P("Capstone Project Report", ParagraphStyle("x", parent=cvField, fontName="Times-Bold", fontSize=15))
SP(30)
P("<b>Submitted by:</b>", cvField)
for line in [
    "Daksh Kanaujia (Roll No. ____________)",
    "K Manoj Krishna (Roll No. ____________)",
    "Utkersh Basnet (2023EBCS010)",
]:
    P(line, cvField)
SP(14)
for line in [
    "<b>Program:</b> BSc Computer Science (Online Mode)",
    "<b>Institution:</b> BITS Pilani",
    "<b>Academic Year:</b> 2025–2026",
    "<b>Internal Supervisor:</b> ____________________",
]:
    P(line, cvField)
SP(40)
P("Date of Submission: 31 August 2026", center)
story.append(PageBreak())

# ================= DECLARATION =================
H("Declaration", h1, 0, toc=False)
P('We hereby declare that this capstone project titled <b>"EduCast — A Demand-Driven, '
  'Real-Time Academic Support Marketplace"</b> is an original work carried out by us and '
  'has not been submitted to any other university or institution for the award of any degree.')
SP(10)
P("All external sources, libraries, and tools used have been duly acknowledged. Any "
  "AI-assisted or automated tooling used during development served as a productivity aid "
  "under our direction, and all resulting work was reviewed and tested by us.")
SP(24)
for nm, roll in [("Daksh Kanaujia", "____________"),
                 ("K Manoj Krishna", "____________"),
                 ("Utkersh Basnet", "2023EBCS010")]:
    P(f"Name: {nm}&nbsp;&nbsp;&nbsp;&nbsp;Roll Number: {roll}", bodyL)
    P("Signature: ____________________&nbsp;&nbsp;&nbsp;&nbsp;Date: ____________", bodyL)
    SP(10)
SP(10)
P("Countersigned (Internal Supervisor):", bodyL)
P("Name: ____________________", bodyL)
P("Signature: ____________________&nbsp;&nbsp;&nbsp;&nbsp;Date: ____________", bodyL)
story.append(PageBreak())

# ================= ABSTRACT =================
H("Abstract", h1, 0, toc=False)
P("Traditional e-learning platforms such as Udemy, Coursera, and YouTube are "
  "<b>supply-driven</b>: educators publish content speculatively and learners must hope "
  "that the right material exists for their exact problem. This model fails the learner "
  "who is stuck on one specific, urgent thing and needs targeted help immediately. "
  "<b>EduCast</b> inverts this into a <b>demand-driven, reverse-auction marketplace</b> "
  "for academic help.")
P("<b>Solution implemented:</b> A student posts a specific problem as a <i>bounty</i> with "
  "a budget; mentors see it instantly and compete by placing <i>bids</i>; either side may "
  "negotiate the price through counter-offers; the student accepts the best bid, which "
  "atomically creates a private session room and holds a simulated escrow; after the "
  "session the student marks it complete and rates the mentor, releasing the payment and "
  "publishing a review to the mentor's profile. Marketplace events propagate in real time "
  "over WebSockets.")
P("<b>Technologies used:</b> A Go (Gin) REST API with GORM over PostgreSQL, a Gorilla "
  "WebSocket hub for real-time events, JWT authentication with role-based access control, "
  "and a React Native (Expo) client. The entire stack is containerised with Docker Compose.")
P("<b>Outcomes and results:</b> The full marketplace loop — post, bid, negotiate, accept, "
  "collaborate, complete, rate — works end-to-end on the containerised stack. A 33-case "
  "black-box API validation suite passes at 100% (33/33). The prototype validates the core "
  "value proposition of a negotiated, real-time alternative to supply-driven course "
  "catalogues, while clearly scoping simulated payments and text-based sessions as "
  "prototype boundaries.")
story.append(PageBreak())

# ================= TOC / LoF / LoT / Abbrev =================
H("Table of Contents", h1, 0, toc=False)
toc = TableOfContents()
toc.levelStyles = [
    ParagraphStyle("toc0", fontName="Times-Bold", fontSize=12, leading=20),
    ParagraphStyle("toc1", fontName="Times-Roman", fontSize=11, leading=16, leftIndent=18),
    ParagraphStyle("toc2", fontName="Times-Roman", fontSize=10, leading=14, leftIndent=36),
]
story.append(toc)
story.append(PageBreak())

H("List of Figures", h1, 0, toc=False)
tbl([[cell("Figure", True), cell("Caption", True), cell("Section", True)],
     [cell("Fig 2.1"), cell("High-level system architecture"), cell("2.1")],
     [cell("Fig 2.2"), cell("Data flow — bounty to completed session"), cell("2.1")],
     [cell("Fig 2.3"), cell("Application screenshots [insert]"), cell("2.5")],
     [cell("Fig 4.1"), cell("Deployment / demo screenshots [insert]"), cell("4.0")],
     [cell("Fig 5.1"), cell("GitHub commit history [insert]"), cell("5.1")]],
    [1.0 * inch, 3.6 * inch, 1.2 * inch])
SP(10)
H("List of Tables", h1, 0, toc=False)
tbl([[cell("Table", True), cell("Caption", True), cell("Section", True)],
     [cell("Table 2.1"), cell("Technology stack"), cell("2.2")],
     [cell("Table 2.2"), cell("Database tables"), cell("2.3")],
     [cell("Table 3.1"), cell("Test cases and results"), cell("3.2")],
     [cell("Table 5.1"), cell("Weekly progress summary"), cell("5.2")]],
    [1.0 * inch, 3.6 * inch, 1.2 * inch])
SP(10)
H("List of Abbreviations", h1, 0, toc=False)
tbl([[cell("Abbr.", True), cell("Meaning", True)],
     [cell("API"), cell("Application Programming Interface")],
     [cell("JWT"), cell("JSON Web Token")],
     [cell("RBAC"), cell("Role-Based Access Control")],
     [cell("ORM"), cell("Object-Relational Mapping")],
     [cell("WS"), cell("WebSocket")],
     [cell("CRUD"), cell("Create, Read, Update, Delete")],
     [cell("UVP"), cell("Unique Value Proposition")],
     [cell("VOD"), cell("Video on Demand")]],
    [1.0 * inch, 4.8 * inch])
story.append(PageBreak())

# ================= CHAPTER 1 =================
H("Chapter 1: Introduction", h1, 0)
P("<i>Note: Problem identification and initial system design were completed as part of the "
  "Study Project; this chapter summarises them and notes subsequent changes.</i>")
H("1.1 Overview of the Project", h2, 1)
P("EduCast is a mobile-first, demand-driven marketplace for academic help. Instead of "
  "browsing a catalogue of pre-recorded courses, a learner posts a precise question as a "
  "bounty with a budget; qualified mentors compete for the work by bidding; and the two "
  "sides move into a real-time, one-to-one session. It reframes online learning around the "
  "loop <b>Ask → Compare → Negotiate → Accept → Learn</b>.")
H("1.2 Problem Statement & Motivation", h2, 1)
P("For learners, generic course libraries do not help when one is blocked on a single, "
  "specific thing — a particular derivative, a specific bug, a niche concept — and there is "
  "no fast way to request targeted, live help. For mentors, producing content speculatively "
  "is high-effort and low-certainty; they want targeted, well-paid work matched to their "
  "expertise. For both, once a deal is struck they need trust and accountability: no "
  "double-booking, a tracked session, and a fair rating afterwards.")
H("1.3 Objectives of the Capstone", h2, 1)
for o in [
    "Build a demand-driven marketplace where students post bounties and mentors bid.",
    "Propagate marketplace events (new bounties, bids, acceptances, completions) in real time over WebSockets.",
    "Support price negotiation through counter-offers.",
    "Guarantee safe, atomic bid acceptance so a mentor cannot be double-booked.",
    "Simulate an escrow → release payment lifecycle.",
    "Persist ratings/reviews and expose mentor directories and profiles.",
    "Containerise the full stack for one-command startup.",
]:
    B(o)
H("1.4 Scope of Implementation", h2, 1)
P("<b>In scope:</b> authentication and role-based access, the full bounty/bid lifecycle, "
  "negotiation, atomic acceptance and session creation, in-session text chat, completion "
  "with rating and review, mentor directory and profiles, price-insight statistics, "
  "real-time events, and Docker deployment.")
P("<b>Out of scope (prototype):</b> real payment processing, live video/audio streaming "
  "(the session room is a text/collaboration space), push notifications, and full "
  "production hardening (rate limiting, secret management, HTTPS/WSS).")
H("1.5 Organization of the Report", h2, 1)
P("Chapter 2 details the implementation (architecture, technology stack, modules, key "
  "logic, and code). Chapter 3 covers testing, validation, and results. Chapter 4 describes "
  "execution and deployment. Chapter 5 presents project-execution evidence. Chapter 6 "
  "concludes with achievements, limitations, and future work.")
story.append(PageBreak())

# ================= CHAPTER 2 =================
H("Chapter 2: Implementation Details", h1, 0)
H("2.1 System Architecture & Design", h2, 1)
P("EduCast follows a three-tier architecture: a React Native (Expo) client communicates "
  "with a Go/Gin backend over REST (Axios) and a persistent WebSocket connection; the "
  "backend persists data in PostgreSQL through the GORM ORM. A single in-process WebSocket "
  "<i>Hub</i> tracks connected clients by user ID and role and delivers events either to "
  "specific users (targeted) or to all clients (broadcast).")
P("<b>High-level architecture (Fig 2.1):</b>", bodyL)
story.append(Preformatted(
    "  React Native (Expo) client  ──REST (Axios)──►  Go + Gin backend  ──GORM──►  PostgreSQL\n"
    "        │  ▲                                        │  ▲\n"
    "        └──┴────────── WebSocket (events) ──────────┘  │\n"
    "                                                 Central WS Hub\n"
    "                                        (targeted + broadcast messaging)", code))
P("<b>Data flow (Fig 2.2):</b> Student posts a bounty → persisted and broadcast to online "
  "mentors → mentor bids → bid pushed to the student → optional counter-offers → student "
  "accepts (atomic: bounty→IN_PROGRESS, room created, ESCROW recorded, mentor notified) → "
  "session + chat → student completes + rates (bounty→CLOSED, RELEASE recorded, rating "
  "updated, review stored, both sides notified).")
P("<b>Component interaction:</b> Gin routes dispatch to controllers; middleware enforces "
  "JWT authentication and role checks before controllers run; controllers use GORM for "
  "persistence and call the Hub to emit real-time events.")

H("2.2 Technology Stack", h2, 1)
tbl([[cell("Layer", True), cell("Technology", True), cell("Purpose", True)],
     [cell("Language (backend)"), cell("Go 1.25"), cell("High-concurrency API + WebSocket server")],
     [cell("Web framework"), cell("Gin"), cell("HTTP routing, middleware, JSON binding")],
     [cell("ORM / DB driver"), cell("GORM + Postgres driver"), cell("Data access layer")],
     [cell("Database"), cell("PostgreSQL 16"), cell("Relational persistence")],
     [cell("Real-time"), cell("Gorilla WebSocket"), cell("Live bounty/bid/session events")],
     [cell("Auth"), cell("golang-jwt + bcrypt"), cell("JWT sessions; password hashing")],
     [cell("IDs"), cell("google/uuid"), cell("Session room identifiers")],
     [cell("Frontend"), cell("React Native (Expo)"), cell("Cross-platform client (web/iOS/Android)")],
     [cell("Client libs"), cell("React Navigation, Axios, AsyncStorage"), cell("Navigation, HTTP, local storage")],
     [cell("Infrastructure"), cell("Docker & Docker Compose"), cell("Containerised, one-command stack")]],
    [1.4 * inch, 1.9 * inch, 2.5 * inch])
P("<b>Table 2.1 — Technology stack.</b>", ParagraphStyle("cap", parent=tcell, alignment=TA_CENTER, spaceBefore=3))

H("2.3 System Modules", h2, 1)
for m in [
    "<b>Authentication:</b> signup/login, bcrypt hashing, JWT issuance and verification.",
    "<b>Bounty:</b> create/list/detail; students see own bounties, mentors see OPEN ones; new bounties broadcast to mentors.",
    "<b>Bid:</b> mentors place bids (price, note, optional duration/preferred time); bids pushed to the owning student.",
    "<b>Negotiation:</b> either party proposes a counter-offer; the other accepts or declines; a party cannot counter its own pending counter.",
    "<b>Acceptance / Session:</b> atomic bid acceptance creates a room, records ESCROW, and notifies the mentor.",
    "<b>Completion / Review:</b> student completes + rates; records RELEASE, updates the mentor's average, and persists a review.",
    "<b>Mentor directory / profile:</b> real computed stats (completed sessions, expertise, reviews); search and subject filters.",
    "<b>Real-time Hub:</b> targeted and broadcast delivery, live presence, and online-user counts.",
]:
    B(m)
P("<b>Table 2.2 — Database tables:</b>", bodyL)
tbl([[cell("Table", True), cell("Key columns", True)],
     [cell("users"), cell("id, name, email (unique), password_hash, role, rating_avg, timestamps")],
     [cell("bounties"), cell("id, student_id→users, title, description, subject_tag, budget, status, room_id, timestamps")],
     [cell("bids"), cell("id, bounty_id→bounties, mentor_id→users, price_offer, note, duration_minutes, preferred_time, counter_price, counter_note, counter_by, is_accepted")],
     [cell("transactions"), cell("id, bounty_id→bounties, amount, type (ESCROW|RELEASE|REFUND), created_at")],
     [cell("reviews"), cell("id, bounty_id→bounties (unique), mentor_id→users, student_id→users, rating (1–5), comment, created_at")]],
    [1.1 * inch, 4.7 * inch])

H("2.4 Key Algorithms / Logic", h2, 1)
P("<b>Atomic bid acceptance</b> (prevents double-booking): the operation runs inside a "
  "database transaction that re-validates state before committing.")
story.append(Preformatted(
    "BEGIN TRANSACTION\n"
    "  load bid (with its bounty)\n"
    "  if bounty.student_id != current_user: abort (403)\n"
    "  if bounty.status != 'OPEN':          abort (400)  # already taken\n"
    "  if bid.is_accepted:                  abort (400)\n"
    "  room_id = uuid()\n"
    "  update bounty: status='IN_PROGRESS', room_id=room_id\n"
    "  update bid:    is_accepted=true\n"
    "  insert transaction(bounty_id, bid.price_offer, 'ESCROW')\n"
    "  emit WS 'bid_accepted' to mentor (with room_id)\n"
    "COMMIT", code))
P("<b>Counter-offer negotiation guard:</b> a shared helper loads the bid, verifies the "
  "caller is the bidding mentor or the owning student, and that the bid is still open; a "
  "party may not counter its own pending counter (enforced by comparing <i>counter_by</i> "
  "to the caller's role).")
P("<b>Rating update on completion:</b> the mentor's running average is recomputed and a "
  "unique per-bounty review row is stored, so profiles reflect real session history.")

H("2.5 Screenshots / Code Snippets", h2, 1)
P("<i>[Insert application screenshots here — e.g. signup, student bounty feed, mentor feed "
  "with live bids, negotiation, session/chat, completion & rating. See Fig 2.3.]</i>")
P("<b>Representative code — atomic acceptance (Go):</b>", bodyL)
story.append(Preformatted(
    'err := config.DB.Transaction(func(tx *gorm.DB) error {\n'
    '    var bid models.Bid\n'
    '    tx.Preload("Bounty").First(&bid, bidID)\n'
    '    if bid.Bounty.StudentID != userID { /* 403 */ }\n'
    '    if bid.Bounty.Status != "OPEN"    { /* 400 */ }\n'
    '    roomID := uuid.New().String()\n'
    '    tx.Model(&bid.Bounty).Updates(map[string]any{\n'
    '        "status": "IN_PROGRESS", "room_id": roomID})\n'
    '    tx.Model(&bid).Update("is_accepted", true)\n'
    '    tx.Create(&models.Transaction{BountyID: bid.BountyID,\n'
    '        Amount: bid.PriceOffer, Type: "ESCROW"})\n'
    '    websocket.GlobalHub.BroadcastBidAccepted(...)\n'
    '    return nil\n'
    '})', code))
story.append(PageBreak())

# ================= CHAPTER 3 =================
H("Chapter 3: Testing, Validation & Results", h1, 0)
H("3.1 Test Plan", h2, 1)
P("<b>Testing strategy:</b> black-box, functional and validation testing of the REST API "
  "against a running instance of the containerised stack. Each test issues a real HTTP "
  "request and compares the actual response (status code, or presence of an expected field) "
  "to the expected outcome. Coverage spans authentication, authorisation/RBAC, the full "
  "bounty/bid lifecycle, negotiation, atomic acceptance, completion/review, and the "
  "directory/profile/insight endpoints.")
P("<b>Tools used:</b> a reproducible shell suite (<font face='Courier'>scripts/api_test.sh</font>) "
  "using curl and python3 for JSON parsing, executed against the Docker Compose deployment "
  "(backend on port 8080, PostgreSQL on 5432).")
H("3.2 Test Cases", h2, 1)

TESTS = [
 ("TC-01","Sign up as Student","Valid Student payload","201 Created + token","PASS"),
 ("TC-02","Sign up as Mentor","Valid Mentor payload","201 Created + token","PASS"),
 ("TC-03","Reject duplicate email","Existing email","409 Conflict","PASS"),
 ("TC-04","Reject invalid email","email='bad'","400 Bad Request","PASS"),
 ("TC-05","Reject short password","password='1'","400 Bad Request","PASS"),
 ("TC-06","Reject invalid role","role='Admin'","400 Bad Request","PASS"),
 ("TC-07","Reject wrong password","Valid email, wrong pass","401 Unauthorized","PASS"),
 ("TC-08","Login returns JWT","Valid credentials","Non-empty token","PASS"),
 ("TC-09","Block missing token","No Authorization header","401 Unauthorized","PASS"),
 ("TC-10","Block invalid token","Bad bearer token","401 Unauthorized","PASS"),
 ("TC-11","Mentor cannot post bounty","POST bounty as Mentor","403 Forbidden","PASS"),
 ("TC-12","Reject incomplete bounty","{title} only","400 Bad Request","PASS"),
 ("TC-13","Reject non-positive budget","budget=0","400 Bad Request","PASS"),
 ("TC-14","Create valid bounty","Full valid payload","Created, valid id","PASS"),
 ("TC-15","Fetch bounty by id","GET /bounties/:id","200 OK","PASS"),
 ("TC-16","Fetch missing bounty","GET /bounties/99999999","404 Not Found","PASS"),
 ("TC-17","Student cannot bid","POST bid as Student","403 Forbidden","PASS"),
 ("TC-18","Mentor places bid","price/note/duration/time","Created, valid id","PASS"),
 ("TC-19","Non-owner cannot view bids","GET bids as Mentor","403 Forbidden","PASS"),
 ("TC-20","Owner views bids","GET bids as owner Student","200 OK","PASS"),
 ("TC-21","Student counters bid","{price:350}","200 OK","PASS"),
 ("TC-22","Cannot counter own counter","Counter again immediately","400 Bad Request","PASS"),
 ("TC-23","Mentor accepts counter","POST counter/accept","200 OK","PASS"),
 ("TC-24","Accept bid creates room","POST /bids/:id/accept","Non-empty room_id","PASS"),
 ("TC-25","No bids on non-open bounty","POST bid after accept","400 Bad Request","PASS"),
 ("TC-26","Double-accept prevented","Accept same bid again","400 Bad Request","PASS"),
 ("TC-27","Reject invalid rating","{rating:9}","400 Bad Request","PASS"),
 ("TC-28","Complete + rate","{rating:5, comment}","200 OK","PASS"),
 ("TC-29","Cannot re-complete","Complete a CLOSED bounty","400 Bad Request","PASS"),
 ("TC-30","Mentor directory","GET /mentors","200 OK","PASS"),
 ("TC-31","Mentor profile","GET /mentors/:id","200 OK","PASS"),
 ("TC-32","Price insight","GET /price-insight?subject=Math","200 OK","PASS"),
 ("TC-33","Health check","GET /health","200 OK","PASS"),
]
rows = [[cell("Test Case ID", True), cell("Description", True), cell("Input", True),
         cell("Expected Output", True), cell("Status", True)]]
for tc in TESTS:
    rows.append([cell(tc[0]), cell(tc[1]), cell(tc[2]), cell(tc[3]), cell(tc[4])])
tbl(rows, [0.75 * inch, 1.7 * inch, 1.5 * inch, 1.55 * inch, 0.55 * inch], fs=8.5)
P("<b>Table 3.1 — Test cases and results (33/33 passed).</b>",
  ParagraphStyle("cap2", parent=tcell, alignment=TA_CENTER, spaceBefore=3))

H("3.3 Results & Analysis", h2, 1)
P("<b>Observations:</b> all 33 test cases passed (100% pass rate) against the live "
  "Dockerised build. Validation rules (email format, password length, role enumeration, "
  "positive budget, rating 1–5) are enforced correctly, and access-control boundaries "
  "(role separation and resource ownership) hold. The atomic-acceptance guarantee is "
  "confirmed indirectly by TC-25 and TC-26 (no further bids and no re-acceptance after a "
  "bid is accepted).")
P("<b>Performance:</b> under manual exercise, API responses were observed in the "
  "sub-millisecond to low-millisecond range in the Gin request logs, and real-time "
  "WebSocket events (new bounty, incoming bid, acceptance, completion) were delivered to "
  "connected clients instantly. Real-time behaviour is additionally validated manually per "
  "the demo walkthrough (DEMO_WORKFLOW.md).")
tbl([[cell("Category", True), cell("Cases", True), cell("Passed", True), cell("Failed", True)],
     [cell("Authentication"), cell("8"), cell("8"), cell("0")],
     [cell("Authorisation / RBAC"), cell("3"), cell("3"), cell("0")],
     [cell("Bounty lifecycle"), cell("5"), cell("5"), cell("0")],
     [cell("Bidding"), cell("4"), cell("4"), cell("0")],
     [cell("Negotiation"), cell("3"), cell("3"), cell("0")],
     [cell("Acceptance / session"), cell("3"), cell("3"), cell("0")],
     [cell("Completion / review"), cell("3"), cell("3"), cell("0")],
     [cell("Directory / profile / insight"), cell("4"), cell("4"), cell("0")],
     [cell("Total"), cell("33"), cell("33"), cell("0")]],
    [2.6 * inch, 1.0 * inch, 1.0 * inch, 1.0 * inch])
story.append(PageBreak())

# ================= CHAPTER 4 =================
H("Chapter 4: Execution / Deployment Details", h1, 0)
H("4.1 Execution Environment", h2, 1)
P("The system runs as three Docker containers orchestrated by Docker Compose: "
  "<b>db</b> (PostgreSQL 16, port 5432), <b>backend</b> (Go/Gin API, port 8080), and "
  "<b>frontend</b> (Expo web, port 8081). The backend waits for the database health check "
  "to pass before starting; the database applies the schema from "
  "<font face='Courier'>backend/migrations/</font> on first boot.")
H("4.2 Deployment Steps (Local)", h2, 1)
story.append(Preformatted(
    "git clone https://github.com/dakshkanaujia/Educast.git\n"
    "cd Educast\n"
    "docker compose up --build        # builds & starts db + backend + frontend\n"
    "curl http://localhost:8080/health   # -> {\"status\":\"ok\"}\n"
    "# open http://localhost:8081 for the app", code))
P("A native (non-Docker) path is also supported (Go + Node + local/containerised Postgres); "
  "see Appendix B / the Installation Guide for full details, including the migration caveat "
  "for pre-existing database volumes.")
H("4.3 Demo Screenshots", h2, 1)
P("<i>[Insert deployment/demo screenshots — running containers, the live feed, a real-time "
  "bid appearing, an accepted session. See Fig 4.1.]</i>")
H("4.4 Demo Video Link", h2, 1)
P("<i>[Insert demo video URL here.]</i>")
story.append(PageBreak())

# ================= CHAPTER 5 =================
H("Chapter 5: Project Execution Evidence", h1, 0)
H("5.1 Version Control Evidence", h2, 1)
P("<b>GitHub repository:</b> https://github.com/dakshkanaujia/Educast.git")
P("<i>[Insert a screenshot of the commit history. See Fig 5.1.]</i>")
H("5.2 Weekly Progress Summary", h2, 1)
P("<i>Fill in dates and obtain supervisor remarks. Entries below reflect the actual "
  "milestones delivered during implementation.</i>", tcell)
wk = [[cell("Week", True), cell("Task Planned", True), cell("Task Completed", True), cell("Supervisor Remark", True)]]
weeks = [
 ("1","Finalise design from Study Project","Requirements & architecture confirmed",""),
 ("2","Backend scaffolding & auth","Gin app, JWT auth, RBAC middleware",""),
 ("3","Bounty & bid lifecycle","CRUD + role guards + validation",""),
 ("4","Real-time layer","WebSocket hub; live bounty/bid events",""),
 ("5","Acceptance & escrow","Atomic accept, room creation, ESCROW/RELEASE",""),
 ("6","Negotiation & reviews","Counter-offers; ratings + mentor profiles",""),
 ("7","Dockerisation & DB","Compose stack; MySQL→PostgreSQL migration",""),
 ("8","Testing & documentation","33-case API suite (100%); full docs set",""),
]
for w in weeks:
    wk.append([cell(w[0]), cell(w[1]), cell(w[2]), cell(w[3])])
tbl(wk, [0.55 * inch, 1.9 * inch, 2.15 * inch, 1.2 * inch])
P("<b>Table 5.1 — Weekly progress summary.</b>",
  ParagraphStyle("cap3", parent=tcell, alignment=TA_CENTER, spaceBefore=3))
H("5.3 Supervisor Interaction Summary", h2, 1)
P("<i>[Record review dates and key feedback received from the internal supervisor.]</i>")
tbl([[cell("Review Date", True), cell("Key Feedback Received", True)],
     [cell("____________"), cell("")],
     [cell("____________"), cell("")],
     [cell("____________"), cell("")]],
    [1.4 * inch, 4.4 * inch])
story.append(PageBreak())

# ================= CHAPTER 6 =================
H("Chapter 6: Conclusion & Future Work", h1, 0)
H("6.1 Summary of Implementation", h2, 1)
P("EduCast delivers a working, real-time, demand-driven tutoring marketplace covering the "
  "complete loop from posting a bounty to a rated, completed session — with atomic "
  "acceptance, price negotiation, simulated escrow, and live mentor reputation — all "
  "containerised for one-command startup.")
H("6.2 Achievements", h2, 1)
for a in [
    "Full marketplace loop implemented and working end-to-end.",
    "Real-time bounty/bid/acceptance/completion events over WebSockets, plus live presence.",
    "Atomic, race-safe bid acceptance with a simulated escrow → release lifecycle.",
    "Persisted ratings/reviews with mentor directory and profiles built from real history.",
    "100% pass rate (33/33) on a reproducible API validation suite.",
    "Fully containerised deployment (PostgreSQL + backend + frontend).",
]:
    B(a)
H("6.3 Limitations", h2, 1)
for l in [
    "Payments and escrow are simulated as database rows (no real gateway).",
    "No live video/audio; the session room is a text/collaboration space.",
    "Real-time events reach only currently-connected clients (no persisted notification inbox).",
    "In-session chat is relayed but not persisted.",
    "A mentor may place multiple bids on the same bounty (no uniqueness guard).",
    "Production hardening pending (default secret, permissive CORS, no rate limiting, HTTP/WS).",
]:
    B(l)
H("6.4 Future Enhancements", h2, 1)
for f in [
    "Real payment gateway integration and a user wallet/balance.",
    "WebRTC live sessions using the existing signaling fields.",
    "Persistent notification inbox and chat history.",
    "Bounty upvoting (demand signalling), plus search and pagination on the feed.",
    "A migration runner (golang-migrate/goose) applied on startup.",
    "Automated Go unit/integration tests in CI.",
]:
    B(f)
story.append(PageBreak())

# ================= REFERENCES =================
H("References", h1, 0)
refs = [
 'Gin Web Framework. [Online]. Available: https://github.com/gin-gonic/gin',
 'GORM — The fantastic ORM library for Golang. [Online]. Available: https://gorm.io',
 'Gorilla WebSocket. [Online]. Available: https://github.com/gorilla/websocket',
 'golang-jwt. [Online]. Available: https://github.com/golang-jwt/jwt',
 'Expo — React Native framework. [Online]. Available: https://expo.dev',
 'PostgreSQL 16 Documentation. [Online]. Available: https://www.postgresql.org/docs/',
 'Docker Compose Documentation. [Online]. Available: https://docs.docker.com/compose/',
]
for i, r in enumerate(refs, 1):
    P(f"[{i}] {r}", bodyL)
story.append(PageBreak())

# ================= APPENDIX =================
H("Appendix", h1, 0)
H("A. User Manual", h2, 1)
P("A full user manual (Student and Mentor step-by-step flows) is provided with the "
  "deliverables (docs/05_User_Manual.md). In brief: sign up as Student or Mentor; students "
  "post bounties and review/negotiate/accept bids, then complete and rate; mentors browse "
  "the live feed, bid, negotiate, deliver the session, and build a rated profile.")
H("B. Installation Guide", h2, 1)
P("A full installation guide is provided (docs/06_Installation_Guide.md), covering the "
  "Docker path (<font face='Courier'>docker compose up --build</font>) and the native path "
  "(Go + Node + PostgreSQL), environment variables, the migration caveat for existing "
  "volumes, running the test suite, and troubleshooting.")
H("C. Source Code Link (GitHub)", h2, 1)
P("https://github.com/dakshkanaujia/Educast.git")
H("D. Demo Video Link", h2, 1)
P("<i>[Insert demo video URL here.]</i>")


# ---------- Doc template with page numbers + TOC ----------
class ReportDoc(BaseDocTemplate):
    def afterFlowable(self, flowable):
        if hasattr(flowable, "_tocentry"):
            level, text = flowable._tocentry
            self.notify("TOCEntry", (level, text, self.page))


def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Times-Roman", 10)
    canvas.drawCentredString(PAGE[0] / 2.0, 0.5 * inch, str(doc.page))
    canvas.restoreState()


doc = ReportDoc(OUT, pagesize=PAGE, leftMargin=M, rightMargin=M, topMargin=M,
                bottomMargin=M, title="EduCast — Final Project Report",
                author="Utkersh Basnet")
frame = Frame(M, M, PAGE[0] - 2 * M, PAGE[1] - 2 * M, id="main")
doc.addPageTemplates([PageTemplate(id="all", frames=[frame], onPage=footer)])
doc.multiBuild(story)
print("Saved", OUT)
