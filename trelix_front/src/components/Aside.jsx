import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useProfileStore } from "../store/profileStore";
function Aside() {
  const { isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const { user, fetchUser, clearUser } = useProfileStore();
  useEffect(() => {
    console.log("🟢 Checking authentication...");
    checkAuth();
    console.log("user avant fetch:" + user);
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
    <aside className="dashboard-sidebar shadow-1 border rounded-3">
      <div className="widget">
        <p className="grettings">Welcome, Maria Carey</p>
        <nav className="dashboard-nav">
          <ul className="list-unstyled nav">
            <li><a className="nav-link" href="student-dashboard.html"><i className="feather-icon icon-home" /><span>Dashboard</span></a></li>
            <li><a className="nav-link active" href="student-profile.html"><i className="feather-icon icon-user" /><span>My
              Profile</span></a></li>
            <li><a className="nav-link" href="student-enrolled-courses.html"><i className="feather-icon icon-book-open" /><span>Enrolled
              Courses</span></a>
            </li>
            <li><a className="nav-link" href="student-wishlist.html"><i className="feather-icon icon-gift" /><span>Wishlist</span></a></li>
            <li><a className="nav-link" href="student-reviews.html"><i className="feather-icon icon-star" /><span>Reviews</span></a>
            </li>
            <li><a className="nav-link" href="student-my-quiz-attempts.html"><i className="feather-icon icon-box" /><span>My
              Quiz Attempts</span></a>
            </li>
            <li><a className="nav-link" href="student-order-history.html"><i className="feather-icon icon-shopping-bag" /><span>Order
              History</span></a></li>
          </ul>
        </nav>
      </div>
      <div className="widget">
        <p className="grettings">instructor</p>
        <nav className="dashboard-nav">
          <ul className="list-unstyled nav">
            <li><a className="nav-link active" href="instructor-courses.html"><i className="feather-icon icon-book" /><span>My
              Courses</span></a></li>
              
             
            <li><a className="nav-link" href="instructor-assignments.html"><i className="feather-icon icon-briefcase" /><span>Assignments</span></a></li>
            <li><a className="nav-link" href="instructor-quiz-attemps.html"><i className="feather-icon icon-cpu" /><span>Quiz
              Attempts</span></a>
            </li>
            <li><a className="nav-link" href="instructor-announcements.html"><i className="feather-icon icon-bell" /><span>Announcements</span></a>
            </li>
          </ul>
        </nav>
      </div>{/*  Widget End */}
      <div className="widget">
        <p className="grettings">User</p>
        <nav className="dashboard-nav">
          <ul className="list-unstyled nav">
            <li><a className="nav-link" href="student-settings.html"><i className="feather-icon icon-settings" /><span>Settings</span></a></li>
            <li>
              <a
                className="nav-link"
                href=""
                onClick={handleLogout}
              >
                <i className="feather-icon icon-log-out" />
                <span>Logout</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>{/*  Widget End */}
    </aside>
  );
}
export default Aside;