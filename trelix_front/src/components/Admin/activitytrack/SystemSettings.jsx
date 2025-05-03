import React, { useEffect, useState } from "react";
import axios from "axios";
import "./SystemSettingsStyle.css";
import EngagementSummaryModal from "./EngagementSummaryModal";

const SystemSettings = () => {
  const [settings, setSettings] = useState([]);
  const [notificationRecipients, setNotificationRecipients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [engagementSummary, setEngagementSummary] = useState(null);
  const [summaryFormat, setSummaryFormat] = useState("minimal");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/system-settings");
      setSettings(res.data.settings);
      setNotificationRecipients(res.data.notificationRecipients || []);
    } catch (err) {
      console.error("Error fetching settings:", err);
    }
    setLoading(false);
  };

  const toggleSetting = async (setting) => {
    try {
      const updatedValue = !setting.value;
      await axios.put(`/api/system-settings/${setting._id}`, {
        value: updatedValue,
      });
      setSettings((prev) =>
        prev.map((s) =>
          s._id === setting._id ? { ...s, value: updatedValue } : s
        )
      );
    } catch (err) {
      console.error("Error updating setting:", err);
    }
  };

  const fetchEngagementSummary = async () => {
    setSummaryLoading(true);
    try {
      const res = await axios.get(
        `/api/user-engagement/summary?format=${summaryFormat}`
      );
      setEngagementSummary(res.data);
      setShowSummaryModal(true);
    } catch (err) {
      console.error("Error fetching engagement summary:", err);
    }
    setSummaryLoading(false);
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <div className="system-settings-container">
      <h2 style={{ fontSize: "24px", marginBottom: "20px" }}>
        System Settings
      </h2>

      {/* Toggle Settings Section */}
      <div className="system-settings-section">
        <h3 style={{ fontSize: "18px", marginBottom: "16px" }}>
          System Toggles
        </h3>
        {loading ? (
          <p>Loading settings...</p>
        ) : (
          settings.map((setting) => (
            <div key={setting._id} className="system-settings-card">
              <div>
                <div className="system-settings-label">{setting.key}</div>
                <div className="system-settings-description">
                  {setting.description}
                </div>

                {setting.key === "Daily-Engagement-Check" && (
                  <div className="system-settings-format-toggle-group">
                    <span style={{ marginRight: "6px" }}>Format:</span>
                    <div className="system-settings-format-buttons">
                      <button
                        className={`system-settings-format-btn ${
                          summaryFormat === "minimal" ? "active" : ""
                        }`}
                        onClick={() => setSummaryFormat("minimal")}
                      >
                        Minimal
                      </button>
                      <button
                        className={`system-settings-format-btn ${
                          summaryFormat === "full" ? "active" : ""
                        }`}
                        onClick={() => setSummaryFormat("full")}
                      >
                        Full
                      </button>
                    </div>
                    <button
                      className="system-settings-success-btn"
                      onClick={fetchEngagementSummary}
                      disabled={summaryLoading}
                    >
                      {summaryLoading ? "Loading..." : "Test Summary"}
                    </button>
                  </div>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <span
                  className={
                    setting.value
                      ? "system-settings-status-on"
                      : "system-settings-status-off"
                  }
                >
                  {setting.value ? "ON" : "OFF"}
                </span>
                <div
                  className="system-settings-switch"
                  onClick={() => toggleSetting(setting)}
                  title="Toggle"
                >
                  <div
                    className="system-settings-switch-knob"
                    style={{ left: setting.value ? "20px" : "2px" }}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <EngagementSummaryModal
        showSummaryModal={showSummaryModal}
        setShowSummaryModal={setShowSummaryModal}
        engagementSummary={engagementSummary}
        summaryFormat={summaryFormat}
      />
    </div>
  );
};

export default SystemSettings;
