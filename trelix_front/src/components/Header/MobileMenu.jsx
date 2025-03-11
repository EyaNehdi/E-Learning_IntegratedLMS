import React from "react";
import { Link, useLocation } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import HomeIcon from "@mui/icons-material/Home";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SchoolIcon from "@mui/icons-material/School";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import Avatar from "@mui/material/Avatar";

const MobileMenu = ({ isAuthenticated, handleLogout, user, onClose }) => {
  const location = useLocation();

  return (
    <div className="mobile-menu">
      {/* Close Button */}
      <button onClick={onClose} className="close-menu-button">
        <CloseIcon />
      </button>

      {/* Logo */}
      <div>
        <div className="logo-container">
          <img src="/assets/images/ss.png" alt="Logo" className="logo-image" />
          <div className="divider" />
        </div>
        {/* Nav Items with Icons */}
        <nav className="nav-links">
          <Link
            to="/"
            className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
            onClick={onClose}
          >
            <HomeIcon className="nav-icon" />
            <span>Home</span>
          </Link>
          <Link
            to="/dashboard"
            className={`nav-link ${
              location.pathname === "/dashboard" ? "active" : ""
            }`}
            onClick={onClose}
          >
            <DashboardIcon className="nav-icon" />
            <span>Dashboard</span>
          </Link>
          <Link
            to="/courses"
            className={`nav-link ${
              location.pathname === "/courses" ? "active" : ""
            }`}
            onClick={onClose}
          >
            <SchoolIcon className="nav-icon" />
            <span>Courses</span>
          </Link>
          <Link
            to="/leaderboard"
            className={`nav-link ${
              location.pathname === "/leaderboard" ? "active" : ""
            }`}
            onClick={onClose}
          >
            <LeaderboardIcon className="nav-icon" />
            <span>Leaderboard</span>
          </Link>
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="bottom-section">
        {isAuthenticated ? (
          <>
            <Link to="/profile" className="user-profile-link" onClick={onClose}>
              <div className="user-profile">
                <Avatar
                  src={
                    user?.profilePhoto
                      ? `http://localhost:5000${user.profilePhoto}`
                      : ""
                  }
                  alt={user?.firstName}
                  className="profile-avatar"
                >
                  {user?.profilePhoto ? user?.firstName?.charAt(0) : ""}
                </Avatar>
                <div className="welcome-message">
                  <span>Welcome,</span>
                  <strong className="user-name">
                    {user?.firstName} {user?.lastName}
                  </strong>
                </div>
                <div className="profile-indicator">
                  <PersonIcon className="indicator-icon" />
                </div>
              </div>
            </Link>
            <button onClick={handleLogout} className="logout-button">
              <LogoutIcon className="nav-icon" />
              <span>Log Out</span>
            </button>
          </>
        ) : (
          <div className="auth-buttons">
            <Link to="/login" className="signin-button" onClick={onClose}>
              <span>Sign In</span>
            </Link>
            <Link to="/signup" className="signup-button" onClick={onClose}>
              <span>Sign Up</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileMenu;
