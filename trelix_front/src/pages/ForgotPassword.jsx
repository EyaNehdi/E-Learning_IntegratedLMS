"use client"

import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { Mail, ArrowLeft, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import "./ForgotPassword.css"

const ForgotPassword = () => {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState({ type: "", message: "" })
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const navigate = useNavigate()

  // Email validation
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate email
    if (!isValidEmail(email)) {
      setStatus({
        type: "error",
        message: "Please enter a valid email address",
      })
      return
    }

    setLoading(true)
    setStatus({ type: "info", message: "Sending password reset email..." })

    try {
      await axios.post("http://localhost:5000/api/auth/forgot-password", { email })

      setStatus({
        type: "success",
        message: "Password reset link sent! Please check your email inbox.",
      })

      setEmailSent(true)

      // Don't redirect automatically - let the user see the success message
      // and decide when to navigate away
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to send password reset email. Please try again."

      setStatus({
        type: "error",
        message: errorMessage,
      })

      setLoading(false)
    }
  }

  const handleBackToLogin = () => {
    navigate("/login")
  }

  const handleTryAgain = () => {
    setEmailSent(false)
    setStatus({ type: "", message: "" })
    setLoading(false)
  }

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="forgot-password-header">
          <div className="logo-placeholder">
            {/* Replace with your actual logo */}
            <svg viewBox="0 0 24 24" fill="none" className="logo-icon">
              <path
                d="M12 15V17M6 21H18C19.1046 21 20 20.1046 20 19V13C20 11.8954 19.1046 11 18 11H6C4.89543 11 4 11.8954 4 13V19C4 20.1046 4.89543 21 6 21ZM16 11V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V11H16Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1>Forgot Your Password?</h1>
          <p className="forgot-info">
            {emailSent
              ? "We've sent you an email with instructions to reset your password."
              : "Enter your email address and we'll send you a link to reset your password."}
          </p>
        </div>

        {emailSent ? (
          <div className="email-sent-container">
            <div className="email-sent-icon">
              <Mail size={48} />
            </div>
            <h2>Check Your Email</h2>
            <p>
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="email-instructions">
              Click the link in the email to reset your password. If you don't see the email, check your spam folder.
            </p>
            <div className="action-buttons">
              <button className="secondary-button" onClick={handleTryAgain}>
                Try Again
              </button>
              <button className="primary-button" onClick={handleBackToLogin}>
                Back to Login
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="forgot-password-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="email-input-container">
                <Mail className="input-icon" size={18} />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {status.message && (
              <div className={`status-message ${status.type}`}>
                {status.type === "error" && <XCircle size={20} />}
                {status.type === "success" && <CheckCircle size={20} />}
                {status.type === "info" && <AlertCircle size={20} />}
                <span>{status.message}</span>
              </div>
            )}

            <button type="submit" className="reset-button" disabled={loading}>
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  <span>Sending...</span>
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>

            <button type="button" className="back-to-login" onClick={handleBackToLogin}>
              <ArrowLeft size={16} />
              <span>Back to Login</span>
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default ForgotPassword
