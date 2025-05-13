import { Outlet } from "react-router-dom";
import PageContainer from "../../layout/PageContainer";

function DailyQuizzes() {
  return (
    <PageContainer>
      <Outlet />
    </PageContainer>
  );
}

export default DailyQuizzes;
