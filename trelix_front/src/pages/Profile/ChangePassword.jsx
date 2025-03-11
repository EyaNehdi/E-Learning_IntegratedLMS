import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const navigate = useNavigate();

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put("http://localhost:5000/api/info/profile/password", {
        oldPassword,
        newPassword,
      });
      setPasswordMessage("✅ Password updated successfully!");
      navigate("/profile/details"); // Redirige après le changement de mot de passe
    } catch (error) {
      setPasswordMessage(error.response?.data?.message || "❌ Error updating password");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h3 className="text-lg font-semibold mb-4">Change Your Password</h3>
        <form onSubmit={handlePasswordChange} className="flex flex-col">
          <input
            type="password"
            placeholder="Old Password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="border p-2 rounded mb-2"
            required
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="border p-2 rounded mb-2"
            required
          />
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
            Update Password
          </button>
        </form>
        {passwordMessage && <p className="mt-2 text-red-500">{passwordMessage}</p>}
      </div>
    </div>
  );
};

export default ChangePassword;
