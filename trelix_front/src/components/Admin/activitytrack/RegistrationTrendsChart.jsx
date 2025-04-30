import { useEffect, useState } from "react";
import { format, subDays } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";

const RegistrationTrendsChart = () => {
  const [registrationData, setRegistrationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30); // Default 30 days

  useEffect(() => {
    const fetchRegistrationData = async () => {
      try {
        const response = await axios.get(
          `/api/admin/users/registration-stats?days=${timeRange}`
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

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
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
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Registration Trends</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(Number(e.target.value))}
          className="border rounded px-3 py-1 text-sm"
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
        <div className="h-64">
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
