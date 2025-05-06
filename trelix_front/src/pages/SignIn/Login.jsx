import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";
import Preloader from "../../components/Preloader/Preloader";
import { useGoogleOneTapLogin } from "@react-oauth/google";
import GitHubLogin from "react-github-login";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useLinkedIn, LinkedIn } from "react-linkedin-login-oauth2";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useProfileStore } from "../../store/profileStore";
import MfaChallenge from "../../components/MfaSetup/MfaChallenge";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setLoading] = useState("");
  const { updateUser } = useProfileStore(); // Assuming you have a method to update user data in your profile store
  const [stayLoggedIn, setStayLoggedIn] = useState(false);
  const navigate = useNavigate();
  const { logingoogle, login } = useAuthStore();
  const [error, setError] = useState("");
  const [mfaRequired, setMfaRequired] = useState(false);
  const [backupCodesExist, setBackupCodesExist] = useState(false);
  const [userId, setUserId] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);
    try {
      const responseLogin = await axios.post(
        `/api/auth/login`,
        { email, password, stayLoggedIn },
        { withCredentials: true }
      );
      if (responseLogin.data.mfaRequired) {
        if (responseLogin.data.backupCodesExist) {
          setBackupCodesExist(true);
        }
        setUserId(responseLogin.data.userId);
        setMfaRequired(true);
        return;
      }
      await login(responseLogin.data);
    } catch (error) {
      if (
        error.response?.status === 403 &&
        error.response.data.verificationRequired
      ) {
        navigate("/verify-email", { state: { email, source: "login" } });
        return;
      }
      if (error.response?.data?.message === "Account does not exist") {
        setErrorMessage("Account does not exist");
      } else {
        setErrorMessage(error.response?.data?.message || "Error logging in");
      }
    } finally {
      setLoading(false);
    }
  };
  const { linkedInLogin } = useLinkedIn({
    clientId: "86un9qr2kersxv",
    redirectUri: "http://localhost:5173/linkedin/callback",
    scope: "openid profile w_member_social email",
    onSuccess: async (code, state) => {
      console.log("LinkedIn code:", code);

      try {
        const res = await axios.post(
          "http://localhost:5000/api/auth/loginLinkedIn",
          { code }
        );

        if (res.data?.email) {
          await logingoogle(res.data.email, stayLoggedIn);
          setLoading(false);
        } else {
          throw new Error("No token received from backend");
        }
      } catch (error) {
        toast.error(
          "This Linkedin account dosn't exists. Redirecting to signup..."
        );
        setTimeout(() => {
          window.location.href = "http://localhost:5173/signup";
        }, 2000);
        console.error("Error:", error);
      } finally {
        // Simulate a 5-second wait
        setTimeout(() => {
          setLoading(false); // Stop loading
        }, 5000);
      }
    },
    onError: (error) => {
      console.error("LinkedIn Error:", error);
    },
  });
  const handleStayLogged = () => {
    setStayLoggedIn(!stayLoggedIn);
  };

  const handleLoginWithGoogle = async (response) => {
    const decoded = jwtDecode(response.credential);
    setLoading(true);
    try {
      await logingoogle(decoded.email, stayLoggedIn);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (error.response?.data?.message === "Account does not exist") {
        toast.error(
          "This Google account dosn't exists. Redirecting to signup..."
        );
        setTimeout(() => {
          window.location.href = "http://localhost:5173/signup";
        }, 2000);
        setErrorMessage("Account does not exist");
      } else {
        setErrorMessage(error.response?.data?.message || "Error logging in");
      }
    }
  };

  const handleGoogleLoginError = () => {
    setError("Google login failed.");
  };

  const handleGitHubLoginError = () => {
    setError("GitHub login failed.");
  };

  const handleGitHubLoginSuccess = async (response) => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/loginGit", {
        code: response.code,
      });

      if (res.data?.email) {
        await logingoogle(res.data.email, stayLoggedIn);

        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      toast.error(
        "This Github account dosn't exists. Redirecting to signup..."
      );
      setTimeout(() => {
        window.location.href = "http://localhost:5173/signup";
      }, 2000);
      console.error(err);
    }
  };

  const [enableGoogleLogin, setEnableGoogleLogin] = useState(false);
  useGoogleOneTapLogin({
    onSuccess: handleLoginWithGoogle,
    onError: handleGoogleLoginError,
    disabled: !enableGoogleLogin,
  });

  const triggerGoogleLogin = () => {
    setEnableGoogleLogin(true);
  };

  const githubRef = useRef(null);
  const triggerGitHubLogin = () => {
    if (githubRef.current) {
      const githubButton = githubRef.current.querySelector("button");
      if (githubButton) {
        githubButton.click();
      }
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />
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
                    {!mfaRequired && (
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
                            <a href="/forgot-password" className="text-reset">
                              Forget Password?
                            </a>
                          </div>
                        </div>
                        {errorMessage && (
                          <div className="error-message">{errorMessage}</div>
                        )}
                      </form>
                    )}

                    {mfaRequired && userId && (
                      <MfaChallenge
                        backupCodesExist={backupCodesExist}
                        userId={userId}
                      />
                    )}

                    <div className="text-center">
                      <div className="alter overly">
                        <p>OR</p>
                      </div>

                      <p>
                        Don&apos;t have account?{" "}
                        <a href="/signup" className="text-primary fw-bold">
                          Sign Up Now
                        </a>
                      </p>
                    </div>
                    {!mfaRequired && (
                      <div className="alter overly">
                        <p>OR</p>
                        <div className="container d-flex justify-content-center align-items-center custom-gap">
                          <div className="">
                            <img
                              src="/assets/icons/google.png"
                              alt="Google"
                              width="24"
                              height="24"
                              onClick={triggerGoogleLogin}
                              style={{ cursor: "pointer" }}
                            />
                          </div>
                          <div className="">
                            <img
                              src="/assets/icons/github.png"
                              alt="GitHub"
                              width="24"
                              height="24"
                              onClick={triggerGitHubLogin}
                              style={{ cursor: "pointer" }}
                            />
                          </div>
                          <div className="d-none" ref={githubRef}>
                            <GitHubLogin
                              clientId="Ov23liQcQlFtxrCS9Hkz"
                              redirectUri="http://localhost:5173/login/student"
                              onSuccess={handleGitHubLoginSuccess}
                              onFailure={handleGitHubLoginError}
                            />
                          </div>
                          <div className="">
                            <img
                              src="/assets/icons/linkedin.png"
                              alt="Linkdine"
                              width="30"
                              height="30"
                              onClick={linkedInLogin}
                              style={{ cursor: "pointer" }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
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
