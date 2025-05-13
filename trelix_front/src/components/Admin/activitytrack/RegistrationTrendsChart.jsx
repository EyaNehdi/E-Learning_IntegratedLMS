import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";
import "../ResponsiveStyle.css"; // Ensure styles are applied globally

const RegistrationTrendsChart = () => {
  const [registrationData, setRegistrationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    const fetchRegistrationData = async () => {
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_API_PROXY
          }/api/admin/users/registration-stats?days=${timeRange}`
        );
        setRegistrationData(response.data);
      } catch (error) {
        console.error("Failed to fetch registration trends:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrationData();
  }, [timeRange]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white p-3 shadow-md rounded border border-gray-200">
          <p className="font-semibold">
            {format(new Date(payload[0].payload.date), "MMMM d, yyyy")}
          </p>
          <p>
            Registrations: <strong>{payload[0].value}</strong>
          </p>
          {payload[0].payload.roles && (
            <div className="mt-2 text-xs">
              <p>Students: {payload[0].payload.roles.student || 0}</p>
              <p>Instructors: {payload[0].payload.roles.instructor || 0}</p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="registration-chart-wrapper">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
        <h2 className="text-xl font-semibold">Registration Trends</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(Number(e.target.value))}
          className="border rounded px-3 py-1 text-sm w-full md:w-auto"
        >
          <option value={7}>Last 7 Days</option>
          <option value={30}>Last 30 Days</option>
          <option value={90}>Last 90 Days</option>
        </select>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <p>Loading data...</p>
        </div>
      ) : registrationData.length > 0 ? (
        <div className="w-full" style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={registrationData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(date) => format(new Date(date), "MMM dd")}
                tick={{ fontSize: 12 }}
              />
              <YAxis allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="count"
                name="Registrations"
                stroke="#4f46e5"
                strokeWidth={2}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center text-gray-500">
          No registration data available
        </div>
      )}
    </div>
  );
};

export default RegistrationTrendsChart;
