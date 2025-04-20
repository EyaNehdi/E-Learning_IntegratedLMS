import { useEffect, useState } from "react";
import { FaEdit, FaSave } from "react-icons/fa";
import { useOutletContext, useNavigate } from "react-router-dom"; // Add useNavigate hook
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import axios from "axios";

const ProfileDetails = () => {
  const { user, accountCompletion, updateUser, locationData } =
    useOutletContext();

  const [isEditing, setIsEditing] = useState(false);
  let timeoutId;
  const [showPopup, setShowPopup] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const readonlyFields = ["email", "userName"];

  const navigate = useNavigate(); // Initialize the navigate function for redirection

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    updateUser({ [name]: value });

    clearTimeout(timeoutId); // Clear the timeout if it's set
    timeoutId = setTimeout(async () => {
      try {
        console.log("🟢 Updating profile...", name);
        const response = await axios.put(
          "http://localhost:5000/api/info/profile/edit",
          {
            [name]: value,
            email: user.email,
          }
        );

        console.log("Update successful:", response.data);
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    }, 500);
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const [cvFile, setCvFile] = useState(null);
  const [entities, setEntities] = useState([]);
  const handleFileChange = (event) => {
    setCvFile(event.target.files[0]);
    setError(null); // Reset error on file change
  };
  const updateskilsWithEntities = async (entities) => {
    try {
      const filteredSkills = entities
        .filter((ent) => ent.label === "PRODUCT")
        .map((ent) => ent.text);

      if (filteredSkills.length === 0) {
        console.warn("No relevant skills found.");
        return;
      }

      const response = await axios.put(
        "http://localhost:5000/api/info/profile/updateskils",
        {
          userId: user._id,
          skills: filteredSkills,
        }
      );

      console.log("Skills updated successfully:", response.data);
    } catch (error) {
      console.error(
        "Failed to update profile:",
        error.response?.data || error.message
      );
    }
  };
  const handleSubmit = async () => {
    const file = cvFile;
    if (!file) return;

    const formData = new FormData();
    formData.append("cvFile", file);

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        "http://localhost:5000/ia/auth/CV",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Add this header
          },
          timeout: 30000,
        }
      );
      // Join them as a single string
      setEntities(response.data.entities);
      updateskilsWithEntities(response.data.entities);
    } catch (error) {
      setError(error.response?.data?.error || error.message); // Capture error message
      console.error("Error:", error.response?.data || error.message);
    } finally {
      setIsLoading(false); // End loading regardless of success or failure
    }
  };
  useEffect(() => {
    // Set isLoading to false when the user data is available
    if (user) {
      setIsLoading(false);
      console.log("User data loaded:", user);
    }
  }, [user]);

  // Function to navigate to the password change page
  const handleChangePassword = () => {
    navigate("/profile/change-password"); // Corrected path
  };
  // Extracting location from user
  const city = locationData?.city || "Unknown City";
  const region = locationData?.region || "Unknown Region";
  const country = locationData?.country || "Unknown Country";
  const lastLoggedInAt = locationData?.loggedInAt || "Unknown Date";
  return (
    <>
      <h2 className="">My Profile</h2>

      <div className="d-flex justify-content-center align-items-start">
        <div className="bg-white rounded-lg w-full max-w-2xl p-8">
          {user ? (
            <>
              {/* Profile Info */}
              <ul className="space-y-3 text-gray-700">
                {[
                  {
                    label: "Location",
                    value: `${city}${region ? `, ${region}` : ""}${
                      country ? `, ${country}` : ""
                    }`,
                    name: "location",
                  },
                  {
                    label: "Last Logged In At",
                    value: `${lastLoggedInAt}`,
                    name: "loggedInAt",
                  },
                  {
                    label: "UserName",
                    value: `${user?.firstName} ${user?.lastName}`,
                    name: "userName",
                  },
                  { label: "Email", value: user?.email, name: "email" },
                  {
                    label: "First Name",
                    value: user?.firstName,
                    name: "firstName",
                  },
                  {
                    label: "Last Name",
                    value: user?.lastName,
                    name: "lastName",
                  },
                  {
                    label: "Phone Number",
                    value: user?.phone || "No phone number provided",
                    name: "phone",
                    type: "number",
                  },
                  {
                    label: "Biography",
                    value: user?.Bio || "",
                    name: "Bio",
                    type: "textarea",
                  },
                ].map((field, index) => (
                  <li
                    key={index}
                    className="flex flex-col sm:flex-row items-start sm:items-center"
                  >
                    <span className="font-semibold w-40">{field.label}:</span>
                    {isEditing ? (
                      field.type === "textarea" ? (
                        <textarea
                          name={field.name}
                          value={field.value}
                          onChange={handleInputChange}
                          className={`border p-2 rounded w-full sm:w-auto ${
                            readonlyFields.includes(field.name)
                              ? "bg-gray-200 cursor-not-allowed"
                              : ""
                          }`}
                          readOnly={readonlyFields.includes(field.name)}
                        />
                      ) : (
                        <input
                          type={field.type || "text"}
                          name={field.name}
                          value={field.value}
                          onChange={handleInputChange}
                          className={`border p-2 rounded w-full sm:w-auto ${
                            readonlyFields.includes(field.name)
                              ? "bg-gray-200 cursor-not-allowed"
                              : ""
                          }`}
                          readOnly={readonlyFields.includes(field.name)}
                        />
                      )
                    ) : (
                      <span className="ml-2">{field.value}</span>
                    )}
                  </li>
                ))}

                {/* Skills/Occupation */}
                <li>
                  <span className="font-semibold">Skill/Occupation:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {user?.skils?.length > 0 ? (
                      user.skils.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-gray-200 px-3 py-1 rounded text-sm"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p>No skills found.</p>
                    )}
                  </div>
                </li>

                {/* Registration Date */}
                <li>
                  <span className="font-semibold">Registration Date:</span>{" "}
                  September 29, 2024, 8:30 AM
                </li>
              </ul>

              {/* Profile Completion & Badge */}
              <div className="flex flex-col items-center mt-6">
                <div className="relative w-24 h-24">
                  <CircularProgressbar
                    value={accountCompletion}
                    text={`${accountCompletion}%`}
                    styles={buildStyles({
                      textSize: "16px",
                      pathColor:
                        accountCompletion === 100 ? "#4CAF50" : "#FF9800",
                      textColor: "#333",
                      trailColor: "#ddd",
                    })}
                  />
                </div>
                {accountCompletion === 100 && (
                  <div className="mt-3 p-3 bg-green-500 text-white rounded-lg text-sm text-center">
                    🎉 Congratulations! You have completed your profile and
                    earned a special badge! 🏅
                  </div>
                )}
              </div>

              <div className="flex justify-between gap-4 mt-6">
                {/* Edit/Save Button */}
                <button
                  onClick={toggleEdit}
                  className="btn fs-6 fs-md-5 fs-lg-4 px-6 py-2 rounded-lg flex items-center justify-center"
                  style={{
                    backgroundColor: "#6045FF",
                    color: "white",
                    whiteSpace: "nowrap",
                  }}
                >
                  {isEditing ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <FaSave className="mr-2" /> Save Profile
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <FaEdit className="mr-2" /> Edit Profile
                    </div>
                  )}
                </button>

                {/* CV Upload Button */}
                <button
                  onClick={() => setShowPopup(true)}
                  className="btn fs-6 fs-md-5 fs-lg-4 px-6 py-2 rounded-lg flex items-center justify-center"
                  style={{
                    border: "2px solid #6045FF",
                    color: "#6045FF",
                    backgroundColor: "transparent",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#6045FF";
                    e.target.style.color = "#ffffff";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "transparent";
                    e.target.style.color = "#6045FF";
                  }}
                >
                  Import Your CV
                </button>
                {/* Change Password Button */}
                <button
                  onClick={handleChangePassword}
                  className="mt-4 px-4 py-2 bg-yellow-500 text-white rounded-lg flex items-center"
                >
                  Change Password
                </button>
              </div>
            </>
          ) : (
            <p className="text-center">Loading user data...</p>
          )}
        </div>
        {/* Popup Modal */}
        {showPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm relative">
              <h3 className="text-lg font-semibold mb-4">Upload Your CV</h3>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="border p-2 w-full rounded"
              />
              {cvFile && (
                <p className="text-sm text-gray-600 mt-2">
                  Selected File: {cvFile.name}
                </p>
              )}

              {/* Buttons */}
              <div className="flex justify-end mt-4">
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
                  {isLoading ? "Analyzing..." : "Analyze"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProfileDetails;
