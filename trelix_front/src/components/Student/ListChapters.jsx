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
                        to={`/chapters/${finalCourseId}/content/${chapter._id}`}
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

                {/* Action Buttons */}
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

                  {areAllChaptersCompleted() && !loading && (
                    <button
                      onClick={() => handleEarnCertificate("Trelix")}
                      className="w-full mt-3 py-3 px-4 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Earn Certificate
                    </button>
                  )}

                  {!areAllChaptersCompleted() && !loading && (
                    <p className="text-sm text-gray-500 mt-2">Complete all chapters to unlock the exam</p>
                  )}
                </div>
              </aside>
            </div>

            {/* Main content area */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-lg shadow-md p-8">
                {isChapterSelected ? (
                  // If a chapter is selected, show the chapter content
                  <Outlet />
                ) : (
                  // If no chapter is selected, show the course details
                  <article className="course-details">
                    {courseDetails && (
                      <>
                        <img
                          className="rounded-3 img-fluid w-full h-64 object-cover mb-6"
                          src="/assets/images/ces.png"
                          alt="Course"
                        />
                        <div className="course-details-meta grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <div className="avatar-info">
                              <h6 className="font-semibold">Niveau de cours</h6>
                              <span className="text-gray-600">{courseDetails.level || "Non spécifié"}</span>
                            </div>
                          </div>
                          <div className="course-reviews">
                            <h6 className="font-semibold">Module</h6>
                            <span className="text-gray-600">{courseDetails.categorie || "Non spécifié"}</span>
                          </div>
                          <div className="course-cat">
                            <h6 className="font-semibold">Prix</h6>
                            <span className="text-gray-600">
                              {formatPrice(courseDetails.price, courseDetails.currency)}
                            </span>
                          </div>
                        </div>

                        <div className="course-content">
                          <h2 className="text-3xl font-bold mb-4">{courseDetails.title}</h2>
                          <div className="course-description mb-8">
                            <p className="text-gray-700">{courseDetails.description}</p>
                          </div>

                          {/* Course objectives or additional info can go here */}
                          {courseDetails.objectives && (
                            <div className="course-objectives mt-6">
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
                            <p className="text-lg mb-4">
                              Sélectionnez un chapitre dans le menu pour commencer à apprendre
                            </p>
                            {chapters.length > 0 && (
                              <Link
                                to={`/chapters/${finalCourseId}/content/${chapters[0]._id}`}
                                className="inline-block py-3 px-6 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                              >
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
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ListChapters
