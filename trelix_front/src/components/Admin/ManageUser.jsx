import Headeradmin from "./Headeradmin";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

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

    // Return true if there are no errors
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }
    if (isEditing) {
      axios
        .put(`/api/admin/updateUser/${id}`, user)
        .then(() => {
          alert("User updated successfully!");
          navigate("/admin/users");
        })
        .catch((err) => console.error("Error updating user:", err));
    } else {
      axios
        .post(`/api/admin/createUser`, user)
        .then(() => {
          alert("User added successfully!");
          navigate("/admin/users");
        })
        .catch((err) => console.error("Error adding user:", err));
    }
  };
  // useEffect(() => {
  //   const script = document.createElement("script");
  //   script.src = "/assetss/js/custom.js"; // Adjust path if necessary
  //   script.async = true;
  //   document.body.appendChild(script);
  //   const link = document.createElement("link");
  //   link.rel = "stylesheet";
  //   link.href = "/assetss/css/style.css"; // Adjust if needed
  //   document.head.appendChild(link);

  //   return () => {
  //     document.body.removeChild(script); // Clean up script when component unmounts
  //     document.head.removeChild(link);
  //   };
  // }, []);

  return (
    <div className="col-xl-9 col-lg-8 col-md-12">
      <div className="row">
        <div className="col-md-12">
          <div className="card ctm-border-radius shadow-sm">
            <div className="card-header">
              <h4 className="card-title mb-0">
                {isEditing ? "Edit User" : "Create User"}
              </h4>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>
                        First Name
                        <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="firstName"
                        name="firstName"
                        value={user.firstName}
                        onChange={handleChange}
                      />
                      {errors.firstName && (
                        <p className="text-danger">{errors.firstName}</p>
                      )}
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>
                        Last Name
                        <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="lastName"
                        name="lastName"
                        value={user.lastName}
                        onChange={handleChange}
                      />
                      {errors.lastName && (
                        <p className="text-danger">{errors.lastName}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>E-mail</label>
                      <input
                        type="text"
                        className="form-control"
                        id="email"
                        name="email"
                        value={user.email}
                        onChange={handleChange}
                      />
                      {errors.email && (
                        <p className="text-danger">{errors.email}</p>
                      )}
                    </div>
                  </div>
                  <div className="col-sm-6">
                    <div className="form-group">
                      <label>
                        Role
                        <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-control"
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
                </div>
                <div className="text-center">
                  <button
                    className="btn btn-theme button-1 text-white ctm-border-radius mt-4"
                    type="submit"
                  >
                    Apply
                  </button>
                  <a
                    href="#"
                    className="btn btn-danger text-white ctm-border-radius mt-4"
                    onClick={() => navigate("/admin")}
                  >
                    Cancel
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ManageUser;
