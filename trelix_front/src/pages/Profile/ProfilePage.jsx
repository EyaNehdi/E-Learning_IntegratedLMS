import { useProfileStore } from "../../store/profileStore";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Profile/Sidebar";
import Preloader from "../../components/Preloader/Preloader";
import { ToastContainer } from "react-toastify";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import "./profilestyle.css";
import { Tooltip } from "@mui/material";
import { siderbarProfileLinks } from "../../config/siderbarProfileLinks";

const ProfilePage = () => {
  const [locationTracked, setLocationTracked] = useState(false);
  const {
    user,
    fetchUser,
    updateUser,
    isLoadingUser,
    toggleMFA,
    setBackupCodes,
    accountCompletion,
  } = useProfileStore();
  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };
  const bgColor = useMemo(() => getRandomColor(), [user?.firstName]);
  const [activePage, setActivePage] = useState("My Profile");
  useEffect(() => {
    const matchedPage = siderbarProfileLinks.find(
      (link) => link.path === location.pathname
    );
    setActivePage(matchedPage ? matchedPage.label : "My Profile");
  }, [location.pathname]);

  useEffect(() => {
    if (accountCompletion === 100) {
      awardBadge();
    }
  }, [accountCompletion]);
  const [locationData, setLocationData] = useState(null);

  // Ensure that tracking location and fetching user data are done sequentially
  // useEffect(() => {
  //   const trackAndFetchData = async () => {
  //     if (!locationTracked) {
  //       console.log("Tracking location...");
  //       const locationResponse = await trackLocation();
  //       if (locationResponse) {
  //         console.log("Location tracking completed.");
  //         // Fetch user data AFTER location tracking completes
  //         await fetchUser();
  //       }
  //     } else if (!isLoadingUser && !user) {
  //       console.log("Fetching user data...");
  //       await fetchUser();
  //     }
  //   };

  //   trackAndFetchData();
  // }, []);

  // Function to track the user's current location
  const trackLocation = async () => {
    console.log("Tracking location...");

    try {
      // Make sure you send the request with credentials (cookie)
      const response = await axios.get(
        "http://localhost:5000/api/auth/current-location",
        {
          withCredentials: true, // This ensures the cookie is sent along with the request
        }
      );

      console.log("Location tracking triggered successfully:", response.data);
      // Save the location data to state
      const location = response.data.location;
      setLocationData(location);
      setLocationTracked(true); // Set the tracking flag to true
      console.log("Location:", location);
      return location;
    } catch (error) {
      console.error(
        "Error tracking location:",
        error.response?.data || error.message
      );
    }
  };

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
      updateUser({ coverPhoto: response.data.coverPhoto });
    } catch (error) {
      console.error("Error updating cover photo:", error);
    }
  };

  const awardBadge = async () => {
    const description = "Earned for completing profile";
    const hasBadge = user.badges?.some(
      (badge) => badge.description === description
    );
    if (hasBadge) {
      return;
    }
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
      <div className="">
        {/* Dashboard Cover Start */}
        <div className="dashbaord-cover bg-shade pt-15 pb-15">
          <div className="container">
            <div className="row">
              <div className="col-lg-12 position-relative">
                {/* Cover Photo */}
                <div
                  className="cover-photo-container"
                  style={{
                    backgroundImage: user?.coverPhoto
                      ? `url(http://localhost:5000${user?.coverPhoto})`
                      : `url('/assets/icons/COVER.png')`,
                  }}
                >
                  {/* Change Cover Photo Button */}
                  <label className="change-cover-icon">
                    <ModeEditIcon fontSize="small" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverPhotoChange}
                      className="d-none"
                    />
                  </label>
                </div>

                {/* Profile Photo */}
                <div className="dash-cover-info d-sm-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center position-relative">
                    <div className="profile-photo-container">
                      <div
                        className="d-flex align-items-center justify-content-center"
                        style={{
                          width: "100px",
                          height: "100px",
                          backgroundColor: user?.profilePhoto
                            ? "transparent"
                            : bgColor,
                          fontSize: "40px",
                          fontWeight: "bold",
                          color: "#fff",
                          textTransform: "uppercase",
                        }}
                      >
                        {user?.profilePhoto ? (
                          <img
                            src={`http://localhost:5000${user?.profilePhoto}`}
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
                            {user?.firstName && user?.lastName ? (
                              <>
                                {user.firstName.charAt(0)}
                                {user.lastName.charAt(0)}
                              </>
                            ) : (
                              "?"
                            )}
                          </span>
                        )}
                      </div>
                      <label className="edit-icon">
                        <div className="edit-button">
                          <ModeEditIcon fontSize="small" />
                        </div>
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
              </div>
              <div
                className="ava-info d-flex justify-content-between align-items-start flex-wrap"
                style={{ paddingTop: "8px" }}
              >
                <div style={{ marginInlineStart: "130px" }}>
                  <h4
                    className="display-5 text-black mb-0"
                    style={{ fontWeight: "bold", textTransform: "capitalize" }}
                  >
                    {user?.firstName} {user?.lastName}
                  </h4>
                  <div className="ava-meta text-black mt-1">
                    <span>
                      <i className="feather-icon icon-book" /> 0 Courses
                      Enrolled{" "}
                    </span>
                    <span>
                      <i className="feather-icon icon-award" />
                      {user?.certificateCount} Certificates
                    </span>
                  </div>
                </div>
                <div
                  className={`${
                    location.pathname !== "/profile/achievements"
                      ? ""
                      : "d-none"
                  }`}
                >
                  {/* Check if the user has badges */}
                  {user?.badges && user.badges.length > 0 ? (
                    <div
                      className="pt-2 px-2 text-white rounded-lg"
                      style={{ backgroundColor: "#A3A3A3" }}
                    >
                      {user?.badges.map((badge, index) => (
                        <div key={index} className="badge-item">
                          <Tooltip
                            title={
                              <div>
                                <div>Name: {badge?.name}</div>
                              </div>
                            }
                            arrow
                            placement="top"
                          >
                            <img
                              src={badge.image}
                              alt={badge.name}
                              className="badge-image"
                              style={{ width: "80px", height: "auto" }} // Adjust width to 100px, height auto to keep aspect ratio
                            />
                          </Tooltip>
                        </div>
                      ))}
                      <p style={{ color: "#F3F4F7" }}>
                        🏆 Congratulations! You have earned these badges keep
                        earning more
                      </p>
                    </div>
                  ) : (
                    <p className="mt-2 text-gray-500">
                      You haven't earned any badges yet. Keep going! 🚀
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Dashboard Inner Start */}
            <div className="row">
              <div className="col-lg-3">
                <Sidebar setActivePage={setActivePage} />
              </div>
              <div className="col-lg-9 ps-lg-4">
                <section className="dashboard-sec">

                  {isLoadingUser ? (
                    <Preloader />
                  ) : (
                    <Outlet
                      context={{
                        user,
                        updateUser,
                        accountCompletion,
                        toggleMFA,
                        setBackupCodes,
                        locationData,
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
