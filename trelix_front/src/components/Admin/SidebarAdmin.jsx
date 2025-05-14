import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  Users,
  Layers,
  Rocket,
  ShoppingCart,
  BadgeCheck,
  HeartPulse,
  FileText,
  Package,
  ChevronDown,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useProfileStore } from "../../store/profileStore";
import "./Sidebar.css";
const sidebarConfig = [
  {
    label: "Users",
    icon: <Users size={16} />,
    path: "/admin",
    children: [
      { label: "List Users", path: "/admin/users" },
      { label: "Create User", path: "/admin/create" },
    ],
  },
  {
    label: "Monitoring",
    icon: <Layers size={16} />,
    path: "/monitor",
    children: [
      { label: "User Monitoring", path: "/monitor/users-audit" },
      { label: "Activity Logs", path: "/monitor/logs" },
      { label: "System Health", path: "/monitor/system" },
    ],
  },
  {
    label: "Gamification",
    icon: <BadgeCheck size={16} />,
    path: "/badge",
    children: [
      { label: "List Badges", path: "/badge/list-badges" },
      { label: "Create Badge", path: "/badge/createBadge" },
      { label: "Add Quiz", path: "/badge/quizz-add" },
    ],
  },
  {
    label: "Business Metrics",
    icon: <HeartPulse size={16} />,
    path: "/business-metrics/user-transactions",
    children: [
      {
        label: "User Transactions",
        path: "/business-metrics/user-transactions",
      },
    ],
  },
  {
    label: "Store",
    icon: <ShoppingCart size={16} />,
    path: "/storeAdmin",
    children: [
      { label: "List Packs", path: "/storeAdmin" },
      { label: "Create Pack", path: "/storeAdmin/create" },
    ],
  },
  {
    label: "Return Home",
    icon: <Rocket size={16} />,
    path: "/home",
  },
];

const SidebarAdmin = ({ collapsed, setCollapsed, onToggleSidebar }) => {
  const { pathname } = useLocation();
  const { user } = useProfileStore();
  const [expanded, setExpanded] = useState({});
  const sidebarRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setCollapsed(true);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setCollapsed]);

  const toggleSection = (label) => {
    setExpanded((prev) => {
      const isCurrentlyOpen = prev[label];
      return {
        [label]: !isCurrentlyOpen,
      };
    });
  };

  return (
    <aside
      ref={sidebarRef}
      className={`admin-sidebar ${collapsed ? "admin-sidebar-hidden" : ""}`}
    >
      <div className="admin-sidebar-header">
        <h2 className="admin-sidebar-title">Admin Panel</h2>
        <button onClick={onToggleSidebar} className="admin-sidebar-toggle">
          ☰
        </button>
      </div>

      <nav>
        <ul className="admin-sidebar-list">
          {sidebarConfig.map((item) => (
            <li key={item.path}>
              <div className="admin-sidebar-section">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    isActive
                      ? "admin-sidebar-link active"
                      : "admin-sidebar-link"
                  }
                  onClick={() => {
                    if (item.children) {
                      toggleSection(item.label);
                    } else if (window.innerWidth <= 768) {
                      setCollapsed(true);
                    }
                  }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.children &&
                    (expanded[item.label] ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    ))}
                </NavLink>
              </div>
              {item.children && expanded[item.label] && (
                <ul className="admin-sidebar-sublist">
                  {item.children.map((child) => (
                    <li key={child.path}>
                      <NavLink
                        to={child.path}
                        className={({ isActive }) =>
                          isActive
                            ? "admin-sidebar-link admin-sidebar-child active"
                            : "admin-sidebar-link admin-sidebar-child"
                        }
                        onClick={() => {
                          if (window.innerWidth <= 768) {
                            setTimeout(() => setCollapsed(true), 100);
                          }
                        }}
                      >
                        <span>{child.label}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="admin-sidebar-footer">
        <div className="admin-sidebar-user">
          <div className="admin-sidebar-user-avatar">
            {user?.name?.[0] || "A"}
          </div>
          <div className="admin-sidebar-user-info">
            <p className="admin-sidebar-user-name">{user?.name}</p>
            <button
              className="admin-sidebar-logout"
              onClick={() => (window.location.href = "/login")}
            >
              Logout <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default SidebarAdmin;
