import { useEffect, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import socket from "../../../utils/socket";
import axios from "axios";
import { Users, GraduationCap, ContactRound } from "lucide-react";

import RegistrationTrendsChart from "./RegistrationTrendsChart";

const AuthDashboard = () => {
  const [events, setEvents] = useState([]);
  const [userStats, setUserStats] = useState({
    total: 0,
    students: 0,
    instructors: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const response = await axios.get("/api/admin/users/stats");
        setUserStats(response.data);
      } catch (error) {
        console.error("Failed to fetch user stats:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchRecentLogins = async () => {
      try {
        const response = await axios.get("/api/logs/recent-logins");
        setEvents(response.data);
      } catch (error) {
        console.error("Failed to fetch recent logins:", error);
      }
    };

    fetchRecentLogins();

    fetchUserStats();

    socket.on("userEvent", (data) => {
      setEvents((prev) => [data, ...prev.slice(0, 99)]);
      console.log("socket data", data);
      console.log("socket event", events);

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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">User Analytics Dashboard</h1>

      {/* Stats Cards */}
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

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Recent User Activity</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {events.map((event, idx) => (
                <tr
                  key={idx}
                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          {event.user.firstName?.charAt(0).toUpperCase()}
                          {event.user.lastName?.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {event.user.firstName} {event.user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {event.user.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                ${
                  event.action === "login"
                    ? "bg-green-100 text-green-800"
                    : "bg-blue-100 text-blue-800"
                }`}
                    >
                      {event.action === "login" ? "Login" : "Registration"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div title={format(new Date(event.timestamp), "PPPpp")}>
                      {formatDistanceToNow(new Date(event.timestamp))} ago
                    </div>
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td
                    colSpan="3"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No recent activity found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Registration Trends (Placeholder for future implementation) */}
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
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {value.toLocaleString()}
            {percentage && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({percentage}%)
              </span>
            )}
          </p>
          {hasGrowth && (
            <span
              className={`mt-1 text-xs ${
                isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {growthText}
            </span>
          )}
          {change && <p className="mt-1 text-xs text-green-600">{change}</p>}
        </div>

        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
};

export default AuthDashboard;
