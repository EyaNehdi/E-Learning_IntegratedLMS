
import { GoogleLogin } from '@react-oauth/google';
import GitHubLogin from 'react-github-login';
import MicrosoftLogin from 'react-microsoft-login';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useState,useEffect } from 'react';
import { useAuthStore } from "../../store/authStore";
import { motion } from "framer-motion";
import PasswordStrengthMeter from '../PasswordStrengthMeter';
function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'instructor'});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const {  isAuthenticated, checkAuth } = useAuthStore();
  useEffect(() => {
    console.log("🟢 isAuthenticated state:", isAuthenticated);
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);
  useEffect(() => {
    console.log("🟢 Checking authentication on mount...");
    checkAuth();
  }, [checkAuth]);
  
  const handleGoogleLoginSuccess = async (response) => {
    try {
      const decoded = jwtDecode(response.credential);  // Decode JWT token from Google
      const googleUserData = {
        firstName: decoded.given_name,
        lastName: decoded.family_name,
        email: decoded.email,
        role: 'instructor',  // Default role for Google sign-up
      };
  
      // Send Google user data to the backend for registration
      const res = await axios.post('http://localhost:5173/api/auth/register/google', googleUserData, {
        withCredentials: true,
      });
  
      if (res.data) {
        navigate('/verify-email');  // Redirect after successful signup
      }
      setLoading(false);
    } catch (err) {
      setError('Google signup failed. Please try again.');
      console.error(err);
    }
  };

  const handleGoogleLoginFailure = () => {
    console.error("Google login failed");
  };
  
  // Handle Google login error
  const handleGoogleLoginError = () => {
    setError('Google login failed.');
  };
  
  // Handle GitHub login success
  const handleGitHubLoginSuccess = async (response) => {
    try {
      // Send the authorization code to the backend
      const res = await axios.post('http://localhost:5173/api/auth/register/github', {
        code: response.code,
      });
  
      if (res.data) {
        navigate('/');  // Redirect after successful signup
      }
    } catch (err) {
      setError('GitHub signup failed. Please try again.');
      console.error(err);
    }
  };
  
  // Handle GitHub login error
  const handleGitHubLoginError = () => {
    setError('GitHub login failed.');
  };
  
  // Handle Microsoft login success
  const handleMicrosoftLoginSuccess = async (response) => {
    setLoading(true);
    setError('');
  
    try {
      const responseData = await axios.post(
        '/api/auth/register/instructor',
        { token: response.authentication.accessToken },
        { withCredentials: true }
      );
  
      if (responseData.data) {
        navigate('/Home'); // Redirect after successful login
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Microsoft login failed. Please try again.');
    
  }};

  const [errors,setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  useEffect(() => {
    // Check if there are any errors
    const hasErrors = Object.values(errors).some(error => error !== "");
  
    // Check if all fields are filled
    const allFieldsFilled = Object.values(formData).every(value => value.trim() !== "");
  
    // Set form validity state
    setIsFormValid(!hasErrors && allFieldsFilled);
  }, [errors, formData]); // Re-run when errors or form data change
  

   //Controle de saisie 
   const validateForm = () => {
    const newErrors = {};
  
    if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters.";
    }
  
    if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters.";
    }
  
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format.";
    }
  
    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }
  
    if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = "Password must contain at least one uppercase letter.";
    }
  
    if (!/[a-z]/.test(formData.password)) {
      newErrors.password = "Password must contain at least one lowercase letter.";
    }
  
    if (!/\d/.test(formData.password)) {
      newErrors.password = "Password must contain at least one number.";
    }
  
    if (!/[^A-Za-z0-9]/.test(formData.password)) {
      newErrors.password = "Password must contain at least one special character.";
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Returns true if no errors
  };
  

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
  const {name,value} = e.target;
      // Field-specific validation
      switch (name) {
        case "firstName":
          newErrors.firstName = value.trim().length < 2 ? "First name must be at least 2 characters." : "";
          break;
        case "lastName":
          newErrors.lastName = value.trim().length < 2 ? "Last name must be at least 2 characters." : "";
          break;
        case "email":
          newErrors.email = !/\S+@\S+\.\S+/.test(value) ? "Invalid email format." : "";
          break;
        case "password":
          if (value.length < 6) {
            newErrors.password = "Password must be at least 6 characters.";
          } else if (!/[A-Z]/.test(value)) {
            newErrors.password = "Password must contain at least one uppercase letter.";
          } else if (!/[a-z]/.test(value)) {
            newErrors.password = "Password must contain at least one lowercase letter.";
          } else if (!/\d/.test(value)) {
            newErrors.password = "Password must contain at least one number.";
          } else if (!/[^A-Za-z0-9]/.test(value)) {
            newErrors.password = "Password must contain at least one special character.";
          } else {
            newErrors.password = ""; // No errors
          }
          break;
        default:
          break;
      }
  
      return newErrors;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setErrors({});
    if (!validateForm()) {
      setLoading(false);
      return; // Stop submission if validation fails
    }

    try {
      const response = await axios.post(
        '/api/auth/register/instructor',
        formData,
        { withCredentials: true }
      );

      if (response.data) {
        navigate('/verify-email'); 
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const handleMicrosoftLoginError = () => {
    setError('Microsoft login failed.');
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);
                      return (
<div>
  {/* Mirrored from html.theme-village.com/eduxo/signup.html by HTTrack Website Copier/3.x [XR&CO'2014], Wed, 12 Feb 2025 20:26:40 GMT */}
  <meta charSet="utf-8" />
  <meta httpEquiv="x-ua-compatible" content="ie=edge" />
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
  <meta name="description" content="An ideal tempalte for online education, e-Learning, Course School, Online School, Kindergarten, Classic LMS, University, Language Academy, Coaching, Online Course, Single Course, and Course marketplace." />
  <meta name="keywords" content="bootstrap 5, online course, education, creative, gulp, business, minimal, modern, course, one page, responsive, saas, e-Learning, seo, startup, html5, site template" />
  <meta name="author" content="theme-village" />
  <title>Eduxo - Online Courses and Education HTML5 Template</title>
  <link rel="apple-touch-icon" href="assets/images/favicon.png" />
  <link rel="shortcut icon" href="assets/images/favicon.ico" />
  {/* SignUp Section Start */}
  <section className="signup-sec full-screen">
    <div className="container">
      <div className="row align-items-center">
        <div className="col-xl-5 col-md-5">
          <div className="signup-thumb">
            <img className="img-fluid" src="assets/images/signup-2.png" alt="Sign Up" />
          </div>
        </div>
        <div className="col-xl-7 col-md-7">
          <div className="signup-form">
            <h1 className="display-3 text-center mb-5">Let’s Sign Up Instructor</h1>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group position-relative">
                <span><i className="feather-icon icon-user" /></span>
                <input type="text" placeholder=" FirstName" name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={`form-control ${errors.firstName ? "is-invalid" : ""}`}
             required />
             {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
              </div>
              <div className="form-group position-relative">
                <span><i className="feather-icon icon-user" /></span>
                <input type="text" placeholder=" LastName"  name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={`form-control ${errors.lastName ? "is-invalid" : ""}`}
             required />
             {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
              </div>
              <div className="form-group position-relative">
                <span><i className="feather-icon icon-mail" /></span>
                <input type="email" placeholder=" Email" name="email"
            value={formData.email}
            onChange={handleChange}
            className={`form-control ${errors.email ? "is-invalid" : ""}`}
             required />
             {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>
              <div className="form-group position-relative">
                <span><i className="feather-icon icon-lock" /></span>
                <input type="password" placeholder="Password"  name="password"
            value={formData.password}
            onChange={handleChange} required />
            
              </div>
              {/*Password Strength meter */}
              <motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className='max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl 
			overflow-hidden'
		>
      <div className='p-8'>
              <PasswordStrengthMeter password={formData.password} />
              </div>
              </motion.div>
              {/*Password Strength meter ends*/}
              <button  disabled={!isFormValid || loading}
  className="btn btn-primary w-100" 
  style={{ 
    padding: "15px", // Augmente la hauteur du bouton
    fontSize: "18px", // Augmente la taille du texte
    borderRadius: "8px" // Arrondi les bords
  }}
>
{loading ? 'Registering...' : 'Sign Up as Instructor'}
</button>
              <div className="form-footer mt-4 text-center">
              <div className="alter overly">
                      <p>OR</p>
                    </div>
                    <div className="google-login">
                      <GoogleLogin
                        onSuccess={handleGoogleLoginSuccess}
                        onError={handleGoogleLoginError}
                      />
                      {error && <p className="text-red-500 mt-2">{error}</p>}
                    </div>

                    <div className="microsoft-login">
                      <MicrosoftLogin
                        clientId="0081ceb9-215c-491a-aaab-e478787be7e8"
                        redirectUri="http://localhost:5173/login/student"
                        onSuccess={handleMicrosoftLoginSuccess}
                        onFailure={handleMicrosoftLoginError}
                      />
                    </div>
                    <div className="github-login">
                      <GitHubLogin
                        clientId="Ov23liQcQlFtxrCS9Hkz"
                        redirectUri="http://localhost:5173/login/student"
                        onSuccess={handleGitHubLoginSuccess}
                        onFailure={handleGitHubLoginError}
                      />
                    </div>

                    <p>
                      Already have an account?{' '}
                      <a href="login.html" className="text-primary fw-bold">
                        Login Now
                      </a>
                    </p>
                    </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    
  </section>
  </div>
  );
  
}

export default Signup;
