# EduCast - Proof of Concept Demo Workflow

## 🎬 Video Demo Script

This workflow demonstrates the complete EduCast marketplace from both student and mentor perspectives, highlighting real-time features and the bidding system.

---

## 🚀 Pre-Demo Setup (Before Recording)

### 1. Start Both Servers
```bash
# Terminal 1: Start Backend
cd /Users/utkershbasnet/Desktop/bits_pilani/Educast/backend
/usr/local/go/bin/go run main.go

# Terminal 2: Start Frontend
cd /Users/utkershbasnet/Desktop/bits_pilani/Educast/frontend
npx expo start
```

### 2. Open the App
- Press `w` to open in web browser (easiest for demo)
- Or use Expo Go app on your phone
- Have 2 browser windows/tabs ready (one for Student, one for Mentor)

### 3. Verify Database is Ready
```bash
mysql -u root -p educast -e "SHOW TABLES;"
```

---

## 📱 Demo Flow (15-20 minutes)

### **Part 1: Introduction (1 minute)**

**What to Show:**
- Briefly explain the concept: "EduCast is a demand-driven academic support marketplace"
- Show the app architecture diagram (Backend: Go, Frontend: React Native, DB: MySQL)
- Mention key features: Real-time bidding, WebSocket updates, JWT authentication

---

### **Part 2: Student Registration & Login (2 minutes)**

**Browser Window 1 - Student Account**

1. **Sign Up as Student**
   - Navigate to Signup screen
   - Fill in details:
     - Name: `Alice Student`
     - Email: `alice@student.com`
     - Password: `1234`
     - Role: **Student**
   - Click "Sign Up"
   - Show successful registration

2. **Login**
   - Enter credentials
   - Show the student dashboard
   - Point out navigation options

**Talking Points:**
- "Students create accounts to post academic doubts as paid bounties"
- "JWT tokens handle secure authentication"

---

### **Part 3: Mentor Registration & Login (2 minutes)**

**Browser Window 2 - Mentor Account**

1. **Sign Up as Mentor**
   - Navigate to Signup screen
   - Fill in details:
     - Name: `Bob Tutor`
     - Email: `bob@mentor.com`
     - Password: `1234`
     - Role: **Mentor**
   - Click "Sign Up"
   - Show successful registration

2. **Login**
   - Enter credentials
   - Show the mentor dashboard with **Live Bounty Feed**

**Talking Points:**
- "Mentors browse live bounties and compete by placing bids"
- "All bounties appear in real-time via WebSocket"

---

### **Part 4: Student Posts a Bounty (3 minutes)**

**Browser Window 1 - Student**

1. **Create New Bounty**
   - Click "Post Bounty" or "Create Bounty"
   - Fill in details:
     - **Title**: `Help with Calculus - Derivatives`
     - **Description**: `I need help understanding the chain rule and solving derivative problems`
     - **Subject Tag**: `Mathematics`
     - **Budget**: `$25.00`
   - Click "Post Bounty"

2. **Show Confirmation**
   - Bounty appears in student's "My Bounties" list
   - Status: **OPEN**

**Talking Points:**
- "Students set their own budget based on problem complexity"
- "Once posted, the bounty is broadcast to all mentors instantly"

---

### **Part 5: Real-Time Bounty Broadcast (1 minute)**

**Browser Window 2 - Mentor**

**IMPORTANT: Show this immediately after posting**

1. **Automatic Update**
   - The new bounty appears **automatically** in the mentor's feed
   - **No page refresh needed!**
   - Highlight the WebSocket real-time update

**Talking Points:**
- "Notice the bounty appeared instantly - this is WebSocket in action"
- "Mentors can see all new opportunities in real-time"

---

### **Part 6: Mentor Places a Bid (3 minutes)**

**Browser Window 2 - Mentor**

1. **View Bounty Details**
   - Click on the "Help with Calculus" bounty
   - Show the full description and budget

2. **Place a Bid**
   - Click "Place Bid"
   - Fill in:
     - **Price Offer**: `$20.00`
     - **Note**: `Hi! I'm a Math tutor with 5 years of experience. I can explain derivatives clearly with examples. Available now!`
   - Click "Submit Bid"

3. **Show Bid Confirmation**
   - Bid appears in mentor's "My Bids" section

**Talking Points:**
- "Mentors compete by offering competitive prices and personalized notes"
- "Students can compare multiple bids to choose the best match"

---

### **Part 7: Student Views & Accepts Bid (3 minutes)**

**Browser Window 1 - Student**

1. **View Bounty Bids**
   - Navigate to "My Bounties"
   - Click on the "Help with Calculus" bounty
   - Click "View Bids" or navigate to bids section

2. **Review Bid**
   - See Bob's bid: $20.00 with his note
   - **Optional**: Show what it looks like with multiple bids (can create another mentor account quickly)

3. **Accept the Bid**
   - Click "Accept Bid" on Bob's offer
   - Show confirmation modal
   - Confirm acceptance

