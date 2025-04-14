"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useProfileStore } from "../../store/profileStore"
import { Link, Outlet, useParams, useNavigate, useLocation } from "react-router-dom"

const ListChapters = () => {
  const { id, courseid } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const [chapters, setChapters] = useState([])
  const [completedChapters, setCompletedChapters] = useState([])
  const { user, fetchUser } = useProfileStore()
  const [loading, setLoading] = useState(true)
  const [courseDetails, setCourseDetails] = useState(null)

  // Determine if a specific chapter is selected
  const isChapterSelected = location.pathname.includes("/content/")

  // Store courseid in localStorage if it's not already there
  useEffect(() => {
    if (courseid) {
      localStorage.setItem("courseid", courseid)
    }
  }, [courseid])

  // Retrieve courseid from localStorage if it's not available from useParams
  const storedCourseId = localStorage.getItem("courseid")
  const finalCourseId = courseid || storedCourseId

  // Fetch the user data on mount
  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  // Fetch course details
  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!finalCourseId) {
        console.error("Course ID is not defined")
        return
      }

      try {
        const response = await axios.get(`http://localhost:5000/course/${finalCourseId}`)
        setCourseDetails(response.data)
        console.log("Course details:", response.data)
      } catch (error) {
        console.error("Error fetching course details:", error)
      }
    }

    fetchCourseDetails()
  }, [finalCourseId])

  // Fetch chapters
  useEffect(() => {
    const fetchChapters = async () => {
      if (!finalCourseId) {
        console.error("Course ID is not defined")
        return
      }

      try {
        const response = await axios.get(`http://localhost:5000/chapter/course/${finalCourseId}`)
        setChapters(response.data.chapters)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching chapters:", error)
        setLoading(false)
      }
    }

    fetchChapters()
  }, [finalCourseId])

  // Fetch completed chapters
  useEffect(() => {
    if (user && user._id) {
      axios
        .get("http://localhost:5000/api/auth/completedchapters", {
          params: {
            userId: user._id,
            chapterId: id,
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
        userId: user._id,
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
    navigate(`/exams/${finalCourseId}`)
  }

  // Handle earning certificate
  const handleEarnCertificate = async (provider) => {
    try {
      const response = await axios.post("http://localhost:5000/certificates/issueCertificate", {
        userId: user._id,
        courseId: finalCourseId,
        provider,
      })

      console.log("Certificate Earned Successfully:", response.data)
      alert("Congratulations! You have earned a certificate.")
    } catch (error) {
      console.error("Error earning certificate:", error.response?.data || error)
      alert(error.response?.data?.error || "An error occurred.")
    }
  }

  // Format price with currency symbol
  const formatPrice = (price, currency = "EUR") => {
    if (price === 0 || price === "0") return "Gratuit"

    const currencySymbols = {
      USD: "$",
      EUR: "€",
      DZD: "د.ج",
    }

    const symbol = currencySymbols[currency] || currencySymbols.EUR
    return `${price} ${symbol}`
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b py-4 px-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">{courseDetails ? courseDetails.title : "Course Content"}</h1>
      </header>

      {/* Main content area with sidebar and content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Chapter List */}
        <aside className="w-80 bg-white border-r shadow-sm flex-shrink-0 overflow-auto">
          <div className="p-5 border-b bg-gray-50">
            <h2 className="text-lg font-bold text-gray-800 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-blue-600"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
              Chapters
            </h2>
          </div>

          <div className="p-4 space-y-3">
            {chapters.map((chapter) => {
              const isCompleted = completedChapters.includes(chapter._id)
              const isActive = location.pathname.includes(`/content/${chapter._id}`)

              return (
                <Link
                  key={chapter._id}
                  className={`flex items-center justify-between w-full px-5 py-3.5 rounded-md transition-all duration-200 
                    ${isActive ? "bg-blue-50 shadow-sm" : ""}
                    ${
                      isCompleted
                        ? "bg-white border-l-4 border-l-green-500 border-y border-r border-gray-100 text-gray-800 hover:bg-gray-50"
                        : "bg-white border border-gray-100 text-gray-800 hover:bg-gray-50 hover:border-gray-200"
                    } focus:outline-none focus:ring-1 focus:ring-blue-400 focus:ring-opacity-50`}
                  to={`/chapters/${finalCourseId}/content/${chapter._id}`}
                >
                  <span className={`font-medium ${isActive ? "text-blue-700" : ""}`}>{chapter.title}</span>

                  {/* Progress Indicator */}
                  {isCompleted ? (
                    <span className="text-green-600 flex-shrink-0 bg-green-50 p-1 rounded-full">
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
                      className="text-gray-400 hover:text-blue-500 cursor-pointer flex-shrink-0 bg-gray-50 p-1 rounded-full hover:bg-blue-50"
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

          {/* Action Buttons */}
          <div className="p-4 border-t mt-4">
            <button
              onClick={handleStartExam}
              disabled={!areAllChaptersCompleted() || loading}
              className={`w-full py-3.5 px-5 rounded-md font-medium text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 mb-3 shadow-sm ${
                areAllChaptersCompleted() && !loading
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:ring-blue-500"
                  : "bg-gray-400 cursor-not-allowed opacity-75"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Loading...
                </span>
              ) : (
                "Start Exam"
              )}
            </button>

            {areAllChaptersCompleted() && !loading && (
              <button
                onClick={() => handleEarnCertificate("Trelix")}
                className="w-full py-3.5 px-5 rounded-md font-medium text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500 shadow-sm"
              >
                <span className="flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Earn Certificate
                </span>
              </button>
            )}

            {!areAllChaptersCompleted() && !loading && (
              <p className="text-sm text-gray-500 mt-2 text-center">Complete all chapters to unlock the exam</p>
            )}
          </div>
        </aside>

        {/* Main content area */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6">
            {isChapterSelected ? (
              // If a chapter is selected, show the chapter content
              <Outlet />
            ) : (
              // If no chapter is selected, show the course details
              <article className="course-details">
                {courseDetails && (
                  <>
                    <img
                      className="w-full h-64 object-cover rounded-lg mb-6"
                      src="/assets/images/ces.png"
                      alt="Course"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div>
                          <h6 className="font-semibold">Niveau de cours</h6>
                          <span className="text-gray-600">{courseDetails.level || "Non spécifié"}</span>
                        </div>
                      </div>
                      <div>
                        <h6 className="font-semibold">Module</h6>
                        <span className="text-gray-600">{courseDetails.categorie || "Non spécifié"}</span>
                      </div>
                      <div>
                        <h6 className="font-semibold">Prix</h6>
                        <span className="text-gray-600">
                          {formatPrice(courseDetails.price, courseDetails.currency)}
                        </span>
                      </div>
                    </div>

                    <div className="course-content">
                      <h2 className="text-3xl font-bold mb-4">{courseDetails.title}</h2>
                      <div className="mb-8">
                        <p className="text-gray-700">{courseDetails.description}</p>
                      </div>

                      {/* Course objectives or additional info */}
                      {courseDetails.objectives && (
                        <div className="mt-6">
                          <h3 className="text-xl font-semibold mb-3">Objectifs du cours</h3>
                          <ul className="list-disc pl-5 space-y-2">
                            {courseDetails.objectives.map((objective, index) => (
                              <li key={index} className="text-gray-700">
                                {objective}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Call to action */}
                      <div className="mt-8 text-center">
                        <p className="text-lg mb-4">Sélectionnez un chapitre dans le menu pour commencer à apprendre</p>
                        {chapters.length > 0 && (
                          <Link
                            to={`/chapters/${finalCourseId}/content/${chapters[0]._id}`}
                            className="inline-flex items-center py-3.5 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-md hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mr-2"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Commencer le premier chapitre
                          </Link>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {!courseDetails && !loading && (
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-700">Détails du cours non disponibles</h2>
                    <p className="text-gray-600 mt-2">Les informations sur ce cours n'ont pas pu être chargées.</p>
                  </div>
                )}

                {loading && (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                )}
              </article>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default ListChapters
