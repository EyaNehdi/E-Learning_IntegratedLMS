

import React, { useState, useEffect } from "react"
import axios from "axios"
import { BookOpen, Edit, Trash2, Plus, Search, Filter, AlertCircle, CheckCircle, Loader2, List, Eye, MoreHorizontal, ArrowUpDown,  ChevronDown,X } from 'lucide-react'

const AllQuiz = () => {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [quizToDelete, setQuizToDelete] = useState(null)
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteSuccess, setDeleteSuccess] = useState(false)
  const [isOpen, setIsOpen] = useState(false);
  
  // Fetch all quizzes
  useEffect(() => {
    fetchQuizzes()
  }, [])

  const fetchQuizzes = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get("http://localhost:5000/quiz/get")
      setQuizzes(response.data)
    } catch (err) {
      console.error("Error fetching quizzes:", err)
      setError("Failed to load quizzes. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Handle delete quiz
  const handleDeleteClick = (quiz) => {
    setQuizToDelete(quiz)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!quizToDelete) return
    
    setDeleteLoading(true)
    try {
      await axios.delete(`http://localhost:5000/quiz/delete/${quizToDelete._id}`)
      setQuizzes(quizzes.filter(quiz => quiz._id !== quizToDelete._id))
      setDeleteSuccess(true)
      
      // Reset after showing success message
      setTimeout(() => {
        setShowDeleteModal(false)
        setQuizToDelete(null)
        setDeleteSuccess(false)
      }, 1500)
    } catch (err) {
      console.error("Error deleting quiz:", err)
      setError("Failed to delete quiz. Please try again.")
    } finally {
      setDeleteLoading(false)
    }
  }

  const cancelDelete = () => {
    setShowDeleteModal(false)
    setQuizToDelete(null)
  }

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  // Handle sort
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("asc")
    }
  }

  // Filter and sort quizzes
  const filteredQuizzes = quizzes
    .filter(quiz => 
      quiz.quizName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      quiz.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "quizName") {
        return sortOrder === "asc" 
          ? a.quizName?.localeCompare(b.quizName || "") 
          : b.quizName?.localeCompare(a.quizName || "")
      } else if (sortBy === "questionCount") {
        return sortOrder === "asc" 
          ? (a.questions?.length || 0) - (b.questions?.length || 0) 
          : (b.questions?.length || 0) - (a.questions?.length || 0)
      } else {
        // Default sort by createdAt
        return sortOrder === "asc" 
          ? new Date(a.createdAt || 0) - new Date(b.createdAt || 0) 
          : new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      }
    })

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quiz Management</h1>
          <p className="text-gray-600 mt-1">Manage all your quizzes in one place</p>
        </div>
        <div className="relative mt-4 md:mt-0">
        <button
  onClick={() => setIsOpen(!isOpen)}
  className="min-w-[150px] px-3 py-1 text-sm leading-tight whitespace-nowrap border rounded disabled:opacity-50"
>
  <Plus className="w-5 h-5 mr-2" />
  Quiz Options
  <ChevronDown className="w-5 h-5 ml-2" />
</button>

