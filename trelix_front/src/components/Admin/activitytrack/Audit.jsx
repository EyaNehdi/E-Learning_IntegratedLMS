import { Fragment, useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import clsx from "clsx";
import ThreadModal from "./ThreadModal";
import { useProfileStore } from "../../../store/profileStore";
import socket from "../../../utils/socket";
import "../ResponsiveStyle.css";

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

  const fetchAuditLogs = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_PROXY}/api/admin/audit-logs`,
        {
          params: { limit: 100 },
          headers: { "Content-Type": "application/json" },
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
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_PROXY}/api/logs/thread/${log._id}`
      );
      setSelectedLog({ ...log, reviews: data });
      setOpen(true);
    } catch (error) {
      console.error("Failed to fetch thread", error);
    }
  };

  return (
    <div className="page-container">
      <h2 className="custom-form-title">Audit Logs Console</h2>
      <ThreadModal
        open={open}
        onClose={() => setOpen(false)}
        selectedLog={selectedLog}
        setSelectedLog={setSelectedLog}
        userLoggedIn={user}
      />

      <div className="auditlogs-table-wrapper">
        <table className="auditlogs-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>User</th>
              <th>Action</th>
              <th>Thread Status</th>
              <th>Advanced Info</th>
            </tr>
          </thead>
          <tbody>
            {currentLogs.map((log, index) => (
              <Fragment key={log._id || index}>
                <tr
                  className={clsx(
                    highlightedLogId === log._id && "highlight-row"
                  )}
                >
                  <td>{moment(log.createdAt).format("YYYY-MM-DD HH:mm")}</td>
                  <td>
                    {log.user?.firstName || log.user?.lastName ? (
                      `${log.user?.firstName ?? ""} ${
                        log.user?.lastName ?? ""
                      }`.trim()
                    ) : (
                      <span className="text-gray-400 italic">
                        (User archived)
                      </span>
                    )}
                  </td>
                  <td>{log.action}</td>
                  <td>
                    {log.technicalDetails.status === "SUCCESS" ? (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          statusColor[!log.solved]
                        }`}
                      >
                        SUCCESS
                      </span>
                    ) : log?.solved ? (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          statusColor[log.solved]
                        }`}
                      >
                        {statusText[log.solved]}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleReviews(log)}
                        className="table-action-button table-action-manage"
                      >
                        Manage Thread
                      </button>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() =>
                        setExpandedRow(index === expandedRow ? null : index)
                      }
                      className="table-action-button table-action-view"
                    >
                      {expandedRow === index ? "Hide" : "View"}
                    </button>
                  </td>
                </tr>
                {expandedRow === index && (
                  <tr className="bg-gray-50 border-t">
                    <td colSpan={5}>
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

      <div className="auditlogs-pagination">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
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
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AuditLogs;
