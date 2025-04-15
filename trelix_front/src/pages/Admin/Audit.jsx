import { Fragment, useState, useEffect } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import moment from "moment";
import clsx from "clsx";
import Headeradmin from "../../components/Admin/Headeradmin";

const socket = io(`http://localhost:5000`, {
  reconnection: true,
});

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({
    action: "",
    status: "",
    method: "",
    user: "",
    userId: "",
  });
  const [expandedRow, setExpandedRow] = useState(null);
  const [highlightedLogId, setHighlightedLogId] = useState(null);

  const fetchAuditLogs = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/admin/audit-logs",
        {
          params: { limit: 100 },
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setLogs(response.data);
      console.log("logs : -->", JSON.stringify(response.data, null, 2));
    } catch (err) {
      console.error("Error fetching logs", err);
    }
  };

  useEffect(() => {
    fetchAuditLogs();

    socket.on("new-audit-log", (log) => {
      setLogs((prev) => [log, ...prev.slice(0, 99)]);
      setHighlightedLogId(log._id);
      setCurrentPage(1);
      setTimeout(() => setHighlightedLogId(null), 2000); // Remove highlight after 2s
    });

    return () => socket.off("new-audit-log");
  }, []);

  const filteredLogs = logs.filter((log) => {
    return (
      (!filters.action || log.action.includes(filters.action)) &&
      (!filters.status || log.status === filters.status) &&
      (!filters.method || log.method === filters.method) &&
      (!filters.user ||
        `${log.user?.firstName} ${log.user?.lastName}`
          .toLowerCase()
          .includes(filters.user.toLowerCase())) && // Check by name
      (!filters.userId || log.user?._id === filters.userId)
    );
  });

  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10;

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const startIndex = (currentPage - 1) * logsPerPage;
  const currentLogs = filteredLogs.slice(startIndex, startIndex + logsPerPage);

  const statusColor = {
    SUCCESS: "bg-green-100 text-green-700",
    FAILURE: "bg-red-100 text-red-700",
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  return (
    <>
      <Headeradmin />
      <div>
        <div className="p-6 bg-gray-100 min-h-screen">
          <h2 className="text-2xl font-semibold mb-4">Audit Logs Console</h2>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-4">
            <input
              type="text"
              placeholder="Action"
              value={filters.action}
              onChange={(e) =>
                setFilters({ ...filters, action: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Status</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILURE">Failure</option>
            </select>
            <select
              value={filters.method}
              onChange={(e) =>
                setFilters({ ...filters, method: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Methods</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
            <input
              type="text"
              placeholder="User (First or Last Name)"
              value={filters.user}
              onChange={(e) => setFilters({ ...filters, user: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
            <input
              type="text"
              placeholder="User ID"
              value={filters.userId}
              onChange={(e) =>
                setFilters({ ...filters, userId: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Logs Table */}
          <div className="border rounded-md shadow">
            <table className="min-w-full table-auto text-sm">
              <thead className="sticky top-0 bg-gray-200 z-10">
                <tr>
                  <th className="px-4 py-2 text-left">User</th>
                  <th className="px-4 py-2 text-left">Action</th>
                  <th className="px-4 py-2 text-left">Method</th>
                  <th className="px-4 py-2 text-left">Endpoint</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Time</th>
                  <th className="px-4 py-2 text-left">Details</th>
                </tr>
              </thead>
              <tbody>
                {currentLogs.map((log, index) => (
                  <Fragment key={log._id || index}>
                    <tr
                      className={clsx(
                        "border-t",
                        highlightedLogId === log._id &&
                          "animate-fadeIn bg-yellow-100"
                      )}
                    >
                      <td className="px-4 py-2">
                        {`${log.user?.firstName} ${log.user?.lastName}` ||
                          "Anonymous"}
                      </td>
                      <td className="px-4 py-2">{log.action}</td>
                      <td className="px-4 py-2">{log.method}</td>
                      <td className="px-4 py-2 break-all">{log.endpoint}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            statusColor[log.status]
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {moment(log.createdAt).format("YYYY-MM-DD HH:mm:ss")}
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() =>
                            setExpandedRow(index === expandedRow ? null : index)
                          }
                          className="text-blue-600 hover:underline text-sm"
                        >
                          {expandedRow === index ? "Hide" : "View"}
                        </button>
                      </td>
                    </tr>
                    {expandedRow === index && (
                      <tr className="bg-gray-50 border-t">
                        <td colSpan={7}>
                          <pre className="text-xs p-4 overflow-auto whitespace-pre-wrap">
                            {JSON.stringify(log.details || {}, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuditLogs;
