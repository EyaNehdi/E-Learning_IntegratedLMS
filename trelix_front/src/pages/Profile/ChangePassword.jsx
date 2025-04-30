
import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { EyeIcon, EyeOffIcon, CheckCircleIcon, XCircleIcon, ShieldCheckIcon } from "lucide-react"

const PasswordStrengthIndicator = ({ password }) => {
  const [strength, setStrength] = useState({
    score: 0,
    label: "Too weak",
    color: "bg-red-500",
  })

  useEffect(() => {
    if (!password) {
      setStrength({ score: 0, label: "Too weak", color: "bg-red-500" })
      return
    }

    // Simple password strength calculation
    let score = 0
    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1

    const strengthMap = [
      { score: 0, label: "Too weak", color: "bg-red-500" },
      { score: 1, label: "Weak", color: "bg-red-500" },
      { score: 2, label: "Fair", color: "bg-yellow-500" },
      { score: 3, label: "Good", color: "bg-blue-500" },
      { score: 4, label: "Strong", color: "bg-green-500" },
      { score: 5, label: "Very strong", color: "bg-green-600" },
    ]

    setStrength(strengthMap[score])
  }, [password])

  return (
    <div className="mt-2 mb-4">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">Password strength</span>
        <span
          className={`text-sm font-medium ${
            strength.score <= 1
              ? "text-red-600"
              : strength.score <= 2
                ? "text-yellow-600"
                : strength.score <= 3
                  ? "text-blue-600"
                  : "text-green-600"
          }`}
        >
          {strength.label}
        </span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${strength.color} transition-all duration-300 ease-in-out`}
          style={{ width: `${(strength.score / 5) * 100}%` }}
        ></div>
      </div>
    </div>
  )
}

const PasswordRequirement = ({ text, satisfied }) => (
  <div className="flex items-center gap-2 text-sm">
    {satisfied ? (
      <CheckCircleIcon className="h-4 w-4 text-green-500" />
    ) : (
      <XCircleIcon className="h-4 w-4 text-red-500" />
    )}
    <span className={satisfied ? "text-gray-700" : "text-gray-500"}>{text}</span>
  </div>
)

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState("")
  const [messageType, setMessageType] = useState("") // "success" or "error"
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  // Password requirements validation
  const requirements = [
    { text: "At least 8 characters", satisfied: newPassword.length >= 8 },
    { text: "At least one uppercase letter", satisfied: /[A-Z]/.test(newPassword) },
    { text: "At least one number", satisfied: /[0-9]/.test(newPassword) },
    { text: "At least one special character", satisfied: /[^A-Za-z0-9]/.test(newPassword) },
    { text: "Passwords match", satisfied: newPassword === confirmPassword && confirmPassword !== "" },
  ]

  const allRequirementsMet = requirements.every((req) => req.satisfied)

  const handlePasswordChange = async (e) => {
    e.preventDefault()

    if (!allRequirementsMet) {
      setPasswordMessage("Please meet all password requirements")
      setMessageType("error")
      return
    }

    setIsSubmitting(true)
    setPasswordMessage("")

    try {
      const response = await axios.put("http://localhost:5000/api/info/profile/change-password", {
        oldPassword,
        newPassword,
      })

      setPasswordMessage("Password updated successfully!")
      setMessageType("success")

      // Clear form
      setOldPassword("")
      setNewPassword("")
      setConfirmPassword("")

      // Redirect after a short delay
      setTimeout(() => {
        navigate("/profile/details")
      }, 2000)
    } catch (error) {
      setPasswordMessage(error.response?.data?.message || "Error updating password")
      setMessageType("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Change Password</h2>
        </div>

        <p className="text-gray-600 mb-6">Create a strong password to keep your account secure.</p>

        <form onSubmit={handlePasswordChange} className="space-y-5">
          <div>
            <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                id="oldPassword"
                type={showOldPassword ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter your current password"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowOldPassword(!showOldPassword)}
              >
                {showOldPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Create a new password"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>

            {newPassword && <PasswordStrengthIndicator password={newPassword} />}

            <div className="mt-2 space-y-1">
              {requirements.slice(0, -1).map((req, index) => (
                <PasswordRequirement key={index} text={req.text} satisfied={req.satisfied} />
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Confirm your new password"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>

            {confirmPassword && (
              <div className="mt-2">
                <PasswordRequirement text={requirements[4].text} satisfied={requirements[4].satisfied} />
              </div>
            )}
          </div>

          {passwordMessage && (
            <div
              className={`p-3 rounded-lg ${
                messageType === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
            >
              {passwordMessage}
            </div>
          )}

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={() => navigate("/profile/details")}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !allRequirementsMet}
              className={`flex-1 px-4 py-3 rounded-lg text-white transition-colors ${
                isSubmitting || !allRequirementsMet ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isSubmitting ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChangePassword
