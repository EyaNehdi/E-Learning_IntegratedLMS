"use client"

import axios from "axios"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useOutletContext } from "react-router-dom"
import {
  AlertCircle,
  CheckCircle2,
  Info,
  ChevronRight,
  ChevronLeft,
  FileText,
  Video,
  Plus,
  Trash2,
  Save,
  BookOpen,
  Calendar,
  Clock,
  X,
} from "lucide-react"
import { CKEditor } from "@ckeditor/ckeditor5-react"
import ClassicEditor from "@ckeditor/ckeditor5-build-classic"

// Button style component for consistent styling
const ButtonStyle = {
  primary: {
    backgroundColor: "#0066ff",
    color: "white",
    borderRadius: "6px",
    padding: "8px 16px",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "auto",
    minWidth: "140px",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.2s",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  secondary: {
    backgroundColor: "white",
    color: "#333",
    borderRadius: "6px",
    padding: "8px 16px",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "auto",
    minWidth: "140px",
    border: "1px solid #ddd",
    cursor: "pointer",
    transition: "background-color 0.2s",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
  },
  danger: {
    backgroundColor: "#ff3b30",
    color: "white",
    borderRadius: "6px",
    padding: "8px 16px",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "auto",
    minWidth: "140px",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.2s",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  success: {
    backgroundColor: "#34c759",
    color: "white",
    borderRadius: "6px",
    padding: "8px 16px",
    fontWeight: "500",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "auto",
    minWidth: "140px",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.2s",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  small: {
    padding: "6px 12px",
    minWidth: "auto",
    fontSize: "0.875rem",
  },
  disabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
  iconButton: {
    backgroundColor: "transparent",
    color: "#0066ff",
    borderRadius: "6px",
    padding: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
}

// Module Modal Component
function ModuleModal({ isOpen, onClose, onModuleAdded }) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [startDate, setStartDate] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addModule = async (e) => {
    e.preventDefault()

    if (!name || !description || !startDate) {
      alert("All fields are required.")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_PROXY}/module/addmodule`, {
        name, // Assurez-vous que ce champ correspond au schéma (name)
        description, // Ce champ est correct
        StartDate: startDate, // Modifié pour correspondre au schéma (StartDate au lieu de startDate)
      })

      if (response.status === 201) {
        alert("Module added successfully!")
        setName("")
        setDescription("")
        setStartDate("")
        onModuleAdded() // Refresh the modules list
        onClose() // Close the modal
      } else {
        alert("Failed to add module.")
      }
    } catch (error) {
      console.error("Error:", error)
      alert(error.response?.data?.message || "Failed to add module.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <X className="w-6 h-6" />
        </button>

        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8">
          <h1 className="text-3xl font-bold text-center text-white mb-2">Add Module</h1>
        </div>

        <form onSubmit={addModule} className="space-y-6">
          {/* Module Name */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Module Name</label>
            <input
              onChange={(e) => setName(e.target.value)}
              type="text"
              name="name"
              placeholder="Enter module name"
              value={name}
              className="w-full p-4 border border-gray-300 rounded-xl bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Description</label>
            <textarea
              onChange={(e) => setDescription(e.target.value)}
              name="description"
              placeholder="Enter description"
              value={description}
              rows={4}
              className="w-full p-4 border border-gray-300 rounded-xl bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            ></textarea>
          </div>

          {/* Creation Date */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Creation Date</label>
            <input
              onChange={(e) => setStartDate(e.target.value)}
              type="date"
              name="startDate"
              value={startDate}
              className="w-full p-4 border border-gray-300 rounded-xl bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-start mt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                backgroundColor: "#0066ff",
                color: "white",
                borderRadius: "6px",
                padding: "8px 16px",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "auto",
                minWidth: "140px",
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
            >
              {isSubmitting ? (
                "Adding..."
              ) : (
                <>
                  <span style={{ marginRight: "4px", fontSize: "18px" }}>+</span>
                  <span>Add Module</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function CoursesWizard() {
  // Navigation
  const navigate = useNavigate()
  const { user } = useOutletContext()

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1)
  const [courseCreated, setCourseCreated] = useState(false)
  const [courseId, setCourseId] = useState("")
  const [courseSlug, setCourseSlug] = useState("")
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showModuleModal, setShowModuleModal] = useState(false)

  // Course form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [level, setLevel] = useState("")
  const [categorie, setCategorie] = useState("")
  const [typeRessource, setTypeRessource] = useState("")
  const [modules, setModules] = useState([])
  const [selectedModules, setSelectedModules] = useState([])
  const [moduleProperty, setModuleProperty] = useState("title")
  const [message, setMessage] = useState({ text: "", type: "" })
  const [showGiftModal, setShowGiftModal] = useState(false)
  const [giftType, setGiftType] = useState("")
  const [editorLoaded, setEditorLoaded] = useState(false)
  const [editorError, setEditorError] = useState(false)
  const [currency, setCurrency] = useState("eur")
  const [formProgress, setFormProgress] = useState(0)

  // Chapter form state
  const [chapters, setChapters] = useState([
    {
      id: 1,
      title: "",
      description: "",
      pdf: null,
      video: null,
      pdfName: "",
      videoName: "",
      uploadProgress: { pdf: 0, video: 0 },
    },
  ])
  const [chapterSubmitting, setChapterSubmitting] = useState(false)

  // Exam form state
  const [examTitle, setExamTitle] = useState("")
  const [examDescription, setExamDescription] = useState("")
  const [duration, setDuration] = useState(60) // in minutes
  const [passingScore, setPassingScore] = useState(60) // percentage
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [questions, setQuestions] = useState([])
  const [examSubmitting, setExamSubmitting] = useState(false)

  // Errors state
  const [errors, setErrors] = useState({
    title: "",
    description: "",
    price: "",
    level: "",
    categorie: "",
    typeRessource: "",
    modules: "",
  })

  // References
  const editorRef = useRef(null)
  const fileInputRefs = useRef({})
  const videoInputRefs = useRef({})

  // Currency symbols
  const currencySymbols = {
    usd: "$",
    eur: "€",
    dzd: "د.ج",
    free: "",
  }

  // CKEditor configuration with only basic features
  const editorConfig = {
    toolbar: ["heading", "|", "bold", "italic", "|", "link", "bulletedList", "numberedList", "|", "undo", "redo"],
  }

  // Fetch modules on component mount
  useEffect(() => {
    fetchModules()
  }, [])

  // Set default dates when moving to exam step
  useEffect(() => {
    if (currentStep === 3 && !startDate && !endDate) {
      // Set default start date to today
      const today = new Date()
      const startDateStr = today.toISOString().slice(0, 16)
      setStartDate(startDateStr)

      // Set default end date to 7 days from now
      const endDate = new Date()
      endDate.setDate(today.getDate() + 7)
      const endDateStr = endDate.toISOString().slice(0, 16)
      setEndDate(endDateStr)
    }
  }, [currentStep])

  // Clear message after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ text: "", type: "" })
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  // Add cleanup effect for CKEditor
  useEffect(() => {
    return () => {
      if (editorRef.current) {
        try {
          if (typeof editorRef.current.destroy === "function") {
            editorRef.current
              .destroy()
              .then(() => {
                editorRef.current = null
              })
              .catch((error) => {
                console.error("Error destroying CKEditor:", error)
                editorRef.current = null
              })
          } else {
            editorRef.current = null
          }
        } catch (error) {
          console.error("Error in CKEditor cleanup:", error)
          editorRef.current = null
        }
      }
    }
  }, [])

  // Function to fetch modules
  const fetchModules = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_PROXY}/module`)
      console.log("Modules retrieved:", response.data)

      if (response.data.length > 0) {
        const firstModule = response.data[0]
        if (firstModule.title) setModuleProperty("title")
        else if (firstModule.name) setModuleProperty("name")
        else if (firstModule.moduleName) setModuleProperty("moduleName")
      }

      setModules(response.data)
    } catch (error) {
      console.error("Error retrieving modules:", error)
      setMessage({
        text: "Error retrieving modules",
        type: "error",
      })
    }
  }

  // Function to strip HTML tags for validation
  const stripHtml = (html) => {
    const tmp = document.createElement("DIV")
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ""
  }

  // Function to validate that text contains at least X alphabetic characters
  const validateMinAlphaChars = (text, minLength = 5) => {
    const plainText = text.includes("<") ? stripHtml(text) : text
    const alphaCount = (plainText.match(/[a-zA-Z]/g) || []).length
    return alphaCount >= minLength
  }

  // Function to validate all form fields
  const validateForm = () => {
    const newErrors = {
      title: "",
      description: "",
      price: "",
      level: "",
      categorie: "",
      typeRessource: "",
      modules: "",
    }

    let isValid = true

    // Check title
    if (!title) {
      newErrors.title = "Title is required"
      isValid = false
    } else if (!validateMinAlphaChars(title)) {
      newErrors.title = "Title must contain at least 5 alphabetic characters"
      isValid = false
    }

    // Check description
    if (!description) {
      newErrors.description = "Description is required"
      isValid = false
    } else if (!validateMinAlphaChars(description)) {
      newErrors.description = "Description must contain at least 10 alphabetic characters"
      isValid = false
    }

    // Check price
    if (!price) {
      newErrors.price = "Price is required"
      isValid = false
    }

    // Check level
    if (!level) {
      newErrors.level = "Level is required"
      isValid = false
    }

    // Check category
    if (!categorie) {
      newErrors.categorie = "Category is required"
      isValid = false
    }

    // Check resource type
    if (!typeRessource) {
      newErrors.typeRessource = "Course type is required"
      isValid = false
    }

    // Check modules
    if (selectedModules.length === 0) {
      newErrors.modules = "Please select at least one module"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  // Calculate form progress
  const calculateFormProgress = () => {
    const fields = [title, description, price, level, categorie, typeRessource]
    const filledFields = fields.filter((field) => field !== "").length
    const progress = (filledFields / fields.length) * 100
    setFormProgress(progress)
  }

  // Handle currency change
  const handleCurrencyChange = (value) => {
    setCurrency(value)
    if (value === "free") {
      setPrice("0")
      handleInputChange("price", "0")
    }
  }

  // Handle input change
  const handleInputChange = (field, value, validator = null) => {
    switch (field) {
      case "title":
        setTitle(value)
        break
      case "description":
        setDescription(value)
        break
      case "price":
        setPrice(value)
        break
      case "level":
        setLevel(value)
        break
      case "categorie":
        setCategorie(value)
        break
      case "typeRessource":
        setTypeRessource(value)
        break
      default:
        break
    }

    if (value) {
      if (validator && !validator(value)) {
        return
      }
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }

    calculateFormProgress()
  }

  // Handle module selection
  const handleModuleSelect = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value)
    setSelectedModules(selectedOptions)

    if (selectedOptions.length > 0) {
      setErrors((prev) => ({ ...prev, modules: "" }))
    }
  }

  // Handle textarea change as fallback
  const handleTextareaChange = (e) => {
    handleInputChange("description", e.target.value, validateMinAlphaChars)
  }

  // Add a course
  const addCourse = async (e) => {
    e.preventDefault()
    setMessage({ text: "", type: "" })
    setIsSubmitting(true)

    if (!validateForm()) {
      setMessage({
        text: "Please correct the errors in the form",
        type: "error",
      })
      setIsSubmitting(false)
      return
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_PROXY}/course/addcourse`, {
        title,
        description,
        price,
        level,
        categorie,
        typeRessource,
        currency,
        moduleId: selectedModules[0],
        userId: user._id,
      })

      console.log("Server response:", response.data)

      if (response.status === 201 || response.status === 200) {
        setMessage({
          text: "Course added successfully! Now, add chapters.",
          type: "success",
        })

        // Store the course ID and slug for later use
        setCourseId(response.data._id || response.data.id)
        setCourseSlug(response.data.slug)
        setCourseCreated(true)

        // Move to the next step
        setCurrentStep(2)
      }
    } catch (error) {
      console.error("Error:", error)
      setMessage({
        text: error.response?.data?.message || "Error adding course.",
        type: "error",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle file change for chapters
  const handleFileChange = (e, chapterIndex, fileType) => {
    const file = e.target.files[0]
    if (file) {
      const updatedChapters = [...chapters]

      if (fileType === "pdf") {
        updatedChapters[chapterIndex].pdf = file
        updatedChapters[chapterIndex].pdfName = file.name
        simulateProgress(chapterIndex, "pdf")
      } else if (fileType === "video") {
        updatedChapters[chapterIndex].video = file
        updatedChapters[chapterIndex].videoName = file.name
        simulateProgress(chapterIndex, "video")
      }

      setChapters(updatedChapters)
    }
  }

  // Simulate upload progress
  const simulateProgress = (chapterIndex, fileType) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 10) + 5
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
      }

      const updatedChapters = [...chapters]
      updatedChapters[chapterIndex].uploadProgress[fileType] = progress
      setChapters(updatedChapters)
    }, 200)
  }

  // Add a new chapter form
  const addChapterForm = () => {
    const newChapter = {
      id: Date.now(),
      title: "",
      description: "",
      pdf: null,
      video: null,
      pdfName: "",
      videoName: "",
      uploadProgress: { pdf: 0, video: 0 },
    }
    setChapters([...chapters, newChapter])
  }

  // Remove a chapter form
  const removeChapterForm = (chapterId) => {
    if (chapters.length > 1) {
      setChapters(chapters.filter((chapter) => chapter.id !== chapterId))
    }
  }

  // Update chapter field
  const updateChapterField = (chapterId, field, value) => {
    const updatedChapters = chapters.map((chapter) =>
      chapter.id === chapterId ? { ...chapter, [field]: value } : chapter,
    )
    setChapters(updatedChapters)
  }

  // Submit chapters
  const submitChapters = async () => {
    // Validate chapters
    const invalidChapters = chapters.filter((chapter) => !chapter.title || !chapter.description)
    if (invalidChapters.length > 0) {
      setMessage({
        text: "All chapters must have a title and description",
        type: "error",
      })
      return
    }

    setChapterSubmitting(true)
    setMessage({ text: "Adding chapters...", type: "info" })

    try {
      // Submit each chapter
      for (const chapter of chapters) {
        const formData = new FormData()
        formData.append("title", chapter.title)
        formData.append("description", chapter.description)
        formData.append("userid", user._id)

        if (chapter.pdf) formData.append("pdf", chapter.pdf)
        if (chapter.video) formData.append("video", chapter.video)

        const response = await axios.post(`${import.meta.env.VITE_API_PROXY}/chapter/add`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })

        if (response.status === 201) {
          // Assign chapter to course
          await axios.post(`${import.meta.env.VITE_API_PROXY}/chapter/assign-chapters`, {
            slugCourse: courseSlug,
            chapters: [response.data._id || response.data.id],
          })
        }
      }

      setMessage({
        text: "Chapters added successfully! Now, create an exam for this course.",
        type: "success",
      })

      // Move to the next step
      setCurrentStep(3)
    } catch (error) {
      console.error("Error adding chapters:", error)
      setMessage({
        text: error.response?.data?.message || "Error adding chapters.",
        type: "error",
      })
    } finally {
      setChapterSubmitting(false)
    }
  }

  // Add a question to the exam
  const addQuestion = (type) => {
    const newQuestion = {
      id: Date.now(),
      type: type,
      question: "",
      options: type === "multiple_choice" ? ["", "", "", ""] : [],
      correctAnswer: type === "true_false" ? "true" : "",
      points: 10,
    }

    setQuestions([...questions, newQuestion])
  }

  // Update question
  const updateQuestion = (id, field, value) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, [field]: value } : q)))
  }

  // Update option for multiple choice
  const updateOption = (questionId, optionIndex, value) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          const newOptions = [...q.options]
          newOptions[optionIndex] = value
          return { ...q, options: newOptions }
        }
        return q
      }),
    )
  }

  // Set correct answer for multiple choice
  const setCorrectAnswer = (questionId, value) => {
    setQuestions(questions.map((q) => (q.id === questionId ? { ...q, correctAnswer: value } : q)))
  }

  // Delete question
  const deleteQuestion = (id) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  // Calculate total points
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0)

  // Submit exam
  const submitExam = async () => {
    // Validate exam
    if (!examTitle) {
      setMessage({
        text: "Exam title is required",
        type: "error",
      })
      return
    }

    if (questions.length === 0) {
      setMessage({
        text: "Please add at least one question to the exam",
        type: "error",
      })
      return
    }

    // Check if all questions have content
    const incompleteQuestion = questions.find((q) => !q.question)
    if (incompleteQuestion) {
      setMessage({
        text: "Please complete all questions",
        type: "error",
      })
      return
    }

    // Validate required dates
    if (!startDate) {
      setMessage({
        text: "Start date is required",
        type: "error",
      })
      return
    }

    if (!endDate) {
      setMessage({
        text: "End date is required",
        type: "error",
      })
      return
    }

    setExamSubmitting(true)
    setMessage({ text: "Adding exam...", type: "info" })

    try {
      // Prepare exam data
      const examData = {
        title: examTitle,
        description: examDescription || "Exam for course " + title, // Provide default description if empty
        duration,
        passingScore,
        startDate,
        endDate,
        questions,
        isPublished: true,
        totalPoints,
        user: user._id,
        courseId: courseId,
        courseSlug: courseSlug,
      }

      // Send data to the backend
      const response = await axios.post(`${import.meta.env.VITE_API_PROXY}/Exam/add`, examData)

      if (response.status === 201) {
        // Assign the exam to the course
        const examId = response.data._id || response.data.id
        await axios.post(`${import.meta.env.VITE_API_PROXY}/Exam/assign-exams`, {
          courseId: courseId,
          examIds: [examId],
        })

        setMessage({
          text: "Exam added successfully! The course creation process is complete.",
          type: "success",
        })

        // Show success message and redirect after a delay
        setShowSuccessMessage(true)
        setTimeout(() => {
          navigate("/profile/list")
        }, 3000)
      }
    } catch (error) {
      console.error("Error adding exam:", error)
      setMessage({
        text: error.response?.data?.message || "Error adding exam. Make sure all required fields are filled.",
        type: "error",
      })
    } finally {
      setExamSubmitting(false)
    }
  }

  // Skip exam creation
  const skipExam = () => {
    setShowSuccessMessage(true)
    setTimeout(() => {
      navigate("/profile/list")
    }, 3000)
  }

  // Show gift/success modal
  const showGift = () => {
    setGiftType("template")
    setShowGiftModal(true)
    setTimeout(() => {
      setShowGiftModal(false)
    }, 2500)
  }

  // Handle opening the module modal
  const handleOpenModuleModal = () => {
    setShowModuleModal(true)
  }

  // Handle closing the module modal
  const handleCloseModuleModal = () => {
    setShowModuleModal(false)
  }

  // Handle module added
  const handleModuleAdded = () => {
    fetchModules() // Refresh the modules list
  }

  // Render step indicators
  const renderStepIndicators = () => {
    return (
      <div className="flex items-center justify-center mb-8">
        <div className={`flex items-center ${currentStep > 1 ? "text-green-600" : "text-blue-600"}`}>
          <div
            className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${currentStep > 1 ? "border-green-600 bg-green-100" : "border-blue-600 bg-blue-100"}`}
          >
            {currentStep > 1 ? <CheckCircle2 className="h-5 w-5" /> : 1}
          </div>
          <span className="ml-2 font-medium">Course</span>
        </div>

        <div className={`w-12 h-1 mx-2 ${currentStep > 1 ? "bg-green-600" : "bg-gray-300"}`}></div>

        <div
          className={`flex items-center ${currentStep > 2 ? "text-green-600" : currentStep === 2 ? "text-blue-600" : "text-gray-400"}`}
        >
          <div
            className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${
              currentStep > 2
                ? "border-green-600 bg-green-100"
                : currentStep === 2
                  ? "border-blue-600 bg-blue-100"
                  : "border-gray-300 bg-gray-100"
            }`}
          >
            {currentStep > 2 ? <CheckCircle2 className="h-5 w-5" /> : 2}
          </div>
          <span className="ml-2 font-medium">Chapters</span>
        </div>

        <div className={`w-12 h-1 mx-2 ${currentStep > 2 ? "bg-green-600" : "bg-gray-300"}`}></div>

        <div className={`flex items-center ${currentStep === 3 ? "text-blue-600" : "text-gray-400"}`}>
          <div
            className={`rounded-full h-8 w-8 flex items-center justify-center border-2 ${
              currentStep === 3 ? "border-blue-600 bg-blue-100" : "border-gray-300 bg-gray-100"
            }`}
          >
            3
          </div>
          <span className="ml-2 font-medium">Exam</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-8">
            <h1 className="text-3xl font-bold text-center text-white mb-2">Creation of complete courses</h1>
            <p className="text-center text-blue-100">Create a course, add chapters and an exam in a single process.</p>
          </div>

          <div className="p-6">
            {/* Step indicators */}
            {renderStepIndicators()}

            {/* Messages */}
            {message.text && (
              <div
                className={`p-4 mb-6 rounded-md flex items-center ${
                  message.type === "success"
                    ? "bg-green-100 border border-green-300 text-green-700"
                    : message.type === "info"
                      ? "bg-blue-100 border border-blue-300 text-blue-700"
                      : "bg-red-100 border border-red-300 text-red-700"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                ) : message.type === "info" ? (
                  <Info className="h-5 w-5 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 mr-2" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            {/* Success message */}
            {showSuccessMessage && (
              <div className="bg-green-100 border border-green-300 text-green-700 p-4 mb-6 rounded-md">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-green-200 rounded-full p-2">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-center mb-2">Congratulations!</h3>
                <p className="text-center">
                  Your course has been successfully created with all its components. You will be redirected to your
                  course list.
                </p>
              </div>
            )}

            {/* Step 1: Course Creation */}
            {currentStep === 1 && (
              <form onSubmit={addCourse} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                      Course title
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={title}
                      onChange={(e) => handleInputChange("title", e.target.value, validateMinAlphaChars)}
                      placeholder="Enter course title"
                      className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 ${
                        errors.title ? "border-red-500" : "border-gray-300"
                      }`}
                      required
                    />
                    {errors.title && (
                      <div className="text-red-500 text-sm mt-1 flex items-center">
                        <Info className="h-4 w-4 mr-1" />
                        {errors.title}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                      Price <span className="text-red-500">*</span>
                    </label>

                    <div className="space-y-4">
                      <div className="flex gap-4 mb-4">
                        <div className="relative flex items-center">
                          <input
                            type="radio"
                            id="usd"
                            name="currency"
                            value="usd"
                            checked={currency === "usd"}
                            onChange={() => handleCurrencyChange("usd")}
                            className="absolute opacity-0 w-full h-full cursor-pointer z-10"
                            style={{ margin: 0 }}
                          />
                          <label
                            htmlFor="usd"
                            className={`text-sm cursor-pointer flex items-center space-x-2 px-4 py-2 rounded-lg ${
                              currency === "usd"
                                ? "text-blue-500 bg-blue-100 border-blue-500 ring-2 ring-blue-300"
                                : "text-gray-700 border border-gray-300"
                            }`}
                          >
                            <span
                              className={`h-6 w-6 border-2 rounded-full flex items-center justify-center ${
                                currency === "usd" ? "border-blue-500 bg-blue-500" : "border-gray-300"
                              }`}
                            >
                              <span
                                className={`w-3 h-3 bg-white rounded-full ${currency === "usd" ? "block" : "hidden"}`}
                              ></span>
                            </span>
                            <span>Trelixcoin</span>
                          </label>
                        </div>

                        <div className="relative flex items-center">
                          <input
                            type="radio"
                            id="free"
                            name="currency"
                            value="free"
                            checked={currency === "free"}
                            onChange={() => handleCurrencyChange("free")}
                            className="absolute opacity-0 w-full h-full cursor-pointer z-10"
                            style={{ margin: 0 }}
                          />
                          <label
                            htmlFor="free"
                            className={`text-sm cursor-pointer flex items-center space-x-2 px-4 py-2 rounded-lg ${
                              currency === "free"
                                ? "text-gray-600 bg-gray-100 border-gray-500 ring-2 ring-gray-300"
                                : "text-gray-700 border border-gray-300"
                            }`}
                          >
                            <span
                              className={`h-6 w-6 border-2 rounded-full flex items-center justify-center ${
                                currency === "free" ? "border-gray-500 bg-gray-500" : "border-gray-300"
                              }`}
                            >
                              <span
                                className={`w-3 h-3 bg-white rounded-full ${currency === "free" ? "block" : "hidden"}`}
                              ></span>
                            </span>
                            <span>Free</span>
                          </label>
                        </div>
                      </div>

                      {currency === "usd" && (
                        <input
                          id="price"
                          type="number"
                          value={price}
                          onChange={(e) => handleInputChange("price", e.target.value)}
                          placeholder="Enter course price"
                          className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 ${
                            errors.price ? "border-red-500" : "border-gray-300"
                          }`}
                          required
                        />
                      )}
                    </div>
                    {errors.price && (
                      <div className="text-red-500 text-sm mt-1 flex items-center">
                        <Info className="h-4 w-4 mr-1" />
                        {errors.price}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <div className="border rounded-md overflow-hidden">
                    <div className={editorError ? "hidden" : ""}>
                      <CKEditor
                        editor={ClassicEditor}
                        data={description}
                        config={editorConfig}
                        onChange={(event, editor) => {
                          try {
                            const data = editor.getData()
                            handleInputChange("description", data, validateMinAlphaChars)
                            setEditorLoaded(true)
                          } catch (error) {
                            console.error("CKEditor onChange error:", error)
                            setEditorError(true)
                          }
                        }}
                        onReady={(editor) => {
                          try {
                            editorRef.current = editor
                            setEditorLoaded(true)
                            if (editor && editor.ui) {
                              const editorElement = editor.ui.getEditableElement()
                              if (editorElement) {
                                editorElement.style.minHeight = "200px"
                                editorElement.style.border = "1px solid #ccc"
                                editorElement.style.padding = "10px"
                              }
                            }
                          } catch (error) {
                            console.error("CKEditor onReady error:", error)
                            setEditorError(true)
                          }
                        }}
                        onError={(error) => {
                          console.error("CKEditor error:", error)
                          setEditorError(true)
                        }}
                      />
                    </div>

                    {editorError && (
                      <textarea
                        id="description"
                        value={description}
                        onChange={handleTextareaChange}
                        placeholder="Enter course description"
                        className={`w-full p-3 border-0 min-h-[200px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 ${
                          errors.description ? "border-red-500" : "border-gray-300"
                        }`}
                        required
                      />
                    )}
                  </div>
                  {errors.description && (
                    <div className="text-red-500 text-sm mt-1 flex items-center">
                      <Info className="h-4 w-4 mr-1" />
                      {errors.description}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 relative">
                    <label htmlFor="level" className="block text-sm font-medium text-gray-700">
                      Level <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="level"
                        value={level}
                        onChange={(e) => handleInputChange("level", e.target.value)}
                        className={`w-full p-3 border rounded-md appearance-none bg-gray-50 ${
                          errors.level ? "border-red-500" : "border-gray-300"
                        }`}
                        style={{
                          display: "block",
                          position: "relative",
                          zIndex: 10,
                        }}
                      >
                        <option value="" disabled>
                          Select a level
                        </option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>
                    {errors.level && (
                      <div className="text-red-500 text-sm mt-1 flex items-center">
                        <Info className="h-4 w-4 mr-1" />
                        {errors.level}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 relative">
                    <label htmlFor="categorie" className="block text-sm font-medium text-gray-700">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="categorie"
                        value={categorie}
                        onChange={(e) => handleInputChange("categorie", e.target.value)}
                        className={`w-full p-3 border rounded-md appearance-none bg-gray-50 ${
                          errors.categorie ? "border-red-500" : "border-gray-300"
                        }`}
                        style={{
                          display: "block",
                          position: "relative",
                          zIndex: 10,
                        }}
                      >
                        <option value="" disabled>
                          Select a category
                        </option>
                        <option value="Computer Science & Programming">Computer Science & Programming</option>
                        <option value="Marketing & Communications">Marketing & Communications</option>
                        <option value="Design & Multimedia">Design & Multimedia</option>
                        <option value="Personal Development">Personal Development</option>
                        <option value="Foreign Languages">Foreign Languages</option>
                        <option value="Science & Mathematics">Science & Mathematics</option>
                        <option value="Business & Entrepreneurship">Business & Entrepreneurship</option>
                        <option value="Health & Wellness">Health & Wellness</option>
                        <option value="Arts & Culture">Arts & Culture</option>
                        <option value="Engineering & Technology">Engineering & Technology</option>
                        <option value="Education & Training">Education & Training</option>
                        <option value="Law & Political Science">Law & Political Science</option>
                        <option value="Environment & Sustainability">Environment & Sustainability</option>
                        <option value="Tourism & Hospitality">Tourism & Hospitality</option>
                        <option value="Trades & Crafts">Trades & Crafts</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>
                    {errors.categorie && (
                      <div className="text-red-500 text-sm mt-1 flex items-center">
                        <Info className="h-4 w-4 mr-1" />
                        {errors.categorie}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 relative">
                    <label htmlFor="typeRessource" className="block text-sm font-medium text-gray-700">
                      Resource Type <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="typeRessource"
                        value={typeRessource}
                        onChange={(e) => handleInputChange("typeRessource", e.target.value)}
                        className={`w-full p-3 border rounded-md appearance-none bg-gray-50 ${
                          errors.typeRessource ? "border-red-500" : "border-gray-300"
                        }`}
                        style={{
                          display: "block",
                          position: "relative",
                          zIndex: 10,
                        }}
                      >
                        <option value="" disabled>
                          Select a Resource Type
                        </option>
                        <option value="pdf">PDF</option>
                        <option value="video">Video</option>
                        <option value="audio">Audio</option>
                        <option value="image">Image</option>
                        <option value="text">Text</option>
                        <option value="other">Other</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      </div>
                    </div>
                    {errors.typeRessource && (
                      <div className="text-red-500 text-sm mt-1 flex items-center">
                        <Info className="h-4 w-4 mr-1" />
                        {errors.typeRessource}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="modules" className="block text-sm font-medium text-gray-700">
                      Modules ({modules.length} available) <span className="text-red-500">*</span>
                    </label>
                    <button type="button" onClick={handleOpenModuleModal} style={ButtonStyle.primary}>
                      <span style={{ marginRight: "4px", fontSize: "18px" }}>+</span>
                      <span>Add Module</span>
                    </button>
                  </div>
                  <div className="relative">
                    <select
                      multiple
                      id="modules"
                      name="modules"
                      onChange={handleModuleSelect}
                      className={`w-full p-3 border rounded-md min-h-[120px] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 ${
                        errors.modules ? "border-red-500" : "border-gray-300"
                      }`}
                      style={{ zIndex: 10, display: "block" }}
                      value={selectedModules}
                    >
                      {modules.length > 0 ? (
                        modules.map((module) => (
                          <option key={module._id} value={module._id}>
                            {module[moduleProperty] ||
                              module.title ||
                              module.name ||
                              module.moduleName ||
                              "Unnamed module"}
                          </option>
                        ))
                      ) : (
                        <option disabled>No modules available</option>
                      )}
                    </select>
                  </div>
                  {errors.modules && (
                    <div className="text-red-500 text-sm mt-1 flex items-center">
                      <Info className="h-4 w-4 mr-1" />
                      {errors.modules}
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    style={{
                      ...ButtonStyle.primary,
                      width: "100%",
                      minWidth: "100%",
                      padding: "12px 16px",
                      fontSize: "1.125rem",
                      ...(isSubmitting ? ButtonStyle.disabled : {}),
                    }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                        Creating course...
                      </>
                    ) : (
                      <>
                        Create course and continue
                        <ChevronRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-4 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ease-out ${
                      Object.values(errors).some((error) => error !== "") ? "bg-red-500" : "bg-green-500"
                    }`}
                    style={{ width: `${formProgress}%` }}
                  ></div>
                </div>
              </form>
            )}

            {/* Step 2: Chapter Creation */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-md">
                  <h3 className="text-lg font-medium text-blue-800 mb-2">Add chapters for "{title}"</h3>
                  <p className="text-blue-700">
                    Add one or more chapters to your course. Each chapter can contain text, PDFs, and videos.
                  </p>
                </div>

                {chapters.map((chapter, index) => (
                  <div key={chapter.id} className="border rounded-lg shadow-sm p-6 bg-white">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Chapter {index + 1}</h3>
                      {chapters.length > 1 && (
                        <button onClick={() => removeChapterForm(chapter.id)} style={ButtonStyle.iconButton}>
                          <Trash2 className="h-5 w-5 text-red-500" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Chapter title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={chapter.title}
                          onChange={(e) => updateChapterField(chapter.id, "title", e.target.value)}
                          placeholder="Enter chapter title"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">PDF Document (Optional)</label>
                        <div className="border border-gray-300 rounded-md overflow-hidden">
                          <div className="flex items-center">
                            <label className="flex-1 cursor-pointer px-3 py-2 bg-white text-gray-700 hover:bg-gray-50">
                              <span className="flex items-center">
                                <FileText className="w-5 h-5 mr-2 text-gray-500" />
                                {chapter.pdfName || "Choose a PDF file"}
                              </span>
                              <input
                                type="file"
                                name="pdf"
                                accept="application/pdf"
                                onChange={(e) => handleFileChange(e, index, "pdf")}
                                className="hidden"
                                ref={(el) => (fileInputRefs.current[`${chapter.id}-pdf`] = el)}
                              />
                            </label>
                            {chapter.pdfName ? (
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedChapters = [...chapters]
                                  updatedChapters[index].pdf = null
                                  updatedChapters[index].pdfName = ""
                                  updatedChapters[index].uploadProgress.pdf = 0
                                  setChapters(updatedChapters)
                                  if (fileInputRefs.current[`${chapter.id}-pdf`])
                                    fileInputRefs.current[`${chapter.id}-pdf`].value = ""
                                }}
                                style={ButtonStyle.iconButton}
                              >
                                <Trash2 className="w-5 h-5 text-red-500" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => fileInputRefs.current[`${chapter.id}-pdf`]?.click()}
                                style={{ ...ButtonStyle.iconButton, backgroundColor: "#f0f9ff" }}
                              >
                                <Plus className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                          {chapter.pdfName && chapter.uploadProgress.pdf > 0 && (
                            <div className="bg-gray-100 h-1">
                              <div
                                className="bg-blue-500 h-1 transition-all duration-300"
                                style={{ width: `${chapter.uploadProgress.pdf}%` }}
                              ></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={chapter.description}
                          onChange={(e) => updateChapterField(chapter.id, "description", e.target.value)}
                          placeholder="Enter chapter description"
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Video (Optional)</label>
                        <div className="border border-gray-300 rounded-md overflow-hidden">
                          <div className="flex items-center">
                            <label className="flex-1 cursor-pointer px-3 py-2 bg-white text-gray-700 hover:bg-gray-50">
                              <span className="flex items-center">
                                <Video className="w-5 h-5 mr-2 text-gray-500" />
                                {chapter.videoName || "Choose a video"}
                              </span>
                              <input
                                type="file"
                                name="video"
                                accept="video/*"
                                onChange={(e) => handleFileChange(e, index, "video")}
                                className="hidden"
                                ref={(el) => (videoInputRefs.current[`${chapter.id}-video`] = el)}
                              />
                            </label>
                            {chapter.videoName ? (
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedChapters = [...chapters]
                                  updatedChapters[index].video = null
                                  updatedChapters[index].videoName = ""
                                  updatedChapters[index].uploadProgress.video = 0
                                  setChapters(updatedChapters)
                                  if (videoInputRefs.current[`${chapter.id}-video`])
                                    videoInputRefs.current[`${chapter.id}-video`].value = ""
                                }}
                                style={ButtonStyle.iconButton}
                              >
                                <Trash2 className="w-5 h-5 text-red-500" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => videoInputRefs.current[`${chapter.id}-video`]?.click()}
                                style={{ ...ButtonStyle.iconButton, backgroundColor: "#f0f9ff" }}
                              >
                                <Plus className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                          {chapter.videoName && chapter.uploadProgress.video > 0 && (
                            <div className="bg-gray-100 h-1">
                              <div
                                className="bg-blue-500 h-1 transition-all duration-300"
                                style={{ width: `${chapter.uploadProgress.video}%` }}
                              ></div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={addChapterForm}
                    style={{
                      ...ButtonStyle.secondary,
                      backgroundColor: "#f0f9ff",
                      color: "#0066ff",
                    }}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add another chapter
                  </button>
                </div>

                <div className="flex justify-between pt-6">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    style={{
                      ...ButtonStyle.secondary,
                      ...(chapterSubmitting ? ButtonStyle.disabled : {}),
                    }}
                    disabled={chapterSubmitting}
                  >
                    <ChevronLeft className="h-5 w-5 mr-2" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={submitChapters}
                    style={{
                      ...ButtonStyle.primary,
                      ...(chapterSubmitting ? ButtonStyle.disabled : {}),
                    }}
                    disabled={chapterSubmitting}
                  >
                    {chapterSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                        Saving...
                      </>
                    ) : (
                      <>
                        Save and continue
                        <ChevronRight className="h-5 w-5 ml-2" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Exam Creation */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-md">
                  <h3 className="text-lg font-medium text-blue-800 mb-2">Create an exam for "{title}"</h3>
                  <p className="text-blue-700">
                    Create an exam to assess the students' knowledge. You can add different types of questions.
                  </p>
                </div>

                <div className="border rounded-lg shadow-sm p-6 bg-white">
                  <h3 className="text-lg font-medium mb-4">Exam Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Exam title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={examTitle}
                        onChange={(e) => setExamTitle(e.target.value)}
                        placeholder="Enter exam title"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-gray-400 mr-2" />
                        <input
                          type="number"
                          min="1"
                          value={duration}
                          onChange={(e) => setDuration(Number.parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={examDescription}
                      onChange={(e) => setExamDescription(e.target.value)}
                      placeholder="Enter exam description"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Passing score (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={passingScore}
                        onChange={(e) => setPassingScore(Number.parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Start date <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                        <input
                          type="datetime-local"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    <label className="block text-sm font-medium text-gray-700">
                      End date <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                      <input
                        type="datetime-local"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">The end date must be later than the start date.</p>
                  </div>
                </div>

                <div className="border rounded-lg shadow-sm p-6 bg-white">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Questions</h3>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => addQuestion("multiple_choice")}
                        style={{
                          ...ButtonStyle.primary,
                          ...ButtonStyle.small,
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Multiple Choice
                      </button>
                      <button
                        onClick={() => addQuestion("true_false")}
                        style={{
                          ...ButtonStyle.primary,
                          ...ButtonStyle.small,
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        True/False
                      </button>
                      <button
                        onClick={() => addQuestion("short_answer")}
                        style={{
                          ...ButtonStyle.primary,
                          ...ButtonStyle.small,
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Short Answer
                      </button>
                    </div>
                  </div>

                  {questions.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                      <BookOpen className="h-12 w-12 mx-auto text-gray-400" />
                      <h3 className="mt-2 text-lg font-medium text-gray-900">No questions yet</h3>
                      <p className="mt-1 text-sm text-gray-500">Start by adding a question using the buttons above.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {questions.map((question, index) => (
                        <div key={question.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                              <span className="font-medium text-gray-700">Question {index + 1}</span>
                              <span className="ml-2 text-sm text-gray-500">({question.type.replace("_", " ")})</span>
                            </div>
                            <button onClick={() => deleteQuestion(question.id)} style={ButtonStyle.iconButton}>
                              <Trash2 className="h-5 w-5 text-red-500" />
                            </button>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                              <textarea
                                value={question.question}
                                onChange={(e) => updateQuestion(question.id, "question", e.target.value)}
                                placeholder="Enter your question"
                                rows={2}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>

                            {question.type === "multiple_choice" && (
                              <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-700">Options</label>
                                {question.options.map((option, optIndex) => (
                                  <div key={optIndex} className="flex items-center space-x-2">
                                    <input
                                      type="radio"
                                      name={`correct-${question.id}`}
                                      checked={question.correctAnswer === option}
                                      onChange={() => setCorrectAnswer(question.id, option)}
                                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                    />
                                    <input
                                      type="text"
                                      value={option}
                                      onChange={(e) => updateOption(question.id, optIndex, e.target.value)}
                                      placeholder={`Option ${optIndex + 1}`}
                                      className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    {question.options.length > 2 && (
                                      <button
                                        onClick={() => {
                                          const newOptions = [...question.options]
                                          newOptions.splice(optIndex, 1)
                                          updateQuestion(question.id, "options", newOptions)
                                        }}
                                        style={ButtonStyle.iconButton}
                                      >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                      </button>
                                    )}
                                  </div>
                                ))}
                                {question.options.length < 6 && (
                                  <button
                                    onClick={() => {
                                      const newOptions = [...question.options, ""]
                                      updateQuestion(question.id, "options", newOptions)
                                    }}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                                  >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add Option
                                  </button>
                                )}
                              </div>
                            )}

                            {question.type === "true_false" && (
                              <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-700">Correct Answer</label>
                                <div className="flex space-x-4">
                                  <div className="flex items-center">
                                    <input
                                      type="radio"
                                      id={`true-${question.id}`}
                                      name={`tf-${question.id}`}
                                      value="true"
                                      checked={question.correctAnswer === "true"}
                                      onChange={() => setCorrectAnswer(question.id, "true")}
                                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor={`true-${question.id}`} className="ml-2 text-gray-700">
                                      True
                                    </label>
                                  </div>
                                  <div className="flex items-center">
                                    <input
                                      type="radio"
                                      id={`false-${question.id}`}
                                      name={`tf-${question.id}`}
                                      value="false"
                                      checked={question.correctAnswer === "false"}
                                      onChange={() => setCorrectAnswer(question.id, "false")}
                                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor={`false-${question.id}`} className="ml-2 text-gray-700">
                                      False
                                    </label>
                                  </div>
                                </div>
                              </div>
                            )}

                            {question.type === "short_answer" && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
                                <input
                                  type="text"
                                  value={question.correctAnswer}
                                  onChange={(e) => setCorrectAnswer(question.id, e.target.value)}
                                  placeholder="Enter the correct answer"
                                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                            )}

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                              <input
                                type="number"
                                min="1"
                                value={question.points}
                                onChange={(e) => updateQuestion(question.id, "points", Number.parseInt(e.target.value))}
                                className="w-24 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                          </div>
                        </div>
                      ))}

                      <div className="bg-blue-50 p-4 rounded-md flex items-center justify-between">
                        <div>
                          <span className="font-medium text-blue-800">Total Points: {totalPoints}</span>
                          <span className="ml-2 text-sm text-blue-600">({questions.length} questions)</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-6">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    style={{
                      ...ButtonStyle.secondary,
                      ...(examSubmitting ? ButtonStyle.disabled : {}),
                    }}
                    disabled={examSubmitting}
                  >
                    <ChevronLeft className="h-5 w-5 mr-2" />
                    Back
                  </button>
                  <div className="space-x-3">
                    <button
                      type="button"
                      onClick={skipExam}
                      style={{
                        ...ButtonStyle.secondary,
                        ...(examSubmitting ? ButtonStyle.disabled : {}),
                      }}
                      disabled={examSubmitting}
                    >
                      Skip this step
                    </button>
                    <button
                      type="button"
                      onClick={submitExam}
                      style={{
                        ...ButtonStyle.success,
                        ...(examSubmitting ? ButtonStyle.disabled : {}),
                      }}
                      disabled={examSubmitting}
                    >
                      {examSubmitting ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5 mr-2" />
                          Complete Course
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Module Modal */}
      <ModuleModal isOpen={showModuleModal} onClose={handleCloseModuleModal} onModuleAdded={handleModuleAdded} />

      {/* Gift Modal */}
      {showGiftModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full transform animate-bounce">
            <div className="text-center">
              <div className="mx-auto w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-4xl">📝</span>
              </div>
              <h3 className="text-2xl font-bold mb-2">Congratulations!</h3>
              <p className="text-lg mb-4">You have successfully completed the course.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CoursesWizard
