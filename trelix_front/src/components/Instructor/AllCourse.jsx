import { useState, useEffect } from "react";
import axios from "axios";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useAuthStore } from "../../store/authStore";
import { Lock, Unlock, ChevronLeft, ChevronRight } from "lucide-react";
import "./stylecontent.css";

const MAX = 50;
const MIN = 0;
const marks = [
  { value: MIN, label: `${MIN} min` },
  { value: MAX, label: `${MAX} max` },
];

function Allcourse() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [filters, setFilters] = useState({
    frontendDev: false,
    backendDev: false,
  });
  const [val, setVal] = useState([MIN, MAX]);
  const [minPrice, setMinPrice] = useState(MIN);
  const [maxPrice, setMaxPrice] = useState(MAX);
  const [popularityFilter, setPopularityFilter] = useState("all");

  const [likedCourses, setLikedCourses] = useState({});
  const [userLikedCourseIds, setUserLikedCourseIds] = useState([]);
  const [animatingHearts, setAnimatingHearts] = useState({});
  const [courseAccess, setCourseAccess] = useState({});

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [paginatedCourses, setPaginatedCourses] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  const currentUserId = "user123"; // à remplacer dynamiquement
  const navigate = useNavigate();
  const { checkAuth, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:5000/course/courses"
        );
        setCourses(response.data);
        setFilteredCourses(response.data);

        const initialLikes = {};
        response.data.forEach((course) => {
          initialLikes[course._id] = course.likes || 0;
        });
        setLikedCourses(initialLikes);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setLoading(false);
      }
    };
    setUserLikedCourseIds([]);
    // const fetchUserLikes = async () => {
    //   if (!currentUserId) return;
    //   try {
    //     const res = await axios.get(
    //       `http://localhost:5000/user/likes/${currentUserId}`
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
      if (!courses.length) return;
      const access = {};
      for (const course of courses) {
        try {
          const response = await axios.get(
            `http://localhost:5000/purchases/access/${course._id}`,
            {
              withCredentials: true,
            }
          );
          access[course._id] = response.data.hasAccess;
        } catch (err) {
          console.error(`Error checking access for course ${course._id}:`, err);
          access[course._id] = false;
        }
      }
      setCourseAccess(access);
      setIsLoading(false);
    };

    checkCoursesAccess();
  }, [courses]);

  useEffect(() => {
    let filtered = courses;

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((course) =>
        selectedCategories.includes(course.categorie)
      );
    }

    if (selectedLevels.length > 0) {
      filtered = filtered.filter((course) =>
        selectedLevels.includes(course.level)
      );
    }

    filtered = filtered.filter(
      (course) => course.price >= minPrice && course.price <= maxPrice
    );

    if (popularityFilter === "most") {
      filtered = [...filtered].sort((a, b) => (b.likes || 0) - (a.likes || 0));
    } else if (popularityFilter === "least") {
      filtered = [...filtered].sort((a, b) => (a.likes || 0) - (b.likes || 0));
    }

    setFilteredCourses(filtered);

    // Reset to first page when filters change
    setCurrentPage(1);
  }, [
    selectedCategories,
    selectedLevels,
    minPrice,
    maxPrice,
    courses,
    popularityFilter,
  ]);

  // Update paginated courses whenever filtered courses or current page changes
  useEffect(() => {
    const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
    setTotalPages(totalPages);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedCourses(filteredCourses.slice(startIndex, endIndex));
  }, [filteredCourses, currentPage, itemsPerPage]);

  const handleChange = (_, newValue) => {
    setVal(newValue);
    setMinPrice(newValue[0]);
    setMaxPrice(newValue[1]);
  };

  const handleFilterChange = (filterName) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterName]: !prevFilters[filterName],
    }));
  };

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleLevelChange = (level) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  const handleLikeClick = async (courseId) => {
    if (!currentUserId) {
      alert("Vous devez être connecté pour liker un cours.");
      return;
    }

    if (userLikedCourseIds.includes(courseId)) {
      alert("Vous avez déjà liké ce cours.");
      return;
    }

    try {
      // Déclencher l'animation
      setAnimatingHearts((prev) => ({
        ...prev,
        [courseId]: true,
      }));

      // Réinitialiser l'état d'animation après la fin de l'animation
      setTimeout(() => {
        setAnimatingHearts((prev) => ({
          ...prev,
          [courseId]: false,
        }));
      }, 1000);

      const res = await axios.post(
        `http://localhost:5000/course/like/${courseId}`,
        {
          userId: currentUserId,
        }
      );

      const updatedCourse = res.data;

      setLikedCourses((prev) => ({
        ...prev,
        [courseId]: updatedCourse.likes,
      }));
      setUserLikedCourseIds((prev) => [...prev, courseId]);
    } catch (error) {
      console.error("Erreur lors du like :", error);
    }
  };

  const handlePopularityFilter = (type) => {
    setPopularityFilter(type);
  };

  // Pagination handlers
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top of course list
    document
      .querySelector(".course-lists")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      document
        .querySelector(".course-lists")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      document
        .querySelector(".course-lists")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Generate page numbers
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total pages are less than max pages to show
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);

      // Calculate start and end of page range
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Adjust if at the beginning
      if (currentPage <= 2) {
        endPage = 4;
      }

      // Adjust if at the end
      if (currentPage >= totalPages - 1) {
        startPage = totalPages - 3;
      }

      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pageNumbers.push("...");
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push("...");
      }

      // Always show last page
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  const categories = Array.from(
    new Set(courses.map((course) => course.categorie))
  );
  const levels = Array.from(new Set(courses.map((course) => course.level)));

  // Unified function to handle course access (used for image, title, and button clicks)
  const handleCourseAccess = async (course, e) => {
    // If an event is provided, prevent default behavior
    if (e) {
      e.preventDefault();
    }

    if (course.price === 0 || courseAccess[course._id]) {
      navigate(`/chapters/${course.slug}`);
      return;
    }

    // Check balance before showing purchase prompt
    if (user.balance < course.price) {
      Swal.fire({
        icon: "warning",
        title: "Insufficient Balance",
        text: `You need ${course.price} Trelix Coins to unlock this course. Your current balance is ${user.balance} Coins.`,
        confirmButtonText: "Go to Store",
        showCancelButton: true,
        cancelButtonText: "Cancel",
        customClass: {
          confirmButton: "swal-custom-confirm-button",
          cancelButton: "swal-custom-cancel-button",
        },
      }).then((result) => {
        if (result.isConfirmed) navigate("/store");
      });
      return;
    }

    // Show SweetAlert for paid, unpurchased course
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
            "http://localhost:5000/purchases/purchase",
            { courseId: course._id },
            { withCredentials: true }
          );
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
                  "http://localhost:5000/api/info/profile/badge",
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
            checkAuth() // Update user balance
            navigate(`/chapters/${course.slug}`);
          })

        } catch (err) {
          console.error("Purchase error:", err);
          Swal.fire({
            icon: "error",
            title: "Purchase Failed",
            text:
              err.response?.data?.message ||
              "An error occurred while purchasing the course.",
            customClass: {
              confirmButton: "swal-custom-confirm-button",
            },
          });
        }
      }
    });
  };

  return (
    <div>
      <link rel="stylesheet" href="/assets/css/animation.css" />

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
                  <a
                    href="/chart"
                    className="btn btn-primary d-flex align-items-center justify-content-center gap-2"
                  >
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
                          <label
                            htmlFor={cat}
                            className="checkbox-custom-label"
                          >
                            {cat}
                          </label>
                          <span className="count">
                            ({courses.filter((c) => c.categorie === cat).length}
                            )
                          </span>
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
                          <label
                            htmlFor={lvl}
                            className="checkbox-custom-label"
                          >
                            {lvl}
                          </label>
                          <span className="count">
                            ({courses.filter((c) => c.level === lvl).length})
                          </span>
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
                    {Math.min(
                      currentPage * itemsPerPage,
                      filteredCourses.length
                    )}{" "}
                    of {filteredCourses.length}
                  </p>
                )}
              </div>

              <div className="course-lists row gy-4 mt-3">
                {loading || isLoading ? (
                  <div className="row">
                    {[...Array(4)].map((_, index) => (
                      <div className="col-xl-6 col-md-6 mb-4" key={index}>
                        <div className="course-entry-3 card rounded-2 bg-white border">
                          {/* Image placeholder */}
                          <div className="card-media position-relative">
                            <div
                              className="skeleton-box"
                              style={{ height: "180px", width: "100%" }}
                            ></div>
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

                          {/* Card body */}
                          <div className="card-body">
                            {/* Rating and level */}
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
                                <div
                                  className="skeleton-box"
                                  style={{ width: "30px", height: "16px" }}
                                ></div>
                              </div>
                              <div
                                className="skeleton-box"
                                style={{ width: "60px", height: "16px" }}
                              ></div>
                            </div>

                            {/* Title */}
                            <h3 className="sub-title mb-0">
                              <div
                                className="skeleton-box"
                                style={{ width: "80%", height: "24px" }}
                              ></div>
                            </h3>

                            {/* Author and module */}
                            <div className="author-meta small d-flex pt-2 justify-content-between">
                              <div
                                className="skeleton-box"
                                style={{ width: "100px", height: "14px" }}
                              ></div>
                              <div
                                className="skeleton-box"
                                style={{ width: "120px", height: "14px" }}
                              ></div>
                            </div>

                            {/* Footer with price and button */}
                            <div className="course-footer d-flex align-items-center justify-content-between pt-3">
                              <div
                                className="skeleton-box"
                                style={{ width: "50px", height: "20px" }}
                              ></div>
                              <div
                                className="skeleton-box"
                                style={{ width: "100px", height: "20px" }}
                              ></div>
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
                          {/* Modified: Image click now triggers handleCourseAccess */}
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
                            {/* Add lock overlay for paid courses that aren't purchased */}
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
                              animatingHearts[course._id]
                                ? "heart-animation"
                                : ""
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              handleLikeClick(course._id);
                            }}
                            style={{ cursor: "pointer" }}
                          >
                            <img
                              src="assets/images/icons/heart-fill.svg"
                              alt="Wishlist"
                              style={{ marginTop: "10px", marginLeft: "9px" }}
                              className={
                                animatingHearts[course._id] ? "heart-pulse" : ""
                              }
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
                              <img
                                src="assets/images/icons/star.png"
                                alt="Rating"
                              />
                              <strong
                                className={
                                  animatingHearts[course._id]
                                    ? "like-count-animation"
                                    : ""
                                }
                              >
                                {likedCourses[course._id] ?? course.likes ?? 0}
                              </strong>
                            </div>
                            <span>{course.level}</span>
                          </div>
                          <h3 className="sub-title mb-0">
                            {/* Modified: Title click now triggers handleCourseAccess */}
                            <a
                              href="#"
                              onClick={(e) => handleCourseAccess(course, e)}
                              style={{ cursor: "pointer" }}
                            >
                              {course.title}
                            </a>
                          </h3>
                          <div className="author-meta small d-flex pt-2 justify-content-between">
                            <span>By: {course.categorie}</span>
                            <span>
                              {course.module?.name || "No module assigned"}
                            </span>
                          </div>
                          <div className="course-footer d-flex align-items-center justify-content-between pt-3">
                            <div className="price">
                              {course.price === 0
                                ? "Free"
                                : `${course.price}🪙`}
                            </div>
                            {/* Button now uses the same handler function */}
                            <button
                              onClick={() => handleCourseAccess(course)}
                              className="btn btn-link p-0"
                            >
                              {course.price > 0 && !courseAccess[course._id] ? (
                                <>
                                  <Lock className="inline mr-1" size={16} />{" "}
                                  Unlock
                                </>
                              ) : (
                                <>
                                  <Unlock className="inline mr-1" size={16} />{" "}
                                  Access Course
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

              {/* Pagination Controls */}
              {filteredCourses.length > itemsPerPage && (
                <nav aria-label="Course pagination" className="mt-4">
                  <ul className="pagination justify-content-center">
                    <li
                      className={`page-item ${
                        currentPage === 1 ? "disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={handlePrevPage}
                        aria-label="Previous"
                      >
                        <ChevronLeft size={16} />
                        <span className="sr-only">Previous</span>
                      </button>
                    </li>

                    {getPageNumbers().map((page, index) =>
                      page === "..." ? (
                        <li
                          key={`ellipsis-${index}`}
                          className="page-item disabled"
                        >
                          <span className="page-link">...</span>
                        </li>
                      ) : (
                        <li
                          key={page}
                          className={`page-item ${
                            currentPage === page ? "active" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </button>
                        </li>
                      )
                    )}

                    <li
                      className={`page-item ${
                        currentPage === totalPages ? "disabled" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={handleNextPage}
                        aria-label="Next"
                      >
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
  );
}

export default Allcourse;
