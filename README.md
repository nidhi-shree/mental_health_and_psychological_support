# MindCare — The AI-Powered Mental Health Ecosystem

MindCare is a pioneering full-stack mental health sanctuary that harmonizes Affective Computing, Generative AI, and Clinical Telehealth into a unified digital ecosystem. It is designed to address the fragmentation of modern mental health tools, providing an end-to-end pathway from anonymous AI-driven self-reflection to verified professional intervention.

 ---

![React](https://img.shields.io/badge/React-18.x-blue)
![Flask](https://img.shields.io/badge/Flask-3.0.x-green)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green)
![Python](https://img.shields.io/badge/Python-3.11-blue)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.15-orange)

## 📖 Table of Contents
- [Overview](#-overview)
- [Features](#-features)
- [System Architecture](#system-architecture)
- [User Roles](#user-roles)
- [Modules](#-modules)
- [Installation](#-installation)
- [Usage](#-usage)
- [Security & Privacy](#-security--privacy)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)


---

## 🌟 Overview

MindCare is a comprehensive, AI-driven web application designed to bridge the gap between self-care and professional mental health support. Built for students and young professionals, it integrates biometric emotion detection, AI-powered journaling, secure tele-therapy, and peer support into one seamless platform.

### 🎯 Key Innovations
- **Biometric Emotion Recognition** via custom-trained EfficientNet model
- **Privacy-first AI Video Journal with analysis and insights** and ephemeral storage
- **Hybrid AI Companion** with crisis detection
- **Role-based professional ecosystem** with verified psychologists(verified via admins)
- **Peer chat ans support circles** in Buddy Space

---

## ✨ Features

### 👥 User Dashboard
| Home page | Chatbot |
| :---: | :---: |
|![Alt Text](screenshots/home_page1.png)|![Alt Text](screenshots/chatbot.png)|

- **Emotion Detection**: Real-time facial expression analysis during video journals
- **AI Chatbot (EmbraceAI)**: Empathetic conversation with safety fallbacks
- **Video Journal**: Record reflections with automatic emotion timeline generation
- **Buddy Space**: Connect with peers based on shared interests and challenges
- **Resource Hub**: Access curated mental health resources and articles
- **Appointment Booking**: Schedule sessions with verified psychologists

### 👨‍⚕️ Psychologist Dashboard
![Psychologist Dashboard](https://img.shields.io/badge/Module-Psychologist_Dashboard-purple)
| Psychologist dashboard | Pschologist dashboard |
| :---: | :---: |
|![Alt Text](screenshots/psychologist_dashboard1.png)|![Alt Text](screenshots/psychologist_dashboard2.png)|

| Feature | Status | Description |
|---------|--------|-------------|
| **Request Pool** | ✅ Live | Accept patient consultation requests |
| **My Schedule** | ✅ Live | View upcoming sessions, start video calls, send prescriptions |
| **Appointment Management** | ✅ Live | Manage bookings and availability |

### 👑 Admin Panel
![Admin Panel](https://img.shields.io/badge/Module-Admin_Panel-red)
| Admin Dashboard | user management |
| :---: | :---: |
|![Alt Text](screenshots/admin_dashboard1.png)|![Alt Text](screenshots/user_management.png)|

- **User Management**: View, verify, and manage all accounts
- **Psychologist Verification**: Validate licenses and approve/reject applications
- **Analytics Dashboard**: Platform usage statistics and insights
- **Content Moderation**: Monitor Buddy Space and resource submissions
- **System Configuration**: Manage platform settings and feature flags

---
## <a id="system-architecture"></a>🏗️ System Architecture

### 🔧 Tech Stack
```
Frontend:
  • React.js 18 with TypeScript
  • Material-UI / Tailwind CSS
  • WebRTC for video calls (Jitsi integration)

Backend:
  • Flask (Python) REST API
  • MongoDB with Mongoose ODM
  • JWT Authentication

AI/ML Services:
  • TensorFlow.js for client-side emotion detection
  • EfficientNet-B0 for facial expression analysis
  • LLM for EmbraceAI

```
---

## <a id="user-roles"></a>👥 User Roles

| Role | Permissions | Access Level |
|------|-------------|--------------|
| **User** | Basic features, Buddy Space, AI Chatbot, Video Journaling | 🔓 Public |
| **Psychologist** | Patient management, Video sessions, Prescriptions | 🔐 Verified Only |
| **Admin** | Full system control, User management, Analytics | 🔑 Super Admin |

---

## 🧩 Modules

### 1. Emotion Detection Module
![AI](https://img.shields.io/badge/AI-Emotion_Detection-blueviolet)
![Alt Text](screenshots/mood_mirror.png)

- **Model**: Custom-trained EfficientNet-B0
- **Emotions**: Happy, Sad, Angry, Fear, Surprise, Disgust, Neutral
- **Accuracy**: 79.2% on test dataset
- **Privacy**: On-device processing option available

### 2. Video Journal System
![Privacy](https://img.shields.io/badge/Privacy-First_Architecture-green)
| Video Journaling | Analysis |
| :---: | :---: |
|![Alt Text](screenshots/video_journaling1.png)|![alt text](screenshots/video_journaling2.png)|

- Record 1-5 minute video reflections
- Automatic emotion timeline generation
- Transcript storage (video files deleted post-processing)
- Emotional trend analysis with AI insights(stored)

### 3. EmbraceAI Chatbot
![AI Chat](https://img.shields.io/badge/AI-Hybrid_Chatbot-orange)
![Alt Text](screenshots/chatbot.png)

- **Primary**: API integration
- **Fallback**: Local rule-based engine
- **Safety**: Crisis keyword detection → Emergency resources
- **recommendation**: Recommends resources based on user input

### 4. Buddy Space
![Social](https://img.shields.io/badge/Module-Buddy_Space-9cf)
| Buddy Space | Support circles |
| :---: | :---: |
|![Alt Text](screenshots/buddy_space1.png)|![alt text](screenshots/buddy_space2.png)|

- peer chat
- Support circle creation
- Anonymous posting option

### 5. Tele-Therapy System
![Video](https://img.shields.io/badge/Feature-Video_Therapy-red)
| Jitsi session | Prescription sent |
| :---: | :---: |
|![Alt Text](screenshots/jitsi_session.png)|![Alt Text](screenshots/prescription_sent.jpeg)|
| Write prescription | 
| :---: | 
|![Alt Text](screenshots/write_prescription.png)|

- End-to-end encrypted video calls (Jitsi)
- Prescription PDF generation
- Session notes and follow-ups

---

## 🚀 Installation

### Prerequisites
- Node.js 18+ 
- Python 3.11+
- MongoDB 7.0+


### Backend Setup
```bash
# Clone repository
git clone https://github.com/yourusername/mindcare.git
cd mindcare/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env with your configuration

# Run migrations
python manage.py migrate

# Start server
python app.py
```

### Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local

# Start development server
npm start
```
---

## 📱 Usage

### For First-Time Users
1. **Register** with email and basic details
2. **Complete onboarding** (interests, preferences)
3. **Try the AI Chatbot** for immediate support
4. **Record a Video Journal** to track emotions
5. **Explore Buddy Space** to connect with peers

### For Psychologists
1. **Apply for verification** with license details
2. **Wait for admin approval** (24-48 hours)
3. **Set up profile and availability**
4. **Monitor Request Pool** for patient requests
5. **Conduct sessions** via secure video call

### For Admins
1. **Access Admin Panel** at `/admin`
2. **Review psychologist applications**
3. **Monitor platform analytics**
4. **Manage user accounts and content**

---

## 🔒 Security & Privacy

### Data Protection
- **End-to-end encryption** for all video calls
- **Ephemeral storage** for video recordings
- **Regular security audits** and penetration testing

### Authentication
- JWT tokens with a refresh mechanism
- Role-based access control (RBAC)
- Session timeout after 30 minutes of inactivity

### Crisis Protocol
```
User mentions a crisis keyword
    ↓
AI Chatbot triggers safety override
    ↓
Display emergency resources
    ↓
Option to connect with a human moderator
    ↓
If immediate danger: Notify emergency contact
```

---

## 📚 API Documentation

This document provides technical details for the MindCare REST API. The backend is built using **Python Flask** and **MongoEngine (MongoDB)**. All protected endpoints require a **JWT (JSON Web Token)** passed in the `Authorization` header.

**Base URL:** `http://localhost:5000/api`

---

## 🔐 1. Authentication (`/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/auth/register` | Register a new user or psychologist. | ❌ No |
| `POST` | `/auth/login` | Authenticate and receive a JWT. | ❌ No |

### 📝 POST `/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "user | psychologist",
  "license_number": "PSY-12345"  // Required only if role is psychologist
}
```

**Responses:**
- **201 Created** (User):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "67890abc",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "status": "verified"
  }
}
```

- **201 Created** (Psychologist):
```json
{
  "message": "Registration successful. Your account is pending verification by an administrator.",
  "user": {
    "_id": "67890xyz",
    "name": "Dr. John Doe",
    "email": "drjohn@example.com",
    "role": "psychologist",
    "status": "pending"
  }
}
```

---

## 📊 2. Mood & AI Journaling (`/moods`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/moods/` | Fetch mood history for the logged-in user. | ✅ Yes |
| `POST` | `/moods/` | Log daily mood score and activities. | ✅ Yes |
| `POST` | `/moods/analyze-video` | Upload video for emotional timeline analysis. | ✅ Yes |
| `GET` | `/moods/journal-history` | Fetch previous AI Journal entries. | ✅ Yes |
| `POST` | `/moods/detect-emotion` | Analyze a single image for real-time mood. | ✅ Yes |
| `GET` | `/moods/ai-insights` | Get 30-day AI-generated mood summary. | ✅ Yes |

### 🎥 POST `/moods/analyze-video`

**Content-Type:** `multipart/form-data`

**Request Body:**
```
video: File (webm/mp4)
transcript: String (optional)
duration: Number (seconds)
```

**Response (200 OK):**
```json
{
  "dominant_emotion": "Happy",
  "timeline": [
    {"time": 1.0, "emotion": "Neutral", "confidence": 0.8},
    {"time": 2.5, "emotion": "Happy", "confidence": 0.92},
    {"time": 4.0, "emotion": "Surprise", "confidence": 0.75}
  ],
  "summary": "You started calm and ended happy. We noticed a moment of surprise around the 4-second mark.",
  "avg_confidence": 0.85,
  "video_id": "67890vid123",
  "processed_at": "2025-12-18T10:30:00Z"
}
```

### 📈 POST `/moods/`

**Request Body:**
```json
{
  "mood_score": 7,
  "activities": ["meditation", "walk", "social"],
  "notes": "Feeling productive today",
  "date": "2025-12-18"
}
```

**Response (201 Created):**
```json
{
  "message": "Mood logged successfully",
  "mood_entry": {
    "_id": "67890mood456",
    "user_id": "67890abc",
    "mood_score": 7,
    "date": "2025-12-18",
    "trend": "improving"
  }
}
```

---

## 🗓️ 3. Appointments (`/appointments`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/appointments/` | User: Request a new appointment. | ✅ Yes |
| `GET` | `/appointments/my-appointments` | User: View personal appointment history. | ✅ Yes |
| `GET` | `/appointments/pool` | Doctor: View pending global requests. | ✅ Yes (Doctor) |
| `PUT` | `/appointments/<id>/accept` | Doctor: Claim an appointment from the pool. | ✅ Yes (Doctor) |
| `GET` | `/appointments/my-schedule` | Doctor: View accepted patient list. | ✅ Yes (Doctor) |

### 📅 POST `/appointments/`

**Request Body:**
```json
{
  "preferred_date": "2025-12-25",
  "preferred_time": "14:00",
  "urgency": "medium",
  "notes": "Need help with anxiety management",
  "psychologist_id": "optional_specific_doctor_id"
}
```

**Response (201 Created):**
```json
{
  "message": "Appointment request submitted to the pool",
  "appointment": {
    "_id": "67890appt789",
    "patient_id": "67890abc",
    "status": "pending",
    "pool_id": "pool_001",
    "estimated_wait_time": "2-3 days"
  }
}
```

### 🩺 PUT `/appointments/<id>/accept`

**Path Parameters:**
- `id`: Appointment ID

**Request Body:** (Optional)
```json
{
  "scheduled_date": "2025-12-26",
  "scheduled_time": "15:30",
  "session_type": "video_call"
}
```

**Response (200 OK):**
```json
{
  "message": "Appointment accepted and scheduled",
  "appointment": {
    "_id": "67890appt789",
    "psychologist_id": "67890doc123",
    "patient_id": "67890abc",
    "scheduled_at": "2025-12-26T15:30:00Z",
    "status": "scheduled",
    "meeting_link": "https://meet.jit.si/mindcare-session-xyz123"
  }
}
```

---

## 📄 4. Clinical Documents (`/documents`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/documents/share-report` | User: Email a 30-day PDF report to a doctor. | ✅ Yes |
| `POST` | `/documents/send-prescription` | Doctor: Send session notes/Rx to patient. | ✅ Yes (Doctor) |

### 📧 POST `/documents/share-report`

**Request Body:**
```json
{
  "psychologist_email": "dr.smith@mindcare.com",
  "report_period": "last_30_days",
  "include_video_insights": true,
  "message": "Please review my emotional trends before our session"
}
```

**Response (200 OK):**
```json
{
  "message": "30-day report shared successfully with Dr. Smith",
  "report_id": "67890report456",
  "shared_at": "2025-12-18T11:00:00Z"
}
```

### 💊 POST `/documents/send-prescription`

**Request Body:**
```json
{
  "patient_email": "patient@example.com",
  "patient_name": "Jane Doe",
  "content": "Take 5mg of rest daily. Homework: 3 journaling sessions this week.",
  "session_date": "2025-12-18",
  "follow_up_date": "2025-12-25",
  "attachments": ["breathing_exercise.pdf", "sleep_schedule.docx"]
}
```

**Response (201 Created):**
```json
{
  "message": "Prescription sent successfully",
  "document_id": "67890doc789",
  "patient_notified": true,
  "pdf_url": "/api/documents/download/67890doc789"
}
```

---

## 🤝 5. Buddy Space (`/buddy`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/buddy/buddies` | Fetch recommended peers based on interests. | ✅ Yes |
| `POST` | `/buddy/friend-request/send/<id>` | Send a connection request. | ✅ Yes |
| `POST` | `/buddy/friend-request/accept/<id>` | Accept a pending request. | ✅ Yes |
| `GET` | `/buddy/notifications` | Fetch real-time activity notifications. | ✅ Yes |
| `GET` | `/buddy/group-chats` | Fetch available support circles. | ✅ Yes |

### 👥 GET `/buddy/buddies`

**Query Parameters:**
- `limit`: Number of recommendations (default: 10)
- `interests`: Filter by specific interests (comma-separated)

**Response (200 OK):**
```json
{
  "recommended_buddies": [
    {
      "_id": "67890buddy123",
      "name": "Alex Johnson",
      "interests": ["meditation", "anxiety_support", "yoga"],
      "matching_score": 0.85,
      "status": "online",
      "mutual_interests": 3
    },
    {
      "_id": "67890buddy456",
      "name": "Sam Wilson",
      "interests": ["academic_stress", "mindfulness"],
      "matching_score": 0.72,
      "status": "offline",
      "mutual_interests": 2
    }
  ],
  "total_matches": 24
}
```

### 🔔 GET `/buddy/notifications`

**Response (200 OK):**
```json
{
  "notifications": [
    {
      "type": "friend_request",
      "from_user": "67890buddy123",
      "from_name": "Alex Johnson",
      "message": "wants to connect with you",
      "timestamp": "2025-12-18T10:15:00Z",
      "read": false
    },
    {
      "type": "group_invite",
      "group_name": "Anxiety Support Circle",
      "invited_by": "Dr. Rachel",
      "timestamp": "2025-12-18T09:30:00Z",
      "read": true
    }
  ],
  "unread_count": 1
}
```

---

## 👑 6. Administration (`/admin`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/admin/stats` | Fetch global system statistics. | ✅ Admin |
| `GET` | `/admin/pending-approvals` | List psychologists awaiting verification. | ✅ Admin |
| `PUT` | `/admin/approve/<id>` | Verify and activate a psychologist account. | ✅ Admin |
| `GET` | `/admin/users` | Manage/View all registered users. | ✅ Admin |
| `DELETE` | `/admin/users/<id>` | Delete a user account. | ✅ Admin |

### 📊 GET `/admin/stats`

**Response (200 OK):**
```json
{
  "total_users": 1250,
  "active_today": 342,
  "total_psychologists": 45,
  "pending_approvals": 3,
  "total_sessions": 892,
  "avg_session_rating": 4.7,
  "platform_uptime": "99.8%",
  "ai_chat_usage": 2456,
  "video_journals": 567,
  "busiest_time": "18:00-20:00"
}
```

### ✅ PUT `/admin/approve/<id>`

**Path Parameters:**
- `id`: Psychologist user ID

**Request Body:** (Optional)
```json
{
  "verification_notes": "License verified, credentials confirmed",
  "specializations": ["anxiety", "depression"],
  "consultation_fee": 75
}
```

**Response (200 OK):**
```json
{
  "message": "Psychologist account verified successfully",
  "psychologist": {
    "_id": "67890doc123",
    "name": "Dr. Rachel Smith",
    "email": "rachel@mindcare.com",
    "status": "verified",
    "verified_at": "2025-12-18T11:30:00Z",
    "verified_by": "admin@mindcare.com"
  }
}
```

---

## 🤖 7. Embrace AI Chat (`/chat`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/chat/talk` | Send a message to the Gemini-powered bot. | ✅ Yes |

### 💬 POST `/chat/talk`

**Request Body:**
```json
{
  "message": "I feel stressed about my upcoming exams",
  "context": "student, final_exams",
  "mood": "anxious",
  "session_id": "optional_continuous_session_id"
}
```

**Response (200 OK):**
```json
{
  "reply": "I hear you. Exam stress is completely normal. Let's try a quick 4-7-8 breathing exercise together...",
  "sentiment": "stressed",
  "recommended_tool": "4-7-8 Breathing Exercise",
  "crisis_level": "normal",
  "follow_up_questions": [
    "How long have you been feeling this way?",
    "Have you tried any relaxation techniques before?"
  ],
  "resources": [
    {
      "title": "Exam Anxiety Guide",
      "url": "/resources/exam-anxiety.pdf",
      "type": "pdf"
    }
  ],
  "session_id": "67890chat123"
}
```

**Crisis Detection Response:**
```json
{
  "reply": "I'm concerned about what you're sharing. Please reach out to a human immediately.",
  "crisis_level": "high",
  "emergency_contacts": [
    "National Suicide Prevention Lifeline: 988",
    "Crisis Text Line: Text HOME to 741741"
  ],
  "immediate_action": "Connecting you with a crisis counselor...",
  "notify_human": true
}
```

---

## 🛠 Status Codes

| Code | Description |
|------|-------------|
| **200 OK** | Request succeeded. |
| **201 Created** | Resource successfully created. |
| **400 Bad Request** | Missing fields or invalid data. |
| **401 Unauthorized** | Invalid or missing JWT. |
| **403 Forbidden** | Role-based access denied (e.g., Psychologist not verified). |
| **404 Not Found** | Resource does not exist. |
| **500 Internal Server Error** | AI API failure or DB crash. |

### 🔒 Authentication Header Example

```http
GET /api/moods/ HTTP/1.1
Host: localhost:5000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

---

## 📦 Rate Limiting

- **General Endpoints:** 100 requests/hour per user
- **AI/ML Endpoints:** 20 requests/hour per user
- **Admin Endpoints:** No limit (admin only)

---

## 🚨 WebSocket Events (Real-time)

```javascript
// Connection
const socket = io('http://localhost:5000', {
  auth: {
    token: 'your_jwt_token'
  }
});

// Listen for appointment updates
socket.on('appointment_update', (data) => {
  console.log('New appointment status:', data);
});

// Listen for buddy notifications
socket.on('buddy_notification', (data) => {
  console.log('New buddy activity:', data);
});

// Listen for chat messages
socket.on('ai_chat_response', (data) => {
  console.log('AI response:', data);
});
```

---

## 🧪 Testing Endpoints

### Using cURL:
```bash
# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","role":"user"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get mood history (with token)
curl -X GET http://localhost:5000/api/moods/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md).

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

### Development Guidelines
- Write clear commit messages
- Add tests for new features
- Update documentation accordingly
- Follow the existing code style

---

## 🙏 Acknowledgments

- **TensorFlow.js** team for emotion detection models
- **Jitsi** for secure video conferencing
- **MongoDB** for database solutions
- **Tailwind CSS** for styling
- **Gemini** for AI insights

---

*"Taking care of your mental health is an act of self-respect."* - MindCare

---
