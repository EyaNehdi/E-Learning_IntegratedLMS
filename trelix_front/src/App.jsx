import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "./pages/SignIn/Login";
import SignUpPage from "./pages/SignUpPage/SignUpPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicy/PrivacyPolicyPage";
import NotFound from "./components/NotFound";
import { LinkedInCallback } from "react-linkedin-login-oauth2";
import CV from "./pages/cv";
import ProtectedRoute from "./layout/ProtectedRoute";
import HomeUser from "./pages/Home/HomeUser";
import ProfilePage from "./pages/Profile/ProfilePage";
import ProfileDetails from "./components/Profile/ProfileDetails";
import MultiFactorAuth from "./components/MfaSetup/MultiFactorAuth";
import PublicRoute from "./layout/PublicRoute";
import AdminRoute from "./layout/AdminRoute";
import Index from "./components";
import Leaderboard from "./pages/Leaderboard/Leaderboard";
import DailyQuizzes from "./pages/Admin/DailyQuizzes";
import QuizzLeaderboard from "./pages/Leaderboard/QuizzLeaderboard";
import ChangePassword from "./pages/Profile/ChangePassword";
import Module from "./components/Instructor/Module";
import Courses from "./components/Instructor/Courses";
import Listecourse from "./components/Instructor/Listcourse";
import EditCourse from "./components/Instructor/Editcourse";
import Allcourse from "./components/Instructor/AllCourse";
import ListChapters from "./components/Student/ListChapters";
import AddChapter from "./components/Instructor/addChapter";
import ChapterContent from "./components/Student/chapterContent";
import AddQuiz from "./components/Instructor/addQuiz";
import CourseChapter from "./components/Instructor/CourseChapter";
import AllQuiz from "./components/Quiz/AllQuiz";
import QuizPreview from "./components/Quiz/QuizPreview";
import QuizEdit from "./components/Quiz/quizEdit";
import AddExam from "./components/Exam/addExam";
import AllExamsInstructor from "./components/Exam/AllExamsInstractor";
import ExamStudent from "./components/Exam/ExamStudent";
import BrowseCertificates from "./components/Student/BrowseCertificates";
import AuditLogs from "./components/Admin/activitytrack/Audit";
import UsersPage from "./pages/Admin/UsersPage";
import ListUsers from "./components/Admin/ListUsers";
import ManageUser from "./components/Admin/ManageUser";
import ManageBadges from "./components/Admin/ManageBadges";
import BadgeFeature from "./pages/Admin/BadgeFeature";
import ListBadges from "./components/Admin/ListBadges";

import ModifyPreference from "./components/Student/ModifyPreference.jsx";

import StatPreference from "./components/Student/preference-statistics";
import Preference from "./components/Student/AddPreference";
import IntelligentCourses from "./components/Student/IntelligentCourses";
import React, { useState } from "react";
import GeminiChatbot from "./components/GeminiChatbot";

import CourseLearningPlatform from "./components/Quiz/test";

import AssignQuizToChapter from "./components/Quiz/AssignQuizToChapter";
import Achievements from "./components/Profile/Achievements";
import MoodleCourses from "./components/MoodleCourses";
import Calendar from "./components/Calendear/Calendar";
import JoinRoom from "./components/JoinRoom";
import MeetingRoom from "./components/MeetingRoom";
import ChatComponent from "./components/ChatComponent";
import CertificatesPage from "./pages/Certification/CertificatesPage";
import CourseChartPage from "./components/Instructor/CourseChart";
import ClassroomPage from "./components/classroom/ClassroomPage";
import CourseDetailsPage from "./components/classroom/CourseDetailsPage";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import Dictionary from "./components/Dictionary";
import { ExamStatusProvider } from "./components/Exam/ExamStatusContext.jsx";
import Summarizer from "./components/Summarizer";
import CitationGenerator from "./components/CitationGenerator";
import AuditPage from "./pages/Admin/AuditPage.jsx";
import WordleGame from "./components/Leaderboard/WordleGame.jsx";
import AuthDashboard from "./components/Admin/activitytrack/AuthDashboard.jsx";
import ListPacks from "./components/Admin/ListPacks.jsx";
import StoreManagement from "./components/Admin/StoreManagement.jsx";
import Store from "./components/Store/Store.jsx";

import EmotionDetection from "./components/ia/emotion.jsx";

import SystemSettings from "./components/Admin/activitytrack/SystemSettings.jsx";
import FinancialOverview from "./components/Admin/Financial/FinancialOverview.jsx";
import BusinessMetrics from "./components/Admin/Financial/BusinessMetrics.jsx";
import UserTransactions from "./components/Admin/Financial/UserTransactions.jsx";
import PacksLayout from "./pages/Admin/PacksLayout.jsx";
import ViewPack from "./components/Admin/ViewPack.jsx";
import ViewUser from "./components/Admin/ViewUser.jsx";
import QuizzAdd from "./components/Admin/QuizzAdd.jsx";

function App() {
  return (
    <Router>
      <div>
        <ChatComponent />

        <Routes>
          {/* **************** */}
          {/* Public routes */}
          <Route element={<PublicRoute />}>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          </Route>
          <Route path="/test" element={<MoodleCourses />} />
          <Route path="/test1" element={<Calendar />} />
          <Route path="/meeting" element={<JoinRoom />} />
          <Route path="/chat" element={<ChatComponent />} />
          <Route path="/meeting/:roomId" element={<MeetingRoom />} />
          {/* **************** */}
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<HomeUser />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/certificates" element={<CertificatesPage />}>
              <Route index element={<BrowseCertificates />} />
              <Route path="browse" element={<BrowseCertificates />} />
            </Route>

            <Route path="/Moodle" element={<MoodleCourses />} />
            <Route path="/allcours" element={<Allcourse />} />
            <Route path="/chart" element={<CourseChartPage />} />
            <Route path="/exams/:courseid" element={<ExamStudent />} />
            <Route path="/chapters/:slugCourse" element={<ListChapters />}>
              <Route path="content/:id" element={<ChapterContent />} />
            </Route>
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/quiz" element={<QuizzLeaderboard />} />
            <Route path="/Classroom" element={<ClassroomPage />} />
            <Route
              path="course-chapter/:slugCourse"
              element={<CourseChapter />}
            />
            <Route path="list" element={<Listecourse />} />
            <Route path="summarizer" element={<Summarizer />} />

            <Route path="module" element={<Module />} />
            <Route path="achievements" element={<Achievements />} />

            <Route
              path="/profile/edit-course/:courseId"
              element={<EditCourse />}
            />

            <Route path="/profile/classroom" element={<ClassroomPage />} />
            <Route
              path="/profile/classroom/courses/:courseId"
              element={<CourseDetailsPage />}
            />
            <Route path="/profile/preference" element={<Preference />} />
            <Route
              path="/profile/modify-preference"
              element={<ModifyPreference />}
            />
            <Route
              path="/profile/preferencestat"
              element={<StatPreference />}
            />
            <Route
              path="/profile/intelligent-courses"
              element={<IntelligentCourses />}
            />
            <Route path="/store" element={<Store />} />
            <Route path="/profile" element={<ProfilePage />}>
              <Route index element={<ProfileDetails />} />
              <Route path="details" element={<ProfileDetails />} />
              <Route path="test" element={<WordleGame />} />

              <Route path="geminichat" element={<GeminiChatbot />} />
              <Route path="dictionary" element={<Dictionary />} />
              <Route path="chat" element={<ChatComponent />} />
              <Route path="meeting" element={<JoinRoom />} />

              <Route path="CitationGenerator" element={<CitationGenerator />} />

              <Route path="addchapter" element={<AddChapter />} />
              <Route path="addExam" element={<AddExam />} />
              <Route path="Allexams" element={<AllExamsInstructor />} />
              <Route path="allquiz" element={<AllQuiz />} />
              <Route path="preview/:idquiz" element={<QuizPreview />} />
              <Route path="edit/:id" element={<QuizEdit />} />
              <Route path="addquiz" element={<AddQuiz />} />
              <Route path="settings" element={<MultiFactorAuth />} />
              <Route path="change-password" element={<ChangePassword />} />
              <Route path="Course" element={<Courses />} />
              <Route
                path="course-chapter/:slugCourse"
                element={<CourseChapter />}
              />
              <Route path="list" element={<Listecourse />} />
              <Route path="summarizer" element={<Summarizer />} />

              <Route path="module" element={<Module />} />
              <Route path="achievements" element={<Achievements />} />

              <Route
                path="/profile/edit-course/:courseId"
                element={<EditCourse />}
              />

              <Route path="/profile/classroom" element={<ClassroomPage />} />
              <Route
                path="/profile/classroom/courses/:courseId"
                element={<CourseDetailsPage />}
              />
              <Route path="/profile/preference" element={<Preference />} />
              <Route
                path="/profile/preferencestat"
                element={<StatPreference />}
              />
              <Route
                path="/profile/intelligent-courses"
                element={<IntelligentCourses />}
              />

              <Route path="/profile/allcours" element={<Allcourse />} />
              <Route
                path="assgnedQuizToChapter"
                element={<AssignQuizToChapter />}
              />
            </Route>
            <Route path="/CV" element={<CV />} />
          </Route>
          {/* **************** */}
          {/* Admin routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<UsersPage />}>
              <Route index element={<ListUsers />} />
              <Route path="users" element={<ListUsers />} />
              <Route path="update/:id" element={<ManageUser />} />
              <Route path="create" element={<ManageUser />} />
              <Route path="details/:id" element={<ViewUser />} />
            </Route>
            <Route path="monitor" element={<AuditPage />}>
              <Route index element={<AuthDashboard />} />
              <Route path="logs" element={<AuditLogs />} />
              <Route path="users-audit" element={<AuthDashboard />} />
              <Route path="system" element={<SystemSettings />} />
            </Route>
            <Route path="/badge" element={<BadgeFeature />}>
              <Route index element={<ListBadges />} />
              <Route path="createBadge" element={<ManageBadges />} />
              <Route path="edit/:id" element={<ManageBadges />} />
              <Route path="list-badges" element={<ListBadges />} />
              <Route path="quizz-add" element={<QuizzAdd />} />
            </Route>
            <Route path="business-metrics" element={<FinancialOverview />}>
              <Route index element={<BusinessMetrics />} />
              <Route path="user-transactions" element={<UserTransactions />} />
            </Route>
            <Route path="/storeAdmin" element={<PacksLayout />}>
              <Route index element={<ListPacks />} />
              <Route path="create" element={<StoreManagement />} />
              <Route path="edit/:id" element={<StoreManagement />} />
              <Route path=":id" element={<ViewPack />} />
            </Route>
          </Route>
          {/* **************** */}
          <Route path="/linkedin/callback" element={<LinkedInCallback />} />
          {/* Not found route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
