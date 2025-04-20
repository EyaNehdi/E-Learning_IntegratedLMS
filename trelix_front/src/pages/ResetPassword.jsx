"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useLocation, useNavigate } from "react-router-dom"
import { Eye, EyeOff, Lock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import "./ResetPassword.css"

const ResetPassword = () => {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [status, setStatus] = useState({ type: "", message: "" })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [validationErrors, setValidationErrors] = useState({
    length: false,
    number: false,
    letter: false,
    special: false,
    match: false,
  })

  const navigate = useNavigate()
  const { search } = useLocation()
  const params = new URLSearchParams(search)
  const token = params.get("token")

  // Validate token exists
  useEffect(() => {
    if (!token) {
      setStatus({
        type: "error",
        message: "Invalid or missing reset token. Please request a new password reset link.",
      })
    }
  }, [token])

  // Check password strength and validation in real-time
  useEffect(() => {
    // Check individual validation criteria
    const hasMinLength = password.length >= 8
    const hasNumber = /\d/.test(password)
    const hasLetter = /[a-zA-Z]/.test(password)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    const passwordsMatch = password === confirmPassword && password !== ""

    setValidationErrors({
      length: hasMinLength,
      number: hasNumber,
      letter: hasLetter,
      special: hasSpecial,
      match: passwordsMatch,
    })

    // Calculate password strength (0-100)
    let strength = 0
    if (password.length > 0) {
      // Base points for having any password
      strength += 20

      // Add points for length (up to 25)
      strength += Math.min(25, password.length * 2)

      // Add points for complexity
      if (hasNumber) strength += 15
      if (hasLetter) strength += 15
      if (hasSpecial) strength += 25

      // Cap at 100
      strength = Math.min(100, strength)
    }

    setPasswordStrength(strength)
  }, [password, confirmPassword])

  // Get strength label and color
  const getStrengthLabel = () => {
    if (passwordStrength === 0) return { label: "", color: "" }
    if (passwordStrength < 40) return { label: "Weak", color: "#ef4444" }
    if (passwordStrength < 70) return { label: "Moderate", color: "#f59e0b" }
    return { label: "Strong", color: "#10b981" }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Check if all validation criteria are met
    const { length, number, letter, special, match } = validationErrors
    if (!length || !number || !letter || !match) {
      setStatus({
        type: "error",
        message: "Please fix the password issues before submitting",
      })
      return
    }

    setLoading(true)
    setStatus({ type: "info", message: "Resetting your password..." })

    try {
      await axios.post("http://localhost:5000/api/auth/reset-password", {
        token,
        newPassword: password,
      })

      setStatus({
        type: "success",
        message: "Your password has been successfully reset! You can now log in with your new password.",
      })

      setPassword("")
      setConfirmPassword("")

      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate("/login")
      }, 3000)
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to reset your password. Please try again."
      setStatus({
        type: "error",
        message: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <div className="reset-password-header">
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
          <h1>Reset Your Password</h1>
          <p className="reset-info">Create a new password for your account. Make sure it's strong and secure.</p>
        </div>

        {status.type === "error" && !token ? (
          <div className={`status-message ${status.type}`}>
            <AlertCircle size={20} />
            <span>{status.message}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="reset-password-form">
            <div className="form-group">
              <label htmlFor="password">New Password</label>
              <div className="password-input-container">
                <Lock className="input-icon" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your new password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Password strength meter */}
              {password && (
                <div className="password-strength">
                  <div className="strength-meter">
                    <div
                      className="strength-meter-fill"
                      style={{
                        width: `${passwordStrength}%`,
                        backgroundColor: getStrengthLabel().color,
                      }}
                    ></div>
                  </div>
                  <span className="strength-text" style={{ color: getStrengthLabel().color }}>
                    {getStrengthLabel().label}
                  </span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="password-input-container">
                <Lock className="input-icon" size={18} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex="-1"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="password-requirements">
              <h3>Password Requirements:</h3>
              <ul>
                <li className={validationErrors.length ? "valid" : "invalid"}>
                  {validationErrors.length ? <CheckCircle size={16} /> : <XCircle size={16} />}
                  <span>At least 8 characters long</span>
                </li>
                <li className={validationErrors.letter ? "valid" : "invalid"}>
                  {validationErrors.letter ? <CheckCircle size={16} /> : <XCircle size={16} />}
                  <span>Contains letters</span>
                </li>
                <li className={validationErrors.number ? "valid" : "invalid"}>
                  {validationErrors.number ? <CheckCircle size={16} /> : <XCircle size={16} />}
                  <span>Contains at least one number</span>
                </li>
                <li className={validationErrors.special ? "valid" : "invalid"}>
                  {validationErrors.special ? <CheckCircle size={16} /> : <XCircle size={16} />}
                  <span>Contains at least one special character (recommended)</span>
                </li>
                <li className={validationErrors.match ? "valid" : "invalid"}>
                  {validationErrors.match ? <CheckCircle size={16} /> : <XCircle size={16} />}
                  <span>Passwords match</span>
                </li>
              </ul>
            </div>

            {status.message && (
              <div className={`status-message ${status.type}`}>
                {status.type === "error" && <XCircle size={20} />}
                {status.type === "success" && <CheckCircle size={20} />}
                {status.type === "info" && <AlertCircle size={20} />}
                <span>{status.message}</span>
              </div>
            )}

            <button type="submit" className="reset-button" disabled={loading || !token}>
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  <span>Resetting Password...</span>
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        )}

        <div className="help-section">
          <p>
            Remember your password?{" "}
            <a href="/login" className="login-link">
              Back to Login
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
