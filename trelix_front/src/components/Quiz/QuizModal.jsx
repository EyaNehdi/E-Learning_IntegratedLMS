"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { CheckCircle, AlertCircle, BookOpen, ChevronRight, ChevronLeft, Loader2, X, List } from "lucide-react"

const QuizModal = ({ showQuiz, onClose, selectedQuizId = null }) => {
  const [quiz, setQuiz] = useState(null)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [allQuizzes, setAllQuizzes] = useState([])
  const [showQuizSelector, setShowQuizSelector] = useState(!selectedQuizId)

  // Fetch quizzes from backend
  useEffect(() => {
    if (showQuiz) {
      setLoading(true)
      axios
        .get("http://localhost:5000/quiz/get") // Update with your actual API endpoint
        .then((response) => {
          console.log("Quizzes fetched:", response.data)
          if (response.data.length > 0) {
            setAllQuizzes(response.data)

            // If a specific quiz ID was provided, load that quiz
            if (selectedQuizId) {
              const selectedQuiz = response.data.find((q) => q._id === selectedQuizId)
              if (selectedQuiz) {
                setQuiz(selectedQuiz)
                setShowQuizSelector(false)
              } else {
                // If the specified quiz wasn't found, show the selector
                setShowQuizSelector(true)
              }
            } else {
              // No specific quiz requested, show the selector
              setShowQuizSelector(true)
            }
          }
          setLoading(false)
        })
        .catch((error) => {
          console.error("Error fetching quizzes:", error)
          setLoading(false)
        })
    }
  }, [showQuiz, selectedQuizId])

  const handleSelectQuiz = (selectedQuiz) => {
    setQuiz(selectedQuiz)
    setShowQuizSelector(false)
    setAnswers({})
    setCurrentQuestionIndex(0)
    setIsSubmitted(false)
  }

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const handleSubmit = () => {
    setIsSubmitted(true)
    console.log("User Answers:", answers)

    // You can send the answers to your backend here
    axios
      .post("http://localhost:5000/quiz/submit", {
        quizId: quiz?._id,
        answers: answers,
      })
      .then((response) => {
        console.log("Quiz submitted successfully:", response.data)
      })
      .catch((error) => {
        console.error("Error submitting quiz:", error)
      })

    setTimeout(() => {
      onClose()
    }, 1500)
  }

  const nextQuestion = () => {
    if (quiz?.questions && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const getProgressPercentage = () => {
    if (!quiz?.questions) return 0
    const answeredCount = Object.keys(answers).length
    return (answeredCount / quiz.questions.length) * 100
  }

  const currentQuestion = quiz?.questions?.[currentQuestionIndex]
  const isCurrentQuestionAnswered = currentQuestion && answers[currentQuestion._id]
  const isLastQuestion = quiz?.questions && currentQuestionIndex === quiz.questions.length - 1
  const allQuestionsAnswered = quiz?.questions && Object.keys(answers).length === quiz.questions.length

  const backToQuizList = () => {
    setShowQuizSelector(true)
    setQuiz(null)
    setAnswers({})
    setCurrentQuestionIndex(0)
    setIsSubmitted(false)
  }

  if (!showQuiz) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
            <p className="text-lg font-medium text-gray-600">Loading quizzes...</p>
          </div>
        ) : showQuizSelector ? (
          <>
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <List className="h-5 w-5 text-blue-600" />
                  <h2 className="text-2xl font-bold">Available Quizzes</h2>
                </div>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-gray-600 mt-1">Select a quiz to begin</p>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {allQuizzes.length > 0 ? (
                <div className="space-y-4">
                  {allQuizzes.map((quizItem) => (
                    <div
                      key={quizItem._id}
                      className="border rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer"
                      onClick={() => handleSelectQuiz(quizItem)}
                    >
                      <div className="flex items-start">
                        <div className="bg-blue-100 p-3 rounded-full mr-4">
                          <BookOpen className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{quizItem.quizName}</h3>
                          <p className="text-gray-600 text-sm mt-1">{quizItem.description}</p>
                          <div className="flex items-center mt-2 text-sm text-gray-500">
                            <span className="flex items-center">
                              <List className="h-4 w-4 mr-1" />
                              {quizItem.questions?.length || 0} questions
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Quizzes Available</h3>
                  <p className="text-gray-600">There are no quizzes available at the moment.</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-gray-50">
              <button
                onClick={onClose}
                className="w-full px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <h2 className="text-2xl font-bold">{quiz?.quizName || "Quiz"}</h2>
                </div>
                {!isSubmitted && (
                  <span className="text-sm font-medium text-gray-600">
                    Question {currentQuestionIndex + 1} of {quiz?.questions?.length}
                  </span>
                )}
              </div>
              <p className="text-gray-600 mt-1">{quiz?.description}</p>

              {!isSubmitted && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{Math.round(getProgressPercentage())}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressPercentage()}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6">
              {isSubmitted ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="rounded-full bg-green-100 p-3 mb-4">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Quiz Submitted!</h3>
                  <p className="text-gray-600">Thank you for completing the quiz. Your answers have been recorded.</p>
                </div>
              ) : currentQuestion ? (
                <div className="space-y-6">
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <h3 className="text-xl font-semibold mb-1">
                      {currentQuestionIndex + 1}. {currentQuestion.question}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {currentQuestion.options.map((option, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center space-x-3 border rounded-lg p-4 transition-colors cursor-pointer ${
                          answers[currentQuestion._id] === option
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                        onClick={() => handleAnswerChange(currentQuestion._id, option)}
                      >
                        <div className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-300">
                          {answers[currentQuestion._id] === option && (
                            <div className="h-3 w-3 rounded-full bg-blue-600" />
                          )}
                        </div>
                        <label className="flex-grow cursor-pointer font-medium">{option}</label>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <AlertCircle className="h-8 w-8 text-red-500 mr-2" />
                  <p className="text-lg font-medium">No questions available</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t bg-gray-50 flex flex-col sm:flex-row gap-3">
              {!isSubmitted && (
                <>
                  <div className="flex w-full sm:w-auto gap-2">
                    <button
                      onClick={prevQuestion}
                      disabled={currentQuestionIndex === 0}
                      className={`px-4 py-2 rounded-md border border-gray-300 flex items-center justify-center flex-1 sm:flex-initial ${
                        currentQuestionIndex === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"
                      }`}
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      Previous
                    </button>
                    {!isLastQuestion ? (
                      <button
                        onClick={nextQuestion}
                        disabled={!isCurrentQuestionAnswered}
                        className={`px-4 py-2 rounded-md bg-blue-600 text-white flex items-center justify-center flex-1 sm:flex-initial ${
                          !isCurrentQuestionAnswered ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
                        }`}
                      >
                        Next
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmit}
                        disabled={!allQuestionsAnswered}
                        className={`px-4 py-2 rounded-md bg-green-600 text-white flex items-center justify-center flex-1 sm:flex-initial ${
                          !allQuestionsAnswered ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700"
                        }`}
                      >
                        Submit Quiz
                      </button>
                    )}
                  </div>
                  <div className="flex w-full sm:w-auto gap-2">
                    <button
                      onClick={backToQuizList}
                      className="px-4 py-2 rounded-md border border-gray-300 flex items-center justify-center"
                    >
                      <List className="mr-1 h-4 w-4" />
                      All Quizzes
                    </button>
                    <button
                      onClick={onClose}
                      className="w-full sm:w-auto sm:ml-auto px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
                    >
                      <X className="h-4 w-4 inline mr-1" />
                      Cancel
                    </button>
                  </div>
                </>
              )}
              {isSubmitted && (
                <button
                  onClick={onClose}
                  className="w-full px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  Close
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const QuizApp = () => {
  const [showQuiz, setShowQuiz] = useState(false)

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md text-center overflow-hidden">
        <div className="p-6 border-b">
          <h1 className="text-3xl font-bold">Welcome to the Quiz</h1>
          <p className="text-gray-600 mt-2">Test your knowledge with our interactive quiz</p>
        </div>
        <div className="p-8 flex justify-center">
          <div className="bg-blue-100 rounded-full p-6">
            <BookOpen className="h-16 w-16 text-blue-600" />
          </div>
        </div>
        <div className="p-6 bg-gray-50">
          <button
            onClick={() => setShowQuiz(true)}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md flex items-center justify-center text-lg"
          >
            <BookOpen className="mr-2 h-5 w-5" />
            Browse Quizzes
          </button>
        </div>
      </div>
      <QuizModal showQuiz={showQuiz} onClose={() => setShowQuiz(false)} />
    </div>
  )
}

export default QuizApp

