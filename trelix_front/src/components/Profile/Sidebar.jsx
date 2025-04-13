import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useProfileStore } from "../../store/profileStore";

function Sidebar({ setActivePage }) {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const { user, clearUser } = useProfileStore();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    clearUser();
    navigate("/");
  };

  return (
    <aside className="dashboard-sidebar shadow-1 border rounded-3">
      <div className="widget">
        {/* Welcome Message */}
        <p className="greetings">
          Welcome, {user?.firstName} {user?.lastName}
        </p>

        {/* Navigation */}
        <nav className="dashboard-nav">
          <ul className="list-unstyled nav">
            {/* <li>
              <Link
                className={`nav-link ${
                  location.pathname === "/dashboard" ? "active" : ""
                }`}
                to="/dashboard"
                onClick={() => setActivePage("Dashboard")}
              >
                <i className="feather-icon icon-home" />
                <span>Dashboard</span>
              </Link>
            </li> */}
            <li>
              <Link
                className={`nav-link ${location.pathname === "/profile" ? "active" : ""
                  }`}
                to="/profile"
                onClick={() => setActivePage("User Account")}
              >
                <i className="feather-icon icon-user" />
                <span>User Account</span>
              </Link>
            </li>

            <li>
              <Link
                className={`nav-link ${location.pathname === "/courses" ? "active" : ""
                  }`}
                to="/profile/list"
                onClick={() => setActivePage("My Courses")}
              >
                <i className="feather-icon icon-book" />
                <span>My Courses</span>
              </Link>
              <ul style={{ paddingLeft: "20px", marginTop: "5px" }}>
                <li>
                  <Link
                    className={`nav-link ${location.pathname === "/profile/classroom/dashboard" ? "active" : ""}`}
                    to="/profile/classroom/dashboard"
                    onClick={() => setActivePage("My Courses")}
                    style={{ display: "flex", alignItems: "center" }}
                  >
                    <img
                      src="https://www.gstatic.com/classroom/logo_square_48.svg"
                      alt="Google Classroom"
                      style={{ width: "20px", height: "20px", marginRight: "8px" }}
                    />
                    <span> Cours Classroom</span>
                  </Link>
                </li>


              </ul>
              
            </li>
            <li>
              <Link
                className={`nav-link ${location.pathname === "/wishlist" ? "active" : ""
                  }`}
                to="/wishlist"
                onClick={() => setActivePage("Wishlist")}
              >
                <i className="feather-icon icon-heart" />
                <span>Wishlist</span>
              </Link>
            </li>
            <li>
              <Link
                className={`nav-link ${location.pathname === "/reviews" ? "active" : ""
                  }`}
                to="/reviews"
                onClick={() => setActivePage("Reviews")}
              >
                <i className="feather-icon icon-star" />
                <span>Reviews</span>
              </Link>
            </li>

            {user?.role === "instructor" && (
              <>
                <li>
                  <Link
                    className={`nav-link ${location.pathname === "/courses" ? "active" : ""
                      }`}
                    to="/profile/list"
                    onClick={() => setActivePage("My Courses")}
                  >
                    <i className="feather-icon icon-book" />
                    <span>My Courses</span>
                  </Link>
                </li>


                <li>
                  <Link className="nav-link" to="/profile/Allexams">
                    <i className="feather-icon icon-book" />
                    <span>My Exams</span>
                  </Link>
                </li>

                <li>
                  <Link className="nav-link" to="/profile/allquiz">
                    <i className="feather-icon icon-book" />
                    <span>My Quizs</span>
                  </Link>
                </li>
              </>
            )}

            {/* <li>
              <Link className="nav-link" to="/profile/addchapter">
                <i className="feather-icon icon-plus" />
                <span>AddChapter</span>
              </Link>
            </li>
            <li>
              <Link className="nav-link" to="/profile/addquiz">
                <i className="feather-icon icon-plus" />
                <span>AddQuiz</span>
              </Link>

            </li>
            <li>
              <Link className="nav-link" to="/profile/addExam">
                <i className="feather-icon icon-plus" />
                <span>addExam</span>
              </Link>
            </li>
            <li>
              <Link className="nav-link" to="/chatbot">
                <i className="feather-icon icon-plus" />
                <span>chatbot</span>
              </Link>
            </li>

          

          
          */}

          </ul>
        </nav>
      </div>

      {/* Course Management */}

      {user?.role === "instructor" && (
        <div className="widget">
          <p className="greetings">Course Management</p>
          <nav className="dashboard-nav">
            <ul className="list-unstyled nav">
              <li>
                <Link
                  className={`nav-link ${location.pathname === "/courses/add-chapter" ? "active" : ""
                    }`}
                  to="/profile/addchapter"
                  onClick={() => setActivePage("Add Chapter")}
                >
                  <i className="feather-icon icon-plus" />
                  <span>Add Chapter</span>
                </Link>
              </li>
              <li>
                <Link
                  className={`nav-link ${location.pathname === "/courses/add-quiz" ? "active" : ""
                    }`}
                  to="/profile/addquiz"
                  onClick={() => setActivePage("Add Quiz")}
                >
                  <i className="feather-icon icon-plus" />
                  <span>Add Quiz</span>
                </Link>
              </li>
              <li>
                <Link className="nav-link" to="/profile/addExam">
                  <i className="feather-icon icon-plus" />
                  <span>addExam</span>
                </Link>
              </li>
              <li>
                <Link className="nav-link" to="/chatbot">
                  <i className="feather-icon icon-plus" />
                  <span>chatbot</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}



      {/* Account Settings */}
      <div className="widget">
        <p className="greetings">Account Settings</p>
        <nav className="dashboard-nav">
          <ul className="list-unstyled nav">
            <li>
              <Link
                className={`nav-link ${location.pathname === "/profile/details" ? "active" : ""
                  }`}
                to="/profile/details"
                onClick={() => setActivePage("Profile Information")}
              >
                <i className="feather-icon icon-user-check" />
                <span>Profile Information</span>
              </Link>
            </li>
            <li>
              <Link
                className={`nav-link ${location.pathname === "/profile/settings" ? "active" : ""
                  }`}
                to="/profile/settings"
                onClick={() => setActivePage("Security & Privacy")}
              >
                <i className="feather-icon icon-shield" />
                <span>Security & Privacy</span>
              </Link>
            </li>
            <li>
              <Link
                className={`nav-link ${location.pathname === "/profile/achievements" ? "active" : ""
                  }`}
                to="/profile/achievements"
                onClick={() => setActivePage("Achievements")}
              >
                <i className="feather-icon icon-award" />
                <span>Achievements</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="widget">
        <hr className="my-3" />
        <nav className="dashboard-nav">
          <ul className="list-unstyled nav">
            <li>
              <a
                className="nav-link text-danger"
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
    </aside>
  );
}

export default Sidebar;
