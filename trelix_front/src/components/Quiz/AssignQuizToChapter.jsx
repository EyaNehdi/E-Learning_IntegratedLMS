import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import {
  Search,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  FileQuestion,
  Clock,
  Calendar,
  HelpCircle,
} from "lucide-react"

const AssignQuizToChapter = () => {
  const [chapters, setChapters] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [selectedQuizzes, setSelectedQuizzes] = useState([])
  const [selectedChapter, setSelectedChapter] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedQuiz, setExpandedQuiz] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const [chaptersResponse, quizzesResponse] = await Promise.all([
          axios.get("http://localhost:5000/chapter/get"),
          axios.get("http://localhost:5000/quiz/get"),
        ])
        setChapters(chaptersResponse.data)
        setQuizzes(quizzesResponse.data)
      } catch (error) {
        console.error("Error fetching data:", error)
        setError("Failed to load data. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleQuizSelect = (quizId) => {
    setSelectedQuizzes((prev) => (prev.includes(quizId) ? prev.filter((id) => id !== quizId) : [...prev, quizId]))
  }

  const handleChapterChange = (e) => {
    setSelectedChapter(e.target.value)
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const toggleQuizDetails = (quizId) => {
    setExpandedQuiz(expandedQuiz === quizId ? null : quizId)
  }

  const handleAssign = async () => {
    if (!selectedChapter) {
      setError("Please select a chapter");
      return;
    }
  
    if (selectedQuizzes.length === 0) {
      setError("Please select at least one quiz");
      return;
    }
  
    setIsLoading(true);
    setError(null);
    setSuccess(null);
  
    try {
      const response = await axios.post("http://localhost:5000/quiz/assign-quizzes", {
        chapterId: selectedChapter,
        quizIds: selectedQuizzes,
      });
  
      // Check if the response indicates success
      if (response.status === 200 && response.data.success) {
        setSuccess(response.data.message || "Quizzes successfully assigned to chapter!");
        setSelectedQuizzes([]);
        setSelectedChapter("");
      } else {
        setError(response.data.message || "Failed to assign quizzes. Please try again.");
      }
    } catch (error) {
      console.error("Error assigning quizzes:", error);
  
      // Handle different types of errors
      if (error.response) {
        // Server responded with a status other than 2xx
        setError(error.response.data.message || "Server error: Failed to assign quizzes.");
      } else if (error.request) {
        // Request was made but no response received
        setError("No response from server. Please check your connection.");
      } else {
        // Something else caused the error
        setError("Unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  

  const filteredQuizzes = quizzes.filter((quiz) => quiz.quizName.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-800 p-6">
          <h1 className="text-2xl font-bold text-white">Assign Quizzes to Chapter</h1>
          <p className="text-purple-100 mt-2">Select quizzes and assign them to a specific chapter</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading && !error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
              <p className="text-gray-600">Loading data...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex items-center">
                <XCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          ) : (
            <>
              {success && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <p className="text-green-700">{success}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Chapter Selection */}
                <div>
                  <label htmlFor="chapter" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Chapter
                  </label>
                  <select
                    id="chapter"
                    value={selectedChapter}
                    onChange={handleChapterChange}
                    style={{ display: "block" }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">-- Select a Chapter --</option>
                    {chapters.map((chapter) => (
                      <option key={chapter._id} value={chapter._id}>
                        {chapter.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quiz Search */}
                <div>
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                    Search Quizzes
                  </label>
                  <div className="relative">
                    <input
                      id="search"
                      type="text"
                      placeholder="Search by title..."
                      value={searchTerm}
                      onChange={handleSearch}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Quiz List */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden mb-6">
                <div className="p-4 bg-gray-100 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-800">Available Quizzes</h2>
                  <span className="text-sm text-gray-500">{selectedQuizzes.length} selected</span>
                </div>

                {filteredQuizzes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <HelpCircle className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No Quizzes Found</h3>
                    <p className="text-gray-500 max-w-md">
                      {searchTerm
                        ? `No quizzes match "${searchTerm}". Try a different search term.`
                        : "There are no quizzes available. Create quizzes first."}
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {filteredQuizzes.map((quiz) => (
                      <li key={quiz._id} className="hover:bg-gray-50">
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                id={`quiz-${quiz._id}`}
                                checked={selectedQuizzes.includes(quiz._id)}
                                onChange={() => handleQuizSelect(quiz._id)}
                                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                              />
                              <label
                                htmlFor={`quiz-${quiz._id}`}
                                className="ml-3 block text-sm font-medium text-gray-700 cursor-pointer"
                              >
                                <div className="flex items-center">
                                  <FileQuestion className="h-4 w-4 text-purple-500 mr-2" />
                                  <span>{quiz.quizName}</span>
                                  {quiz.quizName === "published" && (
                                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                      Published
                                    </span>
                                  )}
                                  {quiz.status === "draft" && (
                                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                      Draft
                                    </span>
                                  )}
                                </div>
                              </label>
                            </div>
                            <button
                              onClick={() => toggleQuizDetails(quiz._id)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              {expandedQuiz === quiz._id ? (
                                <ChevronUp className="h-5 w-5" />
                              ) : (
                                <ChevronDown className="h-5 w-5" />
                              )}
                            </button>
                          </div>

                          {expandedQuiz === quiz._id && (
                            <div className="mt-4 pl-7">
                              <div className="text-sm text-gray-600 mb-3">
                                <p className="mb-2">{quiz.description || "No description available"}</p>
                                <div className="flex flex-wrap gap-4 mt-3">
                                  <div className="flex items-center text-xs text-gray-500">
                                    <Clock className="h-3.5 w-3.5 mr-1" />
                                    <span>{quiz.duration || "60"} minutes</span>
                                  </div>
                                  <div className="flex items-center text-xs text-gray-500">
                                    <Calendar className="h-3.5 w-3.5 mr-1" />
                                    <span>Created: {new Date(quiz.createdAt).toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex items-center text-xs text-gray-500">
                                    <span className="font-medium">Questions: </span>
                                    <span className="ml-1">{quiz.questions?.length || 0}</span>
                                  </div>
                                  <div className="flex items-center text-xs text-gray-500">
                                    <span className="font-medium">Passing Score: </span>
                                    <span className="ml-1">{quiz.passingScore || "60"}%</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => navigate(-1)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssign}
                  disabled={isLoading || selectedQuizzes.length === 0 || !selectedChapter}
                  className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    isLoading || selectedQuizzes.length === 0 || !selectedChapter
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500"
                  }`}
                >
                  {isLoading ? "Assigning..." : "Assign Quizzes"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AssignQuizToChapter

