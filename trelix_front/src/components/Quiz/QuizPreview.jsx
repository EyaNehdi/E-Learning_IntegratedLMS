
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import {
  BookOpen,
  ArrowLeft,
  Edit,
  Loader2,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  List,
} from "lucide-react"

const QuizPreview = () => {
  const { idquiz } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  useEffect(() => {
    console.log("ID:", idquiz)
    const fetchQuiz = async () => {
      setLoading(true)
      try {
        const response = await axios.get(`http://localhost:5000/quiz/get/${idquiz}`)
        setQuiz(response.data)
      } catch (err) {
        console.error("Error fetching quiz:", err)
        setError("Failed to load quiz. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    if (idquiz) {
      fetchQuiz()
    }
  }, [idquiz])

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

  const currentQuestion = quiz?.questions?.[currentQuestionIndex]
  const isLastQuestion = quiz?.questions && currentQuestionIndex === quiz.questions.length - 1

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/profile/allquiz")}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to All Quizzes
        </button>
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Quiz Preview</h1>
          {quiz && (
            <a
              href={`/profile/edit/${quiz._id}`}
              className="mt-2 md:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Quiz
            </a>
          )}
        </div>
      </div>

      {/* Quiz Preview */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
            <p className="text-lg font-medium text-gray-600">Loading quiz...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <div className="bg-red-100 p-4 rounded-full mb-4">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Error Loading Quiz</h3>
            <p className="text-gray-600 max-w-md">{error}</p>
          </div>
        ) : quiz ? (
          <>
            <div className="p-6 border-b">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <h2 className="text-2xl font-bold">{quiz.quizName}</h2>
              </div>
              <p className="text-gray-600">{quiz.description}</p>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">{quiz.questions?.length || 0} questions</span>
                <span className="text-sm font-medium text-gray-600">
                  Question {currentQuestionIndex + 1} of {quiz.questions?.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / (quiz.questions?.length || 1)) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="p-6">
              {quiz.questions?.length > 0 ? (
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
                        className={`flex items-center space-x-3 border rounded-lg p-4 ${
                          option === currentQuestion.correctAnswer ? "border-green-600 bg-green-50" : "border-gray-200"
                        }`}
                      >
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                            option === currentQuestion.correctAnswer
                              ? "border-green-500 bg-green-500"
                              : "border-gray-300"
                          }`}
                        >
                          {option === currentQuestion.correctAnswer && <CheckCircle className="h-4 w-4 text-white" />}
                        </div>
                        <label className="flex-grow font-medium">
                          {option}
                          {option === currentQuestion.correctAnswer && (
                            <span className="ml-2 text-sm text-green-600">(Correct Answer)</span>
                          )}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <AlertCircle className="h-8 w-8 text-amber-500 mr-2" />
                  <p className="text-lg font-medium">No questions available in this quiz</p>
                </div>
              )}
            </div>

            {quiz.questions?.length > 0 && (
              <div className="p-6 border-t bg-gray-50 flex justify-between">
                <button
                  onClick={prevQuestion}
                  disabled={currentQuestionIndex === 0}
                  className={`px-4 py-2 rounded-md border border-gray-300 flex items-center ${
                    currentQuestionIndex === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"
                  }`}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />
                  Previous
                </button>
                {!isLastQuestion ? (
                  <button
                    onClick={nextQuestion}
                    className="px-4 py-2 rounded-md bg-blue-600 text-white flex items-center hover:bg-blue-700"
                  >
                    Next
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/profile/allquiz")}
                    className="px-4 py-2 rounded-md bg-green-600 text-white flex items-center hover:bg-green-700"
                  >
                    <List className="mr-1 h-4 w-4" />
                    All Quizzes
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
              <AlertCircle className="h-10 w-10 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Quiz Not Found</h3>
            <p className="text-gray-600 max-w-md">The quiz you're looking for doesn't exist or has been deleted.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuizPreview

