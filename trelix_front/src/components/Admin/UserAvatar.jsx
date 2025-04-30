import { useState } from "react";

const getBackgroundColor = (firstLetter) => {
  if (!firstLetter) return "#ccc";
  const char = firstLetter.toLowerCase();
  if (char >= "a" && char <= "j") {
    return "#2196F3"; // Green for A-J
  } else {
    return "#2196F3"; // Blue for K-Z
  }
};

const UserAvatar = ({ user }) => {
  const [imageError, setImageError] = useState(false);

  const initials = `${user?.firstName?.[0] || ""}${
    user?.lastName?.[0] || ""
  }`.toUpperCase();
  const backgroundColor = getBackgroundColor(user?.firstName?.[0]);

  const handleError = () => {
    setImageError(true);
  };

  const imageUrl = user?.profilePhoto
    ? `http://localhost:5000${user.profilePhoto}`
    : "";

  return (
    <>
      {imageUrl && !imageError ? (
        <img
          src={imageUrl}
          alt="User Avatar"
          onError={handleError}
          style={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
      ) : (
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            backgroundColor: backgroundColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: 20,
            fontWeight: "bold",
          }}
        >
          {initials}
        </div>
      )}
    </>
  );
};

export default UserAvatar;
