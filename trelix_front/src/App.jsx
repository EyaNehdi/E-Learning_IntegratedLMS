import "./App.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";


import SignupInstructor from './components/Instructor/InstructorRegister';
import SignupStudent from './components/Student/StudentRegister';

import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

import EmailVerificationPage from "./pages/EmailVerificationPage";
import { Toaster } from "react-hot-toast";



import Login from "./pages/SignIn/Login";
import Index from "./components/index";
import Profile from "./components/Profile";
import SignUpPage from "./pages/SignUpPage/SignUpPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicy/PrivacyPolicyPage";
import Review from './components/Admin/Review';
import Leave from './components/Admin/Leave';
import Manage from './components/Admin/Manage';
import Reports from './components/Admin/Reports';

import { useAuthStore } from "./store/authStore";


import NotFound from "./components/Notfound";
import Settings from './components/Admin/Settings';

import { LinkedInCallback } from 'react-linkedin-login-oauth2';
import CV from "./pages/cv";
import ProtectedRoute from "./pages/ProtectedRoute"; 



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
        <Route path="/set" element={<Settings />} />


        


        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />

        <Route path="*" element={<NotFound />} />

      </Routes>
<Toaster />
    </Router>
  );
}

export default App;
