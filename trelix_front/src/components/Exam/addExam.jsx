import { useState, useRef } from "react"
import {
  Clock,
  Calendar,
  Settings,
  Plus,
  Trash2,
  GripVertical,
  Eye,
  Save,
  HelpCircle,
  AlertTriangle,
  CheckCircle,
  FileText,
  Download,
} from "lucide-react"
import axios from "axios"
import { useOutletContext, useParams } from "react-router-dom"

const AddExam = () => {
  // State for exam details
  const [examTitle, setExamTitle] = useState("")
  const [examDescription, setExamDescription] = useState("")
  const [duration, setDuration] = useState(60) // in minutes
  const [passingScore, setPassingScore] = useState(60) // percentage
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isPublished, setIsPublished] = useState(false)

  // State for questions
  const [questions, setQuestions] = useState([])
  const [currentTab, setCurrentTab] = useState("details") // details, questions, settings, preview

  // Add these to the existing state variables
  const [importType, setImportType] = useState("none") // none, pdf, text
  const [importText, setImportText] = useState("")
  const [importFile, setImportFile] = useState(null)
  const [importFileName, setImportFileName] = useState("")
  const [showImportModal, setShowImportModal] = useState(false)

  // New state for storing original file information
  const [originalFile, setOriginalFile] = useState(null)
  const [originalFilePath, setOriginalFilePath] = useState("")
  const [originalFileType, setOriginalFileType] = useState("") // "pdf" or "text"
  const [originalFileUrl, setOriginalFileUrl] = useState("")

  // Reference for file input
  const fileInputRef = useRef(null)
  const { user, profile, setProfile, completion } = useOutletContext()
  // Add a new question
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

  // Move question up or down
  const moveQuestion = (id, direction) => {
    const index = questions.findIndex((q) => q.id === id)
    if ((direction === "up" && index === 0) || (direction === "down" && index === questions.length - 1)) {
      return
    }

    const newQuestions = [...questions]
    const newIndex = direction === "up" ? index - 1 : index + 1
    ;[newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]]
    setQuestions(newQuestions)
  }

  // Calculate total points
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0)
  const saveExam = async (publish = false) => {
    try {
        // Validate form
        if (!examTitle) {
            alert("Please enter an exam title");
            setCurrentTab("details");
            return;
        }

        if (questions.length === 0) {
            alert("Please add at least one question");
            setCurrentTab("questions");
            return;
        }

        // Check if all questions have content
        const incompleteQuestion = questions.find((q) => !q.question);
        if (incompleteQuestion) {
            alert("Please complete all questions");
            setCurrentTab("questions");
            return;
        }

        // Prepare exam data
        const examData = {
            title: examTitle,
            description: examDescription,
            duration,
            passingScore,
            startDate,
            endDate,
            questions,
            isPublished: publish,
            totalPoints,
            user: user._id,
            originalFile: originalFile
                ? {
                      name: originalFile.name,
                      type: originalFileType,
                      size: originalFile.size,
                      path: originalFilePath,
                      url: originalFileUrl,
                  }
                : null,
        };

        console.log("Saving exam:", examData);

        // Send data to the backend
        const response = await axios.post("http://localhost:5000/Exam/add", examData);

        if (response.status === 201) {
            setIsPublished(publish);
            alert(publish ? "Exam published successfully!" : "Exam saved as draft!");

            // ✅ Reset all fields after successful save
            setExamTitle("");
            setExamDescription("");
            setDuration(0);
            setPassingScore(0);
            setStartDate("");
            setEndDate("");
            setQuestions([]);
            setOriginalFile(null);
           
        } else {
            throw new Error("Failed to save exam");
        }
    } catch (error) {
        console.error("Error saving exam:", error);
        alert("An error occurred while saving the exam. Please try again.");
    }
};



  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (file.type !== "application/pdf") {
        alert("Please upload a PDF file")
        return
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size exceeds 10MB limit")
        return
      }

      setImportFile(file)
      setImportFileName(file.name)

      // Store file path (in a real app, this would be handled differently)
      // For demo purposes, we'll just use the file name
      setOriginalFilePath(file.name)
    }
  }

  // Handle direct file upload (from the details tab)
  const handleDirectFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (file.type !== "application/pdf") {
        alert("Please upload a PDF file")
        return
      }

      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size exceeds 10MB limit")
        return
      }

      // Store the original file
      setOriginalFile(file)
      setOriginalFileType("pdf")
      setOriginalFilePath(file.name)

      // Create a temporary URL for the file (for preview purposes)
      const fileUrl = URL.createObjectURL(file)
      setOriginalFileUrl(fileUrl)
    }
  }

  // Remove original file
  const removeOriginalFile = () => {
    setOriginalFile(null)
    setOriginalFileType("")
    setOriginalFilePath("")

    // Revoke the URL to prevent memory leaks
    if (originalFileUrl) {
      URL.revokeObjectURL(originalFileUrl)
      setOriginalFileUrl("")
    }
  }

  // Process imported content
  const processImport = () => {
    // Show loading state
    const loadingToast = alert("Processing your content. Please wait...")

    // Simulate processing delay
    setTimeout(() => {
      // In a real application, you would process the PDF or text here
      // and convert it to question objects

      if (importType === "pdf") {
        // Example of creating questions from a PDF
        const newQuestions = [
          {
            id: Date.now(),
            type: "multiple_choice",
            question: `Sample question extracted from "${importFileName}"`,
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: "Option A",
            points: 10,
          },
          {
            id: Date.now() + 1,
            type: "true_false",
            question: "Another sample question from the PDF",
            correctAnswer: "true",
            points: 5,
          },
        ]

        setQuestions([...questions, ...newQuestions])

        // Store the original file
        setOriginalFile(importFile)
        setOriginalFileType("pdf")
        setOriginalFilePath(importFileName)

        // Create a temporary URL for the file (for preview purposes)
        const fileUrl = URL.createObjectURL(importFile)
        setOriginalFileUrl(fileUrl)
      } else if (importType === "text") {
        // Example of parsing text content
        // This is a simplified example - in a real app you would have more sophisticated parsing
        const lines = importText.split("\n")
        const newQuestions = []
        let currentQuestion = null

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim()

          // Detect new question
          if (/^\d+\./.test(line)) {
            if (currentQuestion) {
              newQuestions.push(currentQuestion)
            }

            currentQuestion = {
              id: Date.now() + newQuestions.length,
              type: "multiple_choice", // Default, may change based on content
              question: line.replace(/^\d+\.\s*/, ""),
              options: [],
              correctAnswer: "",
              points: 10,
            }
          }
          // Detect options
          else if (/^[A-D]\)/.test(line) && currentQuestion) {
            const option = line.replace(/^[A-D]\)\s*/, "")
            currentQuestion.options.push(option)
          }
          // Detect answer
          else if (/^Answer:\s*/.test(line) && currentQuestion) {
            const answer = line.replace(/^Answer:\s*/, "")

            // Handle true/false questions
            if (answer.toLowerCase() === "true" || answer.toLowerCase() === "false") {
              currentQuestion.type = "true_false"
              currentQuestion.correctAnswer = answer.toLowerCase()
            }
            // Handle multiple choice
            else if (/^[A-D]$/.test(answer) && currentQuestion.options.length > 0) {
              const index = answer.charCodeAt(0) - 65 // Convert A->0, B->1, etc.
              if (index >= 0 && index < currentQuestion.options.length) {
                currentQuestion.correctAnswer = currentQuestion.options[index]
              }
            }
            // Handle short answer
            else if (currentQuestion.options.length === 0) {
              currentQuestion.type = "short_answer"
              currentQuestion.correctAnswer = answer
            }
          }
        }

        // Add the last question if it exists
        if (currentQuestion) {
          newQuestions.push(currentQuestion)
        }

        setQuestions([...questions, ...newQuestions])

        // Store the original text
        setOriginalFileType("text")
        setOriginalFilePath("imported-text-" + new Date().toISOString().slice(0, 10) + ".txt")

        // Create a text file from the imported text
        const textFile = new Blob([importText], { type: "text/plain" })
        setOriginalFile(textFile)

        // Create a temporary URL for the file (for preview purposes)
        const fileUrl = URL.createObjectURL(textFile)
        setOriginalFileUrl(fileUrl)
      }

      // Close the modal and show success message
      setShowImportModal(false)
      alert(
        `Successfully imported ${importType === "pdf" ? "PDF" : "text"} content. ${
          importType === "pdf" ? "2" : Math.floor(importText.split(/\d+\./).length - 1)
        } questions added.`,
      )

      // Reset import state
      setImportType("none")
      setImportText("")
      setImportFile(null)
      setImportFileName("")

      // Switch to questions tab to show the imported questions
      setCurrentTab("questions")
    }, 1500)
  }

  // Import Modal
  const ImportModal = () => {
    if (!showImportModal) return null

    return (
      
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-900">Import Exam Content</h3>
            <button onClick={() => setShowImportModal(false)} className="text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left side - Import options */}
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-md mb-4">
                <h4 className="font-medium text-blue-800 mb-2">Import Instructions</h4>
                <p className="text-sm text-blue-700">
                  Choose your import method below. You can upload a PDF exam or paste formatted text. The system will
                  attempt to extract questions and answers automatically.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Import Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <div
                    className={`border rounded-md p-4 cursor-pointer transition-colors ${
                      importType === "pdf" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setImportType("pdf")}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="import-pdf"
                        name="import-type"
                        checked={importType === "pdf"}
                        onChange={() => setImportType("pdf")}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="import-pdf" className="ml-2 block font-medium text-gray-700 cursor-pointer">
                        PDF Document
                      </label>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 ml-6">Upload an existing exam in PDF format</p>
                  </div>

                  <div
                    className={`border rounded-md p-4 cursor-pointer transition-colors ${
                      importType === "text" ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setImportType("text")}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="import-text"
                        name="import-type"
                        checked={importType === "text"}
                        onChange={() => setImportType("text")}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="import-text" className="ml-2 block font-medium text-gray-700 cursor-pointer">
                        Text Content
                      </label>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 ml-6">Paste formatted questions and answers</p>
                  </div>
                </div>
              </div>

              {importType === "pdf" && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Upload PDF Exam</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {!importFile ? (
                      <>
                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-2 flex text-sm text-gray-600 justify-center">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                          >
                            <span>Upload a file</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              accept="application/pdf"
                              className="sr-only"
                              onChange={handleFileUpload}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">PDF up to 10MB</p>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center">
                          <FileText className="h-8 w-8 text-blue-500 mr-2" />
                          <span className="font-medium text-gray-900">{importFileName}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {importFile.size ? `${(importFile.size / 1024 / 1024).toFixed(2)} MB` : ""}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setImportFile(null)
                            setImportFileName("")
                          }}
                          className="text-sm text-red-600 hover:text-red-800 font-medium"
                        >
                          Remove file
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    <p className="font-medium mb-1">Supported formats:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Multiple choice questions with options</li>
                      <li>True/False questions</li>
                      <li>Short answer questions</li>
                    </ul>
                  </div>
                </div>
              )}

              {importType === "text" && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">Paste Text Content</label>
                  <textarea
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    rows={10}
                    placeholder="Example format:
1. What is the capital of France?
A) London
B) Berlin
C) Paris
D) Madrid
Answer: C

