import "./App.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from './components/Login';
import SignupInstructor from './components/Instructor/Signup';
import SignupStudent from './components/Student/Signup';
import Index from './components/index';
import ForgetPassword from './components/ForgetPassword';
import Profile from "./components/Profile";
import Switch from "./components/Switch";
import SignUpPage from "./pages/SignUpPage";

import Preloader from "./components/Preloader/Preloader";
import Admin from './components/Admin/Admin';
import Review from './components/Admin/Review';
import Leave from './components/Admin/Leave';
import Manage from './components/Admin/Manage';
import Reports from './components/Admin/Reports';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/instructor" element={<SignupInstructor />} />
        <Route path="/student" element={<SignupStudent />} />
        <Route path="/forget" element={<ForgetPassword />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/Switch" element={<Switch />} />
        <Route path="/Review" element={<Review />} />
        <Route path="/leave" element={<Leave />} />
        <Route path="/manage" element={<Manage />} />
        <Route path="/report" element={<Reports />} />
        

      </Routes>
    </Router>
  );
}

export default App;
