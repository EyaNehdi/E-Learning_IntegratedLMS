"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useProfileStore } from "../../store/profileStore"
import { Link, Outlet, useParams, useNavigate } from "react-router-dom"

const ListChapters = () => {
  const { id, courseid } = useParams()
  const navigate = useNavigate()

  const [chapters, setChapters] = useState([])
  const [completedChapters, setCompletedChapters] = useState([])
  const { user, fetchUser, clearUser } = useProfileStore()
  const [loading, setLoading] = useState(true)

  // Fetch the user data on mount
  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  useEffect(() => {
    console.log("user after fetch", user)
  }, [user])

  console.log("Course ID:", id)

  useEffect(() => {
    const fetchChapters = async () => {
      console.log("Course ID:", courseid)
      if (!courseid) {
        console.error("Course ID is not defined")
        return
      }

      try {
        const response = await axios.get(`http://localhost:5000/chapter/course/${courseid}`)
        setChapters(response.data.chapters)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching chapters:", error)
        setLoading(false)
      }
    }

    fetchChapters()
  }, [courseid])

  useEffect(() => {
    // Ensure that user is available before making the request
    if (user && user._id) {
      axios
        .get("http://localhost:5000/api/auth/completedchapters", {
          params: {
            userId: user._id, // Pass user ID as query param
            chapterId: id, // Pass the chapter ID as query param
          },
        })
        .then((response) => {
          setCompletedChapters(response.data.completedChapters)
          console.log("Completed chapters data: ", response.data)
        })
        .catch((error) => {
          console.error("Error fetching completed chapters:", error)
        })
    }
  }, [user, id])

  const handleCompleteChapter = (chapterId) => {
    if (!user || !user._id) {
      console.error("User is not logged in")
      return
    }

    // When a chapter is completed, update the backend
    axios
      .post("http://localhost:5000/user/mark-chapter-completed", {
        userId: user._id, // Get the logged-in user's ID
        chapterId: chapterId,
      })
      .then((response) => {
        // Check if the response contains updated completed chapters
        if (response.data.completedChapters) {
          setCompletedChapters(response.data.completedChapters)
        }
      })
      .catch((error) => {
        console.error("Error marking chapter as completed:", error)
      })
  }

  // Check if all chapters are completed
  const areAllChaptersCompleted = () => {
    if (chapters.length === 0) return false
    return chapters.every((chapter) => completedChapters.includes(chapter._id))
  }

  // Handle starting the exam
  const handleStartExam = () => {
    if (!areAllChaptersCompleted()) {
      alert("Please complete all chapters before starting the exam.")
      return
    }

    // Navigate to the exam page
    navigate(`/exams`)
  }
t b
  return (
    <div>
      {/* Course Section */}
      <section className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row">
            {/* Sidebar on the left */}
            <div className="lg:w-1/3 mb-6 lg:mb-0 lg:pr-6">
              <aside className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Chapter Content</h1>
                <div className="space-y-3">
                  {chapters.map((chapter) => {
                    const isCompleted = completedChapters.includes(chapter._id)
                    return (
                      <Link
                        key={chapter._id}
                        className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-all duration-200 
                          ${
                            isCompleted
                              ? "bg-green-50 hover:bg-green-100 border border-green-200 text-green-800"
                              : "bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 hover:border-blue-300"
                          } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                        to={`/chapters/${id}/content/${chapter._id}`}
                      >
                        <span className="font-medium">{chapter.title}</span>

                        {/* Progress Indicator */}
                        {isCompleted ? (
                          <span className="text-green-600 flex-shrink-0">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        ) : (
                          <span
                            className="text-gray-400 hover:text-blue-500 cursor-pointer flex-shrink-0"
                            onClick={(e) => {
                              e.preventDefault()
                              handleCompleteChapter(chapter._id)
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>

                {/* Start Exam Button */}
                <div className="mt-8">
                  <button
                    onClick={handleStartExam}
                    disabled={!areAllChaptersCompleted() || loading}
                    className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      areAllChaptersCompleted() && !loading
                        ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {loading ? "Loading..." : "Start Exam"}
                  </button>
                  {!areAllChaptersCompleted() && !loading && (
                    <p className="text-sm text-gray-500 mt-2">Complete all chapters to unlock the exam</p>
                  )}
                </div>
              </aside>
            </div>

            <div className="lg:w-4/5">
              <div className="bg-white rounded-lg shadow-md p-8">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ListChapters

