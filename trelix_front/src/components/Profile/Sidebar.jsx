import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useProfileStore } from "../../store/profileStore";

function Sidebar() {
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
        <div className="sidebar-user-section text-center bg-light mb-4 shadow-sm">
          <p className="greeting-text mb-1">Welcome,</p>
          <p className="user-name">
            {user?.firstName} {user?.lastName}
          </p>
        </div>

        {/* Navigation */}
        <nav className="dashboard-nav">
          <ul className="nav-list">
            <li>
              <Link
                className={`nav-link ${
                  location.pathname === "/profile" ? "active" : ""
                }`}
                to="/profile"
              >
                <i className="feather-icon icon-user" />
                <span className="nav-label">User Account</span>
              </Link>
            </li>
          </ul>
        </nav>
        
            {user?.role === "instructor" && (
        <div className="widget">
          <p className="section-title"> Course statistics </p>
          <nav className="dashboard-nav">
            <ul className="nav-list">
              <li>
                <Link
                  className={`nav-link ${
                    location.pathname === "/chart" ? "active" : ""
                  }`}
                  to="/chart"
                >
                  <i className="feather-icon icon-plus" />
                  <span className="nav-label">statistics</span>
                </Link>
              </li>
             
            </ul>
          </nav>
        </div>
      )}
        {user?.role === "instructor" && (
          <div className="widget">
            <p className="section-title">Learning Resources</p>
            <nav className="dashboard-nav">
              <ul className="nav-list">
                <li>
                  <Link
                    className={`nav-link ${
                      location.pathname === "/profile/list" ? "active" : ""
                    }`}
                    to="/profile/list"
                  >
                    <i className="feather-icon icon-book" />
                    <span className="nav-label">My Courses</span>
                  </Link>
                </li>
                <li>
                  <Link className="nav-link" to="/profile/Allexams">
                    <i className="feather-icon icon-book" />
                    <span className="nav-label">My Exams</span>
                  </Link>
                </li>
                <li>
                  <Link className="nav-link" to="/profile/allquiz">
                    <i className="feather-icon icon-book" />
                    <span className="nav-label">Quizzes</span>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          
          
        )}
      </div>

      

      {user?.role === "instructor" && (
        <div className="widget">
          <p className="section-title">Course Management</p>
          <nav className="dashboard-nav">
            <ul className="nav-list">
              <li>
                <Link
                  className={`nav-link ${
                    location.pathname === "/profile/addchapter" ? "active" : ""
                  }`}
                  to="/profile/addchapter"
                >
                  <i className="feather-icon icon-plus" />
                  <span className="nav-label">Add Chapter</span>
                </Link>
              </li>
              <li>
                <Link
                  className={`nav-link ${
                    location.pathname === "/profile/addquiz" ? "active" : ""
                  }`}
                  to="/profile/addquiz"
                >
                  <i className="feather-icon icon-plus" />
                  <span className="nav-label">Add Quiz</span>
                </Link>
              </li>
              <li>
                <Link className="nav-link" to="/profile/addExam">
                  <i className="feather-icon icon-plus" />
                  <span className="nav-label">Add Exam</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {user?.role === "student" && (
        <div className="widget">
          <p className="section-title">Course Preference</p>
          <nav className="dashboard-nav">
            <ul className="nav-list">
              <li>
                <Link
                  className={`nav-link ${
                    location.pathname === "/profile/preference" ? "active" : ""
                  }`}
                  to="/profile/preference"
                >
                  <i className="feather-icon icon-book" />
                  <span className="nav-label">Preference</span>
                </Link>
              </li>
              
            </ul>
          </nav>
        </div>
      )}
          {user?.role === "student" && (
        <div className="widget">
          <p className="section-title"> Preference Statistics</p>
          <nav className="dashboard-nav">
            <ul className="nav-list">
              <li>
                <Link
                  className={`nav-link ${
                    location.pathname === "/profile/preferencestat" ? "active" : ""
                  }`}
                  to="/profile/preferencestat"
                >
                  <i className="feather-icon icon-book" />
                  <span className="nav-label">Statistics</span>
                </Link>
              </li>
              
            </ul>
          </nav>
        </div>
      )}
      

      <div className="widget">
        <p className="section-title">Assistance</p>
        <nav className="dashboard-nav">
          <ul className="nav-list">
            <li>
              <Link className="nav-link" to="/profile/geminichat">
                <i className="feather-icon icon-message-square" />
                <span className="nav-label">Chatbot</span>
              </Link>
            </li>
            <li>
              <Link className="nav-link" to="/profile/meeting">
                <i className="feather-icon icon-video" />
                <span className="nav-label">Meet</span>
              </Link>
            </li>
            {user?.role === "student" && (
              <>
                <li>
                  <Link className="nav-link" to="/profile/dictionary">
                    <i className="feather-icon icon-book-open" />
                    <span className="nav-label">Dictionary</span>
                  </Link>
                </li>
                <li>
                  <Link className="nav-link" to="/profile/CitationGenerator">
                    <i className="feather-icon icon-plus" />
                    <span className="nav-label">Citation Generator</span>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
      {user?.role === "student" && (
        <div className="widget">
          <p className="section-title">Mini Games</p>
          <nav className="dashboard-nav">
            <ul className="nav-list">
              <li>
                <Link
                  className={`nav-link ${
                    location.pathname === "/profile/test" ? "active" : ""
                  }`}
                  to="/profile/test"
                >
                  <i className="feather-icon icon-grid" />
                  <span className="nav-label">Wordle</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
      <div className="widget">
        <p className="section-title">Account Settings</p>
        <nav className="dashboard-nav">
          <ul className="nav-list">
            <li>
              <Link
                className={`nav-link ${
                  location.pathname === "/profile/details" ? "active" : ""
                }`}
                to="/profile/details"
              >
                <i className="feather-icon icon-user-check" />
                <span className="nav-label">Profile Information</span>
              </Link>
            </li>
            <li>
              <Link
                className={`nav-link ${
                  location.pathname === "/profile/settings" ? "active" : ""
                }`}
                to="/profile/settings"
              >
                <i className="feather-icon icon-shield" />
                <span className="nav-label">Security & Privacy</span>
              </Link>
            </li>
            {user?.role === "student" && (
              <li>
                <Link
                  className={`nav-link ${
                    location.pathname === "/profile/achievements"
                      ? "active"
                      : ""
                  }`}
                  to="/profile/achievements"
                >
                  <i className="feather-icon icon-award" />
                  <span className="nav-label">Achievements</span>
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>

      <div className="widget">
        <hr className="my-3" />
        <nav className="dashboard-nav">
          <ul className="nav-list">
            <li>
              <a
                className="nav-link text-danger fw-bold"
                href="#"
                onClick={handleLogout}
              >
                <i className="feather-icon icon-log-out" />
                <span className="nav-label">Logout</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
}

export default Sidebar;
