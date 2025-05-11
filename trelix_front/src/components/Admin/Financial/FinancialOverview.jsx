import { Outlet } from "react-router-dom";
import PageContainer from "../../../layout/PageContainer";
const FinancialOverview = () => {
  return (
    <PageContainer>
      <Outlet />
    </PageContainer>
  );
};

export default FinancialOverview;
