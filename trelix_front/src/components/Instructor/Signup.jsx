import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import GitHubLogin from 'react-github-login';
import MicrosoftLogin from 'react-microsoft-login';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  
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
        navigate('/');  // Redirect after successful signup
      }
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
    } finally {
      setLoading(false);
    }
  };
  
  // Handle Microsoft login error
  const handleMicrosoftLoginError = () => {
    setError('Microsoft login failed.');
  };
  return (
    <div>
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
                <form action="#">
                  <div className="form-group position-relative">
                    <input
                      type="text"
                      name="firstName"
                      placeholder="FirstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group position-relative">
                    <input
                      type="text"
                      name="lastName"
                      placeholder="LastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group position-relative">
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group position-relative">
                    <input
                      type="password"
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <button
                    className="btn btn-primary w-100"
                    style={{
                      padding: '15px',
                      fontSize: '18px',
                      borderRadius: '8px'
                    }}
                  >
                    Sign In
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
