import React from "react";
import "./SystemSettingsStyle.css";

const EngagementSummaryModal = ({
  showSummaryModal,
  setShowSummaryModal,
  engagementSummary,
  summaryFormat,
}) => {
  if (!engagementSummary) return null;

  return (
    <div
      className="system-settings-modal-backdrop"
      style={{ display: showSummaryModal ? "flex" : "none" }}
      onClick={() => setShowSummaryModal(false)}
    >
      <div
        className="system-settings-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="system-settings-modal-header">
          <h3>User Engagement Summary</h3>
          <button
            className="system-settings-modal-close-btn"
            onClick={() => setShowSummaryModal(false)}
          >
            ×
          </button>
        </div>

        <div>
          <p>
            <strong>Generated:</strong>{" "}
            {new Date(engagementSummary.timestamp).toLocaleString()}
          </p>

          <div className="system-settings-summary-section">
            <h4>Engagement Status:</h4>
            <div className="system-settings-summary-counts">
              {Object.entries(
                engagementSummary.metrics.engagementStatus.stages
              ).map(([stage, { count }]) => {
                const colorMap = {
                  active: "green",
                  idle: "orange",
                  at_risk: "darkgoldenrod",
                  churned: "red",
                };
                return (
                  <div key={stage}>
                    <div style={{ color: colorMap[stage], fontWeight: "bold" }}>
                      {count}
                    </div>
                    <div>
                      {stage.charAt(0).toUpperCase() +
                        stage.slice(1).replace("_", " ")}
                    </div>
                  </div>
                );
              })}
              <div>
                <div style={{ fontWeight: "bold" }}>
                  {engagementSummary.total || 0}
                </div>
                <div>Total</div>
              </div>
            </div>
          </div>

          <div className="system-settings-summary-section">
            <h4>User Distribution:</h4>
            <div className="system-settings-metrics-grid">
              {Object.entries(engagementSummary.metrics.userDistribution).map(
                ([type, { count, percentage, description }]) => (
                  <div key={type} className="metric-card">
                    <div className="metric-value">
                      {count}{" "}
                      <span className="metric-percentage">({percentage}%)</span>
                    </div>
                    <div className="metric-label">
                      {type.charAt(0).toUpperCase() + type.slice(1)} Users
                    </div>
                    <div className="metric-description">{description}</div>
                  </div>
                )
              )}
            </div>
          </div>

          {summaryFormat === "full" && engagementSummary.stages && (
            <div className="system-settings-summary-section">
              <h4>User Details by Stage:</h4>
              {Object.entries(engagementSummary.stages).map(
                ([stage, users]) => (
                  <div key={stage} className="system-settings-summary-stage">
                    <h5
                      className="system-settings-summary-stage-header"
                      style={{
                        backgroundColor:
                          stage === "active"
                            ? "#e6ffed"
                            : stage === "idle"
                            ? "#fff7e6"
                            : stage === "at_risk"
                            ? "#fffbe6"
                            : "#fff1f0",
                      }}
                    >
                      <span>
                        {stage.charAt(0).toUpperCase() +
                          stage.slice(1).replace("_", " ")}
                      </span>
                      <span>{users.length} users</span>
                    </h5>

                    {users.length > 0 ? (
                      <div className="system-settings-summary-stage-content">
                        <table className="system-settings-summary-table">
                          <thead>
                            <tr>
                              <th>User</th>
                              <th>Email</th>
                              <th>Last Login</th>
                              <th>Days Since</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {users.map((user) => (
                              <tr key={user.id}>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>
                                  {new Date(
                                    user.lastLogin
                                  ).toLocaleDateString()}
                                </td>
                                <td>{user.daysSinceLogin}</td>
                                <td>
                                  {user.hasPurchases && "Premium "}
                                  {user.hasCertificates && "Certified "}
                                  {user.isVerified && "Verified"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="system-settings-no-users">
                        No users in this stage
                      </p>
                    )}
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EngagementSummaryModal;
