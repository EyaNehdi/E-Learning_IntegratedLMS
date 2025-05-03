import { Fragment, useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import clsx from "clsx";
import ThreadModal from "./ThreadModal";
import { useProfileStore } from "../../../store/profileStore";
import socket from "../../../utils/socket";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const { user } = useProfileStore();
  const [filters, setFilters] = useState({
    action: "",
    user: "",
    userId: "",
  });
  const [expandedRow, setExpandedRow] = useState(null);
  const [highlightedLogId, setHighlightedLogId] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [open, setOpen] = useState(false);
  const [newComment, setNewComment] = useState("");

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
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => setHighlightedLogId(null), 2000);
    });

    return () => socket.off("new-audit-log");
  }, []);

  useEffect(() => {
    const handleLogSolved = ({ logId }) => {
      setLogs((prevLogs) =>
        prevLogs.map((log) =>
          log._id === logId ? { ...log, solved: true } : log
        )
      );

      setSelectedLog((prevSelected) => {
        if (prevSelected && prevSelected._id === logId) {
          return { ...prevSelected, solved: true };
        }
        return prevSelected;
      });
    };

    socket.on("log-solved", handleLogSolved);

    return () => {
      socket.off("log-solved", handleLogSolved);
    };
  }, []);

  const filteredLogs = logs.filter((log) => {
    return (
      (!filters.action || log.action.includes(filters.action)) &&
      (!filters.user ||
        `${log.user?.firstName} ${log.user?.lastName}`
          .toLowerCase()
          .includes(filters.user.toLowerCase())) &&
      (!filters.userId || log.user?._id === filters.userId)
    );
  });

  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10;

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const startIndex = (currentPage - 1) * logsPerPage;
  const currentLogs = filteredLogs.slice(startIndex, startIndex + logsPerPage);

  const statusColor = {
    true: "bg-green-100 text-green-800",
    false: "bg-yellow-100 text-yellow-800",
  };

  const statusText = {
    true: "Resolved",
    false: "Pending",
  };

  const handleReviews = async (log) => {
    try {
      const { data } = await axios.get(`/api/logs/thread/${log._id}`);
      setSelectedLog({ ...log, reviews: data });
      setOpen(true);
    } catch (error) {
      console.error("Failed to fetch thread", error);
    }
  };

  return (
    <>
      <div className="p-6 bg-gray-100 min-h-screen">
        <h2 className="text-2xl font-semibold mb-4">Audit Logs Console</h2>
        <ThreadModal
          open={open}
          onClose={() => setOpen(false)}
          selectedLog={selectedLog}
          setSelectedLog={setSelectedLog}
          userLoggedIn={user}
        />
        {/* Filters */}
        {/* <div className="flex flex-wrap gap-4 mb-4">
          <input
            type="text"
            placeholder="Action"
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
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
            onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md"
          />
        </div> */}

        {/* Logs Table */}
        <div className="border rounded-md shadow bg-white">
          <table className="min-w-full table-auto text-sm">
            <thead className="sticky top-0 bg-gray-200 z-10">
              <tr>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">User</th>
                <th className="px-4 py-2 text-left">Action</th>
                <th className="px-4 py-2 text-left">Thread status</th>
                <th className="px-4 py-2 text-left">Advanced Info</th>
              </tr>
            </thead>
            <tbody>
              {currentLogs.map((log, index) => (
                <Fragment key={log._id || index}>
                  <tr
                    className={clsx(
                      "border-t hover:bg-gray-50",
                      highlightedLogId === log._id &&
                        "animate-fadeIn bg-yellow-100"
                    )}
                  >
                    <td className="px-4 py-2 whitespace-nowrap">
                      {moment(log.createdAt).format("YYYY-MM-DD HH:mm:ss")}
                    </td>
                    <td className="px-4 py-2">
                      {log.user?.firstName || log.user?.lastName ? (
                        <span>
                          {`${log.user?.firstName ?? ""} ${
                            log.user?.lastName ?? ""
                          }`.trim()}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic flex items-center gap-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M18.364 5.636L5.636 18.364M5.636 5.636l12.728 12.728"
                            />
                          </svg>
                          (User archived)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2">{log.action}</td>
                    <td className="px-4 py-2">
                      {log.technicalDetails.status === "SUCCESS" ? (
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            statusColor[!log.solved]
                          }`}
                        >
                          SUCCESS
                        </span>
                      ) : log?.solved ? (
                        <>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              statusColor[log.solved]
                            }`}
                          >
                            {statusText[log.solved]}
                          </span>
                        </>
                      ) : (
                        <button
                          onClick={() => handleReviews(log)}
                          className="text-yellow-800 hover:text-yellow-900 hover:underline text-sm px-3 py-1 min-w-[180px] whitespace-nowrap rounded bg-yellow-100"
                        >
                          Manage Thread
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-2 break-all">
                      <button
                        onClick={() =>
                          setExpandedRow(index === expandedRow ? null : index)
                        }
                        className="text-blue-600 hover:text-blue-800 hover:underline text-sm px-2 py-1 min-w-[48px] rounded"
                      >
                        {expandedRow === index ? "Hide" : "View"}
                      </button>
                    </td>
                  </tr>
                  {expandedRow === index && (
                    <tr className="bg-gray-50 border-t">
                      <td colSpan={7}>
                        <pre className="text-xs p-4 overflow-auto whitespace-pre-wrap">
                          {JSON.stringify(log.technicalDetails || {}, null, 2)}
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
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Prev
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
};

export default AuditLogs;
