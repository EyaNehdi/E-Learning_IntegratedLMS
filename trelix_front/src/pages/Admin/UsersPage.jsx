import { Outlet } from "react-router-dom";
import PageContainer from "../../layout/PageContainer";

const UsersPage = () => {
  return (
    <PageContainer>
      <Outlet />
    </PageContainer>
  );
};
export default UsersPage;