2. True or False: The Earth is flat.
Answer: False"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  />
                  <div className="text-sm text-gray-500">
                    <p className="font-medium mb-1">Formatting guidelines:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Number each question (1., 2., etc.)</li>
                      <li>For multiple choice, list options as A), B), C), etc.</li>
                      <li>Indicate the answer with "Answer: [option]"</li>
                      <li>Separate questions with blank lines</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Right side - Preview */}
            <div className="border rounded-md p-4 bg-gray-50">
              <h4 className="font-medium text-gray-800 mb-3 pb-2 border-b">Content Preview</h4>

              {importType === "pdf" && (
                <>
                  {importFile ? (
                    <div className="space-y-4">
                      <div className="aspect-[3/4] bg-white border rounded-md shadow-sm overflow-hidden">
                        <div className="h-full flex items-center justify-center">
                          {/* In a real app, you would render a PDF preview here */}
                          <div className="text-center p-4">
                            <FileText className="h-16 w-16 mx-auto text-blue-500 mb-2" />
                            <h5 className="font-medium text-gray-900">{importFileName}</h5>
                            <p className="text-sm text-gray-500 mt-2">PDF preview available after processing</p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-md">
                        <p className="text-sm text-blue-800">
                          <strong>Note:</strong> The system will analyze this PDF to extract questions and answers.
                          You'll be able to review and edit all imported content before finalizing.
                        </p>
                      </div>
                      <div className="border rounded-md p-3 bg-white">
                        <h5 className="font-medium text-gray-800 mb-2">Expected Import Results:</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>• Questions with their text</li>
                          <li>• Answer options (for multiple choice)</li>
                          <li>• Correct answers where identified</li>
                          <li>• Basic formatting and structure</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-400 border-2 border-dashed rounded-md">
                      <div className="text-center">
                        <FileText className="h-10 w-10 mx-auto mb-2" />
                        <p>Upload a PDF to see preview</p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {importType === "text" && (
                <>
                  {importText ? (
                    <div className="space-y-4">
                      <div className="bg-white border rounded-md p-4 h-64 overflow-auto font-mono text-sm">
                        {importText.split("\n").map((line, i) => (
                          <div
                            key={i}
                            className={`${
                              line.trim().startsWith("Answer:")
                                ? "text-green-600 font-medium"
                                : /^\d+\./.test(line)
                                  ? "text-blue-600 font-medium"
                                  : /^[A-D]\)/.test(line)
                                    ? "ml-4"
                                    : ""
                            }`}
                          >
                            {line || "\u00A0"}
                          </div>
                        ))}
                      </div>
                      <div className="bg-blue-50 p-3 rounded-md">
                        <p className="text-sm text-blue-800">
                          <strong>Preview:</strong> The system will parse this text to create structured questions.
                          Questions will be created based on the format detected.
                        </p>
                      </div>
                      <div className="border rounded-md p-3 bg-white">
                        <h5 className="font-medium text-gray-800 mb-2">Detected Content:</h5>
                        <div className="text-sm text-gray-600">
                          {importText ? (
                            <ul className="space-y-1">
                              <li>• Approximately {importText.split(/\d+\./).length - 1} questions detected</li>
                              <li>
                                •{" "}
                                {importText.includes("A)")
                                  ? "Multiple choice options detected"
                                  : "No multiple choice options detected"}
                              </li>
                              <li>
                                •{" "}
                                {importText.includes("Answer:")
                                  ? "Answer markers detected"
                                  : "No answer markers detected"}
                              </li>
                            </ul>
                          ) : (
                            <p>No content to analyze</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-400 border-2 border-dashed rounded-md">
                      <div className="text-center">
                        <FileText className="h-10 w-10 mx-auto mb-2" />
                        <p>Enter text content to see preview</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => setShowImportModal(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              onClick={processImport}
              disabled={
                importType === "none" || (importType === "pdf" && !importFile) || (importType === "text" && !importText)
              }
              className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                importType === "none" || (importType === "pdf" && !importFile) || (importType === "text" && !importText)
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
              }`}
            >
              Process & Import
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Original File Component
  const OriginalFileComponent = () => {
    if (!originalFile) return null

    return (
      <div className="mt-6 border rounded-md p-4 bg-blue-50">
        <h3 className="font-medium text-gray-800 mb-2 flex items-center">
          <FileText className="h-5 w-5 mr-2 text-blue-600" />
          Original Exam File
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="mr-3">
              {originalFileType === "pdf" ? (
                <div className="h-10 w-10 bg-red-100 rounded flex items-center justify-center">
                  <span className="text-red-700 font-bold text-xs">PDF</span>
                </div>
              ) : (
                <div className="h-10 w-10 bg-blue-100 rounded flex items-center justify-center">
                  <span className="text-blue-700 font-bold text-xs">TXT</span>
                </div>
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900">{originalFilePath}</p>
              <p className="text-sm text-gray-500">
                {originalFile.size ? `${(originalFile.size / 1024 / 1024).toFixed(2)} MB` : ""}
                {originalFileType === "pdf" ? " • PDF Document" : " • Text File"}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            {originalFileUrl && (
              <a
                href={originalFileUrl}
                download={originalFilePath}
                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center text-sm"
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </a>
            )}
            <button
              onClick={removeOriginalFile}
              className="px-3 py-1 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center text-sm"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Remove
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6">
          <h1 className="text-2xl font-bold text-white">Create New Exam</h1>
          <p className="text-blue-100 mt-2">Create a comprehensive assessment for your students</p>
        </div>

        {/* Tabs */}
        <div className="bg-gray-100 px-6 py-4 border-b flex flex-wrap">
  <button
    onClick={() => setCurrentTab("details")}
    className={`px-4 py-2 rounded-md mr-2 mb-2 font-medium text-sm ${
      currentTab === "details" 
        ? "bg-blue-600 text-white" 
        : "bg-gray-300 text-gray-700 hover:bg-gray-50"
    }`}
  >
    Exam Details
  </button>
  <button
    onClick={() => setCurrentTab("questions")}
    className={`px-4 py-2 rounded-md mr-2 mb-2 font-medium text-sm ${
      currentTab === "questions" 
        ? "bg-blue-600 text-white" 
        : "bg-gray-300 text-black-700 hover:bg-gray-50"
    }`}
  >
    Questions ({questions.length})
  </button>
  <button
    onClick={() => setCurrentTab("settings")}
    className={`px-4 py-2 rounded-md mr-2 mb-2 font-medium text-sm ${
      currentTab === "settings" 
        ? "bg-blue-600 text-white" 
        : "bg-gray-300 text-gray-700 hover:bg-gray-50"
    }`}
  >
    Settings
  </button>
  <button
    onClick={() => setCurrentTab("preview")}
    className={`px-4 py-2 rounded-md mr-2 mb-2 font-medium text-sm ${
      currentTab === "preview" 
        ? "bg-blue-600 text-white" 
        : "bg-gray-300 text-gray-700 hover:bg-gray-50"
    }`}
  >
    Preview
  </button>
</div>


        {/* Content */}
        <div className="p-6">
          {/* Exam Details Tab */}
          {currentTab === "details" && (
            <div className="space-y-6">
              <div>
                <label htmlFor="exam-title" className="block text-sm font-medium text-gray-700 mb-1">
                  Exam Title*
                </label>
                <input
                  id="exam-title"
                  type="text"
                  value={examTitle}
                  onChange={(e) => setExamTitle(e.target.value)}
                  placeholder="Enter exam title"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="exam-description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="exam-description"
                  value={examDescription}
                  onChange={(e) => setExamDescription(e.target.value)}
                  placeholder="Enter exam description"
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Original File Upload Section */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Original Exam File (Optional)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {!originalFile ? (
                    <>
                      <FileText className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-2 flex text-sm text-gray-600 justify-center">
                        <label
                          htmlFor="original-file-upload"
                          className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                        >
                          <span>Upload a file</span>
                          <input
                            id="original-file-upload"
                            name="original-file-upload"
                            type="file"
                            accept="application/pdf"
                            className="sr-only"
                            ref={fileInputRef}
                            onChange={handleDirectFileUpload}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Upload the original exam PDF to keep for reference</p>
                    </>
                  ) : (
                    <OriginalFileComponent />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes)
                  </label>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-gray-400 mr-2" />
                    <input
                      id="duration"
                      type="number"
                      min="1"
                      value={duration}
                      onChange={(e) => setDuration(Number.parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="passing-score" className="block text-sm font-medium text-gray-700 mb-1">
                    Passing Score (%)
                  </label>
                  <input
                    id="passing-score"
                    type="number"
                    min="0"
                    max="100"
                    value={passingScore}
                    onChange={(e) => setPassingScore(Number.parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setCurrentTab("questions")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Next: Add Questions
                </button>
              </div>
            </div>
          )}

          {/* Questions Tab */}
          {currentTab === "questions" && (
            <div className="space-y-6">
              {originalFile && <OriginalFileComponent />}

              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  onClick={() => addQuestion("multiple_choice")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Multiple Choice
                </button>
                <button
                  onClick={() => addQuestion("true_false")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  True/False
                </button>
                <button
                  onClick={() => addQuestion("short_answer")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Short Answer
                </button>
                <button
                  onClick={() => addQuestion("essay")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Essay
                </button>

                <button
                  onClick={() => setShowImportModal(true)}
                  className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center ml-auto"
                >
                  <FileText className="h-4 w-4 mr-1" />
                  Import Questions
                </button>
              </div>

              {questions.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <HelpCircle className="h-12 w-12 mx-auto text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">No questions yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by adding a question using the buttons above.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {questions.map((question, index) => (
                    <div key={question.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <GripVertical className="h-5 w-5 text-gray-400 cursor-move mr-2" />
                          <span className="font-medium text-gray-700">Question {index + 1}</span>
                          <span className="ml-2 text-sm text-gray-500">({question.type.replace("_", " ")})</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => moveQuestion(question.id, "up")}
                            disabled={index === 0}
                            className={`p-1 rounded-md ${
                              index === 0 ? "text-gray-300 cursor-not-allowed" : "text-gray-500 hover:bg-gray-100"
                            }`}
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => moveQuestion(question.id, "down")}
                            disabled={index === questions.length - 1}
                            className={`p-1 rounded-md ${
                              index === questions.length - 1
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-gray-500 hover:bg-gray-100"
                            }`}
                          >
                            ↓
                          </button>
                          <button
                            onClick={() => deleteQuestion(question.id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded-md"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
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
                                  
                                />
                                {question.options.length > 2 && (
                                  <button
                                    onClick={() => {
                                      const newOptions = [...question.options]
                                      newOptions.splice(optIndex, 1)
                                      updateQuestion(question.id, "options", newOptions)
                                    }}
                                    className="p-1 text-red-500 hover:bg-red-50 rounded-md"
                                  >
                                    <Trash2 className="h-4 w-4" />
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

                        {question.type === "essay" && (
                          <div className="bg-gray-50 p-3 rounded-md">
                            <p className="text-sm text-gray-500">Essay questions will need to be manually graded.</p>
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
                    <div className="flex space-x-3">
                      <button
                        onClick={() => setCurrentTab("details")}
                        className="min-w-[80px] px-3 py-1 text-sm leading-tight whitespace-nowrap border rounded disabled:opacity-50"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => setCurrentTab("settings")}
                        className="min-w-[150px] px-3 py-1 text-sm leading-tight whitespace-nowrap border rounded disabled:opacity-50"
                      >
                        Next: Settings
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {currentTab === "settings" && (
              <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date & Time
                  </label>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <input
                      id="start-date"
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
        
                <div>
                  <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
                    End Date & Time
                  </label>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <input
                      id="end-date"
                      type="datetime-local"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
        
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Additional Settings</h3>
        
                <div className="space-y-3">
                  {/* Improved checkbox alignment */}
                  <div className="flex items-center">
                    <div className="flex items-center justify-center h-5">
                      <input
                        id="shuffle-questions"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    <label htmlFor="shuffle-questions" className="ml-2 text-sm text-gray-700">
                      Shuffle questions for each student
                    </label>
                  </div>
        
                  <div className="flex items-center">
                    <div className="flex items-center justify-center h-5">
                      <input
                        id="show-results"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    <label htmlFor="show-results" className="ml-2 text-sm text-gray-700">
                      Show results immediately after submission
                    </label>
                  </div>
        
                  <div className="flex items-center">
                    <div className="flex items-center justify-center h-5">
                      <input
                        id="one-attempt"
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    <label htmlFor="one-attempt" className="ml-2 text-sm text-gray-700">
                      Limit to one attempt per student
                    </label>
                  </div>
                </div>
              </div>
        
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setCurrentTab("questions")}
                  className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentTab("preview")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Next: Preview
                </button>
              </div>
            </div>
          )}

          {/* Preview Tab */}
          {currentTab === "preview" && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-2">{examTitle || "Untitled Exam"}</h2>
                {examDescription && <p className="text-gray-600 mb-4">{examDescription}</p>}

                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="bg-white px-3 py-2 rounded-md border border-gray-200 flex items-center">
                    <Clock className="h-4 w-4 text-gray-500 mr-1" />
                    <span className="text-sm text-gray-700">{duration} minutes</span>
                  </div>
                  <div className="bg-white px-3 py-2 rounded-md border border-gray-200 flex items-center">
                    <Settings className="h-4 w-4 text-gray-500 mr-1" />
                    <span className="text-sm text-gray-700">Passing: {passingScore}%</span>
                  </div>
                  <div className="bg-white px-3 py-2 rounded-md border border-gray-200 flex items-center">
                    <CheckCircle className="h-4 w-4 text-gray-500 mr-1" />
                    <span className="text-sm text-gray-700">Total: {totalPoints} points</span>
                  </div>
                </div>

                {questions.length > 0 ? (
                  <div className="space-y-6">
                    {questions.map((question, index) => (
                      <div key={question.id} className="bg-white p-4 rounded-md border border-gray-200">
                        <div className="flex justify-between mb-2">
                          <h3 className="font-medium text-gray-900">Question {index + 1}</h3>
                          <span className="text-sm text-gray-500">{question.points} points</span>
                        </div>
                        <p className="text-gray-800 mb-4">{question.question || "[Question text will appear here]"}</p>

                        {question.type === "multiple_choice" && (
                          <div className="space-y-2">
                            {question.options.map((option, optIndex) => (
                              <div key={optIndex} className="flex items-center">
                                <input
                                  type="radio"
                                  name={`preview-${question.id}`}
                                  disabled
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-gray-700">{option || `[Option ${optIndex + 1}]`}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {question.type === "true_false" && (
                          <div className="flex space-x-4">
                            <div className="flex items-center">
                              <input
                                type="radio"
                                name={`preview-tf-${question.id}`}
                                disabled
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="ml-2 text-gray-700">True</span>
                            </div>
                            <div className="flex items-center">
                              <input
                                type="radio"
                                name={`preview-tf-${question.id}`}
                                disabled
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="ml-2 text-gray-700">False</span>
                            </div>
                          </div>
                        )}

                        {question.type === "short_answer" && (
                          <input
                            type="text"
                            disabled
                            placeholder="Student will type answer here"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50"
                          />
                        )}

                        {question.type === "essay" && (
                          <textarea
                            disabled
                            rows={3}
                            placeholder="Student will write essay here"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No questions added</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Go back to the Questions tab to add questions to your exam.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentTab("settings")}
                  className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Back
                </button>
                <div className="space-x-3">
                  <button
                    onClick={() => saveExam(false)}
                    className="min-w-[150px] px-3 py-1 text-sm leading-tight whitespace-nowrap border rounded disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 inline-block mr-1" />
                    Save as Draft
                  </button>
                  <button
                    onClick={() => saveExam(true)}
                    className="min-w-[150px] px-3 py-1 text-sm leading-tight whitespace-nowrap border rounded disabled:opacity-50"
                  >
                    <Eye className="h-4 w-4 inline-block mr-1" />
                    Publish Exam
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <ImportModal />
    </div>
  )
}

export default AddExam

