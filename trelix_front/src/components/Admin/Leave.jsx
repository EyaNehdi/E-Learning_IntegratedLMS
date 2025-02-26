import Headeradmin from './Headeradmin';
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
function Leave(){
  const { id } = useParams(); // Get user ID from URL
  const navigate = useNavigate();
  const isEditing = !!id; // If id exists, we're editing; otherwise, we're adding
  const [user, setUser] = useState({ firstName: "", lastName: "", email: "", role: "student" });

  useEffect(() => {
    if (id) {
      axios.get(`/api/admin/user/${id}`)  
        .then((res) => setUser(res.data))
        .catch((err) => console.error("Error fetching user:", err));
    }
  }, [id]);
  
  

  // Handle form change
  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  // Handle form submission (update or create)
  const handleSubmit = (e) => {
    e.preventDefault();

    if (isEditing) {
      // Update existing user
      axios.put(`/api/admin/updateUser/${id}`, user)
        .then(() => {
          alert("User updated successfully!");
          navigate("/review"); // Redirect back to user management
        })
        .catch((err) => console.error("Error updating user:", err));
    } else {
      // Create new user
      axios.post(`/api/admin/addUser`, user)
        .then(() => {
          alert("User added successfully!");
          navigate("/admin/review"); // Redirect back
          
        })
        .catch((err) => console.error("Error adding user:", err));
    }
  };
  //css and page
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "/assetss/js/custom.js"; // Adjust path if necessary
    script.async = true;
    document.body.appendChild(script);
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/assetss/css/style.css"; // Adjust if needed
    document.head.appendChild(link);
      
    return () => {
      document.body.removeChild(script); // Clean up script when component unmounts
      document.head.removeChild(link);
    };
  }, []);
  
                      return(
<div>
  {/* Mirrored from dleohr.dreamstechnologies.com/template-1/dleohr-horizontal/leave.html by HTTrack Website Copier/3.x [XR&CO'2014], Fri, 21 Feb 2025 08:53:58 GMT */}
  {/* Required meta tags */}
  <meta charSet="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Leave Page</title>
  {/* Favicon */}
  <link rel="icon" type="image/x-icon" href="assetss/img/favicon.png" />
 <div>
  {/* Bootstrap CSS */}
  <link rel="stylesheet" href="assetss/css/bootstrap.min.css" />
  {/* Linearicon Font */}
  <link rel="stylesheet" href="assetss/css/lnr-icon.css" />
  {/* Fontawesome CSS */}
  <link rel="stylesheet" href="assetss/css/font-awesome.min.css" />
  {/* Custom CSS */}
  <link rel="stylesheet" href="assetss/css/style.css" />
  <div>
    <link rel="stylesheet" href="assetss/css/bootstrap.min.css" />
    <link rel="stylesheet" href="assetss/css/lnr-icon.css" />
    <link rel="stylesheet" href="assetss/css/font-awesome.min.css" />
    <link rel="stylesheet" href="assetss/css/style.css" />
  </div>
</div>
    <Headeradmin/>
    <div className="page-wrapper" style={{
    marginBlock: "2px"}}>
      <div className="container-fluid">
        <div className="row">
          <div className=" col-xl-3 col-lg-4 col-md-12 theiaStickySidebar">
            <aside className="sidebar sidebar-user">
              <div className="card ctm-border-radius shadow-sm">
                <div className="card-body py-4">
                  <div className="row">
                    <div className="col-md-12 mr-auto text-left">
                      <div className="custom-search input-group">
                        <div className="custom-breadcrumb">
                          <ol className="breadcrumb no-bg-color d-inline-block p-0 m-0 mb-2">
                            <li className="breadcrumb-item d-inline-block"><a href="index.html" className="text-dark">Home</a></li>
                            <li className="breadcrumb-item d-inline-block active">Leave</li>
                          </ol>
                          <h4 className="text-dark">Leave</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card ctm-border-radius shadow-sm">
                <div className="card-header">
                  <div className="d-inline-block">
                    <h4 className="card-title mb-0">Focus Technologies</h4>
                    <p className="mb-0 ctm-text-sm">Head Office</p>
                  </div>
                </div>
                <div className="card-body">
                  <h4 className="card-title">Members</h4>
                  <a href="employment.html"><span className="avatar" data-toggle="tooltip" data-placement="top" title="Danny Ward"><img alt="avatar image" src="assetss/img/profiles/img-5.jpg" className="img-fluid" /></span></a>
                  <a href="employment.html"><span className="avatar" data-toggle="tooltip" data-placement="top" title="Linda Craver"><img className="img-fluid" alt="avatar image" src="assetss/img/profiles/img-4.jpg" /></span></a>
                  <a href="employment.html"><span className="avatar" data-toggle="tooltip" data-placement="top" title="Jenni Sims"><img className="img-fluid" alt="avatar image" src="assetss/img/profiles/img-3.jpg" /></span></a>
                  <a href="employment.html"><span className="avatar" data-toggle="tooltip" data-placement="top" title="Maria Cotton"><img alt="avatar image" src="assetss/img/profiles/img-6.jpg" className="img-fluid" /></span></a>
                  <a href="employment.html"><span className="avatar" data-toggle="tooltip" data-placement="top" title="John Gibbs"><img className="img-fluid" alt="avatar image" src="assetss/img/profiles/img-2.jpg" /></span></a>
                  <a href="employment.html"><span className="avatar" data-toggle="tooltip" data-placement="top" title="Richard Wilson"><img className="img-fluid" alt="avatar image" src="assetss/img/profiles/img-10.jpg" /></span></a>
                </div>
              </div>
              <div className="card shadow-sm ctm-border-radius">
                <div className="card-body">
                  <span className="avatar" data-toggle="tooltip" data-placement="top" title="Jenni Sims"><img src="assetss/img/profiles/img-3.jpg" alt="Jenni Sims" className="img-fluid" /></span><span className="ml-4">Jenni Sims is working from home today.</span>
                </div>
              </div>
              <div className="card shadow-sm ctm-border-radius">
                <div className="card-body">
                  <span className="avatar" data-toggle="tooltip" data-placement="top" title="John Gibbs"><img className="img-fluid" src="assetss/img/profiles/img-2.jpg" alt="Jenni Sims" /></span><span className="ml-4">
                    John Gibbs is away today.</span>
                </div>
              </div>
            </aside>
          </div>
          <div className="col-xl-9 col-lg-8 col-md-12">
            <div className="row">
              <div className="col-md-12">
                <div className="card ctm-border-radius shadow-sm">
                  <div className="card-header">
                    <h4 className="card-title mb-0">Edit User</h4>
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
                        <button className="btn btn-theme button-1 text-white ctm-border-radius mt-4" type="submit">Apply</button>
                        <a href="#" className="btn btn-danger text-white ctm-border-radius mt-4" onClick={() => navigate("/review")}>Cancel</a>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
 
  {/* Inner Wrapper */}
  <div className="sidebar-overlay" id="sidebar_overlay" />
  {/* jQuery */}
  {/* Bootstrap Core JS */}
  {/* Sticky sidebar JS */}
  {/* Select2 JS */}
  {/* Datetimepicker JS */}
  {/* Custom Js */}
  {/* Mirrored from dleohr.dreamstechnologies.com/template-1/dleohr-horizontal/leave.html by HTTrack Website Copier/3.x [XR&CO'2014], Fri, 21 Feb 2025 08:54:05 GMT */}
</div>

);
}
export default Leave;
