import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useEffect } from "react";
import Preloader from "../components/Preloader/Preloader";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import ViewSwitcher from "../components/ViewSwitcher";
import ChatComponent from "../components/ChatComponent";
const ProtectedRoute = () => {
  const { isAuthenticated, isCheckingAuth, checkAuth ,user} = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);
  const isAdmin = user?.role === "admin";
  return (
    <>
      {isCheckingAuth ? (
        <Preloader />
      ) : isAuthenticated ? (
        <>
        <ChatComponent />
        {isAdmin && <ViewSwitcher isAdmin={isAdmin} />}
          <Header />
          <Outlet />
          <Footer />
        </>
      ) : (
        <Navigate to="/login" replace />
      )}
    </>
  );
};

export default ProtectedRoute;
