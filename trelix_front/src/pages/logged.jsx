import { useNavigate } from "react-router-dom"; // Import useNavigate to redirect after logout
import { useAuthStore } from "../store/authStore"; // Import the useAuthStore to access the logout function

const Logged = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate(); // Initialize useNavigate for redirection

  const handleLogout = async () => {
    await logout(); // Call logout action from your auth store
    navigate("/"); // Redirect to the home page or sign-in page after logout
  };

  return (
    <>
      <button onClick={handleLogout}>Logout</button> {/* Logout button */}
    </>
  );
};

export default Logged;
