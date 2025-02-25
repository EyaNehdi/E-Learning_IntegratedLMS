import "./App.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from './pages/SignIn/Login';
import SignupInstructor from './components/Instructor/InstructorRegister';
import SignupStudent from './components/Student/StudentRegister';
import Index from './components/index';
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

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
       

       
        <Route path="/signup" element={<SignupInstructor/>} />
        
        
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
        
        
        
        
	
      </Routes>
      <Toaster />
	  
    </Router>
	
  );
}

export default App;
