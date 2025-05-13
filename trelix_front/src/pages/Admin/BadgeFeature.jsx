import { Outlet } from "react-router-dom";
import PageContainer from "../../layout/PageContainer";

const BadgeFeature = () => {
  return (
    <PageContainer>
      <Outlet />
    </PageContainer>
  );
};

export default BadgeFeature;
