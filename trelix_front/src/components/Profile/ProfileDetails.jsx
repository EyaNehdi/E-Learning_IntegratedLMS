import { useState } from "react";
import { FaEdit, FaSave } from "react-icons/fa";
import { useOutletContext } from "react-router-dom";

const ProfileDetails = () => {
  const { user, profile, setProfile } = useOutletContext();
  const [isEditing, setIsEditing] = useState(false);
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
    }, 500); // Wait for 500ms after the user stops typing
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
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
              <span className="font-semibold">Skill/Occupation:</span> Full
              Stack Developer
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
    </div>
  );
};

export default ProfileDetails;
