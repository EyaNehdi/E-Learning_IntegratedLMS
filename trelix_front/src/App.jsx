import "./App.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from './components/Login';
import SignupInstructor from './components/Instructor/Signup';
import SignupStudent from './components/Student/Signup';
import Index from './components/index';
import ForgetPassword from './components/ForgetPassword';
import Dashboard from './components/Admin/Dashboard';

import Preloader from "./components/Preloader/Preloader";
import CV from "./pages/cv";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/instructor" element={<SignupInstructor />} />
        <Route path="/student" element={<SignupStudent />} />
        <Route path="/forget" element={<ForgetPassword />} />
        <Route path="/CV" element={<CV />} />
        <Route path="/Dashboard" element={<Dashboard/>} />
      </Routes>
    </Router>
  );
}

export default App;
