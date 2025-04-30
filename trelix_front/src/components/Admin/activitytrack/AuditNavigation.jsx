import { NavLink } from "react-router-dom";
import "./AuditStyle.css";

const AuditNavigation = () => {
  return (
    <div className="audit-nav">
      <h3 className="audit-nav-title">Audit Logs</h3>
      <ul className="audit-nav-list">
        <li className="audit-nav-item">
          <NavLink
            to="/monitor"
            end
            className={({ isActive }) =>
              `audit-nav-link ${isActive ? "active" : ""}`
            }
          >
            Activity Logs
          </NavLink>
        </li>
        <li className="audit-nav-item">
          <NavLink
            to="/monitor/users-audit"
            className={({ isActive }) =>
              `audit-nav-link ${isActive ? "active" : ""}`
            }
          >
            User Monitoring
          </NavLink>
        </li>
        {/* <li className="audit-nav-item">
          <NavLink
            to="/audit/content"
            className={({ isActive }) => 
              `audit-nav-link ${isActive ? "active" : ""}`
            }
          >
            Content Management
          </NavLink>
        </li> */}
        <li className="audit-nav-item">
          <NavLink
            to="/monitor/system"
            className={({ isActive }) =>
              `audit-nav-link ${isActive ? "active" : ""}`
            }
          >
            System Health
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default AuditNavigation;
