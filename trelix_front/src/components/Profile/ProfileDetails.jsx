"use client"

import { useEffect, useState, useRef } from "react"
import { FaEdit, FaSave, FaTimes, FaPlus } from "react-icons/fa"
import { useOutletContext, useNavigate } from "react-router-dom"
import { CircularProgressbar, buildStyles } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"
import axios from "axios"

// Common programming languages and technologies for autocomplete
const SKILL_SUGGESTIONS = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C#",
  "C++",
  "C",
  "PHP",
  "Ruby",
  "Swift",
  "Kotlin",
  "Go",
  "Rust",
  "HTML",
  "CSS",
  "SASS",
  "LESS",
  "React",
  "Angular",
  "Vue",
  "Next.js",
  "Node.js",
  "Express",
  "Django",
  "Flask",
  "Spring",
  "ASP.NET",
  "Laravel",
  "Ruby on Rails",
  "TensorFlow",
  "PyTorch",
  "SQL",
  "MongoDB",
  "PostgreSQL",
  "MySQL",
  "Redis",
  "AWS",
  "Azure",
  "GCP",
  "Docker",
  "Kubernetes",
  "Git",
  "GitHub",
  "GitLab",
  "CI/CD",
  "Jenkins",
  "Agile",
  "Scrum",
  "Jira",
  "Figma",
  "Adobe XD",
  "Photoshop",
]

