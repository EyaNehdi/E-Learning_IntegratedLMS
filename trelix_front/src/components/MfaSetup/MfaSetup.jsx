import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import LockIcon from "@mui/icons-material/Lock";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import {
  IconButton,
  Typography,
  Box,
  Grid,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { useEffect } from "react";
import { useProfileStore } from "../../store/profileStore";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import GetAppIcon from "@mui/icons-material/GetApp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { toast } from "react-hot-toast";

const MfaSetup = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [backupCodes, setBackupCodes] = useState([]);
  const [buttonMfa, setButtonMfa] = useState(false);
  const [userId, setUserId] = useState(null);
  const { user, fetchUser } = useProfileStore();
  const [trustDevice, setTrustDevice] = useState(false);
  const [metadata, setMetadata] = useState({});

  useEffect(() => {
    setMetadata({
      browser: navigator.userAgent,
      os: navigator.userAgentData?.platform || "Unknown",
    });
  }, []);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      enableMfaButton(user._id);
    }
  }, [user]);

  const enableMfaButton = (id) => {
    setButtonMfa(true);
    setUserId(user._id);
  };

  useEffect(() => {
    if (userId) {
      enableMfaButton(userId);
    }
  }, [userId]);

  const enableMfa = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/signup/mfa/enable",
        { userId: userId }
      );
      setQrCodeUrl(response.data.qrCodeUrl);
      setMfaEnabled(true);
    } catch (error) {
      console.error("Error enabling MFA:", error);
    }
  };

  const verifyMfa = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/signup/mfa/verify",
        { userId, token, trustDevice, metadata }
      );
      setMessage(response.data.message);
      if (response.data.success) {
        setSuccess(true);
      }
    } catch (error) {
      setMessage("Invalid MFA Token");
    }
  };

  const handleInputChange = (event) => {
    const value = event.target.value;
    if (/^\d*$/.test(value) && value.length <= 6) {
      setToken(value);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      verifyMfa();
    }
  };

  const fetchBackupCodes = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/signup/mfa/backup-codes",
        {
          params: { userId: userId },
        }
      );
      console.log(response.data.ResponseBackupCodes);
      setBackupCodes(response.data.ResponseBackupCodes);
    } catch (error) {
      console.error("Error fetching backup codes:", error);
    }
  };

  const copyToClipboard = () => {
    const codeText = backupCodes.map((codeObj) => codeObj.code).join("\n");
    navigator.clipboard.writeText(codeText);
    toast.success("Backup codes copied to clipboard!");
  };

  const downloadBackupCodes = () => {
    if (!backupCodes || backupCodes.length === 0) {
      console.error("No backup codes available to download.");
      return;
    }
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    const filename = `backup_codes_Trelix_${formattedDate}.txt`;
    const fileContent = backupCodes
      .map((codeObj) => `${codeObj.code} ${codeObj.used ? "(used)" : ""}`)
      .join("\n");

    const element = document.createElement("a");
    const file = new Blob([fileContent], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleCancelMfa = async () => {
    try {
      const response = await axios.put(
        "http://localhost:5000/signup/mfa/disable-mfa",
        { userId },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.status !== 200) {
        throw new Error(response.data.message || "Failed to cancel MFA");
      }

      navigate("/home");
    } catch (error) {
      console.error(
        "Error canceling MFA:",
        error.response?.data?.message || error.message
      );
      alert("Failed to cancel MFA. Please try again.");
    }
  };

  return (
    <>
      <div className="signup-form m-0">
        <span className="badge-lg bg-primary rounded-5">MFA Setup</span>

        {!mfaEnabled && (
          <>
            <p style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
              What is Multi-Factor Authentication (MFA)?
            </p>
            <p style={{ fontSize: "0.9rem", opacity: "0.8" }}>
              Multi-Factor Authentication (MFA) adds an extra layer of security
              to your account by requiring a verification code in addition to
              your password. This helps protect your account even if your
              password is compromised.
            </p>
            <p style={{ fontSize: "0.8rem", opacity: "0.9" }}>
              If you wish to start setting up your Multi-Factor Authentication
              Press the button below
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                flexWrap: "wrap",
                justifyContent: "space-between",
              }}
            >
              <Button
                disabled={!buttonMfa}
                variant="contained"
                onClick={enableMfa}
              >
                Enable MFA
              </Button>

              <Tooltip title="Skip or enable MFA later">
                <Link
                  to="/home"
                  style={{
                    textDecoration: "none",
                    color: "blue",
                    fontSize: "0.85rem",
                    marginLeft: "auto",
                  }}
                >
                  Skip for Now
                </Link>
              </Tooltip>
            </div>
          </>
        )}

        {qrCodeUrl &&
          (!backupCodes || backupCodes.length === 0) &&
          !success && (
            <>
              <p
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  opacity: "0.8",
                }}
              >
                Scan the QR code from your authenticator app and then input the
                6 digit verification code generated from the app.
              </p>
              <p style={{ fontSize: "0.9rem", opacity: "0.6" }}>
                Examples of apps you can use are Google Authenticator (Android /
                iOS) or Microsoft Authenticator (Android / iOS)
              </p>
              <div>
                <h3 style={{ fontSize: "1.1rem", opacity: "0.8" }}>
                  QR Code :
                </h3>
                <img
                  src={qrCodeUrl}
                  alt="QR Code"
                  style={{ maxWidth: "100%", height: "auto" }}
                />
              </div>
            </>
          )}

        {qrCodeUrl &&
          !success &&
          (!backupCodes || backupCodes.length === 0) && (
            <div>
              <h3 style={{ fontSize: "1.1rem", opacity: "0.8" }}>
                Enter the code from your Authenticator app:
              </h3>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  flexWrap: "wrap",
                  justifyContent: "start",
                }}
              >
                <Paper
                  component="form"
                  sx={{
                    px: 1,
                    py: 0.5,
                    display: "flex",
                    alignItems: "center",
                  }}
                  onSubmit={(e) => e.preventDefault()}
                >
                  <InputBase
                    sx={{ ml: 1, flex: 1, fontSize: 14 }}
                    placeholder="e.g., XXXXXX"
                    inputProps={{
                      "aria-label": "verify code",
                      maxLength: 6,
                      pattern: "\\d*",
                    }}
                    value={token}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                  />
                  <Divider  sx={{ height: 28, mx: 1 }} orientation="vertical" />
                  <Tooltip title="Verify">
                    <Button
                      loading={loading}
                      sx={{
                        px: 2,
                        py: 1,
                        minWidth: "auto",
                        textTransform: "none",
                        fontSize: 14,
                      }}
                      aria-label="verify"
                      variant=""
                      onClick={verifyMfa}
                      endIcon={<LockIcon />}
                    >
                      {loading ? "Verifying..." : "Verify"}
                    </Button>
                  </Tooltip>
                </Paper>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={trustDevice}
                      onChange={(e) => setTrustDevice(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Trust this device"
                />
                <Button variant="outlined" onClick={handleCancelMfa}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

        {success && (!backupCodes || backupCodes.length === 0) && (
          <>
            <div>
              <p
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  opacity: "0.8",
                }}
              >
                Now that Multi-Factor Authentication (MFA) is enabled, here are
                your backup codes. These one-time-use codes can be used to
                access your account if you lose access to your authenticator
                app. Save them in a secure place.
              </p>
              <p style={{ fontSize: "0.9rem", opacity: "0.6" }}>
                You can copy these codes to your clipboard or save them as a
                text file for safe keeping. Make sure to store them in a secure
                location, such as a password manager or a safe.
              </p>
            </div>
            <Button
              variant="contained"
              sx={{ m: "5px", marginLeft: "auto" }}
              fullWidth
              onClick={fetchBackupCodes}
            >
              Get Backup Codes
            </Button>
            <Link to="/home" style={{ textDecoration: "none" }}>
              <Button
                variant="outlined"
                sx={{
                  m: "5px",
                  fontSize: "0.85rem",
                  marginLeft: "auto",
                }}
                fullWidth
              >
                Skip for Now
              </Button>
            </Link>
          </>
        )}

        {backupCodes && backupCodes.length > 0 && (
          <>
            <Typography variant="h6" fontWeight="bold">
              Backup Codes
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Use these codes in case you lose access to your authenticator app.
              Store them securely.
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 1,
                mt: 2,
                mb: 2,
                p: 2,
                backgroundColor: "#f5f5f5",
                borderRadius: "8px",
              }}
            >
              {backupCodes.map((codeObj, index) => (
                <Paper key={index} sx={{ p: 1, textAlign: "center" }}>
                  {codeObj.code} {codeObj.used && "(used)"}
                </Paper>
              ))}
            </Box>

            <div
              style={{
                display: "flex",
                flexDirection: "row",
                gap: "16px",
                justifyContent: "space-between",
                flexWrap: "wrap",
                marginTop: "16px",
              }}
            >
              {/* Grouped Box for Secondary Actions */}
              <div
                style={{
                  flex: "1 1 100%",
                  minWidth: "200px",
                  padding: "10px",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "8px",
                }}
              >
                {/* Copy to Clipboard Button*/}
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={copyToClipboard}
                  sx={{
                    flex: 1,
                    fontSize: "0.875rem",
                    padding: "8px 16px",
                    display: "flex",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <FileCopyIcon />
                  Copy Backup Codes
                </Button>

                {/* Divider */}
                <div
                  style={{
                    width: "1px",
                    backgroundColor: "#ddd",
                    height: "100%",
                  }}
                ></div>

                {/* Download as TXT Button*/}
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={downloadBackupCodes}
                  sx={{
                    flex: 1,
                    fontSize: "0.875rem",
                    padding: "8px 16px",
                    display: "flex",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <GetAppIcon />
                  Download Backup Codes
                </Button>
              </div>

              {/* Complete Account Setup Button */}
              <div style={{ flex: "1 1 100%", minWidth: "200px" }}>
                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  onClick={() => navigate("/home")}
                  sx={{
                    backgroundColor: "#28a745",
                    "&:hover": {
                      backgroundColor: "#218838",
                    },
                    display: "flex",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <CheckCircleIcon />
                  Complete Account Setup
                </Button>
              </div>
            </div>
          </>
        )}

        {message && (!backupCodes || backupCodes.length === 0) && (
          <p style={{ fontSize: "1rem", opacity: "0.6" }}>{message}</p>
        )}
      </div>
    </>
  );
};

export default MfaSetup;
