import Headeradmin from "./Headeradmin";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { CheckCircle, XCircle } from "lucide-react";
import "./ResponsiveStyle.css";

const ManageUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "student",
  });

  const [errors, setErrors] = useState({
    email: "",
    firstName: "",
    lastName: "",
  });

  useEffect(() => {
    if (id) {
      axios
        .get(`/api/admin/user/${id}`)
        .then((res) => setUser(res.data))
        .catch((err) => console.error("Error fetching user:", err));
    }
  }, [id]);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

    if (!user.firstName) newErrors.firstName = "First Name is required";
    if (!user.lastName) newErrors.lastName = "Last Name is required";
    if (!user.email) newErrors.email = "Email is required";
    else if (!emailRegex.test(user.email))
      newErrors.email = "Invalid email address";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const request = isEditing
      ? axios.put(`/api/admin/updateUser/${id}`, user)
      : axios.post(`/api/admin/createUser`, user);

    request
      .then(() => {
        alert(
          isEditing ? "User updated successfully!" : "User added successfully!"
        );
        navigate("/admin/users");
      })
      .catch((err) => console.error("Error saving user:", err));
  };

  return (
    <div className="custom-user-container">
      <div className="custom-form-wrapper">
        <h2 className="custom-form-title">
          {isEditing ? "Edit User" : "Create User"}
        </h2>
        <form onSubmit={handleSubmit} className="custom-user-form">
          <div className="custom-form-row">
            <div className="custom-form-group">
              <label htmlFor="firstName">
                First Name<span className="custom-required">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={user.firstName}
                onChange={handleChange}
              />
              {errors.firstName && (
                <p className="custom-error-text">{errors.firstName}</p>
              )}
            </div>
            <div className="custom-form-group">
              <label htmlFor="lastName">
                Last Name<span className="custom-required">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={user.lastName}
                onChange={handleChange}
              />
              {errors.lastName && (
                <p className="custom-error-text">{errors.lastName}</p>
              )}
            </div>
          </div>
          <div className="custom-form-row">
            <div className="custom-form-group">
              <label htmlFor="email">E-mail</label>
              <input
                type="text"
                id="email"
                name="email"
                value={user.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="custom-error-text">{errors.email}</p>
              )}
            </div>
            <div className="custom-form-group">
              <label htmlFor="role">
                Role<span className="custom-required">*</span>
              </label>
              <select
                id="role"
                name="role"
                value={user.role}
                onChange={handleChange}
              >
                <option value="admin">Admin</option>
                <option value="instructor">Instructor</option>
                <option value="student">Student</option>
              </select>
            </div>
          </div>
          <div className="custom-form-actions justify-start gap-3">
            <button type="submit" className="custom-outline-btn create-btn">
              <CheckCircle size={16} className="mr-2" /> Apply
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/users")}
              className="custom-outline-btn archive-btn"
            >
              <XCircle size={16} className="mr-2" /> Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageUser;
