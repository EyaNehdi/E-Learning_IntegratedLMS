
import { Tooltip, Box, Typography } from "@mui/material";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import { useLocation, useNavigate } from "react-router-dom";

const ViewSwitcher = ({ isAdmin }) => {
  const location = useLocation();
  const navigate = useNavigate();

  if (!isAdmin) return null;

  const isInAdminView =
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/monitor") ||
    location.pathname.startsWith("/badge") ||
    location.pathname.startsWith("/manage") ||
    location.pathname.startsWith("/report") ||
    location.pathname.startsWith("/set");

  const handleClick = () => {
    navigate(isInAdminView ? "/" : "/admin");
  };

  return (
    <Tooltip
      title={isInAdminView ? "Switch to Public View" : "Switch to Admin Panel"}
      arrow
    >
      <Box
        onClick={handleClick}
        sx={{
          position: "fixed",
          top: 20,
          right: 20,
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 2,
          py: 1,
          backgroundColor: "#f0f0f0",
          borderRadius: "8px",
          boxShadow: 2,
          cursor: "pointer",
          transition: "background-color 0.2s ease-in-out",
          "&:hover": {
            backgroundColor: "#e0e0e0",
          },
        }}
      >
        <SyncAltIcon fontSize="small" />
        <Typography variant="body2" fontWeight={500}>
          {isInAdminView ? "Public View" : "Admin Panel"}
        </Typography>
      </Box>
    </Tooltip>
  );
};

export default ViewSwitcher;
