
import { useState, useEffect } from "react"
import axios from "axios"
import {
  AlertCircle,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Loader2,
  X,
  List,
  Award,
  Check,
  XIcon,
  BarChart2,
} from "lucide-react"
import { useParams } from "react-router-dom"
import { useProfileStore } from "../../store/profileStore";

const QuizModal = ({ showQuiz, onClose, selectedQuizId = null }) => {
  const [quiz, setQuiz] = useState(null)
  const [answers, setAnswers] = useState({})
  const [loading, setIsLoading] = useState(true)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [allQuizzes, setAllQuizzes] = useState([])
  const [showQuizSelector, setShowQuizSelector] = useState(!selectedQuizId)
  const [quizResults, setQuizResults] = useState(null)
  const { id } = useParams() // Getting chapter ID from URL params
  // Add a new state to track completed quizzes
  const [completedQuizzes, setCompletedQuizzes] = useState({})
  const { user, fetchUser, clearUser } = useProfileStore()

  // Update the useEffect to ensure we're properly handling the case where a user has completed quizzes
  useEffect(() => {
    if (showQuiz) {
      setIsLoading(true)

      // Fetch both quizzes and user's quiz attempts in parallel
      Promise.all([
        axios.get(`http://localhost:5000/quiz/getquiz/${id}`),
        axios.get(`http://localhost:5000/quiz/user-attempts/${user._id}`),
      ])
        .then(([quizzesResponse, attemptsResponse]) => {
          console.log("Quizzes fetched:", quizzesResponse.data)
          console.log("User attempts:", attemptsResponse.data)

          // Process completed quizzes into a map for easy lookup
          const completedQuizzesMap = {}
          if (attemptsResponse.data && attemptsResponse.data.length > 0) {
            attemptsResponse.data.forEach((attempt) => {
              completedQuizzesMap[attempt.quizId] = attempt.answers
            })
          }
          setCompletedQuizzes(completedQuizzesMap)
          console.log("Completed Quizzes:", completedQuizzesMap)

          // Set all quizzes regardless of attempts
          setAllQuizzes(quizzesResponse.data)
          console.log("All Quizzes:", quizzesResponse.data)

          // Ensure quizzes are displayed even if the user hasn't taken any
          if (quizzesResponse.data.length > 0) {
            if (selectedQuizId) {
              const selectedQuiz = quizzesResponse.data.find((q) => q._id === selectedQuizId)
              if (selectedQuiz) {
                setQuiz(selectedQuiz)

                // Check if the quiz has been completed
                if (completedQuizzesMap[selectedQuiz._id]) {
                  setQuizResults(completedQuizzesMap[selectedQuiz._id])
                  setIsSubmitted(true)
                } else {
                  setIsSubmitted(false)
                  setAnswers({})
                  setCurrentQuestionIndex(0)
                }

                setShowQuizSelector(false)
              } else {
                setShowQuizSelector(true)
              }
            } else {
              setShowQuizSelector(true)
            }
          }

          setIsLoading(false)
        })
        .catch((error) => {
          console.error("Error fetching data:", error)
          setIsLoading(false)
        })
    }
  }, [showQuiz, selectedQuizId, id, user._id])

  // Modify the handleSelectQuiz function to properly handle completed quizzes
  const handleSelectQuiz = (selectedQuiz) => {
    setQuiz(selectedQuiz)
    setShowQuizSelector(false)

    // Check if the quiz has been completed
    if (completedQuizzes[selectedQuiz._id]) {
      // If completed, show the previous results
      setQuizResults(completedQuizzes[selectedQuiz._id])
      setIsSubmitted(true)
    } else {
      // If not completed, reset for taking the quiz
      setAnswers({})
      setCurrentQuestionIndex(0)
      setIsSubmitted(false)
      setQuizResults(null)
    }
  }

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  // Update the handleSubmit function to store the completed quiz in the completedQuizzes state
  const handleSubmit = () => {
    setIsLoading(true)
    console.log("User Answers:", answers)

    axios
      .post("http://localhost:5000/quiz/submit", {
        quizId: quiz?._id,
        answers: answers,
        userId: user._id,
      })
      .then((response) => {
        console.log("Quiz submitted successfully:", response.data)

        // Process and set the quiz results
        const results = processQuizResults(response.data, quiz, answers)
        setQuizResults(results)

        // Store this quiz as completed
        setCompletedQuizzes((prev) => ({
          ...prev,
          [quiz._id]: results,
        }))

        setIsSubmitted(true)
        setIsLoading(false)
      })
      .catch((error) => {
        console.error("Error submitting quiz:", error)
        setIsLoading(false)

        // Show local results if server submission fails
        const results = processQuizResults(null, quiz, answers)
        setQuizResults(results)
        setIsSubmitted(true)
      })
  }

  // Process quiz results
  const processQuizResults = (serverResponse, quizData, userAnswers) => {
    // If we have server response, use that data
    if (serverResponse && serverResponse.results) {
      return serverResponse.results
    }

    // Otherwise calculate results locally
    const questions = quizData.questions || []
    let correctCount = 0
    let incorrectCount = 0
    let score = 0
    let totalPoints = 0

    const questionResults = questions.map((question) => {
      const userAnswer = userAnswers[question._id]
      const isCorrect = userAnswer === question.answer

      if (isCorrect) correctCount++
      else incorrectCount++

      const points = question.points || 1
      totalPoints += points
      if (isCorrect) score += points

      return {
        questionId: question._id,
        question: question.question,
        userAnswer,
        correctAnswer: question.answer,
        isCorrect,
        points: points,
        earnedPoints: isCorrect ? points : 0,
      }
    })

    const percentageScore = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0
    const passingScore = quizData.passingScore || 60
    const passed = percentageScore >= passingScore

    return {
      score,
      totalPoints,
      percentageScore,
      correctCount,
      incorrectCount,
      totalQuestions: questions.length,
      passed,
      passingScore,
      questionResults,
    }
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
    setQuizResults(null)
  }

  // Update the renderResults function to show the completion message at the top
  const renderResults = () => {
    if (!quizResults) return null

    return (
      <div className="space-y-6">
        {completedQuizzes[quiz?._id] && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <BookOpen className="h-5 w-5 text-blue-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700 font-medium">
                  You've already completed this quiz. You cannot retake it.
                </p>
              </div>
            </div>
          </div>
        )}
        {/* Results Summary */}
        <div className="text-center">
          <div
            className={`inline-flex items-center justify-center p-4 rounded-full ${
              quizResults.passed ? "bg-green-100" : "bg-amber-100"
            } mb-4`}
          >
            {quizResults.passed ? (
              <Award className="h-12 w-12 text-green-600" />
            ) : (
              <AlertCircle className="h-12 w-12 text-amber-600" />
            )}
          </div>

          <h3 className="text-2xl font-bold mb-2">{quizResults.passed ? "Congratulations!" : "Quiz Completed"}</h3>

          <p className="text-gray-600 mb-4">
            {quizResults.passed
              ? "You've successfully passed the quiz!"
              : "You didn't meet the passing score. Review the material and try again later."}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <div className="text-3xl font-bold text-blue-600">{quizResults.percentageScore}%</div>
              <div className="text-sm text-gray-600">Your Score</div>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-3xl font-bold text-gray-700">{quizResults.passingScore}%</div>
              <div className="text-sm text-gray-600">Passing Score</div>
            </div>

            <div className="bg-green-50 rounded-lg p-3 text-center">
              <div className="text-3xl font-bold text-green-600">{quizResults.correctCount}</div>
              <div className="text-sm text-gray-600">Correct</div>
            </div>

            <div className="bg-red-50 rounded-lg p-3 text-center">
              <div className="text-3xl font-bold text-red-600">{quizResults.incorrectCount}</div>
              <div className="text-sm text-gray-600">Incorrect</div>
            </div>
          </div>
        </div>

        {/* Detailed Question Results */}
        <div>
          <h4 className="text-lg font-semibold mb-3 flex items-center">
            <BarChart2 className="h-5 w-5 mr-2 text-blue-600" />
            Question Results
          </h4>

          <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
            {quizResults?.questionResults?.map((result, index) => (
              <div
                key={result.questionId}
                className={`border rounded-lg p-4 ${
                  result.isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                }`}
              >
                <div className="flex items-start">
                  <div className={`rounded-full p-2 mr-3 ${result.isCorrect ? "bg-green-200" : "bg-red-200"}`}>
                    {result.isCorrect ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <XIcon className="h-5 w-5 text-red-600" />
                    )}
                  </div>

                  <div className="flex-1">
                    <h5 className="font-medium mb-2">
                      {index + 1}. {result.question}
                    </h5>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <span className="font-medium mr-2">Your answer:</span>
                        <span className={result.isCorrect ? "text-green-600" : "text-red-600"}>
                          {result.userAnswer || "No answer provided"}
                        </span>
                      </div>

                      {!result.isCorrect && (
                        <div className="flex items-center">
                          <span className="font-medium mr-2">Correct answer:</span>
                          <span className="text-green-600">{result.answer}</span>
                        </div>
                      )}

                      <div className="flex items-center">
                        <span className="font-medium mr-2">Points:</span>
                        <span>
                          {result.earnedPoints} / {result.points}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!showQuiz) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
            <p className="text-lg font-medium text-gray-600">Loading...</p>
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
              <div className="flex items-center mt-3 text-sm">
                <div className="flex items-center mr-4">
                  <div className="w-4 h-4 bg-blue-100 rounded-full mr-1 flex items-center justify-center">
                    <BookOpen className="h-3 w-3 text-blue-600" />
                  </div>
                  <span>Available</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-100 rounded-full mr-1 flex items-center justify-center">
                    <Check className="h-3 w-3 text-green-600" />
                  </div>
                  <span>Completed</span>
                </div>
              </div>
            </div>

            {/* Modify the quiz selector to show completion status */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {allQuizzes.length > 0 ? (
                <div className="space-y-4">
                  {allQuizzes?.map((quizItem) => (
                    <div
                      key={quizItem._id}
                      className={`border rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer ${
                        completedQuizzes[quizItem._id] ? "border-green-200" : ""
                      }`}
                      onClick={() => handleSelectQuiz(quizItem)}
                    >
                      <div className="flex items-start">
                        <div
                          className={`p-3 rounded-full mr-4 ${
                            completedQuizzes[quizItem._id] ? "bg-green-100" : "bg-blue-100"
                          }`}
                        >
                          {completedQuizzes[quizItem._id] ? (
                            <Check className="h-6 w-6 text-green-600" />
                          ) : (
                            <BookOpen className="h-6 w-6 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">{quizItem.quizName}</h3>
                            {completedQuizzes[quizItem._id] && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Completed
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mt-1">{quizItem.description}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm text-gray-500 flex items-center">
                              <List className="h-4 w-4 mr-1" />
                              {quizItem.questions?.length || 0} questions
                            </span>
                            {completedQuizzes[quizItem._id] && (
                              <span className="text-sm text-green-600 font-medium flex items-center">
                                <Award className="h-4 w-4 mr-1" />
                                Score: {completedQuizzes[quizItem._id].score}%
                              </span>
                            )}
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
                  <p className="text-gray-600">There are no quizzes available for this chapter.</p>
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
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700 ml-auto">
                  <X className="h-5 w-5" />
                </button>
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
                renderResults()
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
              {!isSubmitted ? (
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
              ) : (
                <div className="flex w-full gap-3">
                  <button
                    onClick={backToQuizList}
                    className="flex-1 px-4 py-2 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    <List className="h-4 w-4 inline mr-1" />
                    Back to Quiz List
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Close
                  </button>
                </div>
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
    <div className="">
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

