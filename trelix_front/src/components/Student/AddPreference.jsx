"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { AlertCircle, CheckCircle2, Info, ChevronDown, ChevronUp, X } from 'lucide-react'
import { useNavigate, useOutletContext } from "react-router-dom"

function AddPreference() {
  const [typeRessource, setTypeRessource] = useState("video")
  const [momentEtude, setMomentEtude] = useState("day")
  const [langue, setLangue] = useState("french")
  const [styleContenu, setStyleContenu] = useState("theoretical")
  const [objectif, setObjectif] = useState("certification")
  const [methodeEtude, setMethodeEtude] = useState("reading")
  const [modules, setModules] = useState([])
  const [selectedModules, setSelectedModules] = useState([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [clickEffect, setClickEffect] = useState("")
  const [debugMode, setDebugMode] = useState(false)

  // Preload sound for instant playback
  const [clickSoundObj] = useState(() => {
    const sound = new Audio("https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3")
    sound.volume = 0.5
    sound.load()
    return sound
  })

  const [message, setMessage] = useState({ text: "", type: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingModules, setIsLoadingModules] = useState(false)
  const [errors, setErrors] = useState({})
  const [formProgress, setFormProgress] = useState(0)
  const [apiResponses, setApiResponses] = useState([])

  const dropdownRef = useRef(null)
  const context = useOutletContext() || {}
  const user = context.user || {}
  const navigate = useNavigate()

  // Reduced list of resource types (ignored options removed)
  const typeRessourceOptions = [
    "video",
    "pdf",
    "audio",

    "texte",
    "image",
    "quiz",
    "interactive exercice",
    "webinar",
    "infographie",
    "slides",

    "other",
  ]
  
  const momentEtudeOptions = ["day", "evening", "night", "morning", "afternoon", "weekend"]
  const langueOptions = ["french", "english", "spanish", "german", "chinese", "arabic", "russian"]
  const contentStyleOptions = ["theoretical", "practical", "interactive", "visual", "textual", "mixed"]
  const objectifOptions = [
    "certification",
    "professional skills",
    "general knowledge",
    "academic success",
    "personal development",
    "career change",
  ]
  const methodeEtudeOptions = [
    "reading",
    "discussion",
    "project",
    "practical experience",
    "research",
    "tutoring",
    "video learning",
    "group study",
    "self-learning",
    "other",
  ]

  useEffect(() => {
    fetchModules()
  }, [])

  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => setMessage({ text: "", type: "" }), 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  useEffect(() => {
    calculateFormProgress()
  }, [typeRessource, momentEtude, langue, styleContenu, objectif, methodeEtude, selectedModules])

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [dropdownRef])

  const fetchModules = async () => {
    setIsLoadingModules(true)
    try {
      const response = await axios.get("http://localhost:5000/module")
      const data = response.data
      setModules(Array.isArray(data) ? data : [])
    } catch (error) {
      setMessage({ text: `Error: ${error.message}`, type: "error" })
    } finally {
      setIsLoadingModules(false)
    }
  }

  const calculateFormProgress = () => {
    const required = [selectedModules]
    const filled = required.filter((field) => (Array.isArray(field) ? field.length > 0 : field !== "")).length
    setFormProgress((filled / required.length) * 100)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage({ text: "", type: "" })
    setIsSubmitting(true)
    setApiResponses([])
    const newErrors = {}

    if (selectedModules.length === 0) newErrors.module = "Please select at least one module"
    if (!user || !user._id) newErrors.user = "User not identified. Please log in."

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setMessage({ text: "Please correct the errors in the form", type: "error" })
      setIsSubmitting(false)
      return
    }

    try {
      // Create an array of promises for each module submission
      const submissionPromises = selectedModules.map((module) => {
        const requestData = {
          typeRessource,
          momentEtude,
          langue,
          styleContenu,
          objectif,
          methodeEtude,
          module: module.id, // Changé de moduleId à module
          user: user._id,   // Changé de userId à user
        }
        
        if (debugMode) {
          console.log("Sending data for module", module.name, ":", requestData)
        }
        
        return axios.post("http://localhost:5000/preference/add", requestData)
      })

      // Wait for all submissions to complete
      const responses = await Promise.all(submissionPromises)
      
      if (debugMode) {
        setApiResponses(responses.map(r => r.data))
      }

      setMessage({ 
        text: `Preferences successfully added for ${selectedModules.length} module(s)!`, 
        type: "success" 
      })
      
      setTypeRessource("video")
      setMomentEtude("day")
      setLangue("french")
      setStyleContenu("theoretical")
      setObjectif("certification")
      setMethodeEtude("reading")
      setSelectedModules([])
      setErrors({})

      setTimeout(() => {
        // Navigate to intelligent courses of the first module
        if (responses.length > 0 && responses[0].data && responses[0].data.moduleId) {
          navigate(`/profile/intelligent-courses?moduleId=${responses[0].data.moduleId}&userId=${user._id}`)
        }
      }, 3000)
    } catch (error) {
      console.error("Detailed error:", error.response?.data)
      setMessage({ 
        text: error.response?.data?.message || "Error adding preferences.", 
        type: "error" 
      })
      
      if (debugMode && error.response) {
        setApiResponses([{
          error: true,
          status: error.response.status,
          data: error.response.data
        }])
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderRadioGroup = (name, options, value, setValue, label) => {
    const colors = {
      bg: "bg-blue-100",
      border: "border-blue-500",
      text: "text-blue-700",
      ring: "ring-blue-300",
      checked: "peer-checked:bg-blue-100 peer-checked:border-blue-500 peer-checked:text-blue-700",
    }

    const handleClick = (option) => {
      // Play the preloaded sound
      clickSoundObj.currentTime = 0 // Reset sound for rapid clicks
      clickSoundObj.play().catch((error) => console.error("Audio playback error:", error))

      // Apply visual effect
      setClickEffect("scale-105 shadow-lg")
      setTimeout(() => setClickEffect(""), 100) // Remove effect after 100ms

      // Always set the value to the clicked option (no toggle behavior)
      setValue(option)
    }

    return (
      <div className="space-y-3 mb-6">
        <label className="block text-lg font-semibold text-gray-800 mb-2 border-l-4 pl-3 py-1 border-gray-800 bg-gray-50 rounded-r-md shadow-sm">
          {label} <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {options.map((option) => {
            const isSelected = value === option
            return (
              <div key={option} className="flex items-center">
                <input
                  type="radio"
                  id={`${name}-${option}`}
                  name={name}
                  value={option}
                  checked={isSelected}
                  onChange={() => handleClick(option)}
                  className="hidden peer"
                />
                <label
                  htmlFor={`${name}-${option}`}
                  className={`w-full text-sm cursor-pointer transition-all duration-300 ease-in-out flex items-center space-x-3 px-4 py-3 rounded-lg border-2 hover:shadow-md ${
                    isSelected
                      ? "bg-blue-100 border-blue-500 text-blue-700 ring-2 ring-blue-300"
                      : "border-gray-200 text-gray-700"
                  } ${clickEffect}`}
                  onClick={() => handleClick(option)}
                >
                  <span
                    className={`h-5 w-5 border-2 rounded-full flex items-center justify-center ${
                      isSelected ? "border-blue-500" : "border-gray-300"
                    }`}
                  >
                    {isSelected && <span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span>}
                  </span>
                  <span className="font-medium">{option}</span>
                </label>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const toggleModule = (module) => {
    const moduleInfo = {
      id: module._id,
      name: module.title || module.name || module.moduleName || module.nom || "Unnamed Module",
    }

    // Check if the module is already selected
    const isSelected = selectedModules.some((m) => m.id === moduleInfo.id)

    if (isSelected) {
      // Remove the module if already selected
      setSelectedModules(selectedModules.filter((m) => m.id !== moduleInfo.id))
    } else {
      // Add the module if not selected
      setSelectedModules([...selectedModules, moduleInfo])
    }

    // Play sound effect
    clickSoundObj.currentTime = 0
    clickSoundObj.play().catch((error) => console.error("Audio playback error:", error))
  }

  const removeModule = (moduleId) => {
    setSelectedModules(selectedModules.filter((m) => m.id !== moduleId))

    // Play sound effect
    clickSoundObj.currentTime = 0
    clickSoundObj.play().catch((error) => console.error("Audio playback error:", error))
  }

  const isUserLoggedIn = user && user._id

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 px-6 py-8">
            <h1 className="text-3xl font-bold text-center text-white mb-2">Learning Preferences</h1>
            <p className="text-center text-blue-100">Customize your learning experience</p>
            
            {/* Debug mode */}
            <div className="mt-4 flex justify-center">
              <button 
                type="button" 
                onClick={() => setDebugMode(!debugMode)}
                className={`text-xs px-2 py-1 rounded ${debugMode ? 'bg-red-700 text-white' : 'bg-blue-800 bg-opacity-50 text-blue-100'}`}
              >
                {debugMode ? "Disable Debug Mode" : "Enable Debug Mode"}
              </button>
            </div>
          </div>

          <div className="p-6 md:p-8">
            {message.text && (
              <div
                className={`p-4 mb-6 rounded-md flex items-center ${
                  message.type === "success"
                    ? "bg-green-100 border border-green-300 text-green-700"
                    : "bg-red-100 border border-red-300 text-red-700"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 mr-2" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            {!isUserLoggedIn && (
              <div className="p-4 mb-6 rounded-md flex items-center bg-yellow-100 border border-yellow-300 text-yellow-700">
                <AlertCircle className="h-5 w-5 mr-2" />
                <span>You must be logged in to save your preferences.</span>
              </div>
            )}

            {/* Display API responses in debug mode */}
            {debugMode && apiResponses.length > 0 && (
              <div className="p-4 mb-6 rounded-md border border-gray-300 bg-gray-50">
                <h3 className="font-bold mb-2">API Responses:</h3>
                <pre className="text-xs overflow-auto max-h-40 p-2 bg-gray-100 rounded">
                  {JSON.stringify(apiResponses, null, 2)}
                </pre>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2 mb-6">
                <label
                  htmlFor="module"
                  className="block text-lg font-semibold text-gray-800 mb-2 border-l-4 pl-3 py-1 border-gray-800 bg-gray-50 rounded-r-md shadow-sm"
                >
                  Modules <span className="text-red-500">*</span>
                </label>

                {/* Display selected modules */}
                {selectedModules.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedModules.map((module) => (
                      <div
                        key={module.id}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center"
                      >
                        <span className="mr-1">{module.name}</span>
                        <button
                          type="button"
                          onClick={() => removeModule(module.id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    className="w-full p-3 border-2 border-gray-300 rounded-md bg-white text-left flex justify-between items-center hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    disabled={isLoadingModules}
                  >
                    <span className="text-gray-500 italic">
                      {isLoadingModules
                        ? "Loading modules..."
                        : selectedModules.length > 0
                          ? "Add more modules"
                          : "Select modules"}
                    </span>
                    {isDropdownOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {modules.length > 0 ? (
                        modules.map((module) => {
                          const isSelected = selectedModules.some((m) => m.id === module._id)
                          return (
                            <div
                              key={module._id}
                              className={`p-3 hover:bg-blue-100 cursor-pointer border-b border-gray-100 last:border-b-0 flex items-center ${isSelected ? "bg-blue-50" : ""}`}
                              onClick={() => toggleModule(module)}
                            >
                              {isSelected && (
                                <div className="w-4 h-4 bg-blue-500 rounded-full mr-2 flex items-center justify-center">
                                  <CheckCircle2 className="w-3 h-3 text-white" />
                                </div>
                              )}
                              <span>
                                {module.title || module.name || module.moduleName || module.nom || "Unnamed Module"}
                              </span>
                            </div>
                          )
                        })
                      ) : (
                        <div className="p-3 text-gray-500">No modules available</div>
                      )}
                    </div>
                  )}
                </div>

                {errors.module && (
                  <div className="text-red-500 text-sm mt-1 flex items-center">
                    <Info className="h-4 w-4 mr-1" />
                    {errors.module}
                  </div>
                )}

                {modules.length === 0 && !isLoadingModules && (
                  <div className="text-amber-600 text-sm mt-1 flex items-center">
                    <Info className="h-4 w-4 mr-1" />
                    No modules found. Please create a module first.
                  </div>
                )}
              </div>

              {renderRadioGroup(
                "typeRessource",
                typeRessourceOptions,
                typeRessource,
                setTypeRessource,
                "Preferred resource type?",
              )}
              {renderRadioGroup(
                "momentEtude",
                momentEtudeOptions,
                momentEtude,
                setMomentEtude,
                "Preferred time of day to study?",
              )}
              {renderRadioGroup("langue", langueOptions, langue, setLangue, "Preferred language?")}
              {renderRadioGroup(
                "styleContenu",
                contentStyleOptions,
                styleContenu,
                setStyleContenu,
                "Content style?",
              )}
              {renderRadioGroup(
                "objectif",
                objectifOptions,
                objectif,
                setObjectif,
                "Learning objective?",
              )}
              {renderRadioGroup(
                "methodeEtude",
                methodeEtudeOptions,
                methodeEtude,
                setMethodeEtude,
                "Preferred study method?",
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  className={`w-full py-4 px-8 rounded-xl text-lg font-bold text-white transition-all duration-300 ease-in-out shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isSubmitting || !isUserLoggedIn || modules.length === 0 || selectedModules.length === 0
                      ? "bg-gray-300 cursor-not-allowed opacity-70"
                      : "bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 hover:scale-105 hover:shadow-xl backdrop-blur-md bg-opacity-90"
                  }`}
                  disabled={isSubmitting || !isUserLoggedIn || modules.length === 0 || selectedModules.length === 0}
                >
                  {isSubmitting ? "Submitting..." : "Save My Preferences"}
                </button>
              </div>

              <div className="mt-4 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ease-out ${
                    Object.keys(errors).length > 0 ? "bg-red-500" : "bg-green-500"
                  }`}
                  style={{ width: `${formProgress}%` }}
                ></div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    
  )


}

export default AddPreference