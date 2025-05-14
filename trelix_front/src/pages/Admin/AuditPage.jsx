import { Outlet } from "react-router-dom";
import "../../components/Admin/activitytrack/AuditStyle.css";
import PageContainer from "../../layout/PageContainer";

const AuditPage = () => {
  return (
    <PageContainer>
      <Outlet />
    </PageContainer>
  );
};

export default AuditPage;
