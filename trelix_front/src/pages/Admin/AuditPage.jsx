import { Outlet } from "react-router-dom";
import Headeradmin from "../../components/Admin/Headeradmin";
import AuditNavigation from "../../components/Admin/activitytrack/AuditNavigation";
import "../../components/Admin/activitytrack/AuditStyle.css"; 

const AuditPage = () => {
  return (
    <div className="audit-container">
      <Headeradmin />

      <div className="audit-content-wrapper">
        {/* Side Panel */}
        <div className="audit-sidebar">
          <AuditNavigation />
        </div>

        {/* Content Area */}
        <div className="audit-main-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuditPage;
