import { useGoogleLogin, useGoogleOneTapLogin } from "@react-oauth/google";
import GitHubLogin from "react-github-login";
import MicrosoftLogin from "react-microsoft-login";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../../store/authStore";
import { motion } from "framer-motion";
import PasswordStrengthMeter from "../PasswordStrengthMeter";
import { useLinkedIn, LinkedIn } from "react-linkedin-login-oauth2";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const InstructorRegister = ({ setisRegisterSuccess }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "instructor",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { linkedInLogin } = useLinkedIn({
    clientId: "86un9qr2kersxv",
    redirectUri: "http://localhost:5173/linkedin/callback",
    scope: "openid profile w_member_social email",
    onSuccess: async (code, state) => {
      console.log("LinkedIn code:", code);
      setIsLoading(true); // Start loading

      try {
        const response = await axios.post(
          "http://localhost:5000/api/auth/register/linkedinInstructor",
          { code }
        );

        if (response.data) {
          setIsRegisterSuccess(true);
          setisRegisterSuccess(true);
        } else {
          throw new Error("No token received from backend");
        }
      } catch (error) {
        toast.error(
          "This LinkedIn account already exists. Redirecting to login..."
        );

        setTimeout(() => {
          window.location.href = "http://localhost:5173/login";
        }, 2000);
        console.error("Error:", error);
      } finally {
        // Simulate a 5-second wait
        setTimeout(() => {
          setIsLoading(false); // Stop loading
        }, 2000);
      }
    },
    onError: (error) => {
      console.error("LinkedIn Error:", error);
    },
  });

  const handleGoogleLoginSuccess = async (response) => {
    try {
      const decoded = jwtDecode(response.credential); // Decode JWT token from Google
      const googleUserData = {
        firstName: decoded.given_name,
        lastName: decoded.family_name,
        email: decoded.email,
        image: decoded.picture,
        role: "instructor", // Default role for Google sign-up
      };

      // Send Google user data to the backend for registration
      const res = await axios.post(
        "http://localhost:5173/api/auth/register/google",
        googleUserData,
        {
          withCredentials: true,
        }
      );

      if (res.data) {
        setisRegisterSuccess(true);
      }
      setLoading(false);
    } catch (err) {
      toast.error(
        "This Google account already exists. Redirecting to login..."
      );
      setTimeout(() => {
        window.location.href = "http://localhost:5173/login";
      }, 2000);
      console.error(err);
    }
  };

  // Handle Google login error
  const handleGoogleLoginError = () => {
    setError("Google login failed.");
  };

  // Handle GitHub login success
  const handleGitHubLoginSuccess = async (response) => {
    try {
      // Send the authorization code to the backend
      const res = await axios.post(
        "http://localhost:5173/api/auth/register/github",
        {
          code: response.code,
        }
      );

      if (res.data) {
        setisRegisterSuccess(true);
      }
    } catch (err) {
      toast.error(
        "This Github account already exists. Redirecting to login..."
      );
      setTimeout(() => {
        window.location.href = "http://localhost:5173/login";
      }, 2000);

      console.error(err);
    }
  };

  // Handle GitHub login error
  const handleGitHubLoginError = () => {
    setError("GitHub login failed.");
  };

  // Handle Microsoft login success
  const handleMicrosoftLoginSuccess = async (response) => {
    setLoading(true);
    setError("");

    try {
      const responseData = await axios.post(
        "/api/auth/register/instructor",
        { token: response.authentication.accessToken },
        { withCredentials: true }
      );

      if (responseData.data) {
        navigate("/home"); // Redirect after successful login
      }
    } catch (err) {
      setError(
        err.response?.data?.error || "Microsoft login failed. Please try again."
      );
    }
  };

  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  useEffect(() => {
    // Check if there are any errors
    const hasErrors = Object.values(errors).some((error) => error !== "");

    // Check if all fields are filled
    const allFieldsFilled = Object.values(formData).every(
      (value) => value.trim() !== ""
    );

    // Set form validity state
    setIsFormValid(!hasErrors && allFieldsFilled);
  }, [errors, formData]); // Re-run when errors or form data change

  //Controle de saisie
  const validateForm = () => {
    const newErrors = {};

    // First name validation
    if (
      !/^(?!\s)(?!.*\s$)(?=.*[a-zA-Z])[a-zA-Z'-]+(?:\s+[a-zA-Z'-]+)*$/.test(
        formData.firstName.trim()
      )
    ) {
      newErrors.firstName =
        "Please enter a valid first name (e.g., John or Mary Anne)";
    }

    // Last name validation
    if (
      !/^(?!\s)(?!.*\s$)(?=.*[a-zA-Z])[a-zA-Z'-]+(?:\s+[a-zA-Z'-]+)*$/.test(
        formData.lastName.trim()
      )
    ) {
      newErrors.lastName =
        "Please enter a valid last name (e.g., Smith or O'Connor)";
    }
    // Validate email:
    if (
      !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(
        formData.email.trim()
      )
    ) {
      newErrors.email = "Invalid email format (e.g., example@domain.com)";
    }

    // Validate password: min 6 chars, at least one uppercase, one lowercase, one number, one special character
    if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    } else {
      if (!/[A-Z]/.test(formData.password)) {
        newErrors.password =
          "Password must contain at least one uppercase letter.";
      }
      if (!/[a-z]/.test(formData.password)) {
        newErrors.password =
          "Password must contain at least one lowercase letter.";
      }
      if (!/\d/.test(formData.password)) {
        newErrors.password = "Password must contain at least one number.";
      }
      if (!/[^A-Za-z0-9]/.test(formData.password)) {
        newErrors.password =
          "Password must contain at least one special character.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Returns true if no errors
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      const { name, value } = e.target;
      // Field-specific validation
      switch (name) {
        case "firstName":
          newErrors.firstName =
            !/^(?!\s)(?!.*\s$)(?=.*[a-zA-Z])[a-zA-Z'-]+(?:\s+[a-zA-Z'-]+)*$/.test(
              value.trim()
            )
              ? "Invalid firstName, must be at least 3 characters (required)"
              : "";
          break;

        case "lastName":
          newErrors.lastName =
            !/^(?!\s)(?!.*\s$)(?=.*[a-zA-Z])[a-zA-Z'-]+(?:\s+[a-zA-Z'-]+)*$/.test(
              value.trim()
            )
              ? "Invalid lastname, must be at least 3 characters (required)"
              : "";
          break;

        case "email":
          newErrors.email =
            !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(
              value.trim()
            )
              ? "Invalid email format (e.g., example@domain.com)."
              : "";
          break;

        case "password":
          if (value.length < 6) {
            newErrors.password = "Password must be at least 6 characters.";
          } else if (!/[A-Z]/.test(value)) {
            newErrors.password =
              "Password must contain at least one uppercase letter.";
          } else if (!/[a-z]/.test(value)) {
            newErrors.password =
              "Password must contain at least one lowercase letter.";
          } else if (!/\d/.test(value)) {
            newErrors.password = "Password must contain at least one number.";
          } else if (!/[^A-Za-z0-9]/.test(value)) {
            newErrors.password =
              "Password must contain at least one special character.";
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
    setError("");
    setErrors({});
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register/instructor",
        formData,
        { withCredentials: true }
      );
      if (response.data) {
        navigate("/verify-email", {
          state: { email: formData.email, source: "registration" },
        });
        setisRegisterSuccess(true);
      }
    } catch (err) {
      setError(
        err.response?.data?.error || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMicrosoftLoginError = () => {
    setError("Microsoft login failed.");
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
  const [enableGoogleLogin, setEnableGoogleLogin] = useState(false);
  useGoogleOneTapLogin({
    onSuccess: handleGoogleLoginSuccess,
    onError: handleGoogleLoginError,
    disabled: !enableGoogleLogin,
  });

  const triggerGoogleLogin = () => {
    setEnableGoogleLogin(true);
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />
      <div className="signup-form m-0">
        <h1 className="display-3 text-center mb-5">Let’s Sign Up Instructor</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group position-relative">
            <span>
              <i className="feather-icon icon-user" />
            </span>
            <input
              type="text"
              placeholder=" FirstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={`form-control ${errors.firstName ? "is-invalid" : ""}`}
              required
            />
            {errors.firstName && (
              <div className="invalid-feedback">{errors.firstName}</div>
            )}
          </div>
          <div className="form-group position-relative">
            <span>
              <i className="feather-icon icon-user" />
            </span>
            <input
              type="text"
              placeholder=" LastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={`form-control ${errors.lastName ? "is-invalid" : ""}`}
              required
            />
            {errors.lastName && (
              <div className="invalid-feedback">{errors.lastName}</div>
            )}
          </div>
          <div className="form-group position-relative">
            <span>
              <i className="feather-icon icon-mail" />
            </span>
            <input
              type="email"
              placeholder=" Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              required
            />
            {errors.email && (
              <div className="invalid-feedback">{errors.email}</div>
            )}
          </div>
          <div className="form-group position-relative">
            <span>
              <i className="feather-icon icon-lock" />
            </span>
            <input
              type="password"
              placeholder="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          {/*Password Strength meter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl 
			overflow-hidden"
          >
            <div className="p-8">
              <PasswordStrengthMeter password={formData.password} />
            </div>
          </motion.div>
          {/*Password Strength meter ends*/}
          <button
            disabled={!isFormValid || loading}
            className="btn btn-primary w-100"
            style={{
              padding: "15px", // Augmente la hauteur du bouton
              fontSize: "18px", // Augmente la taille du texte
              borderRadius: "8px", // Arrondi les bords
            }}
          >
            {loading ? "Registering..." : "Sign Up as Instructor"}
          </button>
        </form>
        <div className="form-footer mt-4 text-center">
          <div className="alter overly">
            <p>OR</p>
          </div>
          {/* Other Logins Icons */}
          <div className="container d-flex justify-content-center align-items-center custom-gap">
            {/* Google Login */}
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

            {/* Microsoft Login */}
            <div className="">
              <MicrosoftLogin
                clientId="0081ceb9-215c-491a-aaab-e478787be7e8"
                redirectUri="http://localhost:5173/login/student"
                onSuccess={handleMicrosoftLoginSuccess}
                onFailure={handleMicrosoftLoginError}
              >
                <img
                  src="/assets/icons/microsoft.png"
                  alt="Microsoft"
                  width="24"
                  height="24"
                  style={{ cursor: "pointer" }}
                />
              </MicrosoftLogin>
            </div>

            {/* GitHub Login */}
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
                src="/assets/icons/github.png"
                alt="GitHub"
                width="24"
                height="24"
                onClick={triggerGitHubLogin}
                style={{ cursor: "pointer" }}
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

          <p>
            Already have an account?{" "}
            <a href="/login" className="text-primary fw-bold">
              Login Now
            </a>
          </p>
        </div>
      </div>
    </>
  );
};

export default InstructorRegister;
