import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import LockIcon from "@mui/icons-material/Lock";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import { IconButton, Typography, Box, Grid } from "@mui/material";
import { useEffect } from "react";
import { useProfileStore } from "../../store/profileStore";

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

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      console.log("User after fetch:", user);
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
        { userId: userId, token }
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

  const cancelMfa = () => {
    setQrCodeUrl("");
    setMfaEnabled(false);
    navigate("/");
  };

  const fetchBackupCodes = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/signup/mfa/backup-codes",
        {
          params: { userId: userId },
        }
      );
      console.log(response.data);

      setBackupCodes(response.data.backupCodes);
    } catch (error) {
      console.error("Error fetching backup codes:", error);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    alert("Backup codes copied to clipboard!");
  };

  const downloadBackupCodes = () => {
    const element = document.createElement("a");
    const file = new Blob([backupCodes.join("\n")], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "backup_codes.txt";
    document.body.appendChild(element);
    element.click();
  };
  return (
    <>
      <div className="signup-form">
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
            <Button
              disabled={!buttonMfa}
              variant="contained"
              onClick={enableMfa}
              style={{ marginBottom: "20px" }}
            >
              Enable MFA
            </Button>{" "}
          </>
        )}

        {qrCodeUrl && (!backupCodes || backupCodes.length === 0) && (
          <>
            <p
              style={{
                fontSize: "1.2rem",
                fontWeight: "bold",
                opacity: "0.8",
              }}
            >
              Scan the QR code from your authenticator app and then input the 6
              digit verification code generated from the app.
            </p>
            <p style={{ fontSize: "0.9rem", opacity: "0.6" }}>
              Examples of apps you can use are Google Authenticator (Android /
              iOS) or Microsoft Authenticator (Android / iOS)
            </p>
            <div>
              <h3 style={{ fontSize: "1.1rem", opacity: "0.8" }}>QR Code :</h3>
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
              <Paper
                component="form"
                sx={{
                  p: "2px 4px",
                  display: "flex",
                  alignItems: "center",
                  width: 230,
                }}
                onSubmit={(e) => e.preventDefault()}
              >
                <InputBase
                  sx={{ ml: 1, flex: 1 }}
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
                <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                <Tooltip title="Verify">
                  <Button
                    loading={loading}
                    sx={{ p: "10px" }}
                    aria-label="verify"
                    variant=""
                    onClick={verifyMfa}
                    endIcon={<LockIcon />}
                  >
                    {loading ? "Verifying..." : "Verify"}
                  </Button>
                </Tooltip>
              </Paper>
            </div>
          )}

        {success && (!backupCodes || backupCodes.length === 0) && (
          <>
            <Button
              variant="contained"
              sx={{ m: "5px" }}
              fullWidth
              onClick={fetchBackupCodes}
            >
              Get Backup Codes
            </Button>
            <Link to="/" style={{ textDecoration: "none" }}>
              <Button variant="outlined" sx={{ m: "5px" }} fullWidth>
                skip
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
              {backupCodes.map((code, index) => (
                <Paper key={index} sx={{ p: 1, textAlign: "center" }}>
                  {code}
                </Paper>
              ))}
            </Box>

            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={4}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={copyToClipboard}
                >
                  Copy to Clipboard
                </Button>
              </Grid>
              <Grid item xs={4}>
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  onClick={downloadBackupCodes}
                >
                  Download as TXT
                </Button>
              </Grid>
              <Grid item xs={4}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => navigate("/")}
                >
                  Finish
                </Button>
              </Grid>
            </Grid>
          </>
        )}

        {message && (!backupCodes || backupCodes.length === 0) && (
          <p style={{ fontSize: "1rem", opacity: "0.6" }}>{message}</p>
        )}
        <br />
        <Link to="/" style={{ textDecoration: "none" }}>
          <Button>Cancel</Button>
        </Link>
      </div>
    </>
  );
};

export default MfaSetup;
