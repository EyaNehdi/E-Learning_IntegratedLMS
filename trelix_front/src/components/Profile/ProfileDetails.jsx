import { useEffect, useState } from "react";
import { FaEdit, FaSave } from "react-icons/fa";
import { useOutletContext } from "react-router-dom";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import axios from "axios";

const ProfileDetails = () => {
  const { user, profile, setProfile, completion } = useOutletContext();
  const [isEditing, setIsEditing] = useState(false);
  let timeoutId;
  const [showPopup, setShowPopup] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
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

  const handleSubmit = async () => {
    const file = cvFile;
    if (!file) return;

    const formData = new FormData();
    formData.append("cvFile", file); // Use the raw file from the input

    setIsLoading(true); // Start loading
    setError(null); // Reset error message

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
    } catch (error) {
      setError(error.response?.data?.error || error.message); // Capture error message
      console.error("Error:", error.response?.data || error.message);
    } finally {
      setIsLoading(false); // End loading regardless of success or failure
    }
  };
  

  return (
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
              <span className="font-semibold">Registration Date:</span>{" "}
              September 29, 2024, 8:30 AM
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
                ` ${
                  profile.biography ||
                  user?.biography ||
                  "No biography provided"
                }`
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
                🎉 Congratulations! You have completed your profile and earned a
                special badge! 🏅
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
                {isLoading ? "Analyzing..." : "Analyze"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDetails;
