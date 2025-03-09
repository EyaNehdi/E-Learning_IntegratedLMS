import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import Paper from "@mui/material/Paper";

const MultiFactorAuth = () => {
  const { user } = useOutletContext();

  const [mfaEnabled, setMfaEnabled] = useState(user?.mfaEnabled);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [token, setToken] = useState("");
  const [success, setSuccess] = useState(false);
  const [backupCodes, setBackupCodes] = useState([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

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

  const handleShowBackupCodes = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/signup/mfa/get-codes",
        {
          params: { userId: user._id },
        }
      );
      const { promptUser } = response.data;
      if (promptUser) {
        const result = await Swal.fire({
          title: "No Backup Codes Found",
          text: "You don’t have any backup codes. Would you like to generate new ones?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes, generate codes",
          cancelButtonText: "No, thanks",
        });
        if (result.isConfirmed) {
          const generateResponse = await axios.get(
            "http://localhost:5000/signup/mfa/backup-codes",
            {
              params: { userId: user._id },
            }
          );

          if (generateResponse.data.success) {
            setBackupCodes(generateResponse.data.backupCodes);
            setShowBackupCodes(true);
            Swal.fire({
              title: "Success!",
              text: "New backup codes have been generated.",
              icon: "success",
            });
          } else {
            Swal.fire({
              title: "Error",
              text: "Failed to generate backup codes. Please try again.",
              icon: "error",
            });
          }
        } else {
          Swal.fire({
            title: "Cancelled",
            text: "You can generate backup codes anytime later.",
            icon: "info",
          });
        }
      } else {
        setBackupCodes(response.data.backupCodes);
        setShowBackupCodes(true);
      }
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

  const handleRemoveAuthenticator = async () => {
    const userId = user._id;
    Swal.fire({
      title: "Disable MFA",
      text: "Enter your password to remove the authenticator app.",
      input: "password",
      inputPlaceholder: "Enter your password",
      inputAttributes: {
        autocapitalize: "off",
        autocomplete: "current-password",
      },
      showCancelButton: true,
      confirmButtonText: "Disable MFA",
      cancelButtonText: "Cancel",
      showLoaderOnConfirm: true,
      preConfirm: async (password) => {
        if (!password) {
          Swal.showValidationMessage("Password is required.");
          return;
        }
        try {
          const response = await axios.put(
            "http://localhost:5000/signup/mfa/disable-mfa-profile",
            {
              userId,
              password,
            }
          );

          if (response.data.success) {
            return true;
          } else {
            Swal.showValidationMessage("Incorrect password. Please try again.");
          }
        } catch (error) {
          if (error.response.data.isNotPass && error.response.status === 401) {
            Swal.showValidationMessage("Incorrect password. Please try again.");
          } else {
            Swal.showValidationMessage(
              "Something went wrong. Please try again."
            );
          }
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire(
          "MFA Disabled",
          "Your authenticator app has been removed.",
          "success"
        );
      }
    });
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
                      onClick={() => handleRemoveAuthenticator()}
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
                          {backupCodes?.map((codeObj, index) => (
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
