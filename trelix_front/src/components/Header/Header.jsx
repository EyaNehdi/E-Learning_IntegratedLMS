import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useProfileStore } from "../../store/profileStore";
import "./Header.css";
import CloseIcon from "@mui/icons-material/Close";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import Tooltip from "@mui/material/Tooltip";
import MobileMenu from "./MobileMenu";
import axios from "axios";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
 
  const [filteredCourses, setFilteredCourses] = useState([])
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null)
  const { isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()
  const { user, fetchUser, clearUser } = useProfileStore()
  const location = useLocation()

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleLogout = () => {
    logout();
    clearUser();
    navigate("/");
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true)
        const response = await axios.get("http://localhost:5000/course/courses")
        setCourses(response.data)
        setFilteredCourses(response.data)
        setLoading(false)
      } catch (err) {
        console.error("Erreur lors du chargement des cours:", err)
        setError("Impossible de charger les cours. Veuillez réessayer plus tard.")
        setLoading(false)
      }
    }

    fetchCourses()
    fetchUser()
  }, [fetchUser])
  
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCourses(courses);
    } else {
      const filtered = courses.filter((course) =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCourses(filtered);
  
      // Vérifie que l'objet global est défini avant de l'utiliser
      if (window.courseSearchState) {
        window.courseSearchState.query = searchQuery;
        window.courseSearchState.notifyListeners(searchQuery);
      }
    }
  }, [searchQuery, courses]);

  return (
    <>
      <header className="header header-1">
        {/* Section: blue bar header */}
        <div className="sticky-height" />
        <div className="header-top bg-primary text-info text-uppercase">
          <div className="marquee">
            <p>
              <span>Learn Today Lead Tomorrow</span>
              <span>Education is the dreams</span>
              <span>Education is a Way to Success in Life</span>
              <span>Better Education Improves The Nation</span>
              <span>Learn Today Lead Tomorrow</span>
            </p>
          </div>
        </div>

        {/* Search panel offcanvas */}
        <div className="search-popup offcanvas offcanvas-top" id="offcanvas-search" data-bs-scroll="true">
          <div className="container d-flex flex-row py-5 align-items-center position-relative">
            <button
              type="button"
              className="btn-close bg-primary rounded-5"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            />
            <div className="col-lg-9 mx-auto">
              <form className="search-form w-100 mb-5">
                <input
                  id="search-form"
                  type="text"
                  className="form-control shadow-1"
                  placeholder="Type keyword and hit enter"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>

              {loading ? (
                <div className="text-center">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="alert alert-danger">{error}</div>
              ) : (
                <div className="product-wrap d-block">
                  <h6>{searchQuery ? `Résultats pour "${searchQuery}"` : "Our Best Selling Courses"}</h6>
                  {filteredCourses.length > 0 ? (
                    <div className="row mt-3">
                      {filteredCourses.map((course) => (
                        <div className="col-sm-4 mb-4" key={course._id || course.id}>
                          <div className="course-entry-3 card rounded-2 border shadow-1">
                            <div className="card-media position-relative">
                            <a href={`/chapters/${course._id}`}>
                                <img
                                  className="card-img-top"
                                  src={course.image || "assets/images/course1.jpg"}
                                  alt={course.title}
                                />
                              </a>
                            </div>
                            <div className="card-body p-3">
                              <div className="d-flex justify-content-between align-items-center small">
                                <div className="d-flex align-items-center small">
                                  
                                  <span className="rating-count">({course.reviews || 0})</span>
                                </div>
                              </div>
                              <h3 className="display-6 mt-1">
                                <a href={`/courses/${course._id || course.id}`}>{course.title}</a>
                              </h3>
                              <span className="fw-bold">${course.price?.toFixed(2) || "0.00"}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="alert alert-info mt-3">Aucun cours ne correspond à votre recherche.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section: Navbar*/}
        <div className="header-nav-wrapper header-sticky">
          <nav className="navbar navbar-expand-xl nav-center">
            <div className="container navbar-line pe-0">
              <div className="row align-items-center justify-content-between flex-nowrap w-100">
                {/* Logo */}
                <div className="col-auto py-0">
                  <a className=" align-items-center" href="/">
                    <img
                      src="/assets/images/ss.png"
                      alt="Logo"
                      className="d-none py-0 d-xl-block"
                    />
                    <img
                      src="/assets/images/ss.png"
                      alt="Logo"
                      className="d-xl-none py-0"
                      style={{ maxWidth: "100px" }}
                    />
                  </a>
                </div>
                {/* Navbar elements*/}
                <div className="col-auto header-actions position-relative order-xl-2 d-flex align-items-center">
                  <div className="offcanvas offcanvas-start offcanvas-nav">
                    <div className="offcanvas-body pt-0 col d-none d-md-flex align-items-center justify-content-center">
                      <ul className="navbar-nav align-items-lg-center">
                        <li className="nav-item dropdown">
                          <a
                            href="/"
                            role="button"
                            aria-expanded="false"
                            className="nav-link px-3 px-xl-4"
                            style={{
                              paddingInlineEnd: "40px",
                              fontWeight: "bold",
                              fontSize: "20px",
                            }}
                          >
                            Home
                          </a>
                        </li>
                        <li className="nav-item dropdown">
                          <a
                            href="#"
                            role="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            className="nav-link px-3 px-xl-4"
                            style={{
                              paddingInline: "40px",
                              fontWeight: "bold",
                              fontSize: "20px",
                            }}
                          >
                            Dashboard
                          </a>
                        </li>
                        <li className="nav-item dropdown">
                          <a
                            href="/allcours"
                            role="button"
                            aria-expanded="false"
                            className="nav-link px-3 px-xl-4"
                            style={{
                              paddingInline: "40px",
                              fontWeight: "bold",
                              fontSize: "20px",
                            }}
                          >
                            Courses
                          </a>
                        </li>
                        <li className="nav-item dropdown">
                          <a
                            href="/leaderboard"
                            role="button"
                            className="nav-link px-3 px-xl-4"
                            style={{
                              paddingInline: "40px",
                              fontWeight: "bold",
                              fontSize: "20px",
                            }}
                          >
                            Leaderboard
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="col-auto header-actions position-relative order-xl-2 d-flex align-items-center">
                  {/* Search Icon */}
                  <a
                    className="text-reset icon rounded-5 bg-shade"
                    href="#"
                    data-bs-toggle="offcanvas"
                    data-bs-target="#offcanvas-search"
                  >
                    <i className="feather-icon icon-search" />
                  </a>

                  {/* authenticated layout */}
                  {isAuthenticated ? (
                    <div className="d-flex justify-content-center align-items-center user-dropdown">
                      <div>
                        <a
                          className="text-reset icon rounded-5 bg-shade"
                          role="button"
                          onClick={() => setMenuOpen(!menuOpen)}
                        >
                          <i className="feather-icon icon-user" />
                        </a>
                        {menuOpen && (
                          <div
                            className={`admin-menu pt-3 bg-white ${menuOpen ? "open" : ""
                              }`}
                          >
                            <div className="d-flex avatar border-bottom">
                              <div
                                className="avatar p-2 rounded-circle d-flex align-items-center justify-content-center"
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  backgroundColor: user?.profilePhoto
                                    ? "transparent"
                                    : "#007bff",
                                  fontSize: "20px",
                                  fontWeight: "bold",
                                  color: "#fff",
                                  textTransform: "uppercase",
                                }}
                              >
                                {user?.profilePhoto ? (
                                  <img
                                    src={`http://localhost:5000${user.profilePhoto}`}
                                    className="img-fluid border rounded-circle"
                                    alt="Avatar"
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                ) : (
                                  <span>
                                    {user?.firstName ? (
                                      <>
                                        {user.firstName.charAt(0)}
                                        {user.lastName.charAt(0)}
                                      </>
                                    ) : (
                                      "?"
                                    )}
                                  </span>
                                )}
                              </div>
                              <div className="d-flex avatar border-bottom ps-2 pb-3">
                                {user ? (
                                  <h6 className="mb-0">
                                    {user.firstName} {user.lastName}
                                  </h6>
                                ) : (
                                  <h6 className="mb-0">
                                    Please login, you don't have an account
                                  </h6>
                                )}
                                <small>{user.role}</small>
                              </div>
                            </div>
                            <nav className="dashboard-nav mt-1">
                              <ul className="list-unstyled nav">
                                {location.pathname !== "/home" && (
                                  <li>
                                    <a className="nav-link" href="/home">
                                      <i className="feather-icon icon-home" />
                                      <span>Home</span>
                                    </a>
                                  </li>
                                )}
                                <li>
                                  <a className="nav-link" href="/profile">
                                    <i className="feather-icon icon-user" />
                                    <span>My Profile</span>
                                  </a>
                                </li>
                                {/* <li>
                                  <a
                                    className="nav-link"
                                    href="instructor-enrolled-courses.html"
                                  >
                                    <i className="feather-icon icon-book-open" />
                                    <span>Enrolled Courses</span>
                                  </a>
                                </li> */}
                                {/* <li>
                                  <a
                                    className="nav-link"
                                    href="instructor-wishlist.html"
                                  >
                                    <i className="feather-icon icon-gift" />
                                    <span>Wishlist</span>
                                  </a>
                                </li> */}
                                {/* <li>
                                  <a
                                    className="nav-link"
                                    href="instructor-reviews.html"
                                  >
                                    <i className="feather-icon icon-star" />
                                    <span>Reviews</span>
                                  </a>
                                </li> */}
                                {/* <li>
                                  <a
                                    className="nav-link"
                                    href="instructor-my-quiz-attempts.html"
                                  >
                                    <i className="feather-icon icon-box" />
                                    <span>My Quiz Attempts</span>
                                  </a>
                                </li> */}
                                <li>
                                  <a
                                    className="nav-link"
                                    href="/profile/settings"
                                  >
                                    <i className="feather-icon icon-shopping-bag" />
                                    <span>Security</span>
                                  </a>
                                </li>
                                <li>
                                  <a
                                    className="nav-link"
                                    href="/certificates"
                                  >
                                    <i className="feather-icon icon-award" />
                                    <span>View Certificates</span>
                                  </a>
                                </li>
                                <ul>
                                  {user?.role === "instructor" && (
                                    <>
                                      <li>
                                        <a className="nav-link active" href="/profile/list">
                                          <i className="feather-icon icon-book" />
                                          <span>My Courses</span>
                                        </a>
                                      </li>
                                      <li>
                                        <a className="nav-link" href="/profile/allquiz">
                                          <i className="feather-icon icon-briefcase" />
                                          <span>My Quizs</span>
                                        </a>
                                      </li>
                                      <li>
                                        <a className="nav-link" href="/profile/Allexams">
                                          <i className="feather-icon icon-cpu" />
                                          <span>My Exams</span>
                                        </a>
                                      </li>
                                      <li>
                                        <a className="nav-link" href="/profile/addchapter">
                                          <i className="feather-icon icon-bell" />
                                          <span>My Chapters</span>
                                        </a>
                                      </li>
                                    </>
                                  )}
                                </ul>
                                <li className="border-bottom" />
                                <li>
                                  <a
                                    className="nav-link"
                                    href="instructor-settings.html"
                                  >
                                    <i className="feather-icon icon-settings" />
                                    <span>Settings</span>
                                  </a>
                                </li>
                                <li>
                                  <a
                                    className="nav-link"
                                    href="#"
                                    onClick={handleLogout}
                                  >
                                    <i className="feather-icon icon-log-out" />
                                    <span>Logout</span>
                                  </a>
                                </li>
                              </ul>
                            </nav>
                          </div>
                        )}
                      </div>
                      <div>
                        {user ? (
                          <div className="d-none d-sm-flex flex-nowrap align-items-center">
                            Welcome,{" "}
                            <Tooltip
                              title={
                                <div>
                                  <div>Trelix account ({user.role})</div>
                                  <div>Email: {user?.email}</div>
                                  <div>
                                    Name: {user?.firstName} {user?.lastName}
                                  </div>
                                </div>
                              }
                              arrow
                              placement="bottom"
                            >
                              <span
                                className="text-nowrap"
                                style={{
                                  cursor: "pointer",
                                  marginLeft: "4px",
                                }}
                              >
                                {user?.firstName} {user?.lastName}
                              </span>
                            </Tooltip>
                          </div>
                        ) : (
                          <></>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Public layout: Sign Up and Sign In Buttons */}
                      <div className="d-flex gap-2">
                        {/* Sign Up and Sign In Buttons */}
                        <div className="d-none d-md-flex gap-2">
                          <a
                            href="/signup"
                            className="btn fs-6 fs-md-5 fs-lg-4"
                            style={{
                              backgroundColor: "#6045FF",
                              whiteSpace: "nowrap",
                            }}
                          >
                            Sign Up
                          </a>
                          <a
                            href="/login"
                            className="btn fs-6 fs-md-5 fs-lg-4"
                            style={{
                              backgroundColor: "#6045FF",
                              whiteSpace: "nowrap",
                            }}
                          >
                            Sign In
                          </a>
                        </div>
                      </div>
                    </>
                  )}
                  {/* Mobile Menu Toggle Button */}
                  <button
                    onClick={toggleMobileMenu}
                    className="mobile-menu-button d-md-none"
                  >
                    {mobileMenuOpen ? <CloseIcon /> : <MenuOpenIcon />}
                  </button>
                </div>
              </div>
            </div>
          </nav>
        </div>
        {/* Render MobileMenu Component */}
        {mobileMenuOpen && (
          <MobileMenu
            isAuthenticated={isAuthenticated}
            handleLogout={handleLogout}
            user={user}
            onClose={toggleMobileMenu}
          />
        )}
      </header>
    </>
  );
}

export default Header;
