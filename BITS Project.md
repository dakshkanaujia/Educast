**Project Name:** EduCast

## **1\. Executive Summary**

**The Problem Statement:** Traditional e-learning platforms (Udemy, Coursera) are supply-driven; creators upload content, and students consume it. Students often struggle to find specific, niche, or urgent answers from experts. There is no streamlined way to "request" a specific topic and have multiple educators bid to teach it live or provide a custom recording.

**The Solution:** **EduCast** is a demand-driven educational marketplace. It flips the model: Students post learning requests (e.g., "Explain Raft Consensus Algorithm in Go"), and Educators respond with proposals (Live Session or Recorded Video) and price points. It features a YouTube-style discovery feed for existing content and a real-time booking system for live 1-on-1 interactions.

## **2\. User Personas**

* **The Learner (Student):** Wants specific knowledge quickly. Can browse existing content or post a "Bounty/Request" for new topics.  
* **The Expert (Educator):** Wants to monetize expertise. Can earn via passive income (selling recordings) or active income (high-ticket live coaching).

## **3\. Functional Requirements**

### **Module A: Authentication & Profiles**

* **Social Login:** OAuth (Google/GitHub) for friction-free onboarding.  
* **Role Management:** Users can switch between "Student" and "Educator" modes (or unified profile).  
* **Educator Profile:** Bio, expertise tags, rating/reviews, and portfolio of past recordings.

### **Module B: The Marketplace (The Core USP)**

* **Topic Requests:** Students post a request (Title, Description, Budget, Urgency).  
* **Upvoting System:** Other students can view open requests and **upvote** them to signal high demand to educators.  
* **Proposal System:** Educators view requests (sorted by upvotes/date) and send a proposal DM.  
  * *Option A:* Live Session Bid (e.g., "$50 for 1 hour").  
  * *Option B:* Custom Recording Bid (e.g., "$20 for a 30-min explanation").  
* **Booking Handshake:** Once a student accepts a proposal, a payment hold is created (mock payment), and the request is marked "In Progress." It vanishes from the public board only when the session is booked or content is delivered.

### **Module C: Streaming & Content Delivery**

* **Live Sessions:** Real-time video/audio calls using **WebRTC**.  
* **Video Uploads:** Educators can upload pre-recorded videos.  
* **The "Feed":** A home screen displaying videos sorted by Views, Rating, or "Trending" (Algo-based).  
* **Search Engine:** Full-text search for existing recordings, filterable by Price (Free/Paid) and Popularity.

### **Module D: Communication**

* **Real-time Chat:** Direct messaging between Student and Educator for negotiation (WebSocket-based).  
* **Notifications:** Alerts for "Proposal Received," "Request Upvoted," or "Session Starting Soon."

## **4\. Tech Stack**

* **Mobile App:** React Native (Expo) \- Cross-platform (iOS/Android).  
* **Backend:** Go (Golang) \- Chosen for high concurrency and low-latency handling of WebSocket connections.  
* **Database:**  
  * **PostgreSQL:** Primary relational data (Users, Bookings, Transactions).  
  * **Redis:** Caching (Session storage) and Leaderboards (for "Trending" feeds).  
* **Streaming Engine:**  
  * **Live:** **WebRTC**  
  * **VOD (Video on Demand):** **FFmpeg** (to transcode uploaded videos into HLS for smooth streaming).  
* **Object Storage:** AWS S3 to store video files.  
* **Search:** PostgreSQL Full-Text Search.

