import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "./VerifyEmail.css";
import Preloader from "../components/Preloader/Preloader";
import { useAuthStore } from "../store/authStore";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const email = state?.email;
  const source = state?.source;
  const [isValid, setIsValid] = useState(false);
  const [verificationCode, setVerificationCode] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef([]);
  const { login } = useAuthStore();

  useEffect(() => {
    const navEmail = state?.email;
    if (navEmail) {
      setIsValid(true);
    } else {
      navigate("/");
    }
  }, [navigate, state]);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && resendDisabled) {
      setResendDisabled(false);
    }
  }, [countdown, resendDisabled]);

  const handleCodeChange = (index, value) => {
    if (value.length > 1) {
      const digits = value.split("").slice(0, 6 - index);
      const newCode = [...verificationCode];

      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newCode[index + i] = digit;
        }
      });

      setVerificationCode(newCode);
      const nextIndex = Math.min(index + digits.length, 5);
      if (nextIndex < 6) {
        inputRefs.current[nextIndex].focus();
      }
    } else {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);
      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = verificationCode.join("");
    if (code.length !== 6) {
      setStatus({
        type: "error",
        message: "Please enter the complete 6-digit verification code",
      });
      return;
    }
    setIsLoading(true);
    setStatus({ type: "info", message: "Verifying your email..." });
    try {
      const responseVerification = await axios.post(
        "http://localhost:5000/api/auth/verify-email",
        {
          email: email,
          verificationCode: code,
          source: source,
        }
      );
      if (responseVerification) {
        setStatus({
          type: "success",
          message:
            "Email verified successfully! Redirecting you to the dashboard...",
        });
        try {
          await axios.post(
            "http://localhost:5000/api/send-verification-confirmation",
            {
              email: email,
            }
          );
        } catch (error) {
          console.error("Error sending confirmation email:", error);
        }
        setTimeout(async () => {
          if (source === "login") {
            await login(responseVerification.data);
          } else {
            navigate("/signup", {
              state: { isRegisterSuccess: true },
            });
          }
        }, 2000);
      }
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error.response?.data?.message ||
          "Invalid code or verification failed. Please try again.",
      });
      setIsLoading(false);
    }
  };

  // Handle resend verification code
  const handleResendCode = async () => {
    setResendDisabled(true);
    setStatus({ type: "info", message: "Sending a new verification code..." });

    try {
      await axios.post("http://localhost:5000/api/auth/resend-verification", {
        email: email,
      });

      setStatus({
        type: "success",
        message: "A new verification code has been sent to your email",
      });

      setVerificationCode(["", "", "", "", "", ""]);
      inputRefs.current[0].focus();

      setCountdown(60);
    } catch (error) {
      setStatus({
        type: "error",
        message: "Failed to resend verification code. Please try again later.",
      });
      setResendDisabled(false);
    }
  };

  if (!isValid) {
    return <Preloader />;
  }

  return (
    <div className="verify-email-container">
      <div className="verify-email-card">
        <div className="verify-email-header">
          <div className="logo-placeholder">
            {/* Replace with your actual logo */}
            <svg viewBox="0 0 24 24" fill="none" className="logo-icon">
              <path
                d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M16 10L12 14L8 10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1>Verify Your Email</h1>
          <p className="email-info">
            We have sent a verification code to <strong>{email}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="verification-form">
          <div className="verification-code-container">
            {verificationCode.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={6} // Allow pasting full code
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="code-input"
                disabled={isLoading}
                autoFocus={index === 0}
              />
            ))}
          </div>

          {status.message && (
            <div className={`status-message ${status.type}`}>
              {status.message}
            </div>
          )}

          <div className="form-actions">
            <button
              type="submit"
              className="verify-button"
              disabled={isLoading || verificationCode.join("").length !== 6}
            >
              {isLoading ? (
                <span className="loading-spinner"></span>
              ) : (
                "Verify Email"
              )}
            </button>

            <div className="resend-container">
              <p>Didn't receive the code?</p>
              <button
                type="button"
                className="resend-button"
                onClick={handleResendCode}
                disabled={resendDisabled}
              >
                {countdown > 0 ? `Resend code (${countdown}s)` : "Resend code"}
              </button>
            </div>
          </div>
        </form>

        <div className="help-section">
          <p>
            Having trouble?{" "}
            <a href="/support" className="support-link">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
