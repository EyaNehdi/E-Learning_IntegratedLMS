"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { useAuthStore } from "../../store/authStore"
import Swal from "sweetalert2"
import QuizProgressBar from "../../components/Leaderboard/QuizzProgressBar"
import { CheckCircle, ChevronLeft, ChevronRight, Clock, Award, AlertTriangle, Loader2 } from "lucide-react"

function QuizzLeaderboard() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuthStore()
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [quizId, setQuizId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/quiz/active-questions", {
          headers: { Authorization: `Bearer ${user?.token}` },
        })
        setQuestions(res.data.questions)
        setQuizId(res.data.quizId)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching quiz questions:", error)
        setLoading(false)
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load quiz questions. Please try again.",
          confirmButtonColor: "#4F46E5",
        })
      }
    }

    if (isAuthenticated) {
      fetchQuestions()
    } else {
      navigate("/login") // Redirect if not authenticated
    }
  }, [isAuthenticated, navigate, user?.token])

  // Handle selecting an answer
  const handleAnswerChange = (questionId, selectedOption) => {
    setAnswers((prev) => ({ ...prev, [questionId]: selectedOption }))
  }

  // Navigate to next question
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  // Navigate to previous question
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  // Submit quiz
  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      // Calculate score based on the answers
      let score = 0

      questions.forEach((question) => {
        if (answers[question._id] === question.correctAnswer) {
          score += 1
        }
      })

      const res = await axios.post(
        "http://localhost:5000/api/quiz/submit",
        {
          quizId,
          score,
          passed: true,
        },
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        },
      )

      setSubmitting(false)

      Swal.fire({
        icon: "success",
        title: "Quiz Completed!",
        html: `
          <div class="text-center">
            <div class="text-3xl font-bold mb-2">${res.data.attempt.score}/${questions.length}</div>
            <div class="text-gray-600">Thank you for completing the quiz!</div>
          </div>
        `,
        confirmButtonColor: "#4F46E5",
      })

      navigate("/leaderboard")
    } catch (error) {
      setSubmitting(false)
      console.error("Error submitting quiz:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to submit quiz. Please try again.",
        confirmButtonColor: "#4F46E5",
      })
    }
  }

  // Calculate progress percentage
  const progressPercentage = (Object.keys(answers).length / questions.length) * 100

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg text-center">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">Loading Quiz...</h2>
          <p className="text-gray-500 mt-2">Please wait while we prepare your questions.</p>
        </div>
      </div>
    )
  }

  if (!questions.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">No Questions Available</h2>
          <p className="text-gray-500 mt-2">There are no active quiz questions at the moment.</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const isAnswered = answers[currentQuestion._id] !== undefined
  const isLastQuestion = currentQuestionIndex === questions.length - 1

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Quiz Header */}
        <div className="bg-indigo-50 rounded-t-xl shadow-sm p-6 border-b border-indigo-100">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Quiz Challenge</h1>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              <QuizProgressBar
                totalQuestions={questions.length}
                answeredQuestions={Object.keys(answers).length}
                onTimeUp={handleSubmit}
              />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
            <div
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span>
              {Object.keys(answers).length} of {questions.length} answered
            </span>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-gradient-to-br from-indigo-50 to-white rounded-b-xl shadow-lg p-6 mb-6">
          <div className="mb-6">
            <div className="flex items-start">
              <div className="bg-indigo-100 text-indigo-800 font-semibold rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 mr-3">
                {currentQuestionIndex + 1}
              </div>
              <h2 className="text-xl font-semibold text-gray-800 leading-7">{currentQuestion?.question}</h2>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4 mb-8">
            {currentQuestion?.options.map((option, index) => (
              <label
                key={index}
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all block w-full ${
                  answers[currentQuestion._id] === option
                    ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200"
                    : "border-indigo-100 hover:border-indigo-300 bg-indigo-50 hover:bg-indigo-100"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                    answers[currentQuestion._id] === option ? "border-indigo-600 bg-indigo-600" : "border-indigo-400"
                  }`}
                >
                  {answers[currentQuestion._id] === option && <CheckCircle className="w-4 h-4 text-white" />}
                </div>
                <input
                  type="radio"
                  name={`question-${currentQuestion._id}`}
                  value={option}
                  checked={answers[currentQuestion._id] === option}
                  onChange={() => handleAnswerChange(currentQuestion._id, option)}
                  className="sr-only"
                />
                <span className="text-gray-800 font-medium">{option}</span>
              </label>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                currentQuestionIndex === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-none"
              }`}
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Previous
            </button>

            {!isLastQuestion ? (
              <button
                onClick={handleNext}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  isAnswered
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-indigo-400 text-white cursor-pointer"
                }`}
              >
                Next
                <ChevronRight className="h-5 w-5 ml-1" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className={`flex items-center px-6 py-2 rounded-lg transition-colors ${
                  submitting
                    ? "bg-indigo-400 text-white cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Award className="h-5 w-5 mr-2" />
                    Submit Quiz
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Question Navigation */}
        <div className="bg-indigo-50 rounded-xl shadow-sm p-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  currentQuestionIndex === index
                    ? "bg-indigo-600 text-white"
                    : answers[questions[index]._id] !== undefined
                      ? "bg-green-500 text-white"
                      : "bg-indigo-200 text-indigo-800 hover:bg-indigo-300"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuizzLeaderboard
