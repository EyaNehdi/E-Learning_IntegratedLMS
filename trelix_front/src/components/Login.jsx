import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import Preloader from "./Preloader/Preloader";
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setLoading] = useState("");
  const [stayLoggedIn,setStayLoggedIn]= useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated, checkAuth } = useAuthStore();

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
      await login(email, password,stayLoggedIn);
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
                        <a
                          href="#"
                          className="btn w-100"
                          style={{
                            backgroundColor: "white",
                            border: "1px solid #ddd",
                            color: "#333",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            padding: "10px",
                            textDecoration: "none",
                            fontWeight: "bold",
                          }}
                        >
                          <img
                            src="assets/images/icons/facebook.png"
                            alt="Facebook"
                            style={{
                              width: "30px",
                              height: "30px",
                              marginRight: "10px",
                            }}
                          />
                          Continue with Facebook
                        </a>
                        <a
                          href="#"
                          className="btn w-100"
                          style={{
                            backgroundColor: "white",
                            border: "1px solid #ddd",
                            color: "#333",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            padding: "10px",
                            textDecoration: "none",
                            fontWeight: "bold",
                          }}
                        >
                          <img
                            src="assets/images/microsoft.png"
                            alt="Google"
                            style={{
                              width: "40px",
                              height: "40px",
                              marginRight: "10px",
                            }}
                          />
                          Continue with Microsoft
                        </a>
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
                  </div>
                </div>
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
          </section>
        </div>
      )}
    </>
  );
}
export default Login;
