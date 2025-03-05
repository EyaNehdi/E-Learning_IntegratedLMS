import { useProfileStore } from "../../store/profileStore";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Profile/Sidebar";
import Preloader from "../../components/Preloader/Preloader";
import { ToastContainer } from "react-toastify";


const ProfilePage = () => {
  const { user, fetchUser, updateUser, isLoadingUser } = useProfileStore();

  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto);
  const [coverPhoto, setCoverPhoto] = useState(user?.coverPhoto);
  const [profile, setProfile] = useState({ user });
  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };
  const bgColor = useMemo(() => getRandomColor(), [user?.firstName]);
  const [completion, setCompletion] = useState(0);
  const calculateCompletion = (profileData) => {
    const fields = [
      "firstName",
      "lastName",
      "email",
      "profilePhoto",
      "coverPhoto",
      "phone",
    ];
    const filledFields = fields.filter((field) => profileData[field]);
    const percentage = Math.round((filledFields.length / fields.length) * 100);
    setCompletion(percentage);
  };

  useEffect(() => {
    if (completion === 100) {
      awardBadge();
    }
  }, [completion]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user) {
      setProfile(user);
      setProfilePhoto(user.profilePhoto || profilePhoto);
      setCoverPhoto(user.coverPhoto || coverPhoto);
      calculateCompletion(user);
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
  
  const awardBadge = async () => {
    const badgeImageUrl = "/assets/Badges/WelcomeBadge.png"; 

    try {
      const response = await axios.post(
        "http://localhost:5000/api/info/profile/badge",
        {
          badge: " Welcome to Trelix Badge 🏅",
          email: user.email, // Send the user's email
          badgeImage: badgeImageUrl, // Send the badge image URL
        }
      );
      console.log("Badge awarded:", response.data);
    } catch (error) {
      console.error("Error awarding badge:", error);
    }
  };
  return (
    <>
      <ToastContainer position="top-right" autoClose={2000} />
      <link rel="stylesheet" href="assets/css/style.css" />
      <div>
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
                          backgroundColor: profilePhoto
                            ? "transparent"
                            : bgColor,
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
                            style={{
                              width: "100px",
                              height: "100px",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <span>
                            {user?.firstName ? user.firstName.charAt(0) : "?"}
                          </span>
                        )}
                      </div>
                      <div className="ava-info">
                        <h4 className="display-5 text-white mb-0">
                          {user?.firstName} {user?.lastName}
                        </h4>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="photo-upload-buttons d-flex flex-column align-items-center mt-3">
                  <label className="btn btn-primary mb-2 d-flex align-items-center">
                    <i className="feather-icon icon-image me-2"></i> Change
                    Cover Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverPhotoChange}
                      className="d-none"
                    />
                  </label>
                  <label className="btn btn-secondary d-flex align-items-center">
                    <i className="feather-icon icon-user me-2"></i> Change
                    Profile Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePhotoChange}
                      className="d-none"
                    />
                  </label>
                </div>
              </div>
            </div>
            <div className="user-profile">
              <h2>
                {user?.firstName} {user?.lastName}
              </h2>

              {/* Check if the user has badges */}
              {user?.badges && user.badges.length > 0 ? (
                <div className="mt-2 p-2 bg-yellow-500 text-white rounded-lg">
                  <p>
                    🏆 Congratulations! You have earned the following badges:
                  </p>
                  {user?.badges.map((badge, index) => (
                    <div key={index} className="badge-item">
                      <img
                        src="/assets/Badges/WelcomeBadge.png"
                        alt={badge.name}
                        className="badge-image"
                        style={{ width: "100px", height: "auto" }} // Adjust width to 100px, height auto to keep aspect ratio
                      />
                      <span className="badge-name">🏅 {badge.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-gray-500">
                  You haven't earned any badges yet. Keep going! 🚀
                </p>
              )}
            </div>
            {/* Dashboard Inner Start */}
            <div className="row mt-5">
              <div className="col-lg-3">
                <Sidebar />
              </div>
              <div className="col-lg-9 ps-lg-4">
                <section className="dashboard-sec">
                  <h3 className="widget-title mb-4">My Profile</h3>
                  {isLoadingUser ? (
                    <Preloader />
                  ) : (
                    <Outlet
                      context={{
                        user,
                        profile,
                        setProfile,
                        completion,
                      }}
                    />
                  )}
                </section>
              </div>
            </div>
          </div>
        </div>
        <div className="back-top">
          <i className="feather-icon icon-chevron-up" />
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
