import React, { useEffect, useState } from "react";
import Aside from './Aside';
import Footer from './Footer';
import Header from './Header';
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useProfileStore } from "../store/profileStore";
// Using shadcn/ui for styling
import { FaEdit, FaSave } from "react-icons/fa";
import axios from "axios";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { toast, ToastContainer } from "react-toastify";

function Profile() {
  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };
  const [showPopup, setShowPopup] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);


  const { isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const { user, fetchUser, clearUser, updateUser } = useProfileStore();
  const [isEditing, setIsEditing] = useState(false);
  const [completion, setCompletion] = useState(0);
  const [profile, setProfile] = useState({ user });
  let timeoutId; // Define timeoutId

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
    clearTimeout(timeoutId); // Clear the timeout if it's set
    timeoutId = setTimeout(async () => {
      try {
        console.log("🟢 Updating profile...", name);
        const response = await axios.put("http://localhost:5000/api/info/profile/edit", {
          [name]: value,
          email: user.email
        });

        console.log("Update successful:", response.data);

      } catch (error) {
        console.error("Error updating profile:", error);
      }
    }, 500); // Wait for 500ms after the user stops typing
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto);
  const [coverPhoto, setCoverPhoto] = useState(user?.coverPhoto);
  const [skils, setSkils] = useState(user?.skils);
  const bgColor = React.useMemo(() => getRandomColor(), [user?.firstName]); // Random color per user
  useEffect(() => {
    console.log("🟢 Checking authentication...");
    checkAuth();
    console.log("user avant fetch:" + user);
    const fetchData = async () => {
      await fetchUser(); // Ensure user data is fetched first
      console.log("user after fetch", user);
    };
    fetchData();
  }, [fetchUser]);
  useEffect(() => {
    if (user) {
      setProfile(user);
      calculateCompletion(user);
      setProfilePhoto(user.profilePhoto || profilePhoto);
      setCoverPhoto(user.coverPhoto || coverPhoto);
      setSkils(user.skils);
    }
  }, [user]);
  const calculateCompletion = (profileData) => {
    const fields = ["firstName", "lastName", "email", "profilePhoto", "coverPhoto", "phone"];
    const filledFields = fields.filter(field => profileData[field]);
    const percentage = Math.round((filledFields.length / fields.length) * 100);
    setCompletion(percentage);
  };
  useEffect(() => {
    if (user) {
      console.log("🟢 User data fetched:", user);
    }
  }, [user]);
  const handleProfilePhotoChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePhoto", file);

    try {
      const response = await axios.put("/api/info/profile/photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true, // if using cookies for auth
      });

      setProfilePhoto(URL.createObjectURL(file)); // Update preview
      updateUser({ profilePhoto: response.data.profilePhoto }); // Update state with server response
    } catch (error) {
      console.error("Error updating profile photo:", error);
    }
  };

  const handleCoverPhotoChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("coverPhoto", file);

    try {
      const response = await axios.put("/api/info/profile/cover", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      setCoverPhoto(URL.createObjectURL(file));
      updateUser({ coverPhoto: response.data.coverPhoto });
    } catch (error) {
      console.error("Error updating cover photo:", error);
    }
  };


  const [cvFile, setCvFile] = useState(null);
  const [entities, setEntities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null); // State for error messages

  const handleFileChange = (event) => {
    setCvFile(event.target.files[0]);
    setError(null); // Reset error on file change
  };

  const handleSubmit = async () => {
    const file = cvFile;
    if (!file) return;

    const formData = new FormData();
    formData.append('cvFile', file); // Use the raw file from the input

    setIsLoading(true); // Start loading
    setError(null); // Reset error message

    try {
      const response = await axios.post(
        'http://localhost:5000/ia/auth/CV',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data' // Add this header
          },
          timeout: 30000
        }
      );
      // Join them as a single string

      setEntities(response.data.entities);

    } catch (error) {
      setError(error.response?.data?.error || error.message); // Capture error message
      console.error('Error:', error.response?.data || error.message);
    } finally {
      setIsLoading(false); // End loading regardless of success or failure
    }
  };
  useEffect(() => {
    if (completion === 100) {
      awardBadge();
    }
  }, [completion]);
  const awardBadge = async () => {
    const badgeImageUrl = "assets/Badges/WelcomeBadge.png"; // URL of the badge image

    try {
      const response = await axios.post("http://localhost:5000/api/info/profile/badge", {
        badge: " Welcome to Trelix Badge 🏅",
        email: user.email,  // Send the user's email
        badgeImage: badgeImageUrl // Send the badge image URL
      });
      console.log("Badge awarded:", response.data);
    } catch (error) {
      console.error("Error awarding badge:", error);
    }
  };
  return (

    <div>
      <ToastContainer position="top-right" autoClose={2000} />
      {/* Mirrored from html.theme-village.com/eduxo/student-profile.html by HTTrack Website Copier/3.x [XR&CO'2014], Wed, 12 Feb 2025 20:26:24 GMT */}
      <meta charSet="utf-8" />
      <meta httpEquiv="x-ua-compatible" content="ie=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      <meta name="description" content="An ideal tempalte for online education, e-Learning, Course School, Online School, Kindergarten, Classic LMS, University, Language Academy, Coaching, Online Course, Single Course, and Course marketplace." />
      <meta name="keywords" content="bootstrap 5, online course, education, creative, gulp, business, minimal, modern, course, one page, responsive, saas, e-Learning, seo, startup, html5, site template" />
      <meta name="author" content="theme-village" />
      <title>Eduxo - Online Courses and Education HTML5 Template</title>
      <link rel="apple-touch-icon" href="images/favicon.png" />
      <link rel="shortcut icon" href="images/favicon.ico" />
      <link rel="stylesheet" href="css/feather.css" />
      <link rel="stylesheet" href="css/nice-select2.css" />
      <link href="css/glightbox.min.css" rel="stylesheet" />
      <link rel="stylesheet" href="css/swiper-bundle.min.css" />
      {/* Style css */}

      {/*[if lt IE 9]>
    
    
    <![endif]*/}
      {/* Preloader */}
      <div id="preloader">
        <div className="preloader">
          <span />
          <span />
        </div>
      </div>

      <Header />


      {/* Header End */}
      <div className="dashbaord-promo position-relative" />
      {/* Dashboard Cover Start */}
      <div className="dashbaord-cover bg-shade sec-padding">
        <div className="container">
          <div className="row">
            <div className="col-lg-12 position-relative">
              <div
                className="dash-cover-bg rounded-3"
                style={{
                  backgroundImage: coverPhoto
                    ? `url(http://localhost:5000${coverPhoto})`
                    : `url('/assets/icons/COVER.png')`,
                }}
              >
                <div className="dash-cover-info d-sm-flex justify-content-between align-items-center">
                  <div className="ava-wrap d-flex align-items-center">
                    <div
                      className="avatar me-3 rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: "100px",
                        height: "100px",
                        backgroundColor: profilePhoto ? "transparent" : bgColor,
                        fontSize: "40px",
                        fontWeight: "bold",
                        color: "#fff",
                        textTransform: "uppercase",
                      }}
                    >
                      {profilePhoto ? (
                        <img
                          src={`http://localhost:5000${profilePhoto}`}
                          className="rounded-circle"
                          alt="Avatar"
                          style={{ width: "100px", height: "100px", objectFit: "cover" }}
                        />
                      ) : (
                        <span>{user?.firstName ? user.firstName.charAt(0) : "?"}</span>
                      )}
                    </div>
                    <div className="ava-info">
                      <h4 className="display-5 text-white mb-0">{user?.firstName} {user?.lastName}</h4>
                    </div>
                  </div>
                </div>
              </div>
              <div className="photo-upload-buttons d-flex flex-column align-items-center mt-3">
                <label className="btn btn-primary mb-2 d-flex align-items-center">
                  <i className="feather-icon icon-image me-2"></i> Change Cover Photo
                  <input type="file" accept="image/*" onChange={handleCoverPhotoChange} className="d-none" />
                </label>
                <label className="btn btn-secondary d-flex align-items-center">
                  <i className="feather-icon icon-user me-2"></i> Change Profile Photo
                  <input type="file" accept="image/*" onChange={handleProfilePhotoChange} className="d-none" />
                </label>
              </div>
            </div>
          </div>
          <div className="user-profile">
            <h2>{user?.firstName} {user?.lastName}</h2>

            {/* Check if the user has badges */}
            {user?.badges && user.badges.length > 0 ? (
              <div className="mt-2 p-2 bg-yellow-500 text-white rounded-lg">
                <p>🏆 Congratulations! You have earned the following badges:</p>
                {user?.badges.map((badge, index) => (
                  <div key={index} className="badge-item" >
                    <img 
  src={badge.image} 
  alt={badge.name} 
  className="badge-image" 
  style={{ width: '100px', height: 'auto' }} // Adjust width to 100px, height auto to keep aspect ratio
/>
                    <span className="badge-name">🏅 {badge.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-gray-500">You haven't earned any badges yet. Keep going! 🚀</p>
            )}
          </div>


          {/* Dashboard Inner Start */}
          <div className="row mt-5">
            <div className="col-lg-3">

              <Aside />

            </div>
            <div className="col-lg-9 ps-lg-4">
              <section className="dashboard-sec">
                <h3 className="widget-title mb-4">My Profile</h3>
                <div className="profile-info border rounded-3">
                  {user ? (

                    <div className="p-4 border rounded-lg shadow-md bg-white w-full max-w-lg">
                      <ul className="space-y-2 text-gray-700">
                        <li>
                          <span className="font-semibold">UserName:</span>
                          {isEditing ? (
                            <input
                              type="text"
                              name="firstName"
                              value={user?.firstName + " " + user?.lastName}

                              className="ml-2 border p-1 rounded"
                            />
                          ) : (
                            ` ${user?.firstName + " " + user?.lastName}`
                          )}
                        </li>
                        <li>
                          <span className="font-semibold">Email:</span>
                          {isEditing ? (
                            <input
                              type="email"
                              name="email"
                              value={user?.email}
                              onChange={handleInputChange}
                              className="ml-2 border p-1 rounded"
                            />
                          ) : (
                            ` ${profile.email || user?.email}`
                          )}
                        </li>
                        <li>
                          <span className="font-semibold">First Name:</span>
                          {isEditing ? (
                            <input
                              type="text"
                              name="firstName"
                              value={profile.firstName}
                              onChange={handleInputChange}
                              className="ml-2 border p-1 rounded"
                            />
                          ) : (
                            ` ${profile.firstName || user?.firstName}`
                          )}
                        </li>
                        <li>
                          <span className="font-semibold">Last Name:</span>
                          {isEditing ? (
                            <input
                              type="text"
                              name="lastName"
                              value={profile.lastName}
                              onChange={handleInputChange}
                              className="ml-2 border p-1 rounded"
                            />
                          ) : (
                            ` ${profile.lastName || user?.lastName}`
                          )}
                        </li>
                        <li>
                          <span className="font-semibold">Phone Number:</span>
                          {isEditing ? (
                            <input
                              type="text"
                              name="phone"
                              value={profile.phone}
                              onChange={handleInputChange}
                              className="ml-2 border p-1 rounded"
                            />
                          ) : (
                            ` ${profile.phone || user?.phone}`
                          )}
                        </li>
                        <li>
                          <span className="font-semibold">Skill/Occupation:</span>
                          <div className="entities-container">
                            {entities.length > 0 ? (
                              entities.map((ent, index) =>
                                ent.label === "PRODUCT" ? ( // ✅ Only display text when label is "Product"
                                  <p key={index}>{ent.text}</p>
                                ) : null
                              )
                            ) : (
                              <p>No skills found.</p>
                            )}
                          </div>
                        </li>
                        <li>
                          <span className="font-semibold">Registration Date:</span> September 29, 2024, 8:30 AM
                        </li>
                        <li>
                          <span className="font-semibold">Biography:</span>
                          {isEditing ? (
                            <textarea
                              name="biography"
                              value={profile.biography}
                              onChange={handleInputChange}
                              className="ml-2 border p-1 rounded w-full"
                            />
                          ) : (
                            ` ${profile.biography || user?.biography || "No biography provided"}`
                          )}
                        </li>
                      </ul>
                      <div className="flex flex-col items-center p-4">
                        <div className="relative w-24 h-24 mb-4">
                          <CircularProgressbar
                            value={completion}
                            text={`${completion}%`}
                            styles={buildStyles({
                              textSize: "16px",
                              pathColor: completion === 100 ? "#4CAF50" : "#FF9800",
                              textColor: "#333",
                              trailColor: "#ddd",
                            })}
                          />
                        </div>
                        {completion === 100 && (
                          <div className="mt-2 p-2 bg-green-500 text-white rounded-lg">
                            🎉 Congratulations! You have completed your profile and earned a special badge! 🏅
                          </div>
                        )}
                      </div>
                      {/* Edit/Save Button */}
                      <button
                        onClick={toggleEdit}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center"
                      >
                        {isEditing ? (
                          <>
                            <FaSave className="mr-2" /> Save Profile
                          </>
                        ) : (
                          <>
                            <FaEdit className="mr-2" /> Edit Profile
                          </>
                        )}
                      </button>
                    </div>

                  ) : (
                    <p>Loading user data...</p>
                  )}

                  {/* Upload Button */}
                  <button
                    onClick={() => setShowPopup(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Import Your CV
                  </button>

                  {/* Popup Modal */}
                  {showPopup && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white p-5 rounded-lg shadow-lg w-80 relative">
                        <h3 className="text-lg font-semibold mb-3">Upload Your CV</h3>

                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                          className="border p-2 w-full rounded"
                        />

                        {selectedFile && (
                          <p className="text-sm text-gray-600 mt-2">
                            Selected File: {selectedFile.name}
                          </p>
                        )}

                        {/* Buttons */}
                        <div className="flex justify-end mt-3">
                          <button
                            onClick={() => setShowPopup(false)}
                            className="bg-gray-300 px-3 py-1 rounded mr-2 hover:bg-gray-400 transition"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSubmit}
                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
                            disabled={!cvFile || isLoading}
                          >
                            {isLoading ? 'Analyzing...' : 'Analyze'}

                          </button>
                        </div>
                      </div>
                    </div>
                  )}


                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <div className="back-top"><i className="feather-icon icon-chevron-up" /></div>

    </div>
  );
}
export default Profile;
