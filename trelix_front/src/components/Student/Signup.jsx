
import { GoogleLogin } from '@react-oauth/google';
import GitHubLogin from 'react-github-login';
import MicrosoftLogin from 'react-microsoft-login';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import PasswordStrengthMeter from '../PasswordStrengthMeter';
import { motion } from "framer-motion";
function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'instructor'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (user) {
      setEditableUser({ ...user });
    }
  }, [user]);

  const handleEdit = async (field) => {
    const newValue = prompt(`Enter new ${field}:`, editableUser[field]);
    if (newValue !== null) {
      const updatedUser = { ...editableUser, [field]: newValue };
      setEditableUser(updatedUser);

      // Make API call to update the user's information in the backend using axios
      try {
        const res = await axios.post('/api/user/update', updatedUser, {
          withCredentials: true, // Include credentials if needed
        });

        if (res.data) {
          setEditableUser(res.data); // Update the local state with the new user data
        }
      } catch (error) {
        console.error("Error updating user:", error);
      }
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
      const res = await axios.post('http://localhost:5173/api/auth/register/githubStudent', {
        code: response.code,
      });

      if (res.data) {
        navigate('/verify-email');  // Redirect after successful signup
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
  //firstname validation only letters
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required.";
    } else if (!/^[A-Za-z]+$/.test(formData.firstName.trim())) {
      newErrors.firstName = "First name must contain only letters (A-Z, a-z).";
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters.";
    }
  //lastname validation only letters
  if (!formData.lastName.trim()) {
    newErrors.lastName = "Last name is required.";
  } else if (!/^[A-Za-z]+$/.test(formData.lastName.trim())) {
    newErrors.lastName = "Last name must contain only letters (A-Z, a-z).";
  } else if (formData.lastName.trim().length < 2) {
    newErrors.lastName = "Last name must be at least 2 characters.";
  }
  
  // Email validation - must start with letter, only @ and . allowed as special chars
  if (!formData.email) {
    newErrors.email = "Email is required.";
  } else if (!/^[A-Za-z][A-Za-z0-9]*@[A-Za-z0-9]+\.[A-Za-z]+$/.test(formData.email)) {
    newErrors.email = "Email must start with a letter and can only contain '@' and '.' as special characters.";
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
          if (!value.trim()) {
            newErrors.firstName = "First name is required.";
          } else if (!/^[A-Za-z]+$/.test(value.trim())) {
            newErrors.firstName = "First name must contain only letters (A-Z, a-z).";
          } else if (value.trim().length < 2) {
            newErrors.firstName = "First name must be at least 2 characters.";
          } else {
            newErrors.firstName = "";
          }
          break;
        case "lastName":
          if (!value.trim()) {
            newErrors.lastName = "Last name is required.";
          } else if (!/^[A-Za-z]+$/.test(value.trim())) {
            newErrors.lastName = "Last name must contain only letters (A-Z, a-z).";
          } else if (value.trim().length < 2) {
            newErrors.lastName = "Last name must be at least 2 characters.";
          } else {
            newErrors.lastName = "";
          }
          break;
        case "email":
          if (!value) {
            newErrors.email = "Email is required.";
          } else if (!/^[A-Za-z][A-Za-z0-9]*@[A-Za-z0-9]+\.[A-Za-z]+$/.test(value)) {
            newErrors.email = "Email must start with a letter and can only contain '@' and '.' as special characters.";
          } else {
            newErrors.email = "";
          }
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
        '/api/auth/register/student',
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
            <h1 className="display-3 text-center mb-5">Let’s Sign Up Student</h1>
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
                <input type="password" placeholder="Password" name="password"
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
              <button disabled={!isFormValid || loading}
  className="btn btn-primary w-100" 
  style={{ 
    padding: "15px", // Augmente la hauteur du bouton
    fontSize: "18px", // Augmente la taille du texte
    borderRadius: "8px" // Arrondi les bords
  }}
>
{loading ? 'Registering...' : 'Sign Up as Student'} 
</button>
              <div className="form-footer mt-4 text-center">
                <div className="alter overly">
                  <p>OR</p>
                </div>
              </div>
            </form>
            <div className="google-login">
                      <GoogleLogin
                        onSuccess={handleGoogleLoginSuccess}
                        onError={handleGoogleLoginError}
                        theme="outline"
                        size="large"
                        shape="rectangular"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
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
          </div>
        </div>
      </div>
    </div>
  </section>
</div>

  );

}

export default Signup;
