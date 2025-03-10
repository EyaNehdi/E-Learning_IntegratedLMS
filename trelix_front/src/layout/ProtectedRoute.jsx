import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useEffect } from "react";
import Preloader from "../components/Preloader/Preloader";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";

const ProtectedRoute = () => {
  const { isAuthenticated, isCheckingAuth, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <>
      {isCheckingAuth ? (
        <Preloader />
      ) : isAuthenticated ? (
        <>
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
