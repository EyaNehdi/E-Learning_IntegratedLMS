import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import Preloader from "../components/Preloader/Preloader";
import { Navigate, Outlet } from "react-router-dom";
import ViewSwitcher from "../components/ViewSwitcher";
import Headeradmin from "../components/Admin/Headeradmin";
import SidebarAdmin from "../components/Admin/SidebarAdmin";

const AdminRoute = () => {
  const { isAuthenticated, isCheckingAuth, checkAuth, user } = useAuthStore();
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const toggleSidebar = () => {
    setCollapsed((prev) => !prev);
  };

  const isAdmin = user?.role === "admin";

  if (isCheckingAuth) return <Preloader />;

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <>
      <Headeradmin onToggleSidebar={toggleSidebar} />
      <div className="flex">
        <SidebarAdmin
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          onToggleSidebar={toggleSidebar}
        />
        <main
          className={`flex-grow p-4 transition-all duration-300 ${
            collapsed ? "" : "ml-[240px]"
          }`}
        >
          <Outlet />
        </main>
      </div>
    </>
  );
};

export default AdminRoute;
