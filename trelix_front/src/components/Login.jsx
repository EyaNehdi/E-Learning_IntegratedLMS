
import { GoogleLogin } from '@react-oauth/google';
import GitHubLogin from 'react-github-login';
import MicrosoftLogin from 'react-microsoft-login';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";

function Login() {

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Initialize the useNavigate hook
  const [email, setEmail] = useState("");
 
  const [errorMessage, setErrorMessage] = useState("");
  const { logingoogle, isAuthenticated } = useAuthStore();
  const [password, setPassword] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const getPassword = async (email) => {
    try {
      const response = await axios.post("/api/auth/register/getpassfrommail", { email }); // Backend should return hashed password
      return response.data.password; // This should ideally be checked on the backend, not sent to frontend
    } catch (error) {
      console.error("Error fetching password:", error);
      return null;
    }
  };
 
  
  const handleLoginWithGoogle = async (response) => {
    setErrorMessage("");

    if (!response?.credential) {
      setErrorMessage("Google authentication failed.");
      return;
    }

    try {
      const decoded = jwtDecode(response.credential);
      const email = decoded.email;

      // Fetch password from the database (not recommended for production, should be handled via backend authentication)
      const password = await getPassword(email);

      if (!password) {
        setErrorMessage("User not found or incorrect credentials.");
        return;
      }

      // Authenticate user
      await logingoogle(email, password);
      navigate("/logged");
    } catch (error) {
      setErrorMessage(error.message || "Error logging in.");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/logged");
    }
  }, [isAuthenticated, navigate]);
  
  const handleGoogleLoginError = () => {
    setError('Google login failed.');
  };
                      return (
                                          <div>
 <section className="signup-sec full-screen">
  <div className="container">
    <div className="row align-items-center">
      <div className="col-xl-5 col-md-5">
        <div className="signup-thumb">
          <img className="img-fluid" src="assets/images/shape-bg.png" alt="Sign Up" />
        </div>
      </div>
      <div className="col-xl-7 col-md-7">
        <div className="login-form">
          <h1 className="display-3 text-center mb-5">Let’s Sign In Trelix</h1>
          <form action="#">
            <div className="form-group position-relative">
              <span><i className="feather-icon icon-mail" /></span>
              <input type="email" placeholder="Your Email" required />
            </div>
            <div className="form-group position-relative">
              <span><i className="feather-icon icon-lock" /></span>
              <input type="password" placeholder="Password" required />
            </div>
            <button 
  className="btn btn-primary w-100" 
  style={{ 
    padding: "15px", // Augmente la hauteur du bouton
    fontSize: "18px", // Augmente la taille du texte
    borderRadius: "8px" // Arrondi les bords
  }}
>
  Sign In
</button>
            <div className="form-footer mt-4 text-center">
              <div className="d-flex justify-content-between">
                <div className="form-check">
                  <input type="checkbox" className="form-check-input" id="logged-in" />
                  <label className="form-check-label" htmlFor="logged-in">Stay Logged In</label>
                </div>
                <a href="/forget" className="text-reset">Forget Password?</a>
              </div>
              <div className="alter overly"><p>OR</p></div>
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
              <a href="#" className="btn w-100" style={{ backgroundColor: 'white', border: '1px solid #ddd', color: '#333', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px', textDecoration: 'none', fontWeight: 'bold' }}>
              <img src="assets/images/microsoft.png" alt="Google" style={{ width: '40px', height: '40px', marginRight: '10px' }} />
               Continue with Microsoft
               </a>              
               <p>Dont have account? <a href="signup.html" className="text-primary fw-bold">Sign Up Now</a></p>
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
export default Login;