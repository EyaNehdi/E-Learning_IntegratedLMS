"use client"

import { useState, useEffect } from "react"
import {
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Save,
  Flag,
  Send,
  RefreshCw,
  Award,
  Check,
  XIcon,
  BarChart2,
  ArrowLeft,
} from "lucide-react"
import axios from "axios"
import { useParams, useNavigate } from "react-router-dom"
import { useProfileStore } from "../../store/profileStore";

const ExamStudent = () => {
  // State for exam data
  const [exam, setExam] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

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

  // Results state
  const [examResults, setExamResults] = useState(null)
  const [showResults, setShowResults] = useState(false)
  const [viewingQuestion, setViewingQuestion] = useState(null)
 const { user, fetchUser, clearUser } = useProfileStore()
  // Get ID from URL
  const { courseid } = useParams()

  const fetchExam = async () => {
    // The course ID that you want to fetch the exam from
    try {
      setLoading(true)
      // Make the request to get a random exam from the course
      const response = await axios.get(`http://localhost:5000/Exam/random/${courseid}`)

      console.log("Random Exam API response:", response.data) // Debugging

      if (response.data) {
        setExam(response.data) // Set the exam
        setTimeRemaining(response.data.duration * 60) // Set the time remaining
        setTimerActive(true) // Start the timer

        // Ensure the questions exist
        if (response.data.questions && Array.isArray(response.data.questions)) {
          const initialAnswers = {}
          response.data.questions.forEach((q) => {
            initialAnswers[q._id] = q.type === "essay" || q.type === "short_answer" ? "" : null
          })
          setAnswers(initialAnswers)
        } else {
          console.warn("Questions data is missing or not an array")
        }
      } else {
        console.warn("Invalid API response format")
      }

      setLoading(false)
    } catch (err) {
      console.error("Error fetching exam:", err)
      setError("No exams available.")
      setLoading(false)
    }
  }

  useEffect(() => {
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

  // Process exam results
  const processExamResults = (serverResponse, examData, userAnswers) => {
    // If we have server response, use that data
    if (serverResponse && serverResponse.results) {
      return serverResponse.results
    }

    // Otherwise calculate results locally
    const questions = examData.questions || []
    let correctCount = 0
    let incorrectCount = 0
    let score = 0
    let totalPoints = 0
    let unansweredCount = 0

    const questionResults = questions.map((question) => {
      const userAnswer = userAnswers[question._id]

      // Skip scoring for essay questions
      if (question.type === "essay") {
        totalPoints += question.points || 1
        return {
          questionId: question._id,
          question: question.question,
          userAnswer,
          type: question.type,
          needsGrading: true,
          points: question.points || 1,
          earnedPoints: "Pending",
          options: question.options,
        }
      }

      // For short answer, we'll do a simple match (in a real app, this would be more sophisticated)
      let isCorrect = false
      if (question.type === "short_answer") {
        isCorrect = userAnswer && userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()
      } else {
        isCorrect = userAnswer === question.correctAnswer
      }

      if (!userAnswer && userAnswer !== false) {
        unansweredCount++
      } else if (isCorrect) {
        correctCount++
      } else {
        incorrectCount++
      }

      const points = question.points || 1
      totalPoints += points
      if (isCorrect) score += points

      return {
        questionId: question._id,
        question: question.question,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        type: question.type,
        points: points,
        earnedPoints: isCorrect ? points : 0,
        options: question.options,
      }
    })

    const percentageScore = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0
    const passingScore = examData.passingScore || 60
    const passed = percentageScore >= passingScore

    return {
      score,
      totalPoints,
      percentageScore,
      correctCount,
      incorrectCount,
      unansweredCount,
      totalQuestions: questions.length,
      passed,
      passingScore,
      questionResults,
    }
  }

  // Submit exam
  const handleSubmitExam = async () => {
    if (confirmSubmit) {
        try {
            setIsSubmitting(true);

            // Map the answers object to an array of values (this assumes answers is an object with question IDs as keys)
            const answersArray = Object.values(answers);  // Ensure the answers are in the same order as the questions

            // Submit answers to the backend
            const response = await axios.post(`http://localhost:5000/exam/submit/${exam._id}`, {
                userId: user._id, // Pass the user ID
                answers: answersArray,  // Send answers as an array in the same order as questions
            });

            // Assuming response contains exam results, process them
            const results = processExamResults(response.data.result, exam, answers);  // processExamResults already calculates score

            setExamResults(results);
            setExamSubmitted(true);
            setShowResults(true);
            setIsSubmitting(false);
            setTimerActive(false);
            setConfirmSubmit(false);
        } catch (err) {
            console.error("Error submitting exam:", err);
            alert("Failed to submit exam. Please try again.");
            setIsSubmitting(false);
        }
    } else {
        setConfirmSubmit(true);
    }
};



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

  // View a specific question result
  const viewQuestionResult = (questionResult) => {
    setViewingQuestion(questionResult)
  }

  // Back to results summary
  const backToResults = () => {
    setViewingQuestion(null)
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
        <div className="text-center p-8 max-w-md bg-white rounded-lg shadow-md">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-4">
            <button
              onClick={() => {
                setError(null)
                fetchExam()
              }}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Try Again
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Return to Dashboard
            </button>
          </div>
          <p className="mt-6 text-sm text-gray-500">If the problem persists, please contact support.</p>
        </div>
      </div>
    )
  }

  // Render exam results
  if (examSubmitted && showResults) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {viewingQuestion ? (
            // Detailed question view
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-blue-600 p-4 text-white flex items-center justify-between">
                <button onClick={backToResults} className="flex items-center text-white hover:text-blue-100">
                  <ArrowLeft className="w-5 h-5 mr-1" />
                  Back to Results
                </button>
                <h2 className="text-lg font-semibold">Question Review</h2>
              </div>

              <div className="p-6">
                <div
                  className={`p-4 rounded-lg mb-6 ${
                    viewingQuestion.type === "essay"
                      ? "bg-blue-50 border border-blue-200"
                      : viewingQuestion.isCorrect
                        ? "bg-green-50 border border-green-200"
                        : "bg-red-50 border border-red-200"
                  }`}
                >
                  <div className="flex items-start">
                    <div
                      className={`rounded-full p-2 mr-3 flex-shrink-0 ${
                        viewingQuestion.type === "essay"
                          ? "bg-blue-100"
                          : viewingQuestion.isCorrect
                            ? "bg-green-100"
                            : "bg-red-100"
                      }`}
                    >
                      {viewingQuestion.type === "essay" ? (
                        <BarChart2 className="h-5 w-5 text-blue-600" />
                      ) : viewingQuestion.isCorrect ? (
                        <Check className="h-5 w-5 text-green-600" />
                      ) : (
                        <XIcon className="h-5 w-5 text-red-600" />
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">{viewingQuestion.question}</h3>
                      <div className="text-sm">
                        {viewingQuestion.type === "essay" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Essay Question - Needs Grading
                          </span>
                        ) : viewingQuestion.isCorrect ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Correct Answer
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Incorrect Answer
                          </span>
                        )}
                        <span className="ml-2 text-gray-500">
                          {viewingQuestion.earnedPoints} / {viewingQuestion.points} points
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Question type specific content */}
                {viewingQuestion.type === "multiple_choice" && (
                  <div className="space-y-3 mb-6">
                    <h4 className="font-medium text-gray-700">Options:</h4>
                    {viewingQuestion.options.map((option, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center p-3 border rounded-lg ${
                          viewingQuestion.correctAnswer === option
                            ? "border-green-500 bg-green-50"
                            : viewingQuestion.userAnswer === option &&
                                viewingQuestion.userAnswer !== viewingQuestion.correctAnswer
                              ? "border-red-500 bg-red-50"
                              : "border-gray-200"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                            viewingQuestion.correctAnswer === option
                              ? "border-green-500"
                              : viewingQuestion.userAnswer === option &&
                                  viewingQuestion.userAnswer !== viewingQuestion.correctAnswer
                                ? "border-red-500"
                                : "border-gray-300"
                          }`}
                        >
                          {viewingQuestion.correctAnswer === option && (
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          )}
                          {viewingQuestion.userAnswer === option &&
                            viewingQuestion.userAnswer !== viewingQuestion.correctAnswer && (
                              <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            )}
                        </div>
                        <span
                          className={`${
                            viewingQuestion.correctAnswer === option
                              ? "text-green-800"
                              : viewingQuestion.userAnswer === option &&
                                  viewingQuestion.userAnswer !== viewingQuestion.correctAnswer
                                ? "text-red-800"
                                : "text-gray-800"
                          }`}
                        >
                          {option}
                          {viewingQuestion.correctAnswer === option && (
                            <span className="ml-2 text-green-600 text-sm">(Correct Answer)</span>
                          )}
                          {viewingQuestion.userAnswer === option && (
                            <span className="ml-2 text-blue-600 text-sm">(Your Answer)</span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {viewingQuestion.type === "true_false" && (
                  <div className="space-y-3 mb-6">
                    <h4 className="font-medium text-gray-700">Options:</h4>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div
                        className={`flex items-center p-3 border rounded-lg flex-1 ${
                          viewingQuestion.correctAnswer === "true"
                            ? "border-green-500 bg-green-50"
                            : viewingQuestion.userAnswer === "true" && viewingQuestion.correctAnswer !== "true"
                              ? "border-red-500 bg-red-50"
                              : "border-gray-200"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                            viewingQuestion.correctAnswer === "true"
                              ? "border-green-500"
                              : viewingQuestion.userAnswer === "true" && viewingQuestion.correctAnswer !== "true"
                                ? "border-red-500"
                                : "border-gray-300"
                          }`}
                        >
                          {viewingQuestion.correctAnswer === "true" && (
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          )}
                          {viewingQuestion.userAnswer === "true" && viewingQuestion.correctAnswer !== "true" && (
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          )}
                        </div>
                        <span
                          className={`${
                            viewingQuestion.correctAnswer === "true"
                              ? "text-green-800"
                              : viewingQuestion.userAnswer === "true" && viewingQuestion.correctAnswer !== "true"
                                ? "text-red-800"
                                : "text-gray-800"
                          }`}
                        >
                          True
                          {viewingQuestion.correctAnswer === "true" && (
                            <span className="ml-2 text-green-600 text-sm">(Correct Answer)</span>
                          )}
                          {viewingQuestion.userAnswer === "true" && (
                            <span className="ml-2 text-blue-600 text-sm">(Your Answer)</span>
                          )}
                        </span>
                      </div>

                      <div
                        className={`flex items-center p-3 border rounded-lg flex-1 ${
                          viewingQuestion.correctAnswer === "false"
                            ? "border-green-500 bg-green-50"
                            : viewingQuestion.userAnswer === "false" && viewingQuestion.correctAnswer !== "false"
                              ? "border-red-500 bg-red-50"
                              : "border-gray-200"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                            viewingQuestion.correctAnswer === "false"
                              ? "border-green-500"
                              : viewingQuestion.userAnswer === "false" && viewingQuestion.correctAnswer !== "false"
                                ? "border-red-500"
                                : "border-gray-300"
                          }`}
                        >
                          {viewingQuestion.correctAnswer === "false" && (
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          )}
                          {viewingQuestion.userAnswer === "false" && viewingQuestion.correctAnswer !== "false" && (
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          )}
                        </div>
                        <span
                          className={`${
                            viewingQuestion.correctAnswer === "false"
                              ? "text-green-800"
                              : viewingQuestion.userAnswer === "false" && viewingQuestion.correctAnswer !== "false"
                                ? "text-red-800"
                                : "text-gray-800"
                          }`}
                        >
                          False
                          {viewingQuestion.correctAnswer === "false" && (
                            <span className="ml-2 text-green-600 text-sm">(Correct Answer)</span>
                          )}
                          {viewingQuestion.userAnswer === "false" && (
                            <span className="ml-2 text-blue-600 text-sm">(Your Answer)</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {viewingQuestion.type === "short_answer" && (
                  <div className="space-y-3 mb-6">
                    <div className="flex flex-col space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-1">Your Answer:</h4>
                        <div className="p-3 border rounded-lg bg-gray-50">
                          {viewingQuestion.userAnswer || <span className="text-gray-400">No answer provided</span>}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-700 mb-1">Correct Answer:</h4>
                        <div className="p-3 border border-green-200 rounded-lg bg-green-50 text-green-800">
                          {viewingQuestion.correctAnswer}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {viewingQuestion.type === "essay" && (
                  <div className="space-y-3 mb-6">
                    <h4 className="font-medium text-gray-700 mb-1">Your Answer:</h4>
                    <div className="p-4 border rounded-lg bg-gray-50 min-h-[150px] whitespace-pre-wrap">
                      {viewingQuestion.userAnswer || <span className="text-gray-400">No answer provided</span>}
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 text-sm text-blue-800">
                      This essay question will be graded by your instructor. Check back later for your score.
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Results summary
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
                <h1 className="text-2xl font-bold mb-2">Exam Results</h1>
                <p>{exam.title}</p>
              </div>

              <div className="p-6">
                {/* Results Summary */}
                <div className="text-center mb-8">
                  <div
                    className={`inline-flex items-center justify-center p-4 rounded-full ${
                      examResults.passed ? "bg-green-100" : "bg-amber-100"
                    } mb-4`}
                  >
                    {examResults.passed ? (
                      <Award className="h-12 w-12 text-green-600" />
                    ) : (
                      <AlertCircle className="h-12 w-12 text-amber-600" />
                    )}
                  </div>

                  <h2 className="text-2xl font-bold mb-2">
                    {examResults.passed ? "Congratulations!" : "Exam Completed"}
                  </h2>

                  <p className="text-gray-600 mb-6">
                    {examResults.passed
                      ? "You've successfully passed the exam!"
                      : "You didn't meet the passing score. Consider reviewing the material and trying again."}
                  </p>

                  <div className="flex flex-wrap justify-center gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4 text-center min-w-[140px]">
                      <div className="text-3xl font-bold text-blue-600">{examResults.percentageScore}%</div>
                      <div className="text-sm text-gray-600">Your Score</div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 text-center min-w-[140px]">
                      <div className="text-3xl font-bold text-gray-700">{examResults.passingScore}%</div>
                      <div className="text-sm text-gray-600">Passing Score</div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4 text-center min-w-[140px]">
                      <div className="text-3xl font-bold text-green-600">{examResults.correctCount}</div>
                      <div className="text-sm text-gray-600">Correct</div>
                    </div>

                    <div className="bg-red-50 rounded-lg p-4 text-center min-w-[140px]">
                      <div className="text-3xl font-bold text-red-600">{examResults.incorrectCount}</div>
                      <div className="text-sm text-gray-600">Incorrect</div>
                    </div>

                    {examResults.unansweredCount > 0 && (
                      <div className="bg-yellow-50 rounded-lg p-4 text-center min-w-[140px]">
                        <div className="text-3xl font-bold text-yellow-600">{examResults.unansweredCount}</div>
                        <div className="text-sm text-gray-600">Unanswered</div>
                      </div>
                    )}
                  </div>

                  <div className="text-sm text-gray-500 mb-8">
                    <p>
                      You earned {examResults.score} out of {examResults.totalPoints} possible points.
                    </p>
                    {examResults.questionResults.some((q) => q.type === "essay") && (
                      <p className="mt-2 text-blue-600">
                        Note: Your final score may change after essay questions are graded.
                      </p>
                    )}
                  </div>
                </div>

                {/* Question List */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <BarChart2 className="h-5 w-5 mr-2 text-blue-600" />
                    Question Results
                  </h3>

                  <div className="space-y-3">
                    {examResults.questionResults.map((result, index) => (
                      <div
                        key={result.questionId}
                        onClick={() => viewQuestionResult(result)}
                        className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow ${
                          result.type === "essay"
                            ? "border-blue-200 bg-blue-50"
                            : result.isCorrect
                              ? "border-green-200 bg-green-50"
                              : "border-red-200 bg-red-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div
                              className={`rounded-full p-2 mr-3 ${
                                result.type === "essay"
                                  ? "bg-blue-100"
                                  : result.isCorrect
                                    ? "bg-green-100"
                                    : "bg-red-100"
                              }`}
                            >
                              {result.type === "essay" ? (
                                <BarChart2 className="h-5 w-5 text-blue-600" />
                              ) : result.isCorrect ? (
                                <Check className="h-5 w-5 text-green-600" />
                              ) : (
                                <XIcon className="h-5 w-5 text-red-600" />
                              )}
                            </div>

                            <div>
                              <h4 className="font-medium">
                                Question {index + 1}
                                {result.type === "essay" && (
                                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                    Essay
                                  </span>
                                )}
                              </h4>
                              <p className="text-sm text-gray-600 line-clamp-1">{result.question}</p>
                            </div>
                          </div>

                          <div className="flex items-center">
                            <span className="text-sm font-medium mr-2">
                              {result.type === "essay" ? "Pending" : `${result.earnedPoints}/${result.points}`}
                            </span>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Return to Dashboard
                  </button>

                  {/* You could add more actions here if needed */}
                </div>
              </div>
            </div>
          )}
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
                  key={question._id}
                  onClick={() => goToQuestion(index)}
                  className={`w-full aspect-square flex items-center justify-center text-sm rounded-md ${
                    currentQuestionIndex === index
                      ? "bg-blue-600 text-white"
                      : isQuestionAnswered(question._id)
                        ? "bg-green-100 text-green-800 border border-green-300"
                        : flaggedQuestions.includes(question._id)
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
                onClick={() => toggleFlaggedQuestion(currentQuestion._id)}
                className={`p-2 rounded-full ${
                  flaggedQuestions.includes(currentQuestion._id)
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
                      onClick={() => handleAnswerChange(currentQuestion._id, option)}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        answers[currentQuestion._id] === option
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                          answers[currentQuestion._id] === option ? "border-blue-500" : "border-gray-300"
                        }`}
                      >
                        {answers[currentQuestion._id] === option && (
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
                    onClick={() => handleAnswerChange(currentQuestion._id, "true")}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors flex-1 ${
                      answers[currentQuestion._id] === "true"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                        answers[currentQuestion._id] === "true" ? "border-blue-500" : "border-gray-300"
                      }`}
                    >
                      {answers[currentQuestion._id] === "true" && (
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      )}
                    </div>
                    <span className="text-gray-800">True</span>
                  </div>

                  <div
                    onClick={() => handleAnswerChange(currentQuestion._id, "false")}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors flex-1 ${
                      answers[currentQuestion._id] === "false"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                        answers[currentQuestion._id] === "false" ? "border-blue-500" : "border-gray-300"
                      }`}
                    >
                      {answers[currentQuestion._id] === "false" && (
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
                  value={answers[currentQuestion._id] || ""}
                  onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}

              {/* Essay question */}
              {currentQuestion.type === "essay" && (
                <textarea
                  value={answers[currentQuestion._id] || ""}
                  onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
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

