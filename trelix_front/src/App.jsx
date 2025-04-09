import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import { Toaster } from "react-hot-toast";
import Login from "./pages/SignIn/Login";
import SignUpPage from "./pages/SignUpPage/SignUpPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicy/PrivacyPolicyPage";
import Review from "./components/Admin/Review";
import Leave from "./components/Admin/Leave";
import Manage from "./components/Admin/Manage";
import Reports from "./components/Admin/Reports";
import NotFound from "./components/Notfound";
import Settings from "./components/Admin/Settings";
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
import CourseLearningPlatform from "./components/Quiz/test";
import ClassroomDashboard from "./pages/classroom/ClassroomDashboard"
 

function App() {
  return (
    <Router>
      <Routes>
        {/* **************** */}
        <Route path="/addQuizzL" element={<DailyQuizzes />}/>
        {/* Public routes */}
        <Route element={<PublicRoute />}>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-email" element={<EmailVerificationPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          
          
          <Route
            path="/reset-password/:token"
            element={<ResetPasswordPage />}
          />
        </Route>
        <Route path="/test" element={<CourseLearningPlatform />} />
        {/* **************** */}
        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<HomeUser />} />
         
          <Route path="/allcours" element={<Allcourse />} />
          <Route path="/exams" element={<ExamStudent />} />

          <Route path="/chapters/:courseid" element={<ListChapters />} >
            <Route path="content/:id" element={<ChapterContent />} />
          </Route>
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/quiz" element={<QuizzLeaderboard />}/>
          <Route path="/profile" element={<ProfilePage />}>
            <Route index element={<ProfileDetails />} />
            <Route path="details" element={<ProfileDetails />} />
         
            <Route path="addchapter" element={<AddChapter />} />
            <Route path="addExam" element={<AddExam />} />
            <Route path="Allexams" element={<AllExamsInstructor />} />
            <Route path="allquiz" element={<AllQuiz />} />
            <Route path="preview/:idquiz" element={<QuizPreview />} />
            <Route path="edit/:id" element={<QuizEdit />} />
            <Route path="addquiz" element={<AddQuiz />} />
            <Route path="settings" element={<MultiFactorAuth />} />
            {/* Ajout de la route pour changer le mot de passe */}
            <Route path="change-password" element={<ChangePassword />} />
            <Route path="Course" element={<Courses/>} />
            <Route path="course-chapter/:courseId" element={<CourseChapter/>} />
            <Route path="list" element={<Listecourse/>} />
            <Route path="module" element={<Module />} />
            <Route path="/profile/classroom/dashboard" element={<ClassroomDashboard />} />
            <Route
              path="/profile/edit-course/:courseId"
              element={<EditCourse />}
            />
            <Route path="/profile/allcours" element={<Allcourse />} />
            
            
          </Route>
          
        </Route>
        <Route path="/CV" element={<CV />} />
        {/* **************** */}
        {/* Admin routes */}
        <Route element={<AdminRoute />}>
          <Route path="/Review" element={<Review />} />
          <Route path="/leave" element={<Leave />} />
          <Route path="/leave/:id" element={<Leave />} />
          <Route path="/manage" element={<Manage />} />
          <Route path="/report" element={<Reports />} />
          <Route path="/set" element={<Settings />} />
        </Route>
        {/* **************** */}
        <Route path="/linkedin/callback" element={<LinkedInCallback />} />
        {/* Not found route */}

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
