import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import Preloader from "../components/Preloader/Preloader";
import { Navigate, Outlet } from "react-router-dom";
import ViewSwitcher from "../components/ViewSwitcher";
const AdminRoute = () => {
  const { isAuthenticated, isCheckingAuth, checkAuth, user } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  const isAdmin = user?.role === "admin";

  if (isCheckingAuth) return <Preloader />;

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <>
      {isAdmin && <ViewSwitcher isAdmin={isAdmin} />}
      <Outlet />;
    </>
  );
};

export default AdminRoute;