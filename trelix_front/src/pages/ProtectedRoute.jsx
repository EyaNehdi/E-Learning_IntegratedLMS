import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore"; // Adjust path as needed

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuthStore();

  return isAuthenticated ?  <Outlet/>: <Navigate to="/login" replace />;
};

export default ProtectedRoute;
