"use client"

import { useState, useEffect } from "react"
import { Clock, AlertCircle, CheckCircle, ChevronLeft, ChevronRight, Save, Flag, Send } from "lucide-react"

const ExamStudent = () => {
  // State for exam data
  const [exam, setExam] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // State for student's answers
  const [answers, setAnswers] = useState({})
  const [flaggedQuestions, setFlaggedQuestions] = useState([])

  // Navigation state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [timerActive, setTimerActive] = useState(false)

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [examSubmitted, setExamSubmitted] = useState(false)
  const [confirmSubmit, setConfirmSubmit] = useState(false)

  // Mock exam data - replace with actual API call
  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true)
        // Replace with your actual API endpoint
        // const response = await axios.get(`http://localhost:5000/Exam/${examId}`);
        // setExam(response.data);

        // Mock data for demonstration
        const mockExam = {
          _id: "exam123",
          title: "Introduction to Computer Science",
          description: "This exam tests your knowledge of basic computer science concepts.",
          duration: 60, // minutes
          passingScore: 70,
          totalPoints: 100,
          questions: [
            {
              id: 1,
              type: "multiple_choice",
              question: "What does CPU stand for?",
              options: [
                "Central Processing Unit",
                "Computer Personal Unit",
                "Central Process Utility",
                "Central Processor Unifier",
              ],
              points: 10,
            },
            {
              id: 2,
              type: "true_false",
              question: "HTML is a programming language.",
              points: 5,
            },
            {
              id: 3,
              type: "multiple_choice",
              question: "Which of the following is not a JavaScript framework?",
              options: ["React", "Angular", "Vue", "Java"],
              points: 10,
            },
            {
              id: 4,
              type: "short_answer",
              question: "What does CSS stand for?",
              points: 15,
            },
            {
              id: 5,
              type: "essay",
              question: "Explain the difference between frontend and backend development.",
              points: 20,
            },
            {
              id: 6,
              type: "multiple_choice",
              question: "Which of the following is a NoSQL database?",
              options: ["MySQL", "PostgreSQL", "MongoDB", "Oracle"],
              points: 10,
            },
            {
              id: 7,
              type: "true_false",
              question: "JavaScript can be used for server-side programming.",
              points: 5,
            },
            {
              id: 8,
              type: "short_answer",
              question: "What is the purpose of an API?",
              points: 15,
            },
            {
              id: 9,
              type: "multiple_choice",
              question: "Which protocol is used for secure web browsing?",
              options: ["HTTP", "HTTPS", "FTP", "SMTP"],
              points: 10,
            },
          ],
        }

        setExam(mockExam)
        setTimeRemaining(mockExam.duration * 60) // Convert minutes to seconds
        setTimerActive(true)

        // Initialize answers object
        const initialAnswers = {}
        mockExam.questions.forEach((q) => {
          initialAnswers[q.id] = q.type === "essay" || q.type === "short_answer" ? "" : null
        })
        setAnswers(initialAnswers)

        setLoading(false)
      } catch (err) {
        console.error("Error fetching exam:", err)
        setError("Failed to load exam. Please try again later.")
        setLoading(false)
      }
    }

    fetchExam()
  }, [])

  // Timer effect
  useEffect(() => {
    let interval = null

    if (timerActive && timeRemaining > 0 && !examSubmitted) {
      interval = setInterval(() => {
        setTimeRemaining((prevTime) => prevTime - 1)
      }, 1000)
    } else if (timeRemaining === 0 && !examSubmitted) {
      // Auto-submit when time runs out
      handleSubmitExam()
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timerActive, timeRemaining, examSubmitted])

  // Format time remaining
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Handle answer changes
  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  // Toggle flagged question
  const toggleFlaggedQuestion = (questionId) => {
    setFlaggedQuestions((prev) => {
      if (prev.includes(questionId)) {
        return prev.filter((id) => id !== questionId)
      } else {
        return [...prev, questionId]
      }
    })
  }

  // Navigation functions
  const goToNextQuestion = () => {
    if (currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const goToPrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const goToQuestion = (index) => {
    if (index >= 0 && index < exam.questions.length) {
      setCurrentQuestionIndex(index)
    }
  }

  // Save progress
  const saveProgress = async () => {
    try {
      // In a real app, you would save to the server here
      // await axios.post(`http://localhost:5000/Exam/progress/${exam._id}`, { answers });

      // For demo, just show a success message
      alert("Progress saved successfully!")
    } catch (err) {
      console.error("Error saving progress:", err)
      alert("Failed to save progress. Please try again.")
    }
  }

  // Submit exam
  const handleSubmitExam = async () => {
    if (confirmSubmit) {
      try {
        setIsSubmitting(true)
console.log(answers)
        // In a real app, you would submit to the server here
        // await axios.post(`http://localhost:5000/Exam/submit/${exam._id}`, { answers });

        // For demo, just show success and set submitted state
        setTimeout(() => {
          setExamSubmitted(true)
          setIsSubmitting(false)
          setTimerActive(false)
        }, 1500)
      } catch (err) {
        console.error("Error submitting exam:", err)
        alert("Failed to submit exam. Please try again.")
        setIsSubmitting(false)
      }
    } else {
      setConfirmSubmit(true)
    }
  }

  // Cancel submission confirmation
  const cancelSubmit = () => {
    setConfirmSubmit(false)
  }

  // Check if a question has been answered
  const isQuestionAnswered = (questionId) => {
    const answer = answers[questionId]
    if (answer === null || answer === "") return false
    return true
  }

  // Calculate progress percentage
  const calculateProgress = () => {
    if (!exam) return 0

    const answeredCount = Object.values(answers).filter((answer) => answer !== null && answer !== "").length

    return Math.round((answeredCount / exam.questions.length) * 100)
  }

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700">Loading exam...</p>
        </div>
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-6 max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Exam</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Render exam completed state
  if (examSubmitted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 max-w-md bg-white rounded-lg shadow-md">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Exam Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Your answers have been submitted successfully. Your instructor will review your responses.
          </p>
          <button
            onClick={() => (window.location.href = "/dashboard")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Get current question
  const currentQuestion = exam?.questions[currentQuestionIndex]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header with timer and progress */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800 line-clamp-1">{exam.title}</h1>
            <p className="text-sm text-gray-500">Total Points: {exam.totalPoints}</p>
          </div>

          <div className="flex items-center gap-4">
            <div
              className={`flex items-center px-3 py-1.5 rounded-full ${
                timeRemaining < 300 ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
              }`}
            >
              <Clock className="w-4 h-4 mr-1.5" />
              <span className="font-medium">{formatTime(timeRemaining)}</span>
            </div>

            <button
              onClick={saveProgress}
              className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center text-sm"
            >
              <Save className="w-4 h-4 mr-1.5" />
              Save Progress
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Question navigation sidebar */}
        <aside className="w-64 bg-white border-r hidden md:block overflow-y-auto">
          <div className="p-4">
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${calculateProgress()}%` }}></div>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {Object.values(answers).filter((a) => a !== null && a !== "").length} of {exam.questions.length}{" "}
                answered
              </p>
            </div>

            <h3 className="font-medium text-gray-700 mb-2">Questions</h3>
            <div className="grid grid-cols-4 gap-2">
              {exam.questions.map((question, index) => (
                <button
                  key={question.id}
                  onClick={() => goToQuestion(index)}
                  className={`w-full aspect-square flex items-center justify-center text-sm rounded-md ${
                    currentQuestionIndex === index
                      ? "bg-blue-600 text-white"
                      : isQuestionAnswered(question.id)
                        ? "bg-green-100 text-green-800 border border-green-300"
                        : flaggedQuestions.includes(question.id)
                          ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <div className="mt-4 text-sm text-gray-500">
              <div className="flex items-center mb-1">
                <div className="w-3 h-3 bg-green-100 border border-green-300 rounded-sm mr-2"></div>
                <span>Answered</span>
              </div>
              <div className="flex items-center mb-1">
                <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded-sm mr-2"></div>
                <span>Flagged</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded-sm mr-2"></div>
                <span>Unanswered</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm border p-6">
            {/* Question header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-medium text-gray-800">
                  Question {currentQuestionIndex + 1} of {exam.questions.length}
                </h2>
                <p className="text-sm text-gray-500">{currentQuestion.points} points</p>
              </div>

              <button
                onClick={() => toggleFlaggedQuestion(currentQuestion.id)}
                className={`p-2 rounded-full ${
                  flaggedQuestions.includes(currentQuestion.id)
                    ? "bg-yellow-100 text-yellow-600"
                    : "text-gray-400 hover:bg-gray-100"
                }`}
              >
                <Flag className="w-5 h-5" />
              </button>
            </div>

            {/* Question content */}
            <div className="mb-6">
              <p className="text-gray-800 text-lg mb-4">{currentQuestion.question}</p>

              {/* Multiple choice question */}
              {currentQuestion.type === "multiple_choice" && (
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <div
                      key={index}
                      onClick={() => handleAnswerChange(currentQuestion.id, option)}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        answers[currentQuestion.id] === option
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                          answers[currentQuestion.id] === option ? "border-blue-500" : "border-gray-300"
                        }`}
                      >
                        {answers[currentQuestion.id] === option && (
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        )}
                      </div>
                      <span className="text-gray-800">{option}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* True/False question */}
              {currentQuestion.type === "true_false" && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <div
                    onClick={() => handleAnswerChange(currentQuestion.id, "true")}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors flex-1 ${
                      answers[currentQuestion.id] === "true"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                        answers[currentQuestion.id] === "true" ? "border-blue-500" : "border-gray-300"
                      }`}
                    >
                      {answers[currentQuestion.id] === "true" && (
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      )}
                    </div>
                    <span className="text-gray-800">True</span>
                  </div>

                  <div
                    onClick={() => handleAnswerChange(currentQuestion.id, "false")}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors flex-1 ${
                      answers[currentQuestion.id] === "false"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                        answers[currentQuestion.id] === "false" ? "border-blue-500" : "border-gray-300"
                      }`}
                    >
                      {answers[currentQuestion.id] === "false" && (
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      )}
                    </div>
                    <span className="text-gray-800">False</span>
                  </div>
                </div>
              )}

              {/* Short answer question */}
              {currentQuestion.type === "short_answer" && (
                <input
                  type="text"
                  value={answers[currentQuestion.id] || ""}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}

              {/* Essay question */}
              {currentQuestion.type === "essay" && (
                <textarea
                  value={answers[currentQuestion.id] || ""}
                  onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                  placeholder="Write your essay here..."
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between">
              <button
                onClick={goToPrevQuestion}
                disabled={currentQuestionIndex === 0}
                className={`px-4 py-2 flex items-center rounded-md ${
                  currentQuestionIndex === 0 ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:bg-blue-50"
                }`}
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Previous
              </button>

              {currentQuestionIndex < exam.questions.length - 1 ? (
                <button
                  onClick={goToNextQuestion}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
                >
                  Next
                  <ChevronRight className="w-5 h-5 ml-1" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitExam}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center"
                >
                  <Send className="w-5 h-5 mr-1.5" />
                  Submit Exam
                </button>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile navigation bar */}
      <div className="md:hidden bg-white border-t p-3 sticky bottom-0">
        <div className="flex justify-between items-center">
          <button
            onClick={goToPrevQuestion}
            disabled={currentQuestionIndex === 0}
            className={`p-2 rounded-md ${
              currentQuestionIndex === 0 ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:bg-blue-50"
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-sm text-gray-600">
            {currentQuestionIndex + 1} / {exam.questions.length}
          </span>

          {currentQuestionIndex < exam.questions.length - 1 ? (
            <button onClick={goToNextQuestion} className="p-2 text-blue-600 hover:bg-blue-50 rounded-md">
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button onClick={handleSubmitExam} className="p-2 text-green-600 hover:bg-green-50 rounded-md">
              <Send className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Confirmation modal */}
      {confirmSubmit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Submit Exam?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to submit your exam? You won't be able to change your answers after submission.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelSubmit}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitExam}
                disabled={isSubmitting}
                className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center ${
                  isSubmitting ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-1.5" />
                    Submit Exam
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExamStudent

