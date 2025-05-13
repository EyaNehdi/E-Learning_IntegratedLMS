import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import {
  Pencil,
  ArrowLeft,
  ShieldOff,
  Archive,
  ArchiveRestore,
  User,
  Mail,
  Phone,
  Info,
  Coins,
  Star,
  Activity,
  CheckCircle,
  ShieldCheck,
  Laptop2,
  CalendarClock,
  Clock,
  Globe,
} from "lucide-react";
import "./ResponsiveStyle.css";
import parseUserAgentAdmin from "../../utils/parseUserAgent";

const ViewUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_PROXY}/api/admin/user-details/${id}`)
      .then((res) => setUser(res.data))
      .catch((err) => console.error("Error fetching user details:", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return <div className="text-center py-6">Loading user details...</div>;
  if (!user)
    return <div className="text-center py-6 text-red-500">User not found.</div>;

  const handleBack = () => navigate("/admin/users");
  const handleEdit = () => navigate(`/admin/update/${user._id}`);
  const toggleArchive = async () => {
    const endpoint = user.isActive ? "archiveUser" : "unarchiveUser";
    await axios.put(
      `${import.meta.env.VITE_API_PROXY}/api/admin/${endpoint}/${user._id}`
    );
    setUser((prev) => ({ ...prev, isActive: !prev.isActive }));
  };

  const removeDevice = async (deviceId) => {
    try {
      const config = {
        params: {
          userId: id,
          deviceId: deviceId,
        },
      };
      await axios.delete(
        `${import.meta.env.VITE_API_PROXY}/signup/mfa/remove-device`,
        config
      );
      setUser((prev) => ({
        ...prev,
        mfa: {
          ...prev.mfa,
          trustedDevices: prev.mfa.trustedDevices.filter(
            (d) => d.deviceId !== deviceId
          ),
        },
      }));
    } catch (err) {
      console.error("Failed to remove device:", err);
    }
  };

  const enrichedDevices = (user.mfa?.trustedDevices || []).map((device) => {
    const { browser, os } = parseUserAgentAdmin(device.browser);
    return {
      ...device,
      browser,
      os,
    };
  });

  return (
    <div className="page-container">
      <div className="user-action-buttons">
        <button
          className="custom-outline-btn edit-btn"
          onClick={handleEdit}
          title="Edit User"
        >
          <Pencil size={16} className="mr-1" /> Edit
        </button>
        <button
          className="custom-outline-btn archive-btn"
          onClick={toggleArchive}
          title={user.isActive ? "Archive User" : "Unarchive User"}
        >
          {user.isActive ? (
            <Archive size={16} className="mr-1" />
          ) : (
            <ArchiveRestore size={16} className="mr-1" />
          )}
          {user.isActive ? "Archive" : "Unarchive"}
        </button>
        <button
          className="custom-outline-btn view-btn"
          onClick={handleBack}
          title="Back to users list"
        >
          <ArrowLeft size={16} className="mr-1" /> Back
        </button>
      </div>

      <div className="user-details-container">
        <div className="user-box-grid">
          {/* Contact Info */}
          <div className="user-box-half user-contact-status-box">
            <h4 className="user-section-title">Contact Info</h4>
            <div className="user-detail-grid">
              <div className="detail-item grid grid-cols-[auto_1fr] items-center gap-2">
                <User size={16} className="text-gray-500" />
                <div>
                  <span className="user-info-label">Name:</span>{" "}
                  <span className="user-info-value truncate block">
                    {user.firstName} {user.lastName}
                  </span>
                </div>
              </div>
              <div
                className="detail-item grid grid-cols-[auto_1fr] items-center gap-2"
                style={{ gridColumn: "span 2" }}
              >
                <Mail size={16} className="text-gray-500" />
                <div>
                  <span className="user-info-label">Email:</span>{" "}
                  <span className="user-info-value truncate block">
                    {user.email}
                  </span>
                </div>
              </div>
              <div className="detail-item grid grid-cols-[auto_1fr] items-center gap-2">
                <Phone size={16} className="text-gray-500" />
                <div>
                  <span className="user-info-label">Phone:</span>{" "}
                  <span className="user-info-value truncate block">
                    {user.phone || "—"}
                  </span>
                </div>
              </div>
              <div
                className="detail-item flex items-start gap-2"
                style={{ gridColumn: "span 2" }}
              >
                <Info size={16} className="text-gray-500 mt-1" />
                <div>
                  <span className="user-info-label">Bio:</span>{" "}
                  <span className="user-info-value block">
                    {user.Bio || "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="user-box-half user-contact-status-box">
            <h4 className="user-section-title">Account Status</h4>
            <div className="user-detail-grid">
              <div className="detail-item grid grid-cols-[auto_1fr] items-center gap-2">
                <ShieldCheck size={16} className="text-gray-500" />
                <div>
                  <span className="user-info-label">Role:</span>{" "}
                  <span className="user-info-value truncate block">
                    {user.role}
                  </span>
                </div>
              </div>
              <div className="detail-item grid grid-cols-[auto_1fr] items-center gap-2">
                <CheckCircle size={16} className="text-gray-500" />
                <div>
                  <span className="user-info-label">Verified:</span>{" "}
                  <span className="user-info-value">
                    {user.isVerified ? "Yes" : "No"}
                  </span>
                </div>
              </div>
              <div className="detail-item grid grid-cols-[auto_1fr] items-center gap-2">
                <Activity size={16} className="text-gray-500" />
                <div>
                  <span className="user-info-label">Active:</span>{" "}
                  <span className="user-info-value">
                    {user.isActive ? "Yes" : "Archived"}
                  </span>
                </div>
              </div>
              <div className="detail-item grid grid-cols-[auto_1fr] items-center gap-2">
                <Star size={16} className="text-gray-500" />
                <div>
                  <span className="user-info-label">Score:</span>{" "}
                  <span className="user-info-value">{user.totalScore}</span>
                </div>
              </div>
              <div className="detail-item grid grid-cols-[auto_1fr] items-center gap-2">
                <Coins size={16} className="text-gray-500" />
                <div>
                  <span className="user-info-label">Balance:</span>{" "}
                  <span className="user-info-value">
                    {user.balance} T-Coins
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Skills & Badges */}
        <div className="user-box-grid">
          <div className="user-box-half">
            <h4 className="user-section-title">Skills</h4>
            <div className="flex flex-wrap">
              {user.skils?.length
                ? user.skils.map((skill, i) => (
                    <span key={i} className="user-skill-chip">
                      {skill}
                    </span>
                  ))
                : "No skills listed"}
            </div>
          </div>
          <div className="user-box-half">
            <h4 className="user-section-title">Badges</h4>
            <div className="flex gap-3 flex-wrap">
              {user.badges?.length ? (
                user.badges.map((badge) => (
                  <div className="badge-card" key={badge._id}>
                    <img src={badge.image} alt={badge.name} />
                    <p className="font-semibold">{badge.name}</p>
                    <p className="text-xs text-gray-500">
                      {moment(badge.earnedAt).format("YYYY-MM-DD")}
                    </p>
                  </div>
                ))
              ) : (
                <p>No badges earned.</p>
              )}
            </div>
          </div>
        </div>

        {/* Certificates + Courses */}
        <div className="user-box-grid">
          <div className="user-box-half">
            <h4 className="user-section-title">Certificates</h4>
            <div className="flex gap-3 flex-wrap">
              {user.certificatesOwned?.length ? (
                user.certificatesOwned.map((c) => (
                  <div key={c._id} className="certificate-card">
                    <p className="font-semibold">
                      {c.certificateId?.courseId?.title || "—"}
                    </p>
                    <p className="text-xs">
                      {moment(c.acquiredOn).format("YYYY-MM-DD")}
                    </p>
                  </div>
                ))
              ) : (
                <p>No certificates.</p>
              )}
            </div>
          </div>

          <div className="user-box-half">
            <h4 className="user-section-title">Courses Purchased</h4>
            <div className="flex gap-3 flex-wrap">
              {user.purchasedCourses?.length ? (
                user.purchasedCourses.map((p) => (
                  <div key={p._id} className="course-card">
                    <p className="font-semibold">{p.courseId?.title}</p>
                    <p className="text-xs">
                      {moment(p.purchaseDate).format("YYYY-MM-DD")}
                    </p>
                  </div>
                ))
              ) : (
                <p>No courses purchased.</p>
              )}
            </div>
          </div>
        </div>

        {/* Security */}
        <div>
          <h4 className="user-section-title">Security</h4>
          <p className="mb-2">
            <span className="user-info-label">MFA Enabled:</span>{" "}
            {user.mfa?.enabled ? "Yes" : "No"}
          </p>

          {user.mfa?.trustedDevices?.length ? (
            <div className="trusted-device-grid">
              {enrichedDevices.map((device) => (
                <div className="trusted-device-card" key={device.deviceId}>
                  <div className="trusted-device-meta">
                    <div className="device-detail-line">
                      <Laptop2 size={14} className="text-gray-500" />
                      <span className="truncate">{device.deviceId}</span>
                    </div>
                    <div className="device-detail-line">
                      <Globe size={14} className="text-gray-500" />
                      <span className="truncate">
                        {device.browser || "Unknown"} / {device.os || "—"}
                      </span>
                    </div>
                    <div className="device-detail-line">
                      <CalendarClock size={14} className="text-gray-500" />
                      <span>
                        Added: {moment(device.addedAt).format("YYYY-MM-DD")}
                      </span>
                    </div>
                    <div className="device-detail-line">
                      <Clock size={14} className="text-gray-500" />
                      <span>
                        Expires: {moment(device.expiresAt).format("YYYY-MM-DD")}
                      </span>
                    </div>
                  </div>
                  <button
                    className="custom-outline-btn archive-btn"
                    onClick={() => removeDevice(device.deviceId)}
                    title="Remove device"
                  >
                    <ShieldOff size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted">No trusted devices registered.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewUser;
