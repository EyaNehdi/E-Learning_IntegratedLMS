import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useEffect } from "react";
import Preloader from "../components/Preloader/Preloader";

const PublicRoute = () => {
  const { isAuthenticated, isCheckingAuth, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <>
      {isCheckingAuth ? (
        <Preloader />
      ) : !isAuthenticated ? (
        <>
          <Outlet />
        </>
      ) : (
        <Navigate to="/home" replace />
      )}
    </>
  );
};

export default PublicRoute;
