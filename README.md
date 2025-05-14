<p align="center">
  <img src="https://raw.githubusercontent.com/EyaNehdi/E-Learning_IntegratedLMS/refs/heads/main/trelix_front/public/assets/images/logoo.png" width="20%">
</p>

<h2 align="center">Trelix - Learning That Adapts to You!</h2>

Trelix is a smart and interactive Learning Management System (LMS) designed to personalize the digital education experience. Developed as part of an academic project at **Esprit School of Engineering**, this MERN-based platform goes beyond standard LMS solutions by integrating intelligent recommendations, gamified assessments, and advanced administrative tools.

---

## 🌍 Overview

Trelix aims to revolutionize e-learning by offering:

- Personalized course recommendations based on preferences and engagement.
- Real-time quizzes and exams with leaderboards.
- Gamification via badges, certificates, and achievements.
- Role-based dashboards for students, instructors, and admins.
- Seamless integration with Google Classroom and Moodle.
- Multifactor authentication and advanced user security.
- Built-in chatbot and productivity tools (summarizer, citation generator, dictionary).
- Web Scraped Courses added matching Course Collection

---

## ✨ Features

- 🔐 **Secure Authentication**: Email verification, password reset, MFA with backup codes and trusted devices.
- 🧠 **AI Tools**: Gemini chatbot, PDF summarizer, emotion detection, intelligent course recommendations.
- 🧾 **Quizzes & Exams**: Real-time monitoring, scoreboards, and quiz preview/edit for instructors.
- 🧑‍🏫 **Instructor Tools**: Add/manage courses, chapters, quizzes, and exams.
- 📊 **Admin Panel**: Audit logs, financial dashboard, badge management, user monitoring, system settings.
- 🎓 **Gamification**: Earn badges, view achievements, and obtain verifiable certificates.
- 💼 **E-commerce Integration**: Stripe for purchases, user balance tracking, course store & packs.

---

## 🧪 Tech Stack

### Frontend

- **React** (SPA)
- **React Router DOM**
- **Tailwind CSS**
- **React Hot Toast** (for notifications)
- **LinkedIn OAuth**
- **Socket.IO Client**
- **Axios**

### Backend

- **Node.js** + **Express.js**
- **MongoDB** + **Mongoose**
- **Socket.IO**
- **Stripe API**
- **Google Classroom API**
- **Session Management with MongoStore**
- **Multer (File Uploads)**
- **Jade View Engine** (for basic pages)

### Other Tools & APIs

- **PDF-Parse** (Summarization)
- **OpenAI/Gemini APIs** (Chatbot)
- **node-cron** (Scheduled jobs)
- **Cloudinary** (for certificate uploads)
- **Emotion Detection with TensorFlow.js**
- **Docker/Render/Vercel** (Deployment)

---

## 🧱 Architecture

<p align="center">
  <img src="https://raw.githubusercontent.com/EyaNehdi/E-Learning_IntegratedLMS/refs/heads/main/trelix_front/public/assets/images/architecture.png" alt="Trelix System Architecture Overview">
</p>

The architecture follows a modular MERN stack design. Key highlights:

- Frontend built in React with protected/public/admin routing layers.
- Backend in Express with modular route files and session-based authentication.
- MongoDB serves as the central data store, storing users, quizzes, goals, and more.
- Google Classroom and Stripe APIs integrated directly into backend services.
- Socket.IO used for real-time interactions (quizzes, meetings, etc.).

---

## ⚙️ CI/CD Pipeline

Trelix integrates a robust DevOps pipeline for automation, quality control, and seamless deployment.

- **🛠 Jenkins Pipeline**: Automates stages including testing, building, artifact publishing, and Docker container orchestration.
- **📦 Docker Compose**: Defines frontend and backend services for local and containerized deployment.
- **🧪 SonarQube Integration**: Analyzes code quality during the CI process.
- **📤 Nexus Repository**: Used for securely storing and publishing backend artifacts.

---

## 📁 Directory Structure

### Frontend Highlights (`trelix_front`)

```
pages/
  └── SignIn/, SignUpPage/, Profile/, Admin/, Home/, etc.
components/
  └── Quiz/, Exam/, Instructor/, Student/, Admin/, etc.
layout/
  └── ProtectedRoute.jsx, PublicRoute.jsx, AdminRoute.jsx
App.jsx
```

### Backend Highlights (`trelix_back`)

```
routes/
  └── users.js, authRoutes.js, stripe.routes.js, classroom.js, etc.
models/
  └── User.js, Certificate.js, Goal.js, Review.js, etc.
controllers/
  └── quizzLeaderboardController.js, ...
utils/
  └── getInactiveUsers.js, socket.js, etc.
app.js
config/
  └── db.js
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have:

- Node.js >= 18
- MongoDB (local or Atlas)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/EyaNehdi/E-Learning_IntegratedLMS.git

# Backend Setup
cd trelix/trelix_back
npm install
cp .env.example .env    # Set your MONGO_URI, SESSION_SECRET, etc.
node app.js             # or nodemon app.js

# Frontend Setup
cd ../trelix_front
npm install
npm run dev             # Vite or CRA-based dev server
```

---

## 🌐 Live Demo

Access the deployed platform at:  
🔗 [https://trelix-livid.vercel.app](https://trelix-livid.vercel.app)

---

## 🧠 Smart Capabilities

- **Real-Time Engagement Check**: Users are monitored daily and marked as `active`, `at_risk`, or `churned`.
- **Socket-Based Updates**: Live quiz events and leaderboard refreshes.
- **Certificate Generator**: Verified PDF downloads with secure tracking.
- **AI Assistant**: Chatbot powered by large language models.

---

## 🔐 Security & Privacy

- Passwords hashed with bcrypt
- Sessions stored securely via `connect-mongo`
- MFA (Multi-Factor Authentication) with trusted device management
- Email verification and password recovery mechanisms
- GDPR-compliant Privacy Policy

---

## 🙌 Acknowledgments

This project was developed by students at **Esprit School of Engineering**  
Thanks to the professors and peer contributors who supported the ideation, architecture, and deployment phases.

---

## 💡 Future Improvements

- Mobile App (React Native or Flutter)
- LMS Plugin Marketplace
- Instructor Analytics Dashboard
- Full PWA (Progressive Web App) Support
- AI-Powered Auto-Grading

---

## 🛠 Keywords

_Education Technology, Learning Management System, MERN Stack, Esprit School of Engineering, Gamified Learning, Student Engagement, Node.js LMS, React eLearning, MongoDB Certificate Management, Intelligent Quiz Platform, Chatbot Integration, Stripe Payment LMS, Google Classroom Integration_

---

## 🌟 Show Your Support

If this project inspired or helped you, consider giving it a ⭐ on GitHub!
Powered by
