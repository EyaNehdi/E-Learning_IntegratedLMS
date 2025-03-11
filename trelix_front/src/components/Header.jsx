import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useProfileStore } from "../store/profileStore";
import Buttons from "./Buttons";
// import './css/Header.css';

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const { user, fetchUser, clearUser } = useProfileStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleLogout = () => {
    logout();
    clearUser();
    navigate("/");
  };
  return (
    <>
      <header className="header header-1">
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
        <div
          className="search-popup offcanvas offcanvas-top"
          id="offcanvas-search"
          data-bs-scroll="true"
        >
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
                />
              </form>
              <div className="product-wrap d-none d-sm-block">
                <h6>Our Best Selling Courses</h6>
                <div className="row mt-3">
                  <div className="col-sm-4">
                    <div className="course-entry-3 card rounded-2 border shadow-1">
                      <div className="card-media position-relative">
                        <a href="single-course.html">
                          <img
                            className="card-img-top"
                            src="assets/images/course1.jpg"
                            alt="Course"
                          />
                        </a>
                      </div>
                      <div className="card-body p-3">
                        <div className="d-flex justify-content-between align-items-center small">
                          <div className="d-flex align-items-center small">
                            <div className="ratings me-2">
                              <a href="#">
                                <img
                                  src="assets/images/icons/star.png"
                                  alt="star_icon"
                                />
                              </a>
                              <a href="#">
                                <img
                                  src="assets/images/icons/star.png"
                                  alt="star_icon"
                                />
                              </a>
                              <a href="#">
                                <img
                                  src="assets/images/icons/star.png"
                                  alt="star_icon"
                                />
                              </a>
                              <a href="#">
                                <img
                                  src="assets/images/icons/star.png"
                                  alt="star_icon"
                                />
                              </a>
                              <a href="#">
                                <img
                                  src="assets/images/icons/star.png"
                                  alt="star_icon"
                                />
                              </a>
                            </div>
                            <span className="rating-count">(15)</span>
                          </div>
                        </div>
                        <h3 className="display-6 mt-1">
                          <a href="single-course.html">
                            Python Bootcamp Canada
                          </a>
                        </h3>
                        <span className="fw-bold">$75.00</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-4">
                    <div className="course-entry-3 card rounded-2 border shadow-1">
                      <div className="card-media position-relative">
                        <a href="single-course.html">
                          <img
                            className="card-img-top"
                            src="assets/images/course2.jpg"
                            alt="Course"
                          />
                        </a>
                      </div>
                      <div className="card-body p-3">
                        <div className="d-flex justify-content-between align-items-center small">
                          <div className="d-flex align-items-center small">
                            <div className="ratings me-2">
                              <a href="#">
                                <img
                                  src="assets/images/icons/star.png"
                                  alt="star_icon"
                                />
                              </a>
                              <a href="#">
                                <img
                                  src="assets/images/icons/star.png"
                                  alt="star_icon"
                                />
                              </a>
                              <a href="#">
                                <img
                                  src="assets/images/icons/star.png"
                                  alt="star_icon"
                                />
                              </a>
                              <a href="#">
                                <img
                                  src="assets/images/icons/star.png"
                                  alt="star_icon"
                                />
                              </a>
                              <a href="#">
                                <img
                                  src="assets/images/icons/star.png"
                                  alt="star_icon"
                                />
                              </a>
                            </div>
                            <span className="rating-count">(5)</span>
                          </div>
                        </div>
                        <h3 className="display-6 mt-1">
                          <a href="single-course.html">
                            Building wealth &amp; security
                          </a>
                        </h3>
                        <span className="fw-bold">$75.00</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-4">
                    <div className="course-entry-3 card rounded-2 border shadow-1">
                      <div className="card-media position-relative">
                        <a href="single-course.html">
                          <img
                            className="card-img-top"
                            src="assets/images/course3.jpg"
                            alt="Course"
                          />
                        </a>
                      </div>
                      <div className="card-body p-3">
                        <div className="d-flex justify-content-between align-items-center small">
                          <div className="d-flex align-items-center small">
                            <div className="ratings me-2">
                              <a href="#">
                                <img
                                  src="assets/images/icons/star.png"
                                  alt="star_icon"
                                />
                              </a>
                              <a href="#">
                                <img
                                  src="assets/images/icons/star.png"
                                  alt="star_icon"
                                />
                              </a>
                              <a href="#">
                                <img
                                  src="assets/images/icons/star.png"
                                  alt="star_icon"
                                />
                              </a>
                              <a href="#">
                                <img
                                  src="assets/images/icons/star.png"
                                  alt="star_icon"
                                />
                              </a>
                              <a href="#">
                                <img
                                  src="assets/images/icons/star.png"
                                  alt="star_icon"
                                />
                              </a>
                            </div>
                            <span className="rating-count">(09)</span>
                          </div>
                        </div>
                        <h3 className="display-6 mt-1">
                          <a href="single-course.html">
                            Python Bootcamp Canada
                          </a>
                        </h3>
                        <span className="fw-bold">$75.00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="header-nav-wrapper header-sticky">
          <nav className="navbar nav-center navbar-expand-xl">
            <img
              src="/assets/images/ss.png"
              alt="Logo"
              style={{ marginLeft: "104px" }}
            />

            <div
              className="container navbar-line px-3"
              style={{ marginLeft: "45px" }}
            >
              <a className="navbar-brand d-xl-none" href="index-2.html"></a>
              <div className="header-actions position-relative order-xl-2 d-flex align-items-center justify-content-between">
                <button
                  className="navbar-toggler offcanvas-nav-btn"
                  type="button"
                >
                  <span className="feather-icon icon-menu" />
                </button>
                <div className="offcanvas offcanvas-start offcanvas-nav">
                  <div className="offcanvas-header">
                    <button
                      type="button"
                      className="btn-close bg-primary"
                      data-bs-dismiss="offcanvas"
                      aria-label="Close"
                    />
                  </div>

                  <div className="offcanvas-body pt-0 align-items-center justify-content-between">
                    <ul className="navbar-nav align-items-lg-center">
                      <li className="nav-item dropdown">
                        <a
                          href="/home"
                          role="button"
                          aria-expanded="false"





                          style={{
                            marginRight: "46px",
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
                          style={{
                            marginRight: "46px",
                            fontWeight: "bold",
                            fontSize: "20px",
                          }}
                        >
                          Dashboard
                        </a>
                      </li>
                      <li className="nav-item dropdown">
                        <a
                          href="#"
                          role="button"
                         
                          aria-expanded="false"
                          style={{
                            marginRight: "46px",
                            fontWeight: "bold",
                            fontSize: "20px",
                          }}
                        >
                          Courses
                        </a>
                        {/* Dropdown menu for Courses */}
                        <ul className="dropdown-menu">
                          <li>
                            <a className="dropdown-item" href="/chapters  ">
                              All Chapters
                            </a>
                          </li>
                          <li>
                            <a className="dropdown-item" href="/allcours">
                              All Cours
                            </a>
                          </li>
                          <li>
                            <hr className="dropdown-divider" />
                          </li>

                        </ul>
                      </li>
                      <li className="">
                        <a
                          href="/leaderboard"
                          role="button"
                          aria-expanded="false"
                          style={{
                            marginRight: "46px",
                            fontWeight: "bold",
                            fontSize: "20px",
                          }}
                        >
                          Leaderboard
                        </a>

                      </li>
                    </ul>
                    <a
                      className="navbar-brand d-none d-xl-block m-0"
                      href="index-2.html"
                    ></a>
                  </div>
                </div>

                <a
                  className="text-reset icon rounded-5 bg-shade"
                  href="#"
                  data-bs-toggle="offcanvas"
                  data-bs-target="#offcanvas-search"
                >
                  <i className="feather-icon icon-search" />
                </a>

                <div className="d-flex align-items-center ms-3.5  position-relative">
                  {isAuthenticated ? (
                    <div>
                      <a
                        className="text-reset icon rounded-5 bg-shade"
                        href="#"
                        role="button"
                        onClick={() => setMenuOpen(!menuOpen)} // Toggle menu on click
                      >
                        <i className="feather-icon icon-user" />
                      </a>
                      {menuOpen && ( // Show menu if state is true
                        <div className="admin-menu pt-3 bg-white">
                          <div className="d-flex avatar border-bottom pb-3">
                            <img
                              className="img-fluid border rounded-circle"
                              src="assets/images/ava-sm1.jpg"
                              width={50}
                              alt="avatar"
                            />
                            <div className="d-flex avatar border-bottom pb-3">
                              {user ? (
                                <h6 className="mb-0">
                                  {user.firstName} {user.lastName}
                                </h6>
                              ) : (
                                <h6 className="mb-0">
                                  Pleas login you dont have account{" "}
                                </h6>
                              )}
                              <small>Founder</small>
                            </div>
                          </div>
                          <nav className="dashboard-nav mt-1">
                            <ul className="list-unstyled nav">
                              <li>
                                <a className="nav-link" href="/admin">
                                  <i className="feather-icon icon-home" />
                                  <span>Dashboard</span>
                                </a>
                              </li>
                              <li>
                                <a className="nav-link" href="/profile">
                                  <i className="feather-icon icon-user" />
                                  <span>My Profile</span>
                                </a>
                              </li>
                              <li>
                                <a
                                  className="nav-link"
                                  href="instructor-enrolled-courses.html"
                                >
                                  <i className="feather-icon icon-book-open" />
                                  <span>Enrolled Courses</span>
                                </a>
                              </li>
                              <li>
                                <a
                                  className="nav-link"
                                  href="instructor-wishlist.html"
                                >
                                  <i className="feather-icon icon-gift" />
                                  <span>Wishlist</span>
                                </a>
                              </li>
                              <li>
                                <a
                                  className="nav-link"
                                  href="instructor-reviews.html"
                                >
                                  <i className="feather-icon icon-star" />
                                  <span>Reviews</span>
                                </a>
                              </li>
                              <li>
                                <a
                                  className="nav-link"
                                  href="instructor-my-quiz-attempts.html"
                                >
                                  <i className="feather-icon icon-box" />
                                  <span>My Quiz Attempts</span>
                                </a>
                              </li>
                              <li>
                                <a
                                  className="nav-link"
                                  href="instructor-order-history.html"
                                >
                                  <i className="feather-icon icon-shopping-bag" />
                                  <span>Order History</span>
                                </a>
                              </li>
                              <li className="border-bottom" />
                              <li>
                                <a
                                  className="nav-link active"
                                  href="instructor-courses.html"
                                >
                                  <i className="feather-icon icon-book" />
                                  <span>My Courses</span>
                                </a>
                              </li>
                              <li>
                                <a
                                  className="nav-link"
                                  href="instructor-assignments.html"
                                >
                                  <i className="feather-icon icon-briefcase" />
                                  <span>Assignments</span>
                                </a>
                              </li>
                              <li>
                                <a
                                  className="nav-link"
                                  href="instructor-quiz-attempts.html"
                                >
                                  <i className="feather-icon icon-cpu" />
                                  <span>Quiz Attempts</span>
                                </a>
                              </li>
                              <li>
                                <a
                                  className="nav-link"
                                  href="instructor-announcements.html"
                                >
                                  <i className="feather-icon icon-bell" />
                                  <span>Announcements</span>
                                </a>
                              </li>
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
                  ) : (
                    <div className="d-flex buttons-container">
                      <Buttons />
                    </div>
                  )}
                </div>

              </div>

            </div>
          </nav>
        </div>
      </header>
    </>
  );
}
export default Header;
