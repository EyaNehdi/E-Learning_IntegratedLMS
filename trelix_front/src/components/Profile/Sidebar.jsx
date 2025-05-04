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
                    <span>Quizzes</span>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>

      {/* INSTRUCTOR ONLY ROUTES --- Course Management */}
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

                <Link className="nav-link" to="/profile/geminichat">

                  <i className="feather-icon icon-plus" />
                  <span>Chatbot</span>
                </Link>
              </li>
              <li>
                <Link className="nav-link" to="/profile/meeting">
                  <i className="feather-icon icon-plus" />
                  <span>Meet</span>
                </Link>
              </li>
              <li>


              </li>
            </ul>
          </nav>
        </div>
      )}


      {user?.role === "student" && (
        <div className="widget">
          <p className="greetings">Cours Preference</p>
          <nav className="dashboard-nav">
            <ul className="list-unstyled nav">
              <ul className="list-unstyled nav">
                <li>
                  <Link
                    className={`nav-link ${location.pathname === "/preference" ? "active" : ""
                      }`}
                    to="/profile/preference"
                    onClick={() => setActivePage("Add Preference")}
                  >
                    <i className="feather-icon icon-book" />
                    <span>Preference</span>
                  </Link>
                </li>
                
              </ul>
              
            </ul>
          </nav>
          <p className="greetings">Assistance</p>
          <nav className="dashboard-nav">
            <ul className="list-unstyled nav">
            <ul className="list-unstyled nav">  
                <li>

                  <Link className="nav-link" to="/profile/geminichat">

                    <i className="feather-icon icon-plus" />
                    <span>Chatbot</span>
                  </Link>
                </li>
                <li>
                  <Link className="nav-link" to="/profile/meeting">
                    <i className="feather-icon icon-plus" />
                    <span>Meet</span>
                  </Link>
                </li>
                </ul>
              
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
              <Link
                className={`nav-link ${location.pathname === "/profile/test" ? "active" : ""
                  }`}
                to="/profile/test"
                onClick={() => setActivePage("Wordle")}
              >
                <i className="feather-icon icon-shield" />
                <span>Wordle</span>
              </Link>
            </li>
            {user?.role === "student" && (
              <li>
                <Link
                  className={`nav-link ${location.pathname === "/profile/achievements"
                      ? "active"
                      : ""
                    }`}
                  to="/profile/achievements"
                  onClick={() => setActivePage("Achievements")}
                >
                  <i className="feather-icon icon-award" />
                  <span>Achievements</span>
                </Link>
              </li>
            )}
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
