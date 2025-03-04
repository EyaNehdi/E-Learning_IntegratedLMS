import { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { useOutletContext } from "react-router-dom";
import axios from "axios";
import { Divider, InputBase, Paper, Tooltip, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import { LockIcon } from "lucide-react";

const MultiFactorAuth = () => {
  const { user } = useOutletContext();

  const [mfaEnabled, setMfaEnabled] = useState(user?.mfaEnabled);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [backupCodes, setBackupCodes] = useState([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [showRemoveAuthenticatorModal, setShowRemoveAuthenticatorModal] =
    useState(false);

  const handleEnableMfa = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/signup/mfa/enable",
        { userId: user._id }
      );
      setQrCodeUrl(response.data.qrCodeUrl);
      setMfaEnabled(true);
    } catch (error) {
      console.error("Error enabling MFA:", error);
    }
  };

  // Verify MFA Token
  const verifyMfa = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/signup/mfa/verify",
        { userId: user._id, token }
      );
      setMessage(response.data.message);
      if (response.data.success) {
        setSuccess(true);
      }
    } catch (error) {
      setMessage("Invalid MFA Token");
    }
  };

  // Handle input change for the token
  const handleInputChange = (event) => {
    const value = event.target.value;
    if (/^\d*$/.test(value) && value.length <= 6) {
      setToken(value);
    }
  };

  // Handle Enter key press for token verification
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      verifyMfa();
    }
  };

  const handleShowBackupCodes = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/signup/mfa/get-codes",
        {
          params: { userId: user._id },
        }
      );
      setBackupCodes(response.data.backupCodes);
      console.log(response.data.backupCodes);

      setShowBackupCodes(true);
    } catch (error) {
      console.error("Error fetching backup codes:", error);
    }
  };

  const handleGenerateNewBackupCodes = async () => {
    try {
      console.log("am here");
    } catch (error) {
      console.log(error);
    }
  };

  // Download backup codes as a text file
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

  // Remove Authenticator App
  const handleRemoveAuthenticator = async () => {
    try {
      // Make request to the backend to disable MFA with the entered password
      const response = await axios.put("/disable-mfa-profile", { password });
      
      if (response.data.success) {
        setSuccess(true);
        setMfaEnabled(false);
        setError("");
        setTimeout(() => setShowRemoveAuthenticatorModal(false), 2000); // Close modal after 2 seconds
      } else {
        setError("Password is incorrect. Please try again.");
      }
    } catch (error) {
      console.error("Error disabling MFA:", error);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <>
      <div className="container mt-4 mb-4">
        {/* Header Section */}
        <div className="card p-3 mb-4">
          <div className="d-flex align-items-center mb-3">
            <img
              alt="MFA Icon"
              src="/assets/icons/2fa.png"
              className="me-2"
              width="40"
            />
            <p
              style={{
                fontSize: "1.1rem",
                fontWeight: "bold",
                marginBottom: 0,
              }}
            >
              {mfaEnabled
                ? "Multi-Factor Authentication Enabled"
                : "Multi-Factor Authentication Disabled"}
            </p>
          </div>
          {!mfaEnabled && (
            <button
              className="btn btn-success shadow mt-3 rounded-5"
              onClick={handleEnableMfa}
            >
              Enable MFA
            </button>
          )}
        </div>

        {mfaEnabled && (
          <>
            {/* Authenticator App Section */}
            <div className="card p-3 mb-4">
              <p style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
                Authenticator App
              </p>
              <p
                className="text-muted"
                style={{ fontSize: "0.9rem", opacity: "0.8" }}
              >
                Configuring an authenticator app adds an extra layer of security
                to your account. This ensures only you can log in.
              </p>

              {mfaEnabled && (
                <>
                  <div className="d-flex gap-2 flex-wrap">
                    <button
                      className="btn btn-primary shadow mt-3 rounded-5 flex-fill"
                      onClick={
                        !showBackupCodes
                          ? () => handleShowBackupCodes()
                          : () => downloadBackupCodes()
                      }
                    >
                      {showBackupCodes
                        ? "Download Backup Codes"
                        : "View Backup Codes"}
                    </button>
                    <button
                      className="btn btn-outline-danger shadow mt-3 rounded-5 flex-fill"
                      onClick={() => setShowRemoveAuthenticatorModal(true)}
                    >
                      Remove Authenticator App
                    </button>
                  </div>
                  {/* Backup Codes Section */}
                  {showBackupCodes && (
                    <div className="card p-3 mb-4">
                      <p
                        style={{ fontSize: "1.1rem", fontWeight: "bold" }}
                        id="backup-codes"
                      >
                        Backup Codes
                      </p>
                      <p
                        className="text-muted"
                        style={{ fontSize: "0.9rem", opacity: "0.8" }}
                      >
                        Keep these codes safe. Each code can be used{" "}
                        <strong>only once</strong>, and previously generated
                        codes will no longer work.
                      </p>

                      <ul className="list-group mb-3">
                        <div className="row">
                          {backupCodes.map((codeObj, index) => (
                            <div key={index} className="col-6 mb-2">
                              <li className="text-center fw-bold">
                                <Paper
                                  sx={{
                                    p: 1,
                                    textAlign: "center",
                                    color: codeObj.used ? "gray" : "black",
                                    backgroundColor: codeObj.used
                                      ? "#f0f0f0"
                                      : "white",
                                  }}
                                >
                                  {codeObj.code} {codeObj.used && "used"}
                                </Paper>
                              </li>
                            </div>
                          ))}
                        </div>
                      </ul>

                      <button
                        className="btn btn-link shadow mt-3 rounded-5"
                        onClick={handleGenerateNewBackupCodes}
                        style={{
                          textDecoration: "underline",
                          cursor: "pointer",
                        }}
                      >
                        Generate New Backup Codes
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}

       
      </div>
    </>
  );
};

export default MultiFactorAuth;
