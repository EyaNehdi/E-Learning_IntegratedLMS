import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate(); // Initialize the useNavigate hook

  const { login, isAuthenticated } = useAuthStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      await login(email, password);
      // Redirect to the dashboard or homepage after successful login
      navigate("/logged"); // Replace with the route you want to redirect to
    } catch (error) {
      if (error.response?.data?.message === "Account does not exist") {
        setErrorMessage("Account does not exist");
      } else {
        setErrorMessage(error.response?.data?.message || "Error logging in");
      }
    }
  };

 

  useEffect(() => {
    // If the user is already authenticated, redirect them to the dashboard
    if (isAuthenticated) {
      navigate("/logeed"); // Redirect to a different page when logged in
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="signup-container">
      <h2>Sign In</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit">Sign In</button>
        </form>
    

      {errorMessage && <div className="error-message">{errorMessage}</div>}
    </div>
  );
};

export default SignIn;
