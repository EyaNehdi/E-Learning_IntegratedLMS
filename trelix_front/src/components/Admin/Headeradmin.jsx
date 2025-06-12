import { useNavigate, NavLink } from "react-router-dom";
import { useEffect } from "react";
import { useProfileStore } from "../../store/profileStore";
import UserAvatar from "./UserAvatar";
import {
  Users,
  Layers,
  Rocket,
  ShoppingCart,
  Home,
  BadgeCheck,
  User,
  LogOut,
  Settings,
  Menu,
} from "lucide-react";

const Headeradmin = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const { user, fetchUser } = useProfileStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const navLinks = [
    {
      path: "/admin",
      icon: <Users size={16} />,
      label: "Users",
      children: [
        { label: "List Users", path: "/admin/users" },
        { label: "Create User", path: "/admin/create" },
      ],
    },
    {
      path: "/monitor",
      icon: <Layers size={16} />,
      label: "Monitoring",
      children: [
        { label: "User Monitoring", path: "/monitor/users-audit" },
        { label: "Activity Logs", path: "/monitor/logs" },
        { label: "System Health", path: "/monitor/system" },
      ],
    },
    {
      path: "/badge",
      icon: <BadgeCheck size={16} />,
      label: "Gamification",
      children: [
        { label: "List Badges", path: "/badge/list-badges" },
        { label: "Create Badge", path: "/badge/createBadge" },
        { label: "Add Quiz", path: "/badge/quizz-add" },
      ],
    },
    {
      path: "/business-metrics/user-transactions",
      icon: <Rocket size={16} />,
      label: "Metrics",
      children: [
        {
          label: "User Transactions",
          path: "/business-metrics/user-transactions",
        },
      ],
    },
    {
      path: "/storeAdmin",
      icon: <ShoppingCart size={16} />,
      label: "Store",
      children: [
        { label: "List Packs", path: "/storeAdmin" },
        { label: "Create Pack", path: "/storeAdmin/create" },
      ],
    },
    {
      path: "/home",
      icon: <Home size={16} />,
      label: "Return Home",
    },
  ];

  return (
    <header className="admin-header-wrapper">
      <div className="admin-header-container">
        <button
          className="admin-header-toggle-button"
          onClick={onToggleSidebar}
        >
          <Menu size={20} />
        </button>

        <div className="admin-header-logo" onClick={() => navigate("/admin")}>
          <img src="/assetss/img/logoos.png" alt="Logo" />
        </div>

        <div className="admin-header-nav-links">
          {navLinks.map(({ path, label, icon, children }, index) => (
            <div className="admin-header-nav-link" key={index}>
              <NavLink
                to={path}
                className={({ isActive }) =>
                  isActive
                    ? "admin-header-nav-link admin-header-nav-link-active"
                    : "admin-header-nav-link"
                }
              >
                {icon}
                <span>{label}</span>
              </NavLink>
              {children && (
                <div className="admin-header-nav-link-dropdown">
                  {children.map((child) => (
                    <NavLink key={child.path} to={child.path}>
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="admin-header-user-dropdown">
          <UserAvatar user={user} />
          <div className="admin-header-user-dropdown-menu">
            <div
              className="admin-header-dropdown-item"
              onClick={() => navigate("/profile")}
            >
              <User size={16} /> Profile
            </div>
            <div
              className="admin-header-dropdown-item"
              onClick={() => navigate("/profile-settings")}
            >
              <Settings size={16} /> Settings
            </div>
            <div
              className="admin-header-dropdown-item"
              onClick={() => navigate("/login")}
            >
              <LogOut size={16} /> Logout
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Headeradmin;