{isOpen && (
  <div className="absolute left-0 mt-2 w-48 bg-white shadow-md rounded-md border">
    <a
      href="/profile/addquiz"
      className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
    >
      Create New Quiz
    </a>
    <a
      href="/profile/assgnedQuizToChapter"
      className="block px-4 py-2 text-gray-800 hover:bg-gray-100"
    >
      Assign Quiz to Chapter
    </a>
  </div>
)}

    </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search quizzes..."
              className="pl-10 pr-4 py-2 w-full border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => handleSort("quizName")}
              className={`text-blue-600 hover:underline text-sm px-2 py-1 min-w-[57px] rounded ${
                sortBy === "quizName" ? "bg-blue-50 border-blue-200 text-blue-700" : " text-gray-700"
              }`}
            >
              <ArrowUpDown className="h-4 w-4 mr-1" />
              Name
            </button>
            <button 
              onClick={() => handleSort("questionCount")}
              className={`text-blue-600 hover:underline text-sm px-2 py-1 min-w-[100px] rounded ${
                sortBy === "questionCount" ? "bg-blue-50 border-blue-200 text-blue-700" : " text-gray-700"
              }`}
            >
              <ArrowUpDown className="h-4 w-4 mr-1" />
              Questions
            </button>
            <button 
              onClick={() => handleSort("createdAt")}
              className={`"text-blue-600 hover:underline text-sm px-2 py-1 min-w-[48px] rounded ${
                sortBy === "createdAt" ? "bg-blue-50 border-blue-200 text-blue-700" : " text-gray-700"
              }`}
            >
              
              <ArrowUpDown className="h-4 w-4 mr-1" />
              Date
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Quiz List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
            <p className="text-lg font-medium text-gray-600">Loading quizzes...</p>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
              <BookOpen className="h-10 w-10 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Quizzes Found</h3>
            <p className="text-gray-600 max-w-md">
              {searchTerm 
                ? `No quizzes match your search "${searchTerm}". Try a different search term.` 
                : "You haven't created any quizzes yet. Click 'Create New Quiz' to get started."}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop View - Table */}
            <div className="hidden md:block">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quiz</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Questions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredQuizzes.map((quiz) => (
                    <tr key={quiz._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-2 rounded-full mr-3">
                            <BookOpen className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{quiz.quizName}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{quiz.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {quiz.questions?.length || 0} questions
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {quiz.createdAt ? new Date(quiz.createdAt).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <a 
                            href={`/profile/preview/${quiz._id}`}
                            className="text-gray-600 hover:text-gray-900 bg-gray-100 p-2 rounded-md"
                            title="Preview Quiz"
                          >
                            <Eye className="h-4 w-4" />
                          </a>
                          <a 
                            href={`/profile/edit/${quiz._id}`}
                            className="text-blue-600 hover:text-blue-900 bg-blue-100 p-2 rounded-md"
                            title="Edit Quiz"
                          >
                            <Edit className="h-4 w-4" />
                          </a>
                          <button 
                            onClick={() => handleDeleteClick(quiz)}
                            className="text-red-600 hover:text-red-900 bg-red-100 p-2 rounded-md"
                            title="Delete Quiz"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View - Cards */}
            <div className="md:hidden divide-y divide-gray-200">
              {filteredQuizzes.map((quiz) => (
                <div key={quiz._id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start">
                      <div className="bg-blue-100 p-2 rounded-full mr-3 mt-1">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{quiz.quizName}</div>
                        <div className="text-sm text-gray-500 mt-1">{quiz.description}</div>
                        <div className="flex items-center mt-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                            {quiz.questions?.length || 0} questions
                          </span>
                          <span className="text-xs text-gray-500">
                            {quiz.createdAt ? new Date(quiz.createdAt).toLocaleDateString() : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="flex space-x-1">
                        <a 
                          href={`/profile/preview/${quiz._id}`}
                          className="text-gray-600 hover:text-gray-900 bg-gray-100 p-2 rounded-md"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                        <a 
                          href={`/quiz/edit/${quiz._id}`}
                          className="text-blue-600 hover:text-blue-900 bg-blue-100 p-2 rounded-md"
                        >
                          <Edit className="h-4 w-4" />
                        </a>
                        <button 
                          onClick={() => handleDeleteClick(quiz)}
                          className="text-red-600 hover:text-red-900 bg-red-100 p-2 rounded-md"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden">
            {deleteSuccess ? (
              <div className="p-6 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Quiz Deleted Successfully</h3>
                <p className="text-gray-500">The quiz has been permanently removed.</p>
              </div>
            ) : (
              <>
                <div className="p-6">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 text-center mb-2">Delete Quiz</h3>
                  <p className="text-gray-500 text-center">
                    Are you sure you want to delete <span className="font-medium">{quizToDelete?.quizName}</span>? 
                    This action cannot be undone.
                  </p>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={confirmDelete}
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={cancelDelete}
                    disabled={deleteLoading}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AllQuiz
