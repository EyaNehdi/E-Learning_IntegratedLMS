import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import StudentSignup from './pages/StudentSignup';
import InstructorSignup from './pages/InstructorSignup';
import MfaSetup from './pages/MfaSetup';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Home route with login buttons */}
          <Route path="/" element={
            <div className="login-options">
              <h1>Welcome to the Learning Platform</h1>
              <div className="button-container">
                <Link to="/login/student">
                  <button className="login-btn student">Sign up as Student</button>
                </Link>
                <Link to="/login/instructor">
                  <button className="login-btn instructor">Sign up as Instructor</button>
                </Link>
                <Link to="/mfa-setup">
                  <button className="mfa-setup-btn">Enable MFA</button>
                </Link>
              </div>
            </div>
          } />

          {/* Login routes */}
          <Route path="/login/student" element={<StudentSignup />} />
          <Route path="/login/instructor" element={<InstructorSignup />} />

          <Route path="/mfa-setup" element={<MfaSetup />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;