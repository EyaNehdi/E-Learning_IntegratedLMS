import "./App.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from './components/Login';
import SignupInstructor from './components/Instructor/Signup';
import SignupStudent from './components/Student/Signup';
import Index from './components/index';
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import Dashboard from './components/Admin/Dashboard';
import EmailVerificationPage from "./pages/EmailVerificationPage";
import { Toaster } from "react-hot-toast";

import { useAuthStore } from "./store/authStore";
import Preloader from "./components/Preloader/Preloader";




const ProtectedRoute = ({ children }) => {
	const { isAuthenticated, user } = useAuthStore();

	if (!isAuthenticated) {
		return <Navigate to='/login' replace />;
	}

	if (!user.isVerified) {
		return <Navigate to='/verify-email' replace />;
	}

	return children;
};

// redirect authenticated users to the home page
const RedirectAuthenticatedUser = ({ children }) => {
	const { isAuthenticated, user } = useAuthStore();

	if (isAuthenticated && user.isVerified) {
		return <Navigate to='/' replace />;
	}

	return children;
};

function App() {
	
  
  return (
    



    
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/instructor" element={<SignupInstructor />} />
        <Route path="/student" element={<SignupStudent />} />
       
        <Route path="/verify-email" element={<EmailVerificationPage />} />



        <Route
					path='/reset-password/:token'
					element={
						<RedirectAuthenticatedUser>
							<ResetPasswordPage />
						</RedirectAuthenticatedUser>
					}
				/>
        <Route
				path="/forgot-password" 
					element={
						<RedirectAuthenticatedUser>
							<ForgotPasswordPage/>
						</RedirectAuthenticatedUser>
					}
				/>
        
        
        
        <Route path="/Dashboard" element={<Dashboard/>} />
	
      </Routes>
      <Toaster />
	  
    </Router>
	
  );
}

export default App;
