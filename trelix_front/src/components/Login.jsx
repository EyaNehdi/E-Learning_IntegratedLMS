import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate(); // Initialize the useNavigate hook

  const { login, isAuthenticated } = useAuthStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      await login(email, password);
      // Redirect to the dashboard or homepage after successful login
      navigate("/"); // Replace with the route you want to redirect to
    } catch (error) {
      if (error.response?.data?.message === "Account does not exist") {
        setErrorMessage("Account does not exist");
      } else {
        setErrorMessage(error.response?.data?.message || "Error logging in");
      }
    }
  };

 

  useEffect(() => {
    // If the user is already authenticated, redirect them to the dashboard
    if (isAuthenticated) {
      navigate("/"); // Redirect to a different page when logged in
    }
  }, [isAuthenticated, navigate]);
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
          <form onSubmit={handleLogin}>
            <div className="form-group position-relative">
              <span><i className="feather-icon icon-mail" /></span>
              <input type="email" placeholder="Your Email" name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-group position-relative">
              <span><i className="feather-icon icon-lock" /></span>
              <input type="password" placeholder="Password" name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} required />
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
              <a href="#" className="btn w-100" style={{ backgroundColor: 'white', border: '1px solid #ddd', color: '#333', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px', textDecoration: 'none', fontWeight: 'bold' }}>
              <img src="assets/images/icons/facebook.png" alt="Facebook" style={{ width: '30px', height: '30px', marginRight: '10px' }} />
              Continue with Facebook
              </a>
              <a href="#" className="btn w-100" style={{ backgroundColor: 'white', border: '1px solid #ddd', color: '#333', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px', textDecoration: 'none', fontWeight: 'bold' }}>
              <img src="assets/images/microsoft.png" alt="Google" style={{ width: '40px', height: '40px', marginRight: '10px' }} />
               Continue with Microsoft
               </a>              
               <p>Don&apos;t have account? <a href="signup.html" className="text-primary fw-bold">Sign Up Now</a></p>
            </div>
            {errorMessage && <div className="error-message">{errorMessage}</div>}
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