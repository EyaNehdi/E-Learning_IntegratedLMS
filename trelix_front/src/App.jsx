import "./App.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ForgetPassword from './components/ForgetPassword';
import Login from "./pages/SignIn/Login";
import Index from "./components/index";
import Profile from "./components/Profile";
import SignUpPage from "./pages/SignUpPage/SignUpPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicy/PrivacyPolicyPage";
import NotFound from "./pages/NotFound/NotFound";
import Review from './components/Admin/Review';
import Leave from './components/Admin/Leave';
import Manage from './components/Admin/Manage';
import Reports from './components/Admin/Reports';
import { LinkedInCallback } from 'react-linkedin-login-oauth2';
import CV from "./pages/cv";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forget" element={<ForgetPassword />} />

        <Route path="/CV" element={<CV />} />
        <Route path="/linkedin/callback" element={<LinkedInCallback />} />

       
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/Review" element={<Review />} />
        <Route path="/admin" element={<Review />} />
        <Route path="/leave" element={<Leave />} /> {/* Add User Route */}
        <Route path="/leave/:id" element={<Leave />} /> {/* Edit User Route */}
        <Route path="/manage" element={<Manage />} />
        <Route path="/report" element={<Reports />} />


        <Route path="*" element={<NotFound />} />
        


        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
