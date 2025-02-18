import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useProfileStore } from "../store/profileStore";

function Header() {
  const { isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const { user, fetchUser , clearUser } = useProfileStore();
 useEffect(() => {
  console.log("🟢 Checking authentication...");
   checkAuth();
   console.log("user avant fetch:"+user);
   const fetchData = async () => {
    await fetchUser(); // Ensure user data is fetched first
    console.log("user after fetch", user);
  };
  fetchData();
}, [fetchUser]); 


  const handleLogout = () => {
      logout(); // Clear user session
      clearUser();
      navigate("/"); // Redirect to home
      
  };
                      return (
                        <>
<header className="header header-1">
<div className="sticky-height" />
<div className="header-top bg-primary text-info text-uppercase">
  <div className="marquee">
    <p>
      <span>Start Education is a Way to Success in Life</span>
      <span>Better Education Improves The Nation</span>
      <span>Learn Today Lead Tomorrow</span>
      <span>Free education for all</span>
      <span>Education is a key to the door of all the dreams</span>
      <span>Education is a Way to Success in Life</span>
      <span>Better Education Improves The Nation</span>
      <span>Learn Today Lead Tomorrow</span>
      <span>Free education for all</span>
      <span>Education is a key to the door of all the dreams</span>
    </p>
  </div>
</div>
<div className="search-popup offcanvas offcanvas-top" id="offcanvas-search" data-bs-scroll="true">
  <div className="container d-flex flex-row py-5 align-items-center position-relative">
    <button type="button" className="btn-close bg-primary rounded-5" data-bs-dismiss="offcanvas" aria-label="Close" />
    <div className="col-lg-9 mx-auto">
      <form className="search-form w-100 mb-5">
        <input id="search-form" type="text" className="form-control shadow-1" placeholder="Type keyword and hit enter" />
      </form>
      <div className="product-wrap d-none d-sm-block">
        <h6>Our Best Selling Courses</h6>
        <div className="row mt-3">
          <div className="col-sm-4">
            <div className="course-entry-3 card rounded-2 border shadow-1">
              <div className="card-media position-relative">
                <a href="single-course.html"><img className="card-img-top" src="assets/images/course1.jpg" alt="Course" /></a>
              </div>
              <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-center small">
                  <div className="d-flex align-items-center small">
                    <div className="ratings me-2">
                      <a href="#"><img src="assets/images/icons/star.png" alt /></a>
                      <a href="#"><img src="assets/images/icons/star.png" alt /></a>
                      <a href="#"><img src="assets/images/icons/star.png" alt /></a>
                      <a href="#"><img src="assets/images/icons/star.png" alt /></a>
                      <a href="#"><img src="assets/images/icons/star.png" alt /></a>
                    </div>
                    <span className="rating-count">(15)</span>
                  </div>
                </div>
                <h3 className="display-6 mt-1">
                  <a href="single-course.html">Python Bootcamp Canada</a>
                </h3>
                <span className="fw-bold">$75.00</span>
              </div>
            </div>
          </div>
          <div className="col-sm-4">
            <div className="course-entry-3 card rounded-2 border shadow-1">
              <div className="card-media position-relative">
                <a href="single-course.html"><img className="card-img-top" src="assets/images/course2.jpg" alt="Course" /></a>
              </div>
              <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-center small">
                  <div className="d-flex align-items-center small">
                    <div className="ratings me-2">
                      <a href="#"><img src="assets/images/icons/star.png" alt /></a>
                      <a href="#"><img src="assets/images/icons/star.png" alt /></a>
                      <a href="#"><img src="assets/images/icons/star.png" alt /></a>
                      <a href="#"><img src="assets/images/icons/star.png" alt /></a>
                      <a href="#"><img src="assets/images/icons/star.png" alt /></a>
                    </div>
                    <span className="rating-count">(5)</span>
                  </div>
                </div>
                <h3 className="display-6 mt-1">
                  <a href="single-course.html">Building wealth &amp; security</a>
                </h3>
                <span className="fw-bold">$75.00</span>
              </div>
            </div>
          </div>
          <div className="col-sm-4">
            <div className="course-entry-3 card rounded-2 border shadow-1">
              <div className="card-media position-relative">
                <a href="single-course.html"><img className="card-img-top" src="assets/images/course3.jpg" alt="Course" /></a>
              </div>
              <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-center small">
                  <div className="d-flex align-items-center small">
                    <div className="ratings me-2">
                      <a href="#"><img src="assets/images/icons/star.png" alt /></a>
                      <a href="#"><img src="assets/images/icons/star.png" alt /></a>
                      <a href="#"><img src="assets/images/icons/star.png" alt /></a>
                      <a href="#"><img src="assets/images/icons/star.png" alt /></a>
                      <a href="#"><img src="assets/images/icons/star.png" alt /></a>
                    </div>
                    <span className="rating-count">(09)</span>
                  </div>
                </div>
                <h3 className="display-6 mt-1">
                  <a href="single-course.html">Python Bootcamp Canada</a>
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
    <div className="container navbar-line px-3">
      <a className="navbar-brand d-xl-none" href="index-2.html"><img src="assets/images/logo.png" alt="Logo" /></a>
      <div className="header-actions position-relative order-xl-2 d-flex align-items-center justify-content-between">
        <a className="text-reset icon rounded-5 bg-shade" href="#" data-bs-toggle="offcanvas" data-bs-target="#offcanvas-search"><i className="feather-icon icon-search" /></a>
        {isAuthenticated ? (
        <div>
        <a className="text-reset icon rounded-5 bg-shade" data-bs-toggle="collapse" href="#collapseAdminMenu" role="button" aria-expanded="false" aria-controls="collapseAdminMenu">
          <i className="feather-icon icon-user" />
        </a>
        <div className="admin-menu pt-3 bg-white collapse" id="collapseAdminMenu">
          <div className="d-flex avatar border-bottom pb-3">
            <img className="img-fluid border rounded-circle" src="assets/images/ava-sm1.jpg" width={50} alt="avatar" />
            <div className="grettings ps-3">
              {user ? (
              <h6 className="mb-0">{user.firstName} {user.lastName}</h6>
              ) : (
                <h6 className="mb-0">Unknown</h6>
              )}
              <small>Founder</small>
            </div>
          </div>
          <nav className="dashboard-nav mt-1">
            <ul className="list-unstyled nav">
              <li>
                <a className="nav-link" href="instructor-dashboard.html"><i className="feather-icon icon-home" /><span>Dashboard</span></a>
              </li>
              <li>
                <a className="nav-link" href="/profile"><i className="feather-icon icon-user" /><span>My Profile</span></a>
              </li>
              <li>
                <a className="nav-link" href="instructor-enrolled-courses.html"><i className="feather-icon icon-book-open" /><span>Enrolled Courses</span></a>
              </li>
              <li>
                <a className="nav-link" href="instructor-wishlist.html"><i className="feather-icon icon-gift" /><span>Wishlist</span></a>
              </li>
              <li>
                <a className="nav-link" href="instructor-reviews.html"><i className="feather-icon icon-star" /><span>Reviews</span></a>
              </li>
              <li>
                <a className="nav-link" href="instructor-my-quiz-attempts.html"><i className="feather-icon icon-box" /><span>My Quiz Attempts</span></a>
              </li>
              <li>
                <a className="nav-link" href="instructor-order-history.html"><i className="feather-icon icon-shopping-bag" /><span>Order History</span></a>
              </li>
              <li className="border-bottom" />
              <li>
                <a className="nav-link active" href="instructor-courses.html"><i className="feather-icon icon-book" /><span>My Courses</span></a>
              </li>
              <li>
                <a className="nav-link" href="instructor-assignments.html"><i className="feather-icon icon-briefcase" /><span>Assignments</span></a>
              </li>
              <li>
                <a className="nav-link" href="instructor-quiz-attemps.html"><i className="feather-icon icon-cpu" /><span>Quiz Attempts</span></a>
              </li>
              <li>
                <a className="nav-link" href="instructor-announcements.html"><i className="feather-icon icon-bell" /><span>Announcements</span></a>
              </li>
              <li className="border-bottom" />
              <li>
                <a className="nav-link" href="instructor-settings.html"><i className="feather-icon icon-settings" /><span>Settings</span></a>
              </li>
              <li>
                <a className="nav-link" href="" onClick={handleLogout}><i className="feather-icon icon-log-out" /><span>Logout</span></a>
              </li>
            </ul>
          </nav>
        </div>
        </div>
                      ):(
                        <div>
      
        <a href="/Switch" className="btn btn-primary d-none d-lg-block shadow-none border-0 rounded-5 " >Sign Up</a>
       
              
        <a href="/login" className="btn btn-primary d-none d-lg-block shadow-none border-0 rounded-5">Login</a>
      </div>
                      )}
      <button className="navbar-toggler offcanvas-nav-btn" type="button">
        <span className="feather-icon icon-menu" />
      </button>
      <div className="offcanvas offcanvas-start offcanvas-nav">
        <div className="offcanvas-header">
          <a href="index-2.html" className="text-inverse"><img src="assets/images/logo.png" alt="logo" /></a>
          <button type="button" className="btn-close bg-primary" data-bs-dismiss="offcanvas" aria-label="Close" />
        </div>
        <div className="offcanvas-body pt-0 align-items-center justify-content-between">
          <ul className="navbar-nav align-items-lg-center">
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">Home</a>
              <ul className="dropdown-menu">
                <li><a className="dropdown-item" href="index-2.html">Home 1</a></li>
                <li><a className="dropdown-item" href="index-3.html">Home 2</a></li>
                <li>
                  <a className="dropdown-item" href="index-4.html">Home 3
                    <span className="badge bg-primary ms-2">New</span>
                  </a>
                </li>
              </ul>
            </li>
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">Dashboard</a>
              <ul className="dropdown-menu">
                <li className="dropdown-submenu dropend">
                  <a className="dropdown-item dropdown-toggle" href="#">Instructor Dashboard</a>
                  <ul className="dropdown-menu">
                    <li className="dropdown-header">Instructor</li>
                    <li>
                      <a className="dropdown-item" href="instructor-dashboard.html">Dashbaord</a>
                      <a className="dropdown-item" href="/profile">Profile</a>
                      <a className="dropdown-item" href="instructor-enrolled-courses.html">Enrolled Courses</a>
                      <a className="dropdown-item" href="instructor-wishlist.html">Wishlist</a>
                      <a className="dropdown-item" href="instructor-reviews.html">Reviews</a>
                      <a className="dropdown-item" href="instructor-my-quiz-attempts.html">My Quiz Attempts</a>
                      <a className="dropdown-item" href="instructor-order-history.html">Order History</a>
                      <a className="dropdown-item" href="instructor-courses.html">My Course</a>
                      <a className="dropdown-item" href="instructor-announcements.html">Announcements</a>
                      <a className="dropdown-item" href="instructor-quiz-attemps.html">Quiz Attempts</a>
                      <a className="dropdown-item" href="instructor-assignments.html">Assignments</a>
                      <a className="dropdown-item" href="instructor-settings.html">Settings</a>
                    </li>
                  </ul>
                </li>
                <li className="dropdown-submenu dropend">
                  <a className="dropdown-item dropdown-toggle" href="#">Student Dashboard</a>
                  <ul className="dropdown-menu">
                    <li className="dropdown-header">Student</li>
                    <li>
                      <a className="dropdown-item" href="student-dashboard.html">Dashbaord</a>
                      <a className="dropdown-item" href="student-profile.html">Profile</a>
                      <a className="dropdown-item" href="student-enrolled-courses.html">Enrolled Courses</a>
                      <a className="dropdown-item" href="student-wishlist.html">Wishlist</a>
                      <a className="dropdown-item" href="student-reviews.html">Reviews</a>
                      <a className="dropdown-item" href="student-order-history.html">Order History</a>
                      <a className="dropdown-item" href="student-my-quiz-attempts.html">My Quiz Attempts</a>
                      <a className="dropdown-item" href="student-settings.html">Settings</a>
                    </li>
                  </ul>
                </li>
              </ul>
            </li>
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">Courses</a>
              <ul className="dropdown-menu">
                <li><a className="dropdown-item" href="courses.html">All Courses</a></li>
                <li><a className="dropdown-item" href="courses-list.html">Courses List</a></li>
                <li className="dropdown-submenu dropend">
                  <a className="dropdown-item dropdown-toggle" href="#">Course Details</a>
                  <ul className="dropdown-menu">
                    <li className="dropdown-header">Single Course</li>
                    <li>
                      <a className="dropdown-item" href="single-course.html">Course Details 01</a>
                      <a className="dropdown-item" href="single-course-2.html">Course Details 02</a>
                    </li>
                  </ul>
                </li>
                <li><a className="dropdown-item" href="lesson.html">Course Lesson</a></li>
              </ul>
            </li>
            <li className="nav-item dropdown dropdown-fullwidth">
              <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">Pages</a>
              <div className="dropdown-menu">
                <div className="row row-cols-xl-4 row-cols-1">
                  <div className="col">
                    <div>
                      <div>
                        <div className="dropdown-header">Get Started</div>
                        <a className="dropdown-item" href="about.html">About Us</a>
                        <a className="dropdown-item" href="event-grid.html">Event Grid</a>
                        <a className="dropdown-item" href="event-list.html">Event List</a>
                        <a className="dropdown-item" href="event-sidebar.html">Event Sidebar</a>
                        <a className="dropdown-item" href="single-event.html">Event Details</a>
                        <a className="dropdown-item" href="pricing.html">Pricing Plan</a>
                        <a className="dropdown-item" href="admission-guide.html">Admision Guide</a>
                      </div>
                    </div>
                  </div>
                  <div className="col">
                    <div>
                      <div className="dropdown-header">Get Started</div>
                      <a className="dropdown-item" href="contact.html">Contact Us</a>
                      <a className="dropdown-item" href="instructors.html">Instructors</a>
                      <a className="dropdown-item" href="profile.html">Profile</a>
                      <a className="dropdown-item" href="become-instructor.html">Become a instructor</a>
                      <a className="dropdown-item" href="faq.html">FAQ</a>
                      <a className="dropdown-item" href="404.html">404 error</a>
                      <a className="dropdown-item" href="comming-soon.html">Maintenance</a>
                    </div>
                  </div>
                  <div className="col">
                    <div className="mt-3 mt-lg-0">
                      <div>
                        <div className="dropdown-header">Shop Pages</div>
                        <a className="dropdown-item" href="shop.html">Shop</a>
                        <a className="dropdown-item" href="single-product.html">Single Product</a>
                        <a className="dropdown-item" href="cart.html">Cart</a>
                        <a className="dropdown-item" href="checkout.html">Checkout</a>
                        <a className="dropdown-item" href="my-account.html">My Account</a>
                        <a className="dropdown-item" href="login.html">Login</a>
                        <a className="dropdown-item" href="signup.html">Register</a>
                      </div>
                    </div>
                  </div>
                  <div className="col">
                    <div className="mt-3 mt-lg-0">
                      <a href="login.html" className="assets/banner-ads d-flex justify-content-between">
                        <div className="b-content">
                          <h5>Online Learning Platform</h5>
                          <span className="badge-lg bg-primary text-small mt-2">All Courses</span>
                        </div>
                        <img src="assets/images/banner-ads.png" alt className="img-fluid banner-img" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          </ul>
          <a className="navbar-brand d-none d-xl-block m-0" href="index-2.html"><img src="assets/images/logo.png" alt="Logo" /></a>
        </div>
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