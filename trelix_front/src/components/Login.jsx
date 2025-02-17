import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import Preloader from "./Preloader/Preloader";
import { GoogleLogin } from '@react-oauth/google';
import GitHubLogin from 'react-github-login';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';


function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setLoading] = useState("");
  const [stayLoggedIn, setStayLoggedIn] = useState(false);
  const navigate = useNavigate();
  const { logingoogle, login, isAuthenticated, checkAuth } = useAuthStore();
  const [error, setError] = useState('');

  // Effect to check authentication only once on mount
  useEffect(() => {
    console.log("🟢 Checking authentication on mount...");
    checkAuth();
  }, [checkAuth]);

  // Effect to redirect when authentication state changes
  useEffect(() => {
    console.log("🟢 isAuthenticated state:", isAuthenticated);
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);
    try {
      await login(email, password, stayLoggedIn);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (error.response?.data?.message === "Account does not exist") {
        setErrorMessage("Account does not exist");
      } else {
        setErrorMessage(error.response?.data?.message || "Error logging in");
      }
    }
  };

  const handleStayLogged = () => {
    setStayLoggedIn(!stayLoggedIn);
  }



  const handleLoginWithGoogle = async (response) => {
    
    
    const decoded = jwtDecode(response.credential); 
    setLoading(true);
    try {
      await logingoogle(decoded.email, stayLoggedIn);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (error.response?.data?.message === "Account does not exist") {
        setErrorMessage("Account does not exist");
      } else {
        setErrorMessage(error.response?.data?.message || "Error logging in");
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleLoginError = () => {
    setError('Google login failed.');
  };
  const handleGitHubLoginError = () => {
    setError('GitHub login failed.');
  };
  const handleGitHubLoginSuccess = async (response) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/loginGit', {
          code: response.code,
      });

      if (res.data?.email) {
        await logingoogle(res.data.email, stayLoggedIn);
        setLoading(false);
      }
  } catch (err) {
    setLoading(false);
      setError('GitHub signup failed. Please try again.');
      console.error(err);
  }
  };
  return (
    <>
      {isLoading ? (
        <Preloader />
      ) : (
        <div>
          <section className="signup-sec full-screen">
            <div className="container">
              <div className="row align-items-center">
                <div className="col-xl-5 col-md-5">
                  <div className="signup-thumb">
                    <img
                      className="img-fluid"
                      src="assets/images/shape-bg.png"
                      alt="Sign Up"
                    />
                  </div>
                </div>
                <div className="col-xl-7 col-md-7">
                  <div className="login-form">
                    <h1 className="display-3 text-center mb-5">
                      Let’s Sign In Trelix
                    </h1>
                    <form onSubmit={handleLogin}>
                      <div className="form-group position-relative">
                        <span>
                          <i className="feather-icon icon-mail" />
                        </span>
                        <input
                          type="email"
                          placeholder="Your Email"
                          name="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group position-relative">
                        <span>
                          <i className="feather-icon icon-lock" />
                        </span>
                        <input
                          type="password"
                          placeholder="Password"
                          name="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                      <button
                        className="btn btn-primary w-100"
                        style={{
                          padding: "15px", // Augmente la hauteur du bouton
                          fontSize: "18px", // Augmente la taille du texte
                          borderRadius: "8px", // Arrondi les bords
                        }}
                      >
                        Sign In
                      </button>
                      <div className="form-footer mt-4 text-center">
                        <div className="d-flex justify-content-between">
                          <div className="form-check">
                            {/*Stay logged in input */}
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id="logged-in"
                              value={stayLoggedIn}
                              onChange={handleStayLogged}
                            />
                            <label
                              className="form-check-label"
                              htmlFor="logged-in"
                            >
                              Stay Logged In
                            </label>
                          </div>
                          <a href="/forget" className="text-reset">
                            Forget Password?
                          </a>
                        </div>
                        <div className="alter overly">
                          <p>OR</p>
                        </div>
                        
                        <p>
                          Don&apos;t have account?{" "}
                          <a
                            href="signup.html"
                            className="text-primary fw-bold"
                          >
                            Sign Up Now
                          </a>
                        </p>
                      </div>
                      {errorMessage && (
                        <div className="error-message">{errorMessage}</div>
                      )}
                    </form>
                    <div className="alter overly"><p>OR</p>
                <div className="google-login">
                  <GoogleLogin
                    onSuccess={handleLoginWithGoogle}
                    onError={handleGoogleLoginError}
                    theme="outline"
                    size="large"
                    shape="rectangular"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {error && <p className="text-red-500 mt-2">{error}</p>}
                </div>
                <div className="github-login">
                      <GitHubLogin
                        clientId="Ov23liQcQlFtxrCS9Hkz"
                        redirectUri="http://localhost:5173/login/student"
                        onSuccess={handleGitHubLoginSuccess}
                        onFailure={handleGitHubLoginError}
                      />
                    </div>
                <p>Dont have account? <a href="instructor" className="text-primary fw-bold">Sign Up Instructor//</a> <a href="student" className="text-primary fw-bold">//Sign Up Student</a> </p>
              </div>
                  </div>
                </div>
              </div>
             
            </div>
          </section>
        </div>
      )}
    </>
  );
}
export default Login;
