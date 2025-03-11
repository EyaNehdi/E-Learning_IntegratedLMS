
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import {
  BookOpen,
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  Plus,
  Trash2,
  GripVertical,
  CheckCircle,
  X,
} from "lucide-react"

const QuizEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState({
    quizName: "",
    description: "",
    questions: [],
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [draggedQuestionIndex, setDraggedQuestionIndex] = useState(null)

  // Fetch quiz if editing existing quiz
  useEffect(() => {
    const fetchQuiz = async () => {
      if (!id || id === "new") {
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const response = await axios.get(`http://localhost:5000/quiz/get/${id}`)
        setQuiz(response.data)
      } catch (err) {
        console.error("Error fetching quiz:", err)
        setError("Failed to load quiz. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchQuiz()
  }, [id])

  const handleQuizChange = (e) => {
    const { name, value } = e.target
    setQuiz((prev) => ({ ...prev, [name]: value }))
  }

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...quiz.questions]
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value }
    setQuiz((prev) => ({ ...prev, questions: updatedQuestions }))
  }

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...quiz.questions]
    const options = [...updatedQuestions[questionIndex].options]
    options[optionIndex] = value
    updatedQuestions[questionIndex] = { ...updatedQuestions[questionIndex], options }
    setQuiz((prev) => ({ ...prev, questions: updatedQuestions }))
  }

  const addQuestion = () => {
    const newQuestion = {
      _id: Date.now().toString(), // Temporary ID for UI purposes
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
    }
    setQuiz((prev) => ({ ...prev, questions: [...prev.questions, newQuestion] }))
  }

  const removeQuestion = (index) => {
    const updatedQuestions = [...quiz.questions]
    updatedQuestions.splice(index, 1)
    setQuiz((prev) => ({ ...prev, questions: updatedQuestions }))
  }

  const addOption = (questionIndex) => {
    const updatedQuestions = [...quiz.questions]
    updatedQuestions[questionIndex].options.push("")
    setQuiz((prev) => ({ ...prev, questions: updatedQuestions }))
  }

  const removeOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...quiz.questions]
    updatedQuestions[questionIndex].options.splice(optionIndex, 1)

    // If the correct answer was this option, reset it
    if (updatedQuestions[questionIndex].options[optionIndex] === updatedQuestions[questionIndex].correctAnswer) {
      updatedQuestions[questionIndex].correctAnswer = ""
    }

    setQuiz((prev) => ({ ...prev, questions: updatedQuestions }))
  }

  const setCorrectAnswer = (questionIndex, option) => {
    const updatedQuestions = [...quiz.questions]
    updatedQuestions[questionIndex].correctAnswer = option
    setQuiz((prev) => ({ ...prev, questions: updatedQuestions }))
  }

  // Drag and drop functionality
  const handleDragStart = (index) => {
    setDraggedQuestionIndex(index)
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    if (draggedQuestionIndex === null || draggedQuestionIndex === index) return

    const updatedQuestions = [...quiz.questions]
    const draggedQuestion = updatedQuestions[draggedQuestionIndex]

    // Remove the dragged question
    updatedQuestions.splice(draggedQuestionIndex, 1)
    // Insert it at the new position
    updatedQuestions.splice(index, 0, draggedQuestion)

    setQuiz((prev) => ({ ...prev, questions: updatedQuestions }))
    setDraggedQuestionIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedQuestionIndex(null)
  }

  const saveQuiz = async () => {
    // Validate quiz
    if (!quiz.quizName.trim()) {
      setError("Quiz name is required")
      return
    }

    if (quiz.questions.length === 0) {
      setError("Add at least one question to the quiz")
      return
    }

    // Validate each question
    for (let i = 0; i < quiz.questions.length; i++) {
      const q = quiz.questions[i]
      if (!q.question.trim()) {
        setError(`Question ${i + 1} is empty`)
        return
      }

      if (q.options.filter((opt) => opt.trim()).length < 2) {
        setError(`Question ${i + 1} needs at least 2 options`)
        return
      }

      if (!q.correctAnswer) {
        setError(`Select a correct answer for question ${i + 1}`)
        return
      }
    }

    setSaving(true)
    setError(null)

    try {
      let response
      if (id && id !== "new") {
        // Update existing quiz
        response = await axios.put(`http://localhost:5000/quiz/update/${id}`, quiz)
      } else {
        // Create new quiz
        response = await axios.post("http://localhost:5000/quiz/create", quiz)
      }

      setSuccess(true)
      setTimeout(() => {
        navigate("/quiz/all")
      }, 1500)
    } catch (err) {
      console.error("Error saving quiz:", err)
      setError("Failed to save quiz. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
          <p className="text-lg font-medium text-gray-600">Loading quiz...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/quiz/all")}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to All Quizzes
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          {id && id !== "new" ? "Edit Quiz" : "Create New Quiz"}
        </h1>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6 flex items-start">
          <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>Quiz saved successfully! Redirecting...</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Quiz Form */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden mb-6">
        <div className="p-6 border-b">
          <div className="mb-4">
            <label htmlFor="quizName" className="block text-sm font-medium text-gray-700 mb-1">
              Quiz Name*
            </label>
            <input
              type="text"
              id="quizName"
              name="quizName"
              value={quiz.quizName}
              onChange={handleQuizChange}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Enter quiz name"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={quiz.description}
              onChange={handleQuizChange}
              rows={3}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Enter quiz description"
            />
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Questions</h2>
          <button
            onClick={addQuestion}
            className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Question
          </button>
        </div>

        {quiz.questions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <div className="bg-gray-100 p-4 rounded-full inline-block mb-4">
              <BookOpen className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Questions Yet</h3>
            <p className="text-gray-600 mb-4">Start by adding your first question to the quiz.</p>
            <button
              onClick={addQuestion}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Question
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {quiz.questions.map((question, questionIndex) => (
              <div
                key={question._id || questionIndex}
                className="bg-white rounded-lg shadow-sm border overflow-hidden"
                draggable
                onDragStart={() => handleDragStart(questionIndex)}
                onDragOver={(e) => handleDragOver(e, questionIndex)}
                onDragEnd={handleDragEnd}
              >
                <div className="p-4 bg-gray-50 border-b flex items-center">
                  <div className="cursor-move mr-2 text-gray-400">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-medium">Question {questionIndex + 1}</h3>
                  <button
                    onClick={() => removeQuestion(questionIndex)}
                    className="ml-auto text-red-600 hover:text-red-800"
                    title="Remove Question"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Question Text*</label>
                    <input
                      type="text"
                      value={question.question}
                      onChange={(e) => handleQuestionChange(questionIndex, "question", e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your question"
                    />
                  </div>

                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Options* (select the correct answer)
                    </label>
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center mb-2">
                        <input
                          type="radio"
                          id={`q${questionIndex}-option${optionIndex}`}
                          name={`q${questionIndex}-correct`}
                          checked={option === question.correctAnswer}
                          onChange={() => setCorrectAnswer(questionIndex, option)}
                          className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                          className="flex-grow px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder={`Option ${optionIndex + 1}`}
                        />
                        {question.options.length > 2 && (
                          <button
                            onClick={() => removeOption(questionIndex, optionIndex)}
                            className="ml-2 text-red-600 hover:text-red-800"
                            title="Remove Option"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => addOption(questionIndex)}
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Option
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveQuiz}
          disabled={saving}
          className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-5 w-5 mr-2" />
              Save Quiz
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default QuizEdit