const ProfileDetails = () => {
  const { user, accountCompletion, updateUser, locationData } = useOutletContext()

  const [isEditing, setIsEditing] = useState(false)
  let timeoutId
  const [showPopup, setShowPopup] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const readonlyFields = ["email", "userName"]

  // Skills management state
  const [newSkill, setNewSkill] = useState("")
  const [filteredSuggestions, setFilteredSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [userSkills, setUserSkills] = useState([])
  const suggestionsRef = useRef(null)

  const navigate = useNavigate()

  useEffect(() => {
    // Set user skills when user data is loaded
    if (user && user.skils) {
      setUserSkills(user.skils)
    }
  }, [user])

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target

    updateUser({ [name]: value })

    clearTimeout(timeoutId)
    timeoutId = setTimeout(async () => {
      try {
        console.log("🟢 Updating profile...", name)
        const response = await axios.put("http://localhost:5000/api/info/profile/edit", {
          [name]: value,
          email: user.email,
        })

        console.log("Update successful:", response.data)
      } catch (error) {
        console.error("Error updating profile:", error)
      }
    }, 500)
  }

  const toggleEdit = () => {
    setIsEditing(!isEditing)
  }

  const [cvFile, setCvFile] = useState(null)
  const [entities, setEntities] = useState([])

  const handleFileChange = (event) => {
    setCvFile(event.target.files[0])
    setError(null)
  }

  const updateskilsWithEntities = async (entities) => {
    try {
      const filteredSkills = entities.filter((ent) => ent.label === "PRODUCT").map((ent) => ent.text)

      if (filteredSkills.length === 0) {
        console.warn("No relevant skills found.")
        return
      }

      const response = await axios.put("http://localhost:5000/api/info/profile/updateskils", {
        userId: user._id,
        skills: filteredSkills,
      })

      console.log("Skills updated successfully:", response.data)
      // Update local state with new skills
      setUserSkills(filteredSkills)
    } catch (error) {
      console.error("Failed to update profile:", error.response?.data || error.message)
    }
  }

  const handleSubmit = async () => {
    const file = cvFile
    if (!file) return

    const formData = new FormData()
    formData.append("cvFile", file)

    setIsLoading(true)
    setError(null)

    try {
      const response = await axios.post("http://localhost:5000/ia/auth/CV", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000,
      })

      setEntities(response.data.entities)
      updateskilsWithEntities(response.data.entities)

      // Show success message and refresh page
      alert("CV successfully analyzed and skills updated!")
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      setError(error.response?.data?.error || error.message)
      console.error("Error:", error.response?.data || error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      setIsLoading(false)
      console.log("User data loaded:", user)
    }
  }, [user])

  // Function to navigate to the password change page
  const handleChangePassword = () => {
    navigate("/profile/change-password")
  }

  // Skills management functions
  const handleSkillInputChange = (e) => {
    const input = e.target.value
    setNewSkill(input)

    if (input.trim()) {
      const filtered = SKILL_SUGGESTIONS.filter((skill) => skill.toLowerCase().includes(input.toLowerCase()))
      setFilteredSuggestions(filtered)
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }

  const selectSuggestion = (suggestion) => {
    setNewSkill("")
    setShowSuggestions(false)
    addSkill(suggestion)
  }

  const addSkill = async (skill = newSkill) => {
    if (!skill.trim()) return

    // Don't add duplicate skills
    if (userSkills.includes(skill)) {
      setNewSkill("")
      return
    }

    const updatedSkills = [...userSkills, skill]

    try {
      const response = await axios.put("http://localhost:5000/api/info/profile/updateskils", {
        userId: user._id,
        skills: updatedSkills,
      })

      console.log("Skill added successfully:", response.data)
      setUserSkills(updatedSkills)
      setNewSkill("")
    } catch (error) {
      console.error("Failed to add skill:", error.response?.data || error.message)
    }
  }

  const removeSkill = async (skillToRemove) => {
    const updatedSkills = userSkills.filter((skill) => skill !== skillToRemove)

    try {
      const response = await axios.put("http://localhost:5000/api/info/profile/updateskils", {
        userId: user._id,
        skills: updatedSkills,
      })

      console.log("Skill removed successfully:", response.data)
      setUserSkills(updatedSkills)
    } catch (error) {
      console.error("Failed to remove skill:", error.response?.data || error.message)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addSkill()
    }
  }

  // Extracting location from user
  const city = locationData?.city || "Unknown City"
  const region = locationData?.region || "Unknown Region"
  const country = locationData?.country || "Unknown Country"
  const lastLoggedInAt = locationData?.loggedInAt || "Unknown Date"

  return (
    <>
      <h2 className="">My Profile</h2>

      <div className="d-flex justify-content-center align-items-start">
        <div className="bg-white rounded-lg w-full max-w-2xl p-8">
          {user ? (
            <>
              {/* Profile Info */}
              <ul className="space-y-3 text-gray-700">
                {[
                  {
                    label: "Location",
                    value: `${city}${region ? `, ${region}` : ""}${country ? `, ${country}` : ""}`,
                    name: "location",
                  },
                  {
                    label: "Last Logged In At",
                    value: `${lastLoggedInAt}`,
                    name: "loggedInAt",
                  },
                  {
                    label: "UserName",
                    value: `${user?.firstName} ${user?.lastName}`,
                    name: "userName",
                  },
                  { label: "Email", value: user?.email, name: "email" },
                  {
                    label: "First Name",
                    value: user?.firstName,
                    name: "firstName",
                  },
                  {
                    label: "Last Name",
                    value: user?.lastName,
                    name: "lastName",
                  },
                  {
                    label: "Phone Number",
                    value: user?.phone || "No phone number provided",
                    name: "phone",
                    type: "number",
                  },
                  {
                    label: "Biography",
                    value: user?.Bio || "",
                    name: "Bio",
                    type: "textarea",
                  },
                ].map((field, index) => (
                  <li key={index} className="flex flex-col sm:flex-row items-start sm:items-center">
                    <span className="font-semibold w-40">{field.label}:</span>
                    {isEditing ? (
                      field.type === "textarea" ? (
                        <textarea
                          name={field.name}
                          value={field.value}
                          onChange={handleInputChange}
                          className={`border p-2 rounded w-full sm:w-auto ${readonlyFields.includes(field.name) ? "bg-gray-200 cursor-not-allowed" : ""
                            }`}
                          readOnly={readonlyFields.includes(field.name)}
                        />
                      ) : (
                        <input
                          type={field.type || "text"}
                          name={field.name}
                          value={field.value}
                          onChange={handleInputChange}
                          className={`border p-2 rounded w-full sm:w-auto ${readonlyFields.includes(field.name) ? "bg-gray-200 cursor-not-allowed" : ""
                            }`}
                          readOnly={readonlyFields.includes(field.name)}
                        />
                      )
                    ) : (
                      <span className="ml-2">{field.value}</span>
                    )}
                  </li>
                ))}

                {/* Skills/Occupation */}
                <li>
                  <div className="flex flex-col">
                    <span className="font-semibold mb-2">Skills/Occupation:</span>

                    {/* Skills input and add button */}
                    <div className="flex items-center w-full max-w-sm">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={handleSkillInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Add a new skill..."
                        className="border p-2 rounded flex-grow mr-2"
                      />
                      <button
                        onClick={() => addSkill()}
                        className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center"
                      >
                        <FaPlus className="mr-1" /> Add
                      </button>

                      {/* Suggestions dropdown */}
                      {showSuggestions && filteredSuggestions.length > 0 && (
                        <div
                          ref={suggestionsRef}
                          className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-10 max-h-60 overflow-y-auto"
                        >
                          {filteredSuggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              onClick={() => selectSuggestion(suggestion)}
                              className="p-2 hover:bg-gray-100 cursor-pointer"
                            >
                              {suggestion}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Skills tags */}
                    <div className="flex flex-wrap gap-2 mt-1">
                      {userSkills.length > 0 ? (
                        userSkills.map((skill, index) => (
                          <div key={index} className="bg-gray-200 px-3 py-1 rounded text-sm flex items-center group">
                            {skill}
                            <button
                              onClick={() => removeSkill(skill)}
                              className="ml-2 p-1 rounded-full bg-transparent text-gray-500 hover:text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300 transition-all duration-200 ease-in-out"
                              aria-label={`Remove ${skill} skill`} // Accessibility improvement
                            >
                              <FaTimes size={14} className="opacity-70 hover:opacity-100" /> {/* Adjusted size and transparency */}
                            </button>
                          </div>
                        ))
                      ) : (
                        <p>No skills found. Add skills manually or import from your CV.</p>
                      )}
                    </div>
                  </div>
                </li>

                {/* Registration Date */}
                <li>
                  <span className="font-semibold">Registration Date:</span> September 29, 2024, 8:30 AM
                </li>
              </ul>

              {/* Profile Completion & Badge */}
              <div className="flex flex-col items-center mt-6">
                <div className="relative w-24 h-24">
                  <CircularProgressbar
                    value={accountCompletion}
                    text={`${accountCompletion}%`}
                    styles={buildStyles({
                      textSize: "16px",
                      pathColor: accountCompletion === 100 ? "#4CAF50" : "#FF9800",
                      textColor: "#333",
                      trailColor: "#ddd",
                    })}
                  />
                </div>
                {accountCompletion === 100 && (
                  <div className="mt-3 p-3 bg-green-500 text-white rounded-lg text-sm text-center">
                    🎉 Congratulations! You have completed your profile and earned a special badge! 🏅
                  </div>
                )}
              </div>

              <div className="flex justify-between gap-4 mt-6">
                <div className="flex flex-row gap-4"> {/* Changed to flex-row for horizontal layout */}
                  {/* Edit/Save Button */}
                  <button
                    onClick={toggleEdit}
                    className="btn fs-6 fs-md-5 fs-lg-4 px-6 py-2 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      border: "2px solid #6045FF",
                      color: "#6045FF",
                      backgroundColor: "transparent",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      width: "auto",
                      minWidth: "150px",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#6045FF"
                      e.target.style.color = "#ffffff"
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "transparent"
                      e.target.style.color = "#6045FF"
                    }}
                  >
                    <div className="flex items-center justify-center w-full">
                      {isEditing ? (
                        <>
                          <FaSave className="mr-2" /> Save Profile
                        </>
                      ) : (
                        <>
                          <FaEdit className="mr-2" /> Edit Profile
                        </>
                      )}
                    </div>
                  </button>

                  {/* CV Upload Button */}
                  <button
                    onClick={() => setShowPopup(true)}
                    className="btn fs-6 fs-md-5 fs-lg-4 px-6 py-2 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      border: "2px solid #6045FF",
                      color: "#6045FF",
                      backgroundColor: "transparent",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      width: "auto",
                      minWidth: "150px",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#6045FF"
                      e.target.style.color = "#ffffff"
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "transparent"
                      e.target.style.color = "#6045FF"
                    }}
                  >
                    <div className="flex items-center justify-center w-full">Import Your CV</div>
                  </button>

                  {/* Change Password Button */}
                  <button
                    onClick={handleChangePassword}
                    className="btn fs-6 fs-md-5 fs-lg-4 px-6 py-2 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      border: "2px solid #6045FF",
                      color: "#6045FF",
                      backgroundColor: "transparent",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      width: "auto",
                      minWidth: "150px",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#6045FF"
                      e.target.style.color = "#ffffff"
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "transparent"
                      e.target.style.color = "#6045FF"
                    }}
                  >
                    <div className="flex items-center justify-center w-full">Change Password</div>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <p className="text-center">Loading user data...</p>
          )}
        </div>

        {/* CV Upload Popup Modal */}
        {showPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm relative">
              {/* Close button */}
              <button
                onClick={() => setShowPopup(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close popup"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>

              {/* Header */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Upload Your CV</h3>
                <p className="text-gray-500 mt-2">We'll analyze your CV to extract your skills and experience</p>
              </div>

              {/* Upload area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 mb-6 text-center transition-colors
                ${cvFile ? "border-green-400 bg-green-50" : "border-gray-300 hover:border-blue-400 bg-gray-50"}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  const files = e.dataTransfer.files
                  if (files.length) {
                    const file = files[0]
                    if (
                      file.type === "application/pdf" ||
                      file.type === "application/msword" ||
                      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    ) {
                      setCvFile(file)
                      setError(null)
                    } else {
                      setError("Please upload a PDF or Word document")
                    }
                  }
                }}
              >
                {!cvFile ? (
                  <>
                    <div className="mb-4 flex justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-gray-400"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="12" y1="18" x2="12" y2="12"></line>
                        <line x1="9" y1="15" x2="15" y2="15"></line>
                      </svg>
                    </div>
                    <p className="text-gray-600 mb-2">Drag and drop your CV here, or</p>
                    <label className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700 transition-colors">
                      Browse Files
                      <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="hidden" />
                    </label>
                    <p className="text-xs text-gray-500 mt-3">Supported formats: PDF, DOC, DOCX</p>
                  </>
                ) : (
                  <div className="flex items-center">
                    <div className="bg-white p-3 rounded-md shadow-sm mr-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={cvFile.name.endsWith(".pdf") ? "text-red-500" : "text-blue-500"}
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-800 truncate">{cvFile.name}</p>
                      <p className="text-xs text-gray-500">{(cvFile.size / 1024).toFixed(1)} KB</p>
                      <div className="flex items-center mt-1">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                        <span className="text-xs text-green-600">Ready to analyze</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setCvFile(null)
                        setError(null)
                      }}
                      className="ml-2 text-gray-400 hover:text-gray-600"
                      aria-label="Remove file"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Error message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    {error}
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowPopup(false)}
                  className="px-5 py-2.5 rounded-lg font-medium text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!cvFile || isLoading}
                  className={`px-5 py-2.5 rounded-lg font-medium flex items-center justify-center min-w-[120px] transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500
                  ${!cvFile || isLoading
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow"
                    }`}
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2"
                      >
                        <path d="M2 12h4l3 8 3-16 3 8h7"></path>
                      </svg>
                      Analyze CV
                    </>
                  )}
                </button>
              </div>

              {/* Help text */}
              <p className="text-xs text-gray-500 mt-6 text-center">
                We'll extract your skills and experience to enhance your profile
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default ProfileDetails
