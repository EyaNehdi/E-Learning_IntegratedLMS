"use client"

import { useState } from "react"
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

const AddQuiz = () => {
  const [quiz, setQuiz] = useState({
    quizName: "",
    description: "",
    questions: [
      {
        question: "",
        options: ["", "", "", ""],
        correctAnswer: "",
      },
    ],
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [draggedQuestionIndex, setDraggedQuestionIndex] = useState(null)

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

  const handleSubmit = async (e) => {
    e.preventDefault()

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

    // Format data for API
    const quizData = {
      quizName: quiz.quizName,
      description: quiz.description,
      questions: quiz.questions.map((q) => ({
        question: q.question,
        options: q.options.filter((opt) => opt.trim()), // Remove empty options
        answer: q.correctAnswer,
      })),
    }

    console.log("Sending quiz data:", quizData)

    try {
      const response = await axios.post("http://localhost:5000/quiz/add", quizData)
      console.log("Quiz added successfully:", response.data)

      setSuccess(true)

      // Reset form after success
      setTimeout(() => {
        setQuiz({
          quizName: "",
          description: "",
          questions: [
            {
              question: "",
              options: ["", "", "", ""],
              correctAnswer: "",
            },
          ],
        })
        setSuccess(false)
      }, 2000)
    } catch (err) {
      console.error("Error adding quiz:", err.response ? err.response.data : err.message)
      setError("Failed to save quiz. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <a href="/quiz/all" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to All Quizzes
        </a>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Create New Quiz</h1>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6 flex items-start">
          <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>Quiz added successfully!</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
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
                required
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
                required
              />
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Questions</h2>
            <button
              type="button"
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
                type="button"
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
                  key={questionIndex}
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
                      type="button"
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
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="Enter your question"
                        required
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
                            required={optionIndex < 2} // At least 2 options required
                          />
                          {question.options.length > 2 && (
                            <button
                              type="button"
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
                      type="button"
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
            type="submit"
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
      </form>
    </div>
  )
}

export default AddQuiz

