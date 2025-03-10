import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useProfileStore } from "../../store/profileStore";
function Sidebar() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const { fetchUser, clearUser } = useProfileStore();
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);
  
  const handleLogout = () => {
    logout();
    clearUser();
    navigate("/");
  };

  return (
    
    <aside className="dashboard-sidebar shadow-1 border rounded-3">
      
      <div className="widget">
        <p className="grettings">Welcome, Maria Carey</p>
        <nav className="dashboard-nav">
          <ul className="list-unstyled nav">
            <li>
              <a className="nav-link" href="student-dashboard.html">
                <i className="feather-icon icon-home" />
                <span>Dashboard</span>
              </a>
            </li>
            <li>
              <Link className="nav-link" to="/profile/details">
                <i className="feather-icon icon-user" />
                <span>My Profile</span>

              </Link>
            </li>


             <li>
              <Link className="nav-link" to="/profile/list">
                <i className="feather-icon icon-settings" />
                <span>Cours</span>
              </Link>
            </li>
            <li>
              <a className="nav-link" href="student-wishlist.html">
                <i className="feather-icon icon-gift" />
                <span>Wishlist</span>
              </a>
            </li>
            <li>
              <a className="nav-link" href="student-reviews.html">
                <i className="feather-icon icon-star" />
                <span>Reviews</span>
              </a>
            </li>
          
            <li>
            <Link className="nav-link" to="/profile/Allexams">
                <i className="feather-icon icon-book" />
                <span>My Exams</span>
              </Link>

            <Link className="nav-link" to="/profile/allquiz">
                <i className="feather-icon icon-book" />
                <span>My Quizs</span>
              </Link>
            <Link className="nav-link" to="/profile/addchapter">
                <i className="feather-icon icon-plus" />
                <span>AddChapter</span>
              </Link>
              <Link className="nav-link" to="/profile/addquiz">
                <i className="feather-icon icon-plus" />
                <span>AddQuiz</span>
              </Link>
              <Link className="nav-link" to="/profile/addExam">
                <i className="feather-icon icon-plus" />
                <span>addExam</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="widget">
        <p className="grettings">User</p>
        <nav className="dashboard-nav">
          <ul className="list-unstyled nav">
            <li>
              <Link className="nav-link" to="/profile/settings">
                <i className="feather-icon icon-settings" />
                <span>Settings</span>
              </Link>
            </li>
            <li>
              <a className="nav-link" href="" onClick={handleLogout}>
                <i className="feather-icon icon-log-out" />
                <span>Logout</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
      {/*  Widget End */}
    </aside>
  );
}
export default Sidebar;
