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
import Index from "./components";
import AdminRoute from "./layout/AdminRoute";
import Leaderboard from "./pages/Leaderboard/Leaderboard";
import DailyQuizzes from "./pages/Admin/DailyQuizzes";

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
        {/* **************** */}
        {/* Protected routes  */}
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<HomeUser />} />
          
          <Route path="/profile" element={<ProfilePage />}>
            <Route path="details" element={<ProfileDetails />} />
            <Route path="settings" element={<MultiFactorAuth />} />
            
            
          </Route>
          <Route path="/leaderboard" element={<Leaderboard />} />
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
