import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import Swal from "sweetalert2";
import Paper from "@mui/material/Paper";
import { useProfileStore } from "../../store/profileStore";
import "./MfaStyle.css";
import { parseUserAgent } from "../../utils/parseUserAgent";
import {
  FaWindows,
  FaApple,
  FaLinux,
  FaAndroid,
  FaChrome,
  FaFirefox,
  FaEdge,
  FaOpera,
  FaSafari,
  FaQuestion,
} from "react-icons/fa";

export function getOSIcon(os) {
  switch (os) {
    case "Windows":
      return <FaWindows />;
    case "macOS":
      return <FaApple />;
    case "Linux":
      return <FaLinux />;
    case "Android":
      return <FaAndroid />;
    case "iOS":
      return <FaApple />;
    default:
      return <FaQuestion />;
  }
}

export function getBrowserIcon(browser) {
  switch (browser) {
    case "Chrome":
      return <FaChrome />;
    case "Firefox":
      return <FaFirefox />;
    case "Edge":
      return <FaEdge />;
    case "Opera":
      return <FaOpera />;
    case "Safari":
      return <FaSafari />;
    default:
      return <FaQuestion />;
  }
}

const MultiFactorAuth = () => {
  const { user, toggleMFA, setBackupCodes } = useProfileStore();

  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [showQrCode, setShowQrCode] = useState(false);
  const [timer, setTimer] = useState(60);
  const [retryCountdown, setRetryCountdown] = useState(null);
  const [token, setToken] = useState("");
  const [success, setSuccess] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [showRetryLink, setShowRetryLink] = useState(false);
  const [retryFadeOut, setRetryFadeOut] = useState(false);
  const qrRef = useRef(null);
  const [trustedDevices, setTrustedDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const MFA_Route = `http://localhost:5000/signup/mfa`;
  const fetchTrustedDevices = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${MFA_Route}/get-trusted`, {
        params: { userId: user._id },
      });
      if (response.data.success) {
        const enrichedDevices = response.data.trustedDevices.map((device) => {
          const { os, browser } = parseUserAgent(device.browser);
          return {
            ...device,
            os,
            browser,
          };
        });
        setTrustedDevices(enrichedDevices);
      }
    } catch (error) {
      console.error("Error fetching trusted devices:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to fetch trusted devices.",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.mfa?.enabled) fetchTrustedDevices();
  }, [user]);

  useEffect(() => {
    if (showQrCode && qrRef.current) {
      qrRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [showQrCode]);

  const handleEnableMfa = async () => {
    try {
      const response = await axios.post(`${MFA_Route}/enable`, {
        userId: user._id,
      });
      setQrCodeUrl(response.data.qrCodeUrl);
      setShowQrCode(true);
      setFadeOut(false);
      setTimer(60);
      setShowRetryLink(false);
      setRetryFadeOut(false);

      const countdown = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(countdown);
            setFadeOut(true);
            setTimeout(() => {
              setShowQrCode(false);
              setShowRetryLink(true);
              setRetryFadeOut(false);
              setRetryCountdown(20);
              const retryInterval = setInterval(() => {
                setRetryCountdown((prevRetry) => {
                  if (prevRetry <= 1) {
                    clearInterval(retryInterval);
                    setRetryFadeOut(true);

                    setTimeout(() => {
                      setShowRetryLink(false);
                    }, 1000);

                    return null;
                  }
                  return prevRetry - 1;
                });
              }, 1000);
            }, 1000);
          }
          return prev - 1;
        });
      }, 1000);
      toggleMFA();
    } catch (error) {
      console.error("Error enabling MFA:", error);
    }
  };

  const verifyMfa = async () => {
    try {
      const response = await axios.post(`${MFA_Route}/verify`, {
        userId: user._id,
        token,
      });
      setMessage(response.data.message);
      if (response.data.success) {
        setSuccess(true);
      }
    } catch (error) {
      setMessage("Invalid MFA Token");
    }
  };

  const handleShowBackupCodes = async () => {
    try {
      const response = await axios.get(`${MFA_Route}/get-codes`, {
        params: { userId: user._id },
      });
      const { promptUser } = response.data;
      if (promptUser) {
        const result = await Swal.fire({
          title: "No Backup Codes Found",
          text: "You don’t have any backup codes. Would you like to generate new ones?",
          icon: "warning",
          customClass: {
            popup: "custom-popup",
            confirmButton: "custom-confirm-button",
            cancelButton: "custom-confirm-button",
          },
          showCancelButton: true,
          confirmButtonText: "Yes, generate codes",
          cancelButtonText: "No, thanks",
        });
        if (result.isConfirmed) {
          handleGenerateNewCodes();
        } else {
          Swal.fire({
            title: "Cancelled",
            text: "You can generate backup codes anytime later.",
            icon: "info",
            customClass: {
              popup: "custom-popup",
              confirmButton: "custom-confirm-button",
              cancelButton: "custom-confirm-button",
            },
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

  const downloadBackupCodes = () => {
    if (!user?.mfa?.backupCodes || user?.mfa?.backupCodes.length === 0) {
      console.error("No backup codes available to download.");
      return;
    }
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0];
    const filename = `backup_codes_Trelix_${formattedDate}.txt`;
    const fileContent = user?.mfa?.backupCodes
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
    setShowBackupCodes(false);
    Swal.fire({
      title: "Disable MFA",
      text: "Enter your password to remove the authenticator app.",
      input: "password",
      customClass: {
        popup: "custom-popup",
        confirmButton: "custom-confirm-button",
        cancelButton: "custom-confirm-button",
      },
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
          const response = await axios.put(`${MFA_Route}/disable-mfa-profile`, {
            userId,
            password,
          });

          if (response.data.success) {
            await toggleMFA();
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
        Swal.fire({
          title: "MFA Disabled",
          text: "Your authenticator app has been removed.",
          icon: "success",
          customClass: {
            popup: "custom-popup",
            confirmButton: "custom-confirm-button",
            cancelButton: "custom-confirm-button",
          },
        });
      }
    });
  };

  const handleGenerateNewCodes = async () => {
    const generateResponse = await axios.get(`${MFA_Route}/backup-codes`, {
      params: { userId: user._id },
    });

    if (generateResponse.data.success) {
      setBackupCodes(generateResponse.data.ResponseBackupCodes);
      setShowBackupCodes(true);
      Swal.fire({
        title: "Success!",
        text: "New backup codes have been generated.",
        icon: "success",
        customClass: {
          popup: "custom-popup",
          confirmButton: "custom-confirm-button",
          cancelButton: "custom-confirm-button",
        },
      });
    } else {
      Swal.fire({
        title: "Error",
        text: "Failed to generate backup codes. Please try again.",
        icon: "error",
        customClass: {
          popup: "custom-popup",
          confirmButton: "custom-confirm-button",
          cancelButton: "custom-confirm-button",
        },
      });
    }
  };

  const handleRemoveTrustedDevice = async (deviceId) => {
    try {
      const config = {
        params: {
          userId: user._id,
          deviceId: deviceId,
        },
      };
      const response = await axios.delete(`${MFA_Route}/remove-device`, config);
      if (response.status === 200) {
        toast.success("Device removed successfully!");
        setTrustedDevices((prevDevices) =>
          prevDevices.filter((device) => device.deviceId !== deviceId)
        );
      } else {
        toast.error("Failed to remove the device.");
      }
    } catch (error) {
      console.error("Error removing device:", error);
      toast.error("There was an error removing the device.");
    }
  };

  const formatDate = (date) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };
    return new Date(date).toLocaleString(undefined, options);
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
              {user?.mfa?.enabled
                ? "Multi-Factor Authentication Enabled"
                : "Multi-Factor Authentication Disabled"}
            </p>
          </div>
          {showRetryLink && (
            <span
              className={`text-primary ms-2 mt-1 d-inline-block`}
              style={{
                fontSize: "0.9rem",
                textDecoration: "underline",
                cursor: "pointer",
                opacity: retryFadeOut ? 0 : 1,
                transition: "opacity 1s ease-out",
              }}
              onClick={handleEnableMfa}
            >
              {retryCountdown !== null
                ? `Retry in ${retryCountdown}s`
                : "Retry"}
            </span>
          )}

          {!user?.mfa?.enabled && (
            <button
              className="btn btn-success shadow mt-3 rounded-5"
              onClick={handleEnableMfa}
            >
              Enable MFA
            </button>
          )}
        </div>

        {qrCodeUrl && showQrCode && (
          <div
            ref={qrRef}
            className={`d-flex flex-column align-items-center justify-content-center mt-4 p-4 rounded shadow-sm bg-white ${
              fadeOut ? "fadeQR-out" : "fadeQR-in"
            }`}
            style={{ maxWidth: "400px", margin: "0 auto", textAlign: "center" }}
          >
            <h5 className="mb-3" style={{ fontWeight: 600 }}>
              Scan the QR Code
            </h5>

            <p className="text-muted" style={{ fontSize: "0.9rem" }}>
              Use <strong>Google Authenticator</strong>, <strong>Authy</strong>,
              or another OTP app to scan this code. The QR code will disappear
              in <strong>{timer}</strong> seconds.
            </p>

            <img
              src={qrCodeUrl}
              alt="MFA QR Code"
              style={{
                width: "200px",
                height: "200px",
                margin: "20px 0",
                borderRadius: "8px",
                border: "1px solid #ddd",
              }}
            />

            <p className="text-muted" style={{ fontSize: "0.85rem" }}>
              After scanning, your app will generate a{" "}
              <strong>6-digit code</strong> you can use to log in.
            </p>
          </div>
        )}

        {user?.mfa?.enabled && (
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

              {user?.mfa?.enabled && (
                <>
                  <div className="custom-buttonMFA-group">
                    <button
                      className="custom-buttonMFA primary"
                      onClick={
                        !showBackupCodes
                          ? handleShowBackupCodes
                          : downloadBackupCodes
                      }
                    >
                      {showBackupCodes
                        ? "Download Backup Codes"
                        : "View Backup Codes"}
                    </button>

                    <button
                      className="custom-buttonMFA remove-auth"
                      onClick={handleRemoveAuthenticator}
                    >
                      Remove Authenticator App{" "}
                      <span className="remove-auth-span">
                        This will also disable MFA
                      </span>
                    </button>
                  </div>
                  {/* Backup Codes Section */}
                  {showBackupCodes && (
                    <>
                      <hr className="divider-profile" />
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

                        {user?.mfa?.backupCodes?.filter((code) => code.used)
                          .length >
                          user?.mfa?.backupCodes?.length / 2 && (
                          <div className="alert alert-warning small px-3 py-2 mb-3">
                            <strong>Warning:</strong> Limited Backup Codes
                            Remaining.
                            <br />
                            <span className="text-muted">
                              We strongly recommend generating new codes to
                              ensure continued access to your account in case of
                              emergency.
                            </span>
                          </div>
                        )}

                        <ul className="list-group mb-3">
                          <div className="row">
                            {user?.mfa?.backupCodes?.map((codeObj, index) => (
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

                        {/* Link-style Button */}
                        <div className="underlined-buttons-container">
                          <button
                            onClick={handleGenerateNewCodes}
                            className="generate-codes-link"
                          >
                            Generate new backup codes
                          </button>

                          <button
                            className="hide-codes-link"
                            onClick={() => setShowBackupCodes(false)}
                          >
                            Hide backup codes
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
      {/* Trusted Devices Section */}
      {user?.mfa?.enabled && (
        <>
          <hr className="divider-profile" />

          <div className="container mt-4 mb-4">
            <div className="card-device p-3 mb-4">
              <p style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
                Trusted Devices
              </p>
              <p
                className="text-muted"
                style={{ fontSize: "0.9rem", opacity: "0.8" }}
              >
                Trusted devices are those you've marked as trusted, meaning you
                can access your account from these devices without needing to
                enter additional verification. If you suspect a device is being
                used without your consent, you can remove it from this list.
              </p>
              {loading ? (
                <>Fetching trusted devices...</>
              ) : (
                <>
                  {/* List of Trusted Devices */}
                  {trustedDevices?.length > 0 ? (
                    <div className="device-list">
                      {trustedDevices?.map((device, index) => (
                        <div key={index} className="device-card">
                          <div className="device-info">
                            <p className="device-name">{device.name}</p>
                            <div className="device-details">
                              <div className="device-os d-flex align-items-center mb-1">
                                {getOSIcon(device.os)}{" "}
                                <span className="ms-2">{device.os}</span>
                              </div>
                              <div
                                className="device-browser d-flex align-items-center text-muted"
                                style={{ fontSize: "0.9rem" }}
                              >
                                {getBrowserIcon(device.browser)}{" "}
                                <span className="ms-2">{device.browser}</span>
                              </div>
                              <div className="device-date">
                                <strong>Added At:</strong>{" "}
                                {formatDate(device.addedAt)}
                              </div>
                            </div>
                          </div>
                          <button
                            className="btn-remove-device"
                            onClick={() =>
                              handleRemoveTrustedDevice(device.deviceId)
                            }
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted">
                      No trusted devices found. You can add them by marking
                      devices as trusted after login.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default MultiFactorAuth;
