import axios from "axios";
import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import "./MfaStyle.css";
import Swal from "sweetalert2";

const MfaChallenge = ({ userId, backupCodesExist }) => {
  const { login } = useAuthStore();
  const [otpCode, setOtpCode] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [trustDevice, setTrustDevice] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({});
  const [selectedMethod, setSelectedMethod] = useState("otp");

  const toggleMethod = (method) => {
    if (method === "otp") {
      setBackupCode("");
      setSelectedMethod("otp");
    } else {
      setOtpCode("");
      setSelectedMethod("backup");
    }
  };

  useEffect(() => {
    setDeviceInfo({
      browser: navigator.userAgent,
      os: navigator.userAgentData?.platform || "Unknown",
    });
  }, []);

  const handleVerifyMfa = async () => {
    try {
      if (selectedMethod === "otp") {
        setBackupCode("");
      } else {
        setOtpCode("");
      }
      const response = await axios.post(
        "http://localhost:5000/signup/mfa/verifyMfaCode",
        {
          userId,
          otpCode,
          backupCode,
          trustDevice,
          deviceInfo,
        }
      );
      if (response.data.success) {
        await login(response.data);
      }
    } catch (err) {
      console.error("Verification error:", err);
      if (err?.status === 401) {
        const otpError = err.response.data?.otpError;
        console.log("otpError", otpError);
        if (!otpError) {
          Swal.fire({
            icon: "error",
            title: "Used Backup Code",
            text: "The backup code has already been used.",
            customClass: {
              popup: "custom-popup",
              confirmButton: "custom-confirm-button",
            },
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Invalid OTP",
            text:
              err.response.data?.message || "Invalid code. Please try again.",
            customClass: {
              popup: "custom-popup",
              confirmButton: "custom-confirm-button",
            },
          });
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Unexpected Error",
          text: "Something went wrong during verification.",
          customClass: {
            popup: "custom-popup",
            confirmButton: "custom-confirm-button",
          },
        });
      }
    }
  };

  return (
    <div
      className="card p-4 shadow-sm border rounded mt-4"
      style={{ maxWidth: "480px", margin: "0 auto" }}
    >
      <h4 className="text-center mb-3">Verify Your Identity</h4>

      <p className="text-muted text-center" style={{ fontSize: "0.95rem" }}>
        Your account has Multi-Factor Authentication enabled. To continue,
        please enter the 6-digit code from your authenticator app, or use one of
        your backup codes.
      </p>

      <div className="mfa-form-fields-wrapper">
        {selectedMethod !== "otp" ? (
          <div className="mfa-method-toggle d-flex justify-content-center mb-4 gap-2">
            <button
              type="button"
              className={`mfa-toggle-btn ${
                selectedMethod === "otp" ? "mfa-btn-active" : ""
              }`}
              onClick={() => toggleMethod("otp")}
            >
              Authenticator App
            </button>
          </div>
        ) : (
          <div
            className={`mfa-form-fields ${
              selectedMethod === "otp" ? "show" : ""
            }`}
          >
            {/* OTP input field */}
            <div className="mb-3">
              <label htmlFor="otpCode" className="form-label fw-semibold">
                One-Time Password (OTP)
              </label>
              <input
                type="text"
                className="form-control"
                id="otpCode"
                placeholder="Enter 6-digit OTP"
                value={otpCode}
                maxLength={6}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/[^0-9]/g, "")
                    .slice(0, 6);
                  setOtpCode(value);
                }}
              />
            </div>
            <p className="mfa-instructions">
              Open Google Authenticator, Authy, or similar app and enter the
              6-digit code.
            </p>
          </div>
        )}
        {backupCodesExist && (
          <>
            <div
              className="text-center text-muted mb-2"
              style={{ fontSize: "0.85rem" }}
            >
              — OR —
            </div>
            {selectedMethod !== "backup" ? (
              <div className="mfa-method-toggle d-flex justify-content-center mb-4 gap-2">
                <button
                  type="button"
                  className={`mfa-toggle-btn ${
                    selectedMethod === "backup" ? "mfa-btn-active" : ""
                  }`}
                  onClick={() => toggleMethod("backup")}
                >
                  Backup Code
                </button>
              </div>
            ) : (
              <div
                className={`mfa-form-fields ${
                  selectedMethod === "backup" ? "show" : ""
                }`}
              >
                {/* Backup code input field */}
                <div className="mb-3">
                  <label
                    htmlFor="backupCode"
                    className="form-label fw-semibold"
                  >
                    Backup Code
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="backupCode"
                    placeholder="Enter a backup code"
                    value={backupCode}
                    maxLength={6}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/[^0-9]/g, "")
                        .slice(0, 6);
                      setBackupCode(value);
                    }}
                  />
                </div>
                <p className="mfa-instructions">
                  You can only use each backup code once. Don’t share them with
                  anyone.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <div className="form-check mb-3">
        <input
          className="form-check-input"
          type="checkbox"
          id="trustDevice"
          checked={trustDevice}
          onChange={(e) => setTrustDevice(e.target.checked)}
        />
        <label
          className="form-check-label"
          htmlFor="trustDevice"
          style={{ fontSize: "0.9rem" }}
        >
          Trust this device for future logins
        </label>
      </div>

      <button
        className="btn btn-primary w-100 rounded-5"
        onClick={handleVerifyMfa}
        disabled={
          (selectedMethod === "otp" && otpCode.length !== 6) ||
          (selectedMethod === "backup" && backupCode.length !== 6)
        }
      >
        Complete Verification
      </button>

      <p
        className="text-muted mt-3 text-center"
        style={{ fontSize: "0.85rem" }}
      >
        Don’t have access to your phone or backup codes? Please contact support.
      </p>
    </div>
  );
};

export default MfaChallenge;
