import { useState, useEffect } from "react";
import { Dialog } from "@mui/material";
import { IoClose, IoSend } from "react-icons/io5";
import { CheckCircle } from "lucide-react";
import socket from "../../../utils/socket";
import { format, formatDistanceToNow } from "date-fns";

const ThreadModal = ({
  open,
  onClose,
  selectedLog,
  setSelectedLog,
  userLoggedIn,
}) => {
  const [comment, setComment] = useState("");
  const [loadingResolve, setLoadingResolve] = useState(false);
  const handleAddComment = async () => {
    if (!comment.trim()) return;
    socket.emit("add-review", {
      reviewer: userLoggedIn?._id,
      logId: selectedLog._id,
      comment,
    });
    setComment("");
  };

  const handleResolve = () => {
    if (window.confirm("Are you sure you want to mark this as resolved?")) {
      setLoadingResolve(true);
      socket.emit("resolve-log", { logId: selectedLog._id });
      setLoadingResolve(false);
      onClose();
    }
  };

  useEffect(() => {
    if (!selectedLog?._id) return;

    const handleNewReview = ({ logId, newReview }) => {
      if (selectedLog._id === logId) {
        setSelectedLog((prev) => ({
          ...prev,
          reviews: [...prev.reviews, newReview],
        }));
      }
    };

    socket.on("new-review", handleNewReview);

    return () => {
      socket.off("new-review", handleNewReview);
    };
  }, [selectedLog?._id]);

  if (!selectedLog) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        style: {
          height: "90vh",
          borderRadius: "12px",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: "1px solid #E5E7EB",
          paddingBottom: "16px",
          marginBottom: "16px",
        }}
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-1">
              {selectedLog?.action && (
                <span
                  style={{
                    textTransform: "capitalize",
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  {selectedLog.action.replace(/([A-Z])/g, " $1").trim()}
                </span>
              )}
            </h2>
            <div style={{ fontSize: "0.875rem", color: "#6B7280" }}>
              By: {selectedLog?.user?.firstName} {selectedLog?.user?.lastName} •{" "}
              {new Date(selectedLog?.createdAt).toLocaleString()}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "1px solid #E5E7EB",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "6px",
              borderRadius: "4px",
            }}
          >
            <IoClose size={20} color="#6B7280" />
          </button>
        </div>

        {selectedLog?.technicalDetails && (
          <div
            style={{
              backgroundColor: "#F9FAFB",
              padding: "10px 12px",
              borderRadius: "6px",
              marginTop: "12px",
              fontSize: "0.813rem",
            }}
          >
            <div style={{ display: "flex", gap: "16px", color: "#4B5563" }}>
              <div>
                <span style={{ fontWeight: "600", marginRight: "4px" }}>
                  Status:
                </span>
                <span
                  style={{
                    backgroundColor:
                      selectedLog.technicalDetails.status === "SUCCESS"
                        ? "#ECFDF5"
                        : "#FEF2F2",
                    color:
                      selectedLog.technicalDetails.status === "SUCCESS"
                        ? "#065F46"
                        : "#B91C1C",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                    fontWeight: "500",
                  }}
                >
                  {selectedLog.technicalDetails.status}
                </span>
              </div>
              <div>
                <span style={{ fontWeight: "600", marginRight: "4px" }}>
                  Method:
                </span>
                <span
                  style={{
                    backgroundColor: "#EFF6FF",
                    color: "#1E40AF",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                    fontWeight: "500",
                  }}
                >
                  {selectedLog.technicalDetails.method}
                </span>
              </div>
            </div>
            {selectedLog.technicalDetails.endpoint && (
              <div style={{ marginTop: "6px", overflowX: "auto" }}>
                <span
                  style={{
                    fontWeight: "600",
                    marginRight: "4px",
                    color: "#4B5563",
                  }}
                >
                  Endpoint:
                </span>
                <code
                  style={{
                    fontFamily: "monospace",
                    backgroundColor: "#F3F4F6",
                    padding: "3px 6px",
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                    color: "#374151",
                  }}
                >
                  {selectedLog.technicalDetails.endpoint}
                </code>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Discussion Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          overflowY: "auto",
          maxHeight: "55vh",
          paddingRight: "4px",
          flex: 1,
          justifyContent:
            selectedLog.reviews?.length > 0 ? "flex-end" : "center",
        }}
        className="discussion-container"
      >
        {selectedLog.reviews && selectedLog.reviews.length > 0 ? (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {selectedLog.reviews.map((review, idx) => {
              const isOwnComment = review.reviewer?._id === userLoggedIn._id;
              const fullName = review.reviewer
                ? `${review.reviewer.firstName} ${review.reviewer.lastName}`
                : "Unknown";

              const timeAgo = formatDistanceToNow(new Date(review.timestamp), {
                addSuffix: true,
              });

              const commentDate =
                new Date() - new Date(review.timestamp) >
                7 * 24 * 60 * 60 * 1000
                  ? format(new Date(review.timestamp), "PPPp")
                  : timeAgo;

              return (
                <div
                  key={idx}
                  className={`flex ${
                    isOwnComment ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2 rounded-xl text-sm leading-snug ${
                      isOwnComment
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                    style={{
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: "500",
                        marginBottom: "4px",
                        color: isOwnComment
                          ? "rgba(255,255,255,0.85)"
                          : "#6B7280",
                      }}
                    >
                      {isOwnComment ? "You" : fullName} •{" "}
                      <span style={{ fontWeight: "400" }}>{commentDate}</span>
                    </div>
                    <div>{review.comment}</div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center text-sm">No comments yet.</p>
        )}
      </div>

      {/* Comment Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAddComment();
        }}
        className="flex items-center gap-2 mt-4"
      >
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Enter your comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            style={{
              width: "100%",
              paddingLeft: "16px",
              paddingRight: "40px",
              paddingTop: "8px",
              paddingBottom: "8px",
              fontSize: "0.875rem",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              outline: "none",
              transition: "border-color 0.2s ease, box-shadow 0.2s ease",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#3B82F6";
              e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.3)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#E5E7EB";
              e.target.style.boxShadow = "none";
            }}
          />
          <button
            type="submit"
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#3B82F6",
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = "#2563EB")}
            onMouseOut={(e) => (e.currentTarget.style.color = "#3B82F6")}
          >
            <IoSend size={18} />
          </button>
        </div>
      </form>

      {/* Footer Buttons */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={handleResolve}
          disabled={loadingResolve || selectedLog?.solved}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "0.875rem",
            fontWeight: "600",
            padding: "10px 20px",
            borderRadius: "25px",
            border: "none",
            cursor: selectedLog?.solved ? "not-allowed" : "pointer",
            backgroundColor: selectedLog?.solved ? "#10B981" : "#047857",
            color: "white",
            transition: "background-color 0.2s ease",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
          onMouseOver={(e) => {
            if (!selectedLog?.solved) {
              e.currentTarget.style.backgroundColor = "#065F46";
            }
          }}
          onMouseOut={(e) => {
            if (!selectedLog?.solved) {
              e.currentTarget.style.backgroundColor = "#047857";
            }
          }}
        >
          <CheckCircle size={16} />
          {selectedLog?.solved ? "Thread Completed" : "Complete Thread"}
        </button>

        <button
          onClick={onClose}
          style={{
            fontSize: "0.875rem",
            fontWeight: "500",
            padding: "10px 20px",
            borderRadius: "6px",
            backgroundColor: "transparent",
            border: "1px solid #D1D5DB",
            color: "#6B7280",
            cursor: "pointer",
            transition: "background-color 0.2s ease",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "#F9FAFB";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          Close
        </button>
      </div>
    </Dialog>
  );
};

export default ThreadModal;
