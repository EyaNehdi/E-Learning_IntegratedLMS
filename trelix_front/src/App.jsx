import "./App.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from './components/Login';
import ForgetPassword from './components/ForgetPassword';
import Login from "./pages/SignIn/Login";
import Index from "./components/index";
import ForgetPassword from "./components/ForgetPassword";
import Dashboard from "./components/Admin/Dashboard";
import Profile from "./components/Profile";
import SignUpPage from "./pages/SignUpPage/SignUpPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicy/PrivacyPolicyPage";
import NotFound from "./pages/NotFound/NotFound";

import Admin from './components/Admin/Admin';
import Review from './components/Admin/Review';
import Leave from './components/Admin/Leave';
import Manage from './components/Admin/Manage';
import Reports from './components/Admin/Reports';
import Statistic from "./components/Admin/Statistic";

import CV from "./pages/cv";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forget" element={<ForgetPassword />} />

        <Route path="/CV" element={<CV />} />

        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/Review" element={<Review />} />
        <Route path="/leave" element={<Leave />} />
        <Route path="/manage" element={<Manage />} />
        <Route path="/report" element={<Reports />} />
        


        <Route path="stat" element={<Statistic/>} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
