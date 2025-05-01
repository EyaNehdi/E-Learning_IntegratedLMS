import { useNavigate, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { useProfileStore } from "../../store/profileStore";
import UserAvatar from "./UserAvatar";

const Headeradmin = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, fetchUser } = useProfileStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const navLinks = [
    { path: "/admin", icon: "lnr-users", label: "Users" },
    { path: "/monitor", icon: "lnr-layers", label: "Monitoring" },
    { path: "/report", icon: "lnr-rocket", label: "Quizzes" },
    { path: "/storeAdmin", icon: "lnr-cart", label: "Store Management" },

    { path: "/badge", icon: "lnr-rocket", label: "Gamification" },
    { path: "/home", icon: "lnr-home", label: "Return Home" },
  ];

  return (
    <header className="header">
      <div>
        <link rel="stylesheet" href="/assetss/css/bootstrap.min.css" />
        <link rel="stylesheet" href="/assetss/css/lnr-icon.css" />
        <link rel="stylesheet" href="/assetss/css/style.css" />
        <style>
          {`           
            .header {
              background-color: #6045FF; /* Deep purple as specified */
            }
            
           
            .top-header-section {
              background-color: inherit;
            }
            
            .nav-link-active {
              background-color: #FFA03A; /* Orange as specified */
              color: white !important;
              border-radius: 4px;
              font-weight: 600;
            }
            
            .nav-link-inactive {
              color: #ffffff; /* White for good contrast against purple */
            }
            
            .nav-link-inactive:hover {
              background-color: rgba(255, 255, 255, 0.15);
              border-radius: 4px;
            }
            
            .cursor-pointer {
              cursor: pointer;
            }
            
            .offcanvas-menu {
              display: none;
              position: fixed;
              top: 0;
              right: 0;
              width: 250px;
              height: 100%;
              background: white;
              z-index: 1000;
              padding: 20px;
              box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
              overflow-y: auto;
            }
            
            .offcanvas-menu.show {
              display: block;
            }
            
            /* Override bottom navigation bg color */
            .header-menu-list.bg-white {
              background-color: #7057FF !important; /* Slightly lighter purple for bottom nav */
            }
            
            /* Custom button color */
            .btn-primary {
              background-color: #FFA03A;
              border-color: #FFA03A;
            }
            
          `}
        </style>
      </div>

      {/* Top Header Section */}
      <div className="top-header-section">
        <div className="container-fluid">
          <div className="row align-items-center">
            {/* Logo */}
            <div className="col-lg-3 col-md-3 col-sm-3 col-6">
              <div className="logo my-3 my-sm-0">
                <a
                  className="cursor-pointer"
                  onClick={() => navigate("/admin")}
                >
                  <img
                    src="/assetss/img/logoos.png"
                    alt="logo image"
                    className="img-fluid"
                    width={100}
                  />
                </a>
              </div>
            </div>

            {/* Right Side Content */}
            <div className="col-lg-9 col-md-9 col-sm-9 col-6 text-right">
              {/* Desktop View */}
              <div className="user-block d-none d-lg-block">
                <div className="row align-items-center">
                  <div className="col-lg-12 col-md-12 col-sm-12">
                    {/* User Profile Dropdown */}
                    <div className="user-info align-right dropdown d-inline-block header-dropdown">
                      <a
                        href="#"
                        data-toggle="dropdown"
                        className="menu-style dropdown-toggle"
                        onClick={(e) => e.preventDefault()}
                      >
                        <UserAvatar user={user} />
                      </a>
                      {/* Dropdown Menu */}
                      <div className="dropdown-menu notification-dropdown-menu shadow-lg border-0 p-3 m-0 dropdown-menu-right">
                        <a
                          className="dropdown-item p-2 cursor-pointer"
                          onClick={() => navigate("/profile")}
                        >
                          <span className="media align-items-center">
                            <span className="lnr lnr-user mr-3" />
                            <span className="media-body text-truncate">
                              <span className="text-truncate">Profile</span>
                            </span>
                          </span>
                        </a>
                        <a
                          className="dropdown-item p-2 cursor-pointer"
                          onClick={() => navigate("/profile-settings")}
                        >
                          <span className="media align-items-center">
                            <span className="lnr lnr-cog mr-3" />
                            <span className="media-body text-truncate">
                              <span className="text-truncate">Settings</span>
                            </span>
                          </span>
                        </a>
                        <a
                          className="dropdown-item p-2 cursor-pointer"
                          onClick={() => navigate("/login")}
                        >
                          <span className="media align-items-center">
                            <span className="lnr lnr-power-switch mr-3" />
                            <span className="media-body text-truncate">
                              <span className="text-truncate">Logout</span>
                            </span>
                          </span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile View Toggle */}
              <div className="d-block d-lg-none">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleMobileMenu();
                  }}
                >
                  <span className="lnr lnr-menu d-block display-5 text-white" />
                </a>

                {/* Mobile Menu */}
                <div
                  className={`offcanvas-menu ${mobileMenuOpen ? "show" : ""}`}
                >
                  <span
                    className="lnr lnr-cross float-left display-6 position-absolute t-1 l-1 text-dark cursor-pointer"
                    onClick={toggleMobileMenu}
                  />
                  <div className="user-info align-center text-center">
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className="d-block menu-style text-white"
                    >
                      <div className="user-avatar d-inline-block mr-3">
                        <UserAvatar user={user} />
                      </div>
                    </a>
                  </div>

                  {/* Mobile Search */}
                  <div className="user-notification-block align-center mt-3">
                    <div className="top-nav-search item-animated">
                      <form>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search here"
                        />
                        <button className="btn" type="submit">
                          <i className="fa fa-search" />
                        </button>
                      </form>
                    </div>
                  </div>
                  <hr />

                  {/* Mobile Navigation Links */}
                  <div className="user-menu-items px-3 m-0">
                    <a
                      className="px-0 pb-2 pt-0 cursor-pointer"
                      onClick={() => {
                        navigate("/admin");
                        toggleMobileMenu();
                      }}
                    >
                      <span className="media align-items-center">
                        <span className="lnr lnr-home mr-3" />
                        <span className="media-body text-truncate text-left">
                          <span className="text-truncate text-left">
                            Dashboard
                          </span>
                        </span>
                      </span>
                    </a>

                    {/* Map through navigation links */}
                    {navLinks.map((link, index) => (
                      <a
                        key={index}
                        className="p-2 cursor-pointer"
                        onClick={() => {
                          navigate(link.path);
                          toggleMobileMenu();
                        }}
                      >
                        <span className="media align-items-center">
                          <span className={`lnr ${link.icon} mr-3`} />
                          <span className="media-body text-truncate text-left">
                            <span className="text-truncate text-left">
                              {link.label}
                            </span>
                          </span>
                        </span>
                      </a>
                    ))}

                    {/* Additional Mobile Links */}
                    <a
                      className="p-2 cursor-pointer"
                      onClick={() => {
                        navigate("/profile");
                        toggleMobileMenu();
                      }}
                    >
                      <span className="media align-items-center">
                        <span className="lnr lnr-user mr-3" />
                        <span className="media-body text-truncate text-left">
                          <span className="text-truncate text-left">
                            Profile
                          </span>
                        </span>
                      </span>
                    </a>
                    <a
                      className="p-2 cursor-pointer"
                      onClick={() => {
                        navigate("/login");
                        toggleMobileMenu();
                      }}
                    >
                      <span className="media align-items-center">
                        <span className="lnr lnr-power-switch mr-3" />
                        <span className="media-body text-truncate text-left">
                          <span className="text-truncate text-left">
                            Logout
                          </span>
                        </span>
                      </span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Menu - Desktop Only */}
      <div className="header-wrapper d-none d-sm-none d-md-none d-lg-block">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="header-menu-list d-flex bg-white rt_nav_header horizontal-layout nav-bottom">
                <div className="append mr-auto my-0 my-md-0">
                  <ul className="list-group list-group-horizontal-md mr-auto">
                    {navLinks.map((link, index) => (
                      <li key={index} className="mr-1">
                        <NavLink
                          to={link.path}
                          className={({ isActive }) =>
                            isActive
                              ? "btn-ctm-space nav-link-active"
                              : "btn-ctm-space nav-link-inactive"
                          }
                        >
                          <span className={`lnr ${link.icon} pr-0 pr-lg-2`} />
                          <span className="d-none d-lg-inline">
                            {link.label}
                          </span>
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Headeradmin;
