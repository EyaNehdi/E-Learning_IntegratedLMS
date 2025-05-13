"use client"

import { useState, useEffect, useCallback } from "react"
import axios from "axios"
import Box from "@mui/material/Box"
import Slider from "@mui/material/Slider"
import { useNavigate } from "react-router-dom"
import Swal from "sweetalert2"
import { useAuthStore } from "../../store/authStore"
import { Lock, Unlock, ChevronLeft, ChevronRight, Sparkles } from "lucide-react"
import "./stylecontent.css"

const MAX = 50
const MIN = 0
const marks = [
  { value: MIN, label: `${MIN} min` },
  { value: MAX, label: `${MAX} max` },
]

function Allcourse() {
  const [courses, setCourses] = useState([])
  const [filteredCourses, setFilteredCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedLevels, setSelectedLevels] = useState([])
  const [error, setError] = useState(null)
  const [recommendations, setRecommendations] = useState([])
  const [showingRecommendations, setShowingRecommendations] = useState(false)
  const [recommendationsLoading, setRecommendationsLoading] = useState(false)
  const [filters, setFilters] = useState({
    frontendDev: false,
    backendDev: false,
  })
  const [val, setVal] = useState([MIN, MAX])
  const [minPrice, setMinPrice] = useState(MIN)
  const [maxPrice, setMaxPrice] = useState(MAX)
  const [popularityFilter, setPopularityFilter] = useState("all")
  const [buttonHover, setButtonHover] = useState(false)
  const [buttonClicked, setButtonClicked] = useState(false)

  const [likedCourses, setLikedCourses] = useState({})
  const [userLikedCourseIds, setUserLikedCourseIds] = useState([])
  const [animatingHearts, setAnimatingHearts] = useState({})
  const [courseAccess, setCourseAccess] = useState({})
  // Add new state for locked/unlocked filter
  const [accessFilter, setAccessFilter] = useState("all") // "all", "locked", or "unlocked"

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [paginatedCourses, setPaginatedCourses] = useState([])
  const [totalPages, setTotalPages] = useState(1)

  const navigate = useNavigate()
  const { checkAuth, user } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)

  // Get userId from auth store
  const userId = user && user._id ? user._id : null

  useEffect(() => {
    const fetchCourses = async () => {
      try {

        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_PROXY}/course/courses`
        );
        setCourses(response.data);
        setFilteredCourses(response.data);

        const initialLikes = {};

        response.data.forEach((course) => {
          initialLikes[course._id] = course.likes || 0
        })
        setLikedCourses(initialLikes)

        setLoading(false)
      } catch (error) {
        console.error("Error fetching courses:", error)
        setLoading(false)
      }

    };
    setUserLikedCourseIds([]);
    // const fetchUserLikes = async () => {
    //   if (!currentUserId) return;
    //   try {
    //     const res = await axios.get(
    //       `${import.meta.env.VITE_API_PROXY}/user/likes/${currentUserId}`
    //     );
    //     setUserLikedCourseIds(res.data.likedCourseIds || []);
    //   } catch (err) {
    //     console.error(
    //       "Erreur lors de la récupération des likes utilisateur :",
    //       err
    //     );
    //   }
    // };

    fetchCourses();
    // fetchUserLikes();
  }, []);


  useEffect(() => {
    const checkCoursesAccess = async () => {
      if (!courses.length) return
      const access = {}
      for (const course of courses) {
        try {

          const response = await axios.get(
            `${import.meta.env.VITE_API_PROXY}/purchases/access/${course._id}`,
            {
              withCredentials: true,
            }
          );
          access[course._id] = response.data.hasAccess;

        } catch (err) {
          console.error(`Error checking access for course ${course._id}:`, err)
          access[course._id] = false
        }
      }
      setCourseAccess(access)
      setIsLoading(false)
    }

    checkCoursesAccess()
  }, [courses])

  useEffect(() => {
    let filtered = courses

    if (showingRecommendations && recommendations.length > 0) {
      console.log("Recommendations:", recommendations)

      // Assume recommendations contain courseId
      const recommendationIds = recommendations.map((rec) => rec.title)
      console.log("Recommendation titles:", recommendationIds)

      filtered = filtered.filter((course) => recommendationIds.includes(course.title))
      console.log("Filtered courses by recommendations:", filtered)

      // If no courses match recommendations, show a message and revert to all courses
      if (filtered.length === 0) {
        console.log("No matching courses found for recommendations")
        Swal.fire({
          icon: "info",
          title: "No Matching Courses",
          text: "We couldn't find any courses matching your recommendations. Showing all courses instead.",
          showConfirmButton: true,
        })
        setShowingRecommendations(false)
        filtered = courses
      }
    } else {
      // Apply regular filters
      if (selectedCategories.length > 0) {
        filtered = filtered.filter((course) => selectedCategories.includes(course.categorie))
      }

      if (selectedLevels.length > 0) {
        filtered = filtered.filter((course) => selectedLevels.includes(course.level))
      }

      filtered = filtered.filter((course) => course.price >= minPrice && course.price <= maxPrice)

      // Apply access filter
      if (accessFilter === "locked") {
        filtered = filtered.filter((course) => !courseAccess[course._id] && course.price > 0)
      } else if (accessFilter === "unlocked") {
        filtered = filtered.filter((course) => courseAccess[course._id] || course.price === 0)
      }

      if (popularityFilter === "most") {
        filtered = [...filtered].sort((a, b) => (b.likes || 0) - (a.likes || 0))
      } else if (popularityFilter === "least") {
        filtered = [...filtered].sort((a, b) => (a.likes || 0) - (b.likes || 0))
      }
    }

    setFilteredCourses(filtered)
    setCurrentPage(1)
  }, [
    selectedCategories,
    selectedLevels,
    minPrice,
    maxPrice,
    courses,
    popularityFilter,
    showingRecommendations,
    recommendations,
    accessFilter, // Add accessFilter to dependency array
    courseAccess, // Add courseAccess to dependency array
  ])

  useEffect(() => {
    const totalPages = Math.ceil(filteredCourses.length / itemsPerPage)
    setTotalPages(totalPages)

    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    setPaginatedCourses(filteredCourses.slice(startIndex, endIndex))
  }, [filteredCourses, currentPage, itemsPerPage])

  const handleChange = (_, newValue) => {
    setVal(newValue)
    setMinPrice(newValue[0])
    setMaxPrice(newValue[1])
  }

  const handleFilterChange = (filterName) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterName]: !prevFilters[filterName],
    }))
  }

  const handleCategoryChange = (category) => {
    setShowingRecommendations(false)
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const handleLevelChange = (level) => {
    setShowingRecommendations(false)
    setSelectedLevels((prev) => (prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]))
  }

  // Add handler for access filter
  const handleAccessFilter = (filterType) => {
    setShowingRecommendations(false)
    setAccessFilter(filterType)
  }

  const handleLikeClick = async (courseId) => {
    if (!userId) {
      Swal.fire({
        icon: "warning",
        title: "Please Log In",
        text: "You need to be logged in to like a course.",
        confirmButtonText: "Log In",
        showCancelButton: true,
        cancelButtonText: "Cancel",
        customClass: {
          confirmButton: "swal-custom-confirm-button",
          cancelButton: "swal-custom-cancel-button",
        },
      }).then((result) => {
        if (result.isConfirmed) navigate("/login")
      })
      return
    }

    if (userLikedCourseIds.includes(courseId)) {
      alert("Vous avez déjà liké ce cours.")
      return
    }

    try {
      setAnimatingHearts((prev) => ({
        ...prev,
        [courseId]: true,
      }))

      setTimeout(() => {
        setAnimatingHearts((prev) => ({
          ...prev,
          [courseId]: false,
        }))
      }, 1000)


      const res = await axios.post(
        `${import.meta.env.VITE_API_PROXY}/course/like/${courseId}`,
        {
          userId: currentUserId,
        }
      );


      const updatedCourse = res.data

      setLikedCourses((prev) => ({
        ...prev,
        [courseId]: updatedCourse.likes,
      }))
      setUserLikedCourseIds((prev) => [...prev, courseId])
    } catch (error) {
      console.error("Erreur lors du like :", error)
    }
  }

  const handlePopularityFilter = (type) => {
    setShowingRecommendations(false)
    setPopularityFilter(type)
  }

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
    document.querySelector(".course-lists")?.scrollIntoView({ behavior: "smooth" })
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
      document.querySelector(".course-lists")?.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
      document.querySelector(".course-lists")?.scrollIntoView({ behavior: "smooth" })
    }
  }

  const getPageNumbers = () => {
    const pageNumbers = []
    const maxPagesToShow = 5

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      pageNumbers.push(1)
      let startPage = Math.max(2, currentPage - 1)
      let endPage = Math.min(totalPages - 1, currentPage + 1)

      if (currentPage <= 2) {
        endPage = 4
      }
      if (currentPage >= totalPages - 1) {
        startPage = totalPages - 3
      }

      if (startPage > 2) {
        pageNumbers.push("...")
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i)
      }

      if (endPage < totalPages - 1) {
        pageNumbers.push("...")
      }

      pageNumbers.push(totalPages)
    }

    return pageNumbers
  }

  const categories = Array.from(new Set(courses.map((course) => course.categorie)))
  const levels = Array.from(new Set(courses.map((course) => course.level)))

  const handleCourseAccess = async (course, e) => {
    if (e) {
      e.preventDefault()
    }

    if (course.price === 0 || courseAccess[course._id]) {
      navigate(`/chapters/${course.slug}`)
      return
    }

    if (!user || user.balance < course.price) {
      Swal.fire({
        icon: "warning",
        title: "Insufficient Balance",
        text: `You need ${course.price} Trelix Coins to unlock this course. Your current balance is ${user ? user.balance : 0} Coins.`,
        confirmButtonText: "Go to Store",
        showCancelButton: true,
        cancelButtonText: "Cancel",
        customClass: {
          confirmButton: "swal-custom-confirm-button",
          cancelButton: "swal-custom-cancel-button",
        },
      }).then((result) => {
        if (result.isConfirmed) navigate("/store")
      })
      return
    }

    Swal.fire({
      title: `Purchase ${course.title}?`,
      text: `This course costs ${course.price} Trelix Coins. Your current balance is ${user.balance} Coins.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Purchase",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      customClass: {
        confirmButton: "swal-custom-confirm-button",
        cancelButton: "swal-custom-cancel-button",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.post(
            `${import.meta.env.VITE_API_PROXY}/purchases/purchase`,
            { courseId: course._id },
            { withCredentials: true },
          )
          Swal.fire({
            icon: "success",
            title: "Course Purchased!",
            text: response.data.message,
            confirmButtonText: "Go to Course",
            customClass: {
              confirmButton: "swal-custom-confirm-button",
              cancelButton: "swal-custom-cancel-button",
            },
          }).then(async () => {

              try {
                const badgeResponse = await axios.post(
                  `${import.meta.env.VITE_API_PROXY}/api/info/profile/badge`,
                  {
                    badge: "First Chapter Explorer Badge 🚀",
                    email: user.email,
                    badgeImage: "/assets/Badges/FirstCoursePurchase.png",
                    description: "Earned for purchasing your first chapter",
                  },
                  { withCredentials: true },
                )
                console.log("Badge awarded:", badgeResponse.data)
                Swal.fire({
                  icon: "success",
                  title: "Achievement Unlocked!",
                  text: "You've earned the 'First Chapter Explorer' badge for purchasing your first chapter!",
                  confirmButtonText: "Awesome!",
                 
                  
                })
              } catch (badgeError) {
                console.error("Error awarding badge:", badgeError)
              }
            

            setCourseAccess((prev) => ({ ...prev, [course._id]: true }))
            checkAuth()
            navigate(`/chapters/${course.slug}`)
          })
        } catch (err) {
          console.error("Purchase error:", err)
          Swal.fire({
            icon: "error",
            title: "Purchase Failed",
            text: err.response?.data?.message || "An error occurred while purchasing the course.",
            customClass: {
              confirmButton: "swal-custom-confirm-button",
            },
          })
        }
      }
    })
  }

  const fetchRecommendations = useCallback(async () => {
    setRecommendationsLoading(true)
    setError(null)
    setButtonClicked(true)

    setTimeout(() => {
      setButtonClicked(false)
    }, 600)

    try {
      const response = await axios.get(`https://trelix-xj5h.onrender.com/recommendation/recommendation`, {
        withCredentials: true,
      })

      console.log("Recommendations response:", response.data)

      if (response.data && response.data.recommendations && Array.isArray(response.data.recommendations)) {
        setRecommendations(response.data.recommendations)
        console.log("Set recommendations:", response.data.recommendations)

        if (response.data.recommendations.length === 0) {
          Swal.fire({
            icon: "info",
            title: "No Recommendations Yet",
            text: "We don't have enough data to make personalized recommendations yet. Try exploring more courses!",
            timer: 3000,
            showConfirmButton: false,
          })
          setShowingRecommendations(false)
        } else {
          setShowingRecommendations(true)
          Swal.fire({
            icon: "success",
            title: "Recommendations Ready!",
            text: `We've found ${response.data.recommendations.length} courses just for you.`,
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: "swal-custom-popup",
            },
          })
        }
      } else {
        throw new Error("Invalid recommendation data structure")
      }
    } catch (err) {
      setError("Failed to fetch recommendations")
      console.error("Recommendation error:", err)
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: "We couldn't load your recommendations. Please try again.",
        customClass: {
          confirmButton: "swal-custom-confirm-button",
        },
      })
      setShowingRecommendations(false)
    } finally {
      setRecommendationsLoading(false)
    }
  }, [])

  const useMockRecommendations = useCallback(() => {
    setRecommendationsLoading(true)
    setButtonClicked(true)

    setTimeout(() => {
      setButtonClicked(false)
      const mockRecommendations = courses.slice(0, Math.min(5, courses.length)).map((course) => ({
        courseId: course._id,
        score: 0.95 - Math.random() * 0.2,
      }))
      console.log("Using mock recommendations:", mockRecommendations)
      setRecommendations(mockRecommendations)
      setShowingRecommendations(true)
      setRecommendationsLoading(false)
      Swal.fire({
        icon: "success",
        title: "Mock Recommendations Ready!",
        text: "Using sample recommendations for testing.",
        timer: 2000,
        showConfirmButton: false,
      })
    }, 1000)
  }, [courses])

  const toggleRecommendations = useCallback(() => {
    if (!userId) {
      Swal.fire({
        icon: "warning",
        title: "Please Log In",
        text: "You need to be logged in to view personalized recommendations.",
        confirmButtonText: "Log In",
        showCancelButton: true,
        cancelButtonText: "Cancel",
        customClass: {
          confirmButton: "swal-custom-confirm-button",
          cancelButton: "swal-custom-cancel-button",
        },
      }).then((result) => {
        if (result.isConfirmed) navigate("/login")
      })
      return
    }

    if (!showingRecommendations) {
      if (recommendations.length > 0) {
        setShowingRecommendations(true)
        setButtonClicked(true)
        setTimeout(() => {
          setButtonClicked(false)
        }, 600)
      } else {
        fetchRecommendations().catch((err) => {
          console.error("Error in recommendation flow, using mock data:", err)
          useMockRecommendations()
        })
      }
    } else {
      setShowingRecommendations(false)
      setButtonClicked(true)
      setTimeout(() => {
        setButtonClicked(false)
      }, 600)
    }
  }, [showingRecommendations, recommendations, fetchRecommendations, useMockRecommendations, userId, navigate])

  useEffect(() => {
    // Inject custom SweetAlert2 styles
    const styleElement = document.createElement("style")
    styleElement.textContent = `
    .swal2-actions {
      width: 100%;
      margin-top: 1.5rem !important;
    }
    
    .swal2-confirm, .swal2-cancel {
      flex: 1;
      padding: 0.75rem 1.5rem !important;
      font-size: 1rem !important;
      margin: 0 0.5rem !important;
      min-width: 120px !important;
    }
    
    .swal2-title {
      font-size: 1.5rem !important;
      padding: 1rem 0 !important;
    }
    
    .swal2-html-container {
      font-size: 1rem !important;
      margin-top: 1rem !important;
      margin-bottom: 1rem !important;
    }
  `
    document.head.appendChild(styleElement)

    return () => {
      // Clean up when component unmounts
      document.head.removeChild(styleElement)
    }
  }, [])

  return (
    <div>
      <link rel="stylesheet" href="/assets/css/animation.css" />

      <style jsx>{`
        .recommendation-button {
          position: relative;
          overflow: hidden;
          padding: 12px 24px;
          border-radius: 50px;
          border: none;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(107, 114, 241, 0.3);
          min-width: 250px;
          outline: none;
          transform: translateY(0);
          z-index: 1;
          margin-bottom: 20px;
        }

        .recommendation-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(107, 114, 241, 0.5);
        }

        .recommendation-button:active {
          transform: translateY(0);
          box-shadow: 0 4px 15px rgba(107, 114, 241, 0.3);
        }

        .recommendation-button.clicked {
          animation: pulse 0.5s ease-in-out;
        }

        .recommendation-button.loading {
          background: linear-gradient(135deg, #4f46e5, #7c3aed);
          cursor: wait;
        }
        
        .recommendation-button.active {
          background: linear-gradient(135deg, #10b981, #059669);
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
        }
        
        .recommendation-button.active:hover {
          box-shadow: 0 8px 25px rgba(16, 185, 129, 0.5);
        }

        .button-content {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .sparkle-icon {
          animation: twinkle 1.5s infinite alternate;
        }

        .loader-icon {
          animation: spin 1s linear infinite;
        }

        .recommendation-button::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.3) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: rotate(30deg);
          animation: shimmer 4s infinite;
          z-index: 1;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .recommendation-button:hover::after {
          opacity: 1;
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%) rotate(30deg);
          }
          100% {
            transform: translateX(100%) rotate(30deg);
          }
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(0.97);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes twinkle {
          0% {
            opacity: 0.7;
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1.1);
          }
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        
        .recommendation-badge {
          display: inline-block;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          margin-left: 8px;
          box-shadow: 0 2px 5px rgba(107, 114, 241, 0.3);
        }
      `}</style>

      <section
        className="promo-sec"
        style={{
          background: 'url("images/promo-bg.jpg")no-repeat center / cover',
        }}
      >
        <div className="container text-center">
          <h1 className="display-2 text-white">Courses</h1>
          <nav aria-label="breadcrumb mt-0">
            <ol className="breadcrumb">
              <li className="breadcrumb-item active">Courses</li>
            </ol>
          </nav>
        </div>
      </section>

      <section className="courses-sec sec-padding">
        <div className="container">
          <div className="row">
            <div className="col-lg-4">
              <div className="widget">
                <h3 className="widget-title">Statistiques</h3>
                <div className="widget-inner text-center">
                  <a href="/chart" className="btn btn-primary d-flex align-items-center justify-content-center gap-2">
                    <i className="feather-icon icon-bar-chart" />
                    <span>Voir les statistiques</span>
                  </a>
                </div>
              </div>

              <aside className="sidebar sidebar-spacing">
                <div className="widget">
                  <h3 className="widget-title">Filter by Popularity</h3>
                  <div className="widget-inner">
                    <ul className="list-unstyled">
                      <li className="mb-2">
                        <button
                          className="btn btn-outline-primary w-100 text-start"
                          onClick={() => handlePopularityFilter("most")}
                        >
                          Most liked Courses
                        </button>
                      </li>
                      <li className="mb-2">
                        <button
                          className="btn btn-outline-secondary w-100 text-start"
                          onClick={() => handlePopularityFilter("least")}
                        >
                          Least liked Courses
                        </button>
                      </li>
                      <li>
                        <button
                          className="btn btn-outline-dark w-100 text-start"
                          onClick={() => handlePopularityFilter("all")}
                        >
                          Reset the filters
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Add new widget for locked/unlocked filter */}
                <div className="widget">
                  <h3 className="widget-title">Course Access</h3>
                  <div className="widget-inner">
                    <ul className="list-unstyled">
                      <li className="mb-2">
                        <button
                          className={`btn ${accessFilter === "unlocked" ? "btn-success" : "btn-outline-success"} w-100 text-start d-flex align-items-center justify-content-between`}
                          onClick={() => handleAccessFilter("unlocked")}
                        >
                          <span>Show Unlocked Courses</span>
                          <Unlock size={16} className="ms-2" />
                        </button>
                      </li>
                      <li className="mb-2">
                        <button
                          className={`btn ${accessFilter === "locked" ? "btn-danger" : "btn-outline-danger"} w-100 text-start d-flex align-items-center justify-content-between`}
                          onClick={() => handleAccessFilter("locked")}
                        >
                          <span>Show Locked Courses</span>
                          <Lock size={16} className="ms-2" />
                        </button>
                      </li>
                      <li>
                        <button
                          className={`btn ${accessFilter === "all" ? "btn-primary" : "btn-outline-primary"} w-100 text-start`}
                          onClick={() => handleAccessFilter("all")}
                        >
                          Show All Courses
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="widget">
                  <h3 className="widget-title">Categories</h3>
                  <div className="widget-inner">
                    <ul>
                      {categories.map((cat) => (
                        <li key={cat}>
                          <input
                            type="checkbox"
                            id={cat}
                            className="checkbox-custom"
                            checked={selectedCategories.includes(cat)}
                            onChange={() => handleCategoryChange(cat)}
                          />
                          <label htmlFor={cat} className="checkbox-custom-label">
                            {cat}
                          </label>
                          <span className="count">({courses.filter((c) => c.categorie === cat).length})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="widget">
                  <h3 className="widget-title">Price</h3>
                  <div className="widget-inner">
                    <Box sx={{ width: 250 }}>
                      <Slider
                        marks={marks}
                        step={10}
                        value={val}
                        valueLabelDisplay="auto"
                        min={MIN}
                        max={MAX}
                        onChange={handleChange}
                        valueLabelFormat={(value) => `${value}`}
                      />
                    </Box>
                  </div>
                </div>

                <div className="widget">
                  <h3 className="widget-title">Level</h3>
                  <div className="widget-inner">
                    <ul>
                      {levels.map((lvl) => (
                        <li key={lvl}>
                          <input
                            type="checkbox"
                            id={lvl}
                            className="checkbox-custom"
                            checked={selectedLevels.includes(lvl)}
                            onChange={() => handleLevelChange(lvl)}
                          />
                          <label htmlFor={lvl} className="checkbox-custom-label">
                            {lvl}
                          </label>
                          <span className="count">({courses.filter((c) => c.level === lvl).length})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </aside>
            </div>

            <div className="col-lg-8">
              <div className="course-filters d-flex justify-content-between align-items-center">
                <p>{filteredCourses.length} Courses found.</p>
                {filteredCourses.length > 0 && (
                  <p>
                    Showing {(currentPage - 1) * itemsPerPage + 1} -{" "}
                    {Math.min(currentPage * itemsPerPage, filteredCourses.length)} of {filteredCourses.length}
                  </p>
                )}
              </div>

              <div className="text-center mb-4">
                <button
                  className={`recommendation-button ${recommendationsLoading ? "loading" : ""} ${buttonClicked ? "clicked" : ""} ${showingRecommendations ? "active" : ""}`}
                  onClick={toggleRecommendations}
                  disabled={recommendationsLoading}
                  onMouseEnter={() => setButtonHover(true)}
                  onMouseLeave={() => setButtonHover(false)}
                >
                  <div className="button-content">
                    {recommendationsLoading ? (
                      <>
                        <ChevronRight className="loader-icon" size={20} />
                        <span>Finding perfect courses for you...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="sparkle-icon" size={20} />
                        <span>{showingRecommendations ? "Show All Courses" : "Show Recommended Courses"}</span>
                      </>
                    )}
                  </div>
                </button>
              </div>

              {showingRecommendations && recommendations.length > 0 && (
                <div className="alert alert-info d-flex align-items-center mb-4">
                  <Sparkles size={20} className="me-2" />
                  <div>
                    <strong>Personalized for You:</strong> Showing courses tailored to your preference.
                  </div>
                </div>
              )}

              {showingRecommendations && recommendations.length === 0 && !recommendationsLoading && (
                <div className="alert alert-warning d-flex align-items-center mb-4">
                  <i className="feather-icon icon-info me-2"></i>
                  <div>
                    <strong>No Recommendations Available:</strong> We don't have enough data to make personalized
                    recommendations yet. Try exploring more courses to get better recommendations!
                  </div>
                </div>
              )}

              {/* Add filter status message */}
              {accessFilter !== "all" && !showingRecommendations && (
                <div
                  className={`alert ${accessFilter === "unlocked" ? "alert-success" : "alert-danger"} d-flex align-items-center mb-4`}
                >
                  {accessFilter === "unlocked" ? (
                    <>
                      <Unlock size={20} className="me-2" />
                      <div>
                        <strong>Showing Unlocked Courses:</strong> Displaying courses you can access.
                      </div>
                    </>
                  ) : (
                    <>
                      <Lock size={20} className="me-2" />
                      <div>
                        <strong>Showing Locked Courses:</strong> Displaying courses you haven't purchased yet.
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="course-lists row gy-4 mt-3">
                {loading || isLoading ? (
                  <div className="row">
                    {[...Array(4)].map((_, index) => (
                      <div className="col-xl-6 col-md-6 mb-4" key={index}>
                        <div className="course-entry-3 card rounded-2 bg-white border">
                          <div className="card-media position-relative">
                            <div className="skeleton-box" style={{ height: "180px", width: "100%" }}></div>
                            <div
                              className="action-wishlist position-absolute text-white icon-xs rounded-circle skeleton-box"
                              style={{
                                top: "10px",
                                right: "10px",
                                width: "32px",
                                height: "32px",
                              }}
                            ></div>
                          </div>
                          <div className="card-body">
                            <div className="course-meta d-flex justify-content-between align-items-center mb-2">
                              <div className="d-flex align-items-center">
                                <div
                                  className="skeleton-box"
                                  style={{
                                    width: "20px",
                                    height: "20px",
                                    marginRight: "5px",
                                  }}
                                ></div>
                                <div className="skeleton-box" style={{ width: "30px", height: "16px" }}></div>
                              </div>
                              <div className="skeleton-box" style={{ width: "60px", height: "16px" }}></div>
                            </div>
                            <h3 className="sub-title mb-0">
                              <div className="skeleton-box" style={{ width: "80%", height: "24px" }}></div>
                            </h3>
                            <div className="author-meta small d-flex pt-2 justify-content-between">
                              <div className="skeleton-box" style={{ width: "100px", height: "14px" }}></div>
                              <div className="skeleton-box" style={{ width: "120px", height: "14px" }}></div>
                            </div>
                            <div className="course-footer d-flex align-items-center justify-content-between pt-3">
                              <div className="skeleton-box" style={{ width: "50px", height: "20px" }}></div>
                              <div className="skeleton-box" style={{ width: "100px", height: "20px" }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !isLoading && paginatedCourses.length > 0 ? (
                  paginatedCourses.map((course) => (
                    <div className="col-xl-6 col-md-6" key={course._id}>
                      <div className="course-entry-3 card rounded-2 bg-white border">
                        <div className="card-media position-relative">
                          <a
                            href="#"
                            onClick={(e) => handleCourseAccess(course, e)}
                            className="course-image-link"
                            style={{ cursor: "pointer" }}
                          >
                            <img
                              className="card-img-top"
                              src={
                                course.categorie === "OpenClassrooms"
                                  ? "assets/images/openclassrooms.jpg"
                                  : course.categorie === "OpenLearn"
                                    ? "assets/images/openlearn.png"
                                    : "assets/images/crs.png"
                              }
                              alt={course.title}
                            />
                            {course.price > 0 && !courseAccess[course._id] && (
                              <div className="course-lock-overlay">
                                <div className="lock-icon">
                                  <Lock size={24} className="text-white" />
                                </div>
                              </div>
                            )}
                          </a>
                          <a
                            href="#"
                            className={`action-wishlist position-absolute text-white icon-xs rounded-circle ${
                              animatingHearts[course._id] ? "heart-animation" : ""
                            }`}
                            onClick={(e) => {
                              e.preventDefault()
                              handleLikeClick(course._id)
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            <img
                              src="assets/images/icons/heart-fill.svg"
                              alt="Wishlist"
                              style={{ marginTop: "10px", marginLeft: "9px" }}
                              className={animatingHearts[course._id] ? "heart-pulse" : ""}
                            />
                            {animatingHearts[course._id] && (
                              <div className="heart-particles">
                                <span className="particle"></span>
                                <span className="particle"></span>
                                <span className="particle"></span>
                                <span className="particle"></span>
                                <span className="particle"></span>
                              </div>
                            )}
                          </a>
                        </div>
                        <div className="card-body">
                          <div className="course-meta d-flex justify-content-between align-items-center mb-2">
                            <div className="d-flex align-items-center">
                              <img src="assets/images/icons/star.png" alt="Rating" />
                              <strong className={animatingHearts[course._id] ? "like-count-animation" : ""}>
                                {likedCourses[course._id] ?? course.likes ?? 0}
                              </strong>
                              {showingRecommendations &&
                                recommendations.some((rec) => (rec.courseId || rec._id) === course._id) && (
                                  <span className="recommendation-badge">
                                    <Sparkles size={12} className="me-1" />
                                    Recommended
                                  </span>
                                )}
                            </div>
                            <span>{course.level}</span>
                          </div>
                          <h3 className="sub-title mb-0">
                            <a href="#" onClick={(e) => handleCourseAccess(course, e)} style={{ cursor: "pointer" }}>
                              {course.title}
                            </a>
                          </h3>
                          <div className="author-meta small d-flex pt-2 justify-content-between">
                            <span>By: {course.categorie}</span>
                            <span>{course.module?.name || "No module assigned"}</span>
                          </div>
                          <div className="course-footer d-flex align-items-center justify-content-between pt-3">
                            <div className="price">{course.price === 0 ? "Free" : `${course.price}🪙`}</div>
                            <button
                              onClick={() => handleCourseAccess(course)}
                              style={{
                                fontSize: "10px",
                              }}
                            >
                              {course.price > 0 && !courseAccess[course._id] ? (
                                <>
                                  <Lock className="inline mr-1" size={16} />{" "}

                                </>
                              ) : (
                                <>
                                  <Unlock className="inline mr-1" size={16} />{" "}

                                </>
                              )}
                              <i className="feather-icon icon-arrow-right ml-1" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-12 text-center">
                    <p>Aucun cours disponible.</p>
                  </div>
                )}
              </div>

              {filteredCourses.length > itemsPerPage && (
                <nav aria-label="Course pagination" className="mt-4">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                      <button className="page-link" onClick={handlePrevPage} aria-label="Previous">
                        <ChevronLeft size={16} />
                        <span className="sr-only">Previous</span>
                      </button>
                    </li>
                    {getPageNumbers().map((page, index) =>
                      page === "..." ? (
                        <li key={`ellipsis-${index}`} className="page-item disabled">
                          <span className="page-link">...</span>
                        </li>
                      ) : (
                        <li key={page} className={`page-item ${currentPage === page ? "active" : ""}`}>
                          <button className="page-link" onClick={() => handlePageChange(page)}>
                            {page}
                          </button>
                        </li>
                      ),
                    )}
                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                      <button className="page-link" onClick={handleNextPage} aria-label="Next">
                        <ChevronRight size={16} />
                        <span className="sr-only">Next</span>
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Allcourse
