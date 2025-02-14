import { useState } from "react";
import axios from "axios";

const MfaSetup = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");

  const enableMfa = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/signup/mfa/enable",
        {
          userId: "67ae20123b15b3fdeb784c34",
        }
      );
      setQrCodeUrl(response.data.qrCodeUrl);
    } catch (error) {
      console.error("Error enabling MFA:", error);
    }
  };

  const verifyMfa = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/signup/mfa/verify",
        {
          userId: "67ae20123b15b3fdeb784c34",
          token: token,
        }
      );
      setMessage(response.data.message);
    } catch (error) {
      setMessage("Invalid MFA Token");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>MFA Setup</h2>
      <button onClick={enableMfa}>Enable MFA</button>

      {qrCodeUrl && (
        <div>
          <h3>Scan this QR Code</h3>
          <img src={qrCodeUrl} alt="QR Code" />
        </div>
      )}

      <div>
        <h3>Enter the code from your Authenticator app:</h3>
        <input
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Enter OTP"
        />
        <button onClick={verifyMfa}>Verify</button>
      </div>

      {message && <p>{message}</p>}
    </div>
  );
};

export default MfaSetup;