4. **Show Updated Status**
   - Bounty status changes to **IN_PROGRESS**
   - Session Room ID is generated
   - Escrow transaction recorded in database

**Talking Points:**
- "Students compare bids and choose based on price and mentor experience"
- "Accepting a bid creates an escrow transaction for payment security"
- "A session room is automatically generated for the tutoring session"

---

### **Part 8: Real-Time Bid Acceptance Notification (1 minute)**

**Browser Window 2 - Mentor**

**Show this immediately after acceptance**

1. **Automatic Notification**
   - Mentor receives **real-time notification** that bid was accepted
   - Bounty status updates to IN_PROGRESS
   - Session room details appear

**Talking Points:**
- "Mentors are instantly notified when their bid is accepted"
- "Both parties can now join the session room to start tutoring"

---

### **Part 9: Complete Bounty & Rate Mentor (3 minutes)**

**Browser Window 1 - Student**

1. **Simulate Session Completion**
   - Navigate to the bounty
   - Explain: "After the tutoring session is complete..."
   - Click "Mark as Complete" or "Complete Bounty"

2. **Rate the Mentor**
   - Rating modal appears
   - Select **5 stars**
   - Optional: Add review comment
   - Submit rating

3. **Show Final Status**
   - Bounty status: **CLOSED**
   - Payment released (show transaction in database if possible)
   - Mentor's rating updated

**Talking Points:**
- "After the session, students rate mentors to build reputation"
- "Payment is released from escrow automatically"
- "High-rated mentors appear more attractive to future students"

---

### **Part 10: Show Backend & Database (Optional - 2 minutes)**

**Terminal/Database View**

1. **Show Backend Logs**
   - Display the Go backend terminal
   - Point out API calls, WebSocket connections

2. **Query Database**
   ```sql
   -- Show created bounty
   SELECT * FROM bounties;
   
   -- Show bid
   SELECT * FROM bids;
   
   -- Show transactions
   SELECT * FROM transactions;
   
   -- Show updated mentor rating
   SELECT name, rating_avg FROM users WHERE role='Mentor';
   ```

**Talking Points:**
- "All data is persisted in MySQL"
- "Transactions provide payment audit trail"
- "Ratings accumulate to build mentor reputation"

---

## 🎯 Key Features to Highlight

### 1. **Real-Time Updates (WebSocket)**
   - Bounties appear instantly in mentor feed
   - Bid acceptance notifications are immediate
   - No page refresh needed

### 2. **Competitive Bidding System**
   - Mentors compete for students (demand-driven)
   - Students get best value through competition
   - Transparent pricing

### 3. **Secure Payment Flow**
   - Escrow on bid acceptance
   - Release on completion
   - Refund capability (if needed)

### 4. **Trust & Reputation**
   - Student ratings build mentor credibility
   - Average rating visible to students
   - Quality assurance through feedback

### 5. **Role-Based Access Control**
   - Students can only post bounties and accept bids
   - Mentors can only view bounties and place bids
   - JWT-secured endpoints

---

## 💡 Demo Tips

### **Before Recording:**
- Clear browser cache
- Test the entire flow once
- Prepare multiple browser windows
- Have database ready with schema
- Ensure both servers are running

### **During Recording:**
- Speak clearly and explain each step
- Show the real-time updates prominently
- Switch between student and mentor views smoothly
- Point out the WebSocket real-time magic
- Keep the pace engaging but not rushed

### **Backup Plan:**
- If real-time update doesn't show, refresh and mention it
- Have cURL commands ready to test API directly
- Screenshot key features in case of technical issues

---

## 📊 Optional: Advanced Demonstrations

### **Multiple Mentors Bidding**
Create 2-3 mentor accounts quickly and show competitive bidding:
- Mentor 1: Bids $20
- Mentor 2: Bids $18
- Mentor 3: Bids $22 with premium experience

### **Show API with Postman/cURL**
Demonstrate backend API calls:
```bash
# Create bounty via API
curl -X POST http://localhost:8080/api/bounties \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Physics Help","description":"Need help with Newton'\''s laws","subject_tag":"Physics","budget":30.00}'
```

### **WebSocket Connection Demo**
Show WebSocket connection in browser DevTools:
- Open Network tab
- Filter by WS (WebSocket)
- Show live messages

---

## ✅ Post-Demo Checklist

- [ ] Summarize key features shown
- [ ] Mention scalability potential
- [ ] Discuss next steps / future features
- [ ] Thank viewers
- [ ] Provide GitHub/contact info

---

## 🚀 Future Features to Mention

- **Video Streaming**: WebRTC integration for live tutoring
- **Push Notifications**: Mobile notifications for bids/updates
- **Payment Gateway**: Stripe/PayPal integration
- **Advanced Search**: Filter bounties by subject, price, deadline
- **Chat System**: In-session messaging
- **Calendar Integration**: Schedule sessions in advance
- **Dispute Resolution**: Mediation system for issues

---

**Good luck with your demo! 🎥**
