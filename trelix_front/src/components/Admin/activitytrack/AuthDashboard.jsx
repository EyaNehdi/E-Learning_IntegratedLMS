import { useEffect, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import socket from "../../../utils/socket";
import axios from "axios";
import { Users, GraduationCap, ContactRound } from "lucide-react";
import RegistrationTrendsChart from "./RegistrationTrendsChart";
import "../ResponsiveStyle.css";

const AuthDashboard = () => {
  const [events, setEvents] = useState([]);
  const [userStats, setUserStats] = useState({
    total: 0,
    students: 0,
    instructors: 0,
  });
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 5;

  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentEvents = events.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(events.length / rowsPerPage);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_PROXY}/api/admin/users/stats`
        );
        setUserStats(response.data);
      } catch (error) {
        console.error("Failed to fetch user stats:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchRecentLogins = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_PROXY}/api/logs/recent-logins`
        );
        setEvents(response.data);
      } catch (error) {
        console.error("Failed to fetch recent logins:", error);
      }
    };

    fetchRecentLogins();
    fetchUserStats();

    socket.on("userEvent", (data) => {
      setEvents((prev) => [data, ...prev.slice(0, 99)]);
      if (data.action === "register") {
        setUserStats((prev) => ({
          ...prev,
          total: prev.total + 1,
          [data.user.role]: prev[data.user.role] + 1,
        }));
      }
    });

    return () => {
      socket.off("userEvent");
    };
  }, []);

  const getRolePercentage = (count) => {
    return userStats.total > 0
      ? ((count / userStats.total) * 100).toFixed(1)
      : "0";
  };

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  return (
    <div className="page-container">
      <h1 className="text-2xl font-bold mb-6">User Analytics Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard
          title="Total Users"
          value={userStats.total}
          change={userStats.growth}
          growth={userStats.growth}
          growthPercentage={userStats.growthPercentage}
          icon={<Users className="text-gray-700" />}
        />
        <StatCard
          title="Students"
          value={userStats.students}
          percentage={getRolePercentage(userStats.students)}
          growth={0}
          icon={<GraduationCap className="text-blue-600" />}
        />
        <StatCard
          title="Instructors"
          value={userStats.instructors}
          percentage={getRolePercentage(userStats.instructors)}
          growth={0}
          icon={<ContactRound className="text-purple-600" />}
        />
      </div>

      <div className="auditlogs-table-wrapper">
        <h2 className="text-xl font-semibold mb-4">Recent User Activity</h2>

        <div className="hidden md:block">
          <table className="auditlogs-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Action</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {currentEvents.map((event, idx) => (
                <tr key={idx}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        {event.user.firstName?.charAt(0).toUpperCase()}
                        {event.user.lastName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {event.user.firstName} {event.user.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          ID: {event.user.id}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`px-2 inline-flex text-xs font-semibold rounded-full ${
                        event.action === "login"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {event.action === "login" ? "Login" : "Registration"}
                    </span>
                  </td>
                  <td>
                    <div title={format(new Date(event.timestamp), "PPPpp")}>
                      {formatDistanceToNow(new Date(event.timestamp))} ago
                    </div>
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center text-gray-500 py-4">
                    No recent activity found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden flex flex-col gap-4">
          {currentEvents.map((event, idx) => (
            <div
              key={idx}
              className="border border-gray-300 rounded-lg p-4 shadow-sm bg-white"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-semibold">
                  {event.user.firstName?.charAt(0).toUpperCase()}
                  {event.user.lastName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {event.user.firstName} {event.user.lastName}
                  </p>
                  <p className="text-sm text-gray-500">ID: {event.user.id}</p>
                </div>
              </div>
              <div className="text-sm mb-1">
                <span className="font-semibold">Action:</span>{" "}
                <span
                  className={`px-2 py-1 rounded ${
                    event.action === "login"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {event.action === "login" ? "Login" : "Registration"}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(event.timestamp))} ago
              </div>
            </div>
          ))}
        </div>

        <div className="pagination-controls mt-4">
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2 mt-2 justify-center">
            <button
              className="custom-outline-btn"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <button
              className="custom-outline-btn"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <RegistrationTrendsChart />
    </div>
  );
};

const StatCard = ({
  title,
  value,
  growth,
  growthPercentage,
  percentage,
  change,
  icon,
}) => {
  const hasGrowth = growth !== 0;
  const isPositive = growth > 0;
  const growthText = hasGrowth
    ? `${isPositive ? "+" : ""}${growth} (${
        isPositive ? "↑" : "↓"
      }${growthPercentage}%)`
    : "No change";

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-300 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {value.toLocaleString()}
            {percentage && (
              <span className="ml-2 text-sm text-gray-500">
                ({percentage}%)
              </span>
            )}
          </p>
          {hasGrowth && (
            <p
              className={`mt-1 text-xs ${
                isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {growthText}
            </p>
          )}
          {change && <p className="mt-1 text-xs text-green-600">{change}</p>}
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
};

export default AuthDashboard;
