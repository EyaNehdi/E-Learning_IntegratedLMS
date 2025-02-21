import "./App.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/SignIn/Login";
import Index from "./components/index";
import ForgetPassword from "./components/ForgetPassword";
import Dashboard from "./components/Admin/Dashboard";
import Profile from "./components/Profile";
import SignUpPage from "./pages/SignUpPage/SignUpPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicy/PrivacyPolicyPage";
import NotFound from "./pages/NotFound/NotFound";

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

        <Route path="stat" element={<Statistic/>} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
