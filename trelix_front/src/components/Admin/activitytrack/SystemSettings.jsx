import React, { useEffect, useState } from "react";
import axios from "axios";
import "../ResponsiveStyle.css";
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
      const res = await axios.get(
        `${import.meta.env.VITE_API_PROXY}/api/system-settings`
      );
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
      await axios.put(
        `${import.meta.env.VITE_API_PROXY}/api/system-settings/${setting._id}`,
        {
          value: updatedValue,
        }
      );
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
        `${
          import.meta.env.VITE_API_PROXY
        }/api/user-engagement/summary?format=${summaryFormat}`
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
    <div className="page-container">
      <h2 className="text-2xl font-semibold mb-6">System Settings</h2>

      <div className="flex flex-col gap-6">
        {loading ? (
          <p>Loading settings...</p>
        ) : (
          settings.map((setting) => (
            <div
              key={setting._id}
              className="bg-white border border-gray-200 p-4 rounded shadow-sm"
            >
              <div className="mb-3">
                <p className="font-semibold text-gray-800 mb-1">
                  {setting.key}
                </p>
                <p className="text-sm text-gray-500">{setting.description}</p>

                {setting.key === "Daily-Engagement-Check" && (
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <span className="text-sm font-medium">Format:</span>
                    <div className="flex gap-2">
                      <button
                        className={`custom-btn-toggle ${
                          summaryFormat === "minimal" ? "selected" : ""
                        }`}
                        onClick={() => setSummaryFormat("minimal")}
                      >
                        Minimal
                      </button>
                      <button
                        className={`custom-btn-toggle ${
                          summaryFormat === "full" ? "selected" : ""
                        }`}
                        onClick={() => setSummaryFormat("full")}
                      >
                        Full
                      </button>
                    </div>
                    <button
                      className="custom-btn-primary"
                      onClick={fetchEngagementSummary}
                      disabled={summaryLoading}
                    >
                      {summaryLoading ? "Loading..." : "Test Summary"}
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between mt-2">
                <span
                  className={`text-xs font-medium px-3 py-1 rounded-full ${
                    setting.value
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {setting.value ? "ON" : "OFF"}
                </span>
                <div
                  className={`cursor-pointer w-10 h-5 rounded-full relative ${
                    setting.value ? "bg-indigo-500" : "bg-gray-300"
                  }`}
                  onClick={() => toggleSetting(setting)}
                  title="Toggle"
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-200 ${
                      setting.value ? "left-5" : "left-0.5"
                    }`}
                  ></div>
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
