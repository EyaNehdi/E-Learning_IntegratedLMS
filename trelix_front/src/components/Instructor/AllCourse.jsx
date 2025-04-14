"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import Box from "@mui/material/Box"
import Slider from "@mui/material/Slider"

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
  const [filters, setFilters] = useState({ frontendDev: false, backendDev: false })
  const [val, setVal] = useState([MIN, MAX])
  const [minPrice, setMinPrice] = useState(MIN)
  const [maxPrice, setMaxPrice] = useState(MAX)
  const [popularityFilter, setPopularityFilter] = useState("all")

  const [likedCourses, setLikedCourses] = useState({})
  const [userLikedCourseIds, setUserLikedCourseIds] = useState([])
  const [animatingHearts, setAnimatingHearts] = useState({})

  const currentUserId = "user123" // à remplacer dynamiquement

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true)
        const response = await axios.get("http://localhost:5000/course/courses")
        setCourses(response.data)
        setFilteredCourses(response.data)

        const initialLikes = {}
        response.data.forEach((course) => {
          initialLikes[course._id] = course.likes || 0
        })
        setLikedCourses(initialLikes)

        setLoading(false)
      } catch (error) {
        console.error("Error fetching courses:", error)
        setLoading(false)
      }
    }

    const fetchUserLikes = async () => {
      if (!currentUserId) return
      try {
        const res = await axios.get(`http://localhost:5000/user/likes/${currentUserId}`)
        setUserLikedCourseIds(res.data.likedCourseIds || [])
      } catch (err) {
        console.error("Erreur lors de la récupération des likes utilisateur :", err)
      }
    }

    fetchCourses()
    fetchUserLikes()
  }, [])

  useEffect(() => {
    let filtered = courses

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((course) => selectedCategories.includes(course.categorie))
    }

    if (selectedLevels.length > 0) {
      filtered = filtered.filter((course) => selectedLevels.includes(course.level))
    }

    filtered = filtered.filter((course) => course.price >= minPrice && course.price <= maxPrice)

    if (popularityFilter === "most") {
      filtered = [...filtered].sort((a, b) => (b.likes || 0) - (a.likes || 0))
    } else if (popularityFilter === "least") {
      filtered = [...filtered].sort((a, b) => (a.likes || 0) - (b.likes || 0))
    }

    setFilteredCourses(filtered)
  }, [selectedCategories, selectedLevels, minPrice, maxPrice, courses, popularityFilter])

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
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const handleLevelChange = (level) => {
    setSelectedLevels((prev) => (prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]))
  }

  const handleLikeClick = async (courseId) => {
    if (!currentUserId) {
      alert("Vous devez être connecté pour liker un cours.")
      return
    }

    if (userLikedCourseIds.includes(courseId)) {
      alert("Vous avez déjà liké ce cours.")
      return
    }

    try {
      // Déclencher l'animation
      setAnimatingHearts((prev) => ({
        ...prev,
        [courseId]: true,
      }))

      // Réinitialiser l'état d'animation après la fin de l'animation
      setTimeout(() => {
        setAnimatingHearts((prev) => ({
          ...prev,
          [courseId]: false,
        }))
      }, 1000)

      const res = await axios.post(`http://localhost:5000/course/like/${courseId}`, {
        userId: currentUserId,
      })

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
    setPopularityFilter(type)
  }

  const categories = Array.from(new Set(courses.map((course) => course.categorie)))
  const levels = Array.from(new Set(courses.map((course) => course.level)))

  return (
    <div>
      <link rel="stylesheet" href="/assets/css/animation.css" />

      <section className="promo-sec" style={{ background: 'url("images/promo-bg.jpg")no-repeat center / cover' }}>
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
                  <h3 className="widget-title">Filtrer par popularité</h3>
                  <div className="widget-inner d-flex flex-column gap-2">
                    <button className="btn btn-outline-primary" onClick={() => handlePopularityFilter("most")}>
                      Cours les plus likés
                    </button>
                    <button className="btn btn-outline-secondary" onClick={() => handlePopularityFilter("least")}>
                      Cours les moins likés
                    </button>
                    <button className="btn btn-outline-dark" onClick={() => handlePopularityFilter("all")}>
                      Réinitialiser le filtre
                    </button>
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
                <p>{filteredCourses.length} cours trouvés</p>
              </div>

              <div className="course-lists row gy-4 mt-3">
                {loading ? (
                  <div className="col-12 text-center">
                    <p>Chargement...</p>
                  </div>
                ) : filteredCourses.length > 0 ? (
                  filteredCourses.map((course) => (
                    <div className="col-xl-6 col-md-6" key={course._id}>
                      <div className="course-entry-3 card rounded-2 bg-white border">
                        <div className="card-media position-relative">
                          <a href={`/chapters/${course._id}`}>
                            <img
                              className="card-img-top"
                              src={
                                course.categorie === "OpenClassrooms"
                                  ? "assets/images/openclassrooms.jpg"
                                  : "assets/images/crs.png"
                              }
                              alt={course.title}
                            />
                          </a>
                          <a
                            href="#"
                            className={`action-wishlist position-absolute text-white icon-xs rounded-circle ${animatingHearts[course._id] ? "heart-animation" : ""}`}
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
                            </div>
                            <span>{course.level}</span>
                          </div>
                          <h3 className="sub-title mb-0">
                            <a href={`/single-course/${course._id}`}>{course.title}</a>
                          </h3>
                          <div className="author-meta small d-flex pt-2 justify-content-between">
                            <span>By: {course.categorie}</span>
                            <span>{course.module?.name || "No module assigned"}</span>
                          </div>
                          <div className="course-footer d-flex align-items-center justify-content-between pt-3">
                            <div className="price">
                              {course.price === 0 ? "Free" : `${course.price}$`} <del>$35.00</del>
                            </div>
                            <a href={`/enroll/${course._id}`}>
                              Enroll Now <i className="feather-icon icon-arrow-right" />
                            </a>
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
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Allcourse
