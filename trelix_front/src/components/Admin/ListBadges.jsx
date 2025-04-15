import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const ListBadges = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("grid");

  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const response = await axios.get(`/api/badges-r/get-badges`);
        setBadges(response.data);
        console.log(response.data);
      } catch (err) {
        console.error("Error fetching badges:", err);
        setError("Failed to load badges. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchBadges();
  }, []);

  const handleDelete = async (badgeId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`/api/badges-r/deleteBadge/${badgeId}`, {
          withCredentials: true,
        }),
          setBadges(badges.filter((badge) => badge._id !== badgeId));
        Swal.fire("Deleted!", "Your badge has been deleted.", "success");
      } catch (error) {
        Swal.fire("Error!", "Failed to delete badge.", "error");
        console.error("Delete error:", error);
      }
    }
  };

  // Edit handler - navigates with badge data
  const handleEdit = (badge) => {
    navigate(`/badge/edit/${badge._id}`, {
      state: {
        badgeData: {
          name: badge.name,
          description: badge.description,
          triggerType: badge.triggerType,
          triggerCondition: badge.triggerCondition,
          conditionValue: badge.conditionValue,
          existingImage: badge.image,
        },
      },
    });
  };

  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
        <p>Loading badges...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger text-center py-10">
        {error}
        <button
          onClick={() => window.location.reload()}
          className="btn btn-link"
        >
          Retry
        </button>
      </div>
    );
  }
  const baseUrl = "http://localhost:5000";
  return (
    <div className="card ctm-border-radius shadow-sm">
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center">
          <h4 className="card-title mb-0">All Badges</h4>
          <div className="btn-group">
            <button
              onClick={() => setViewMode("grid")}
              className={`btn btn-sm ${
                viewMode === "grid" ? "btn-primary" : "btn-outline-secondary"
              }`}
            >
              <i className="fa fa-th-large"></i> Grid
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`btn btn-sm ${
                viewMode === "table" ? "btn-primary" : "btn-outline-secondary"
              }`}
            >
              <i className="fa fa-table"></i> Table
            </button>
          </div>
        </div>
      </div>
      <div className="card-body">
        {badges.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">
              No badges found. Create your first badge!
            </p>
            <button
              onClick={() => navigate("/badge/createBadge")}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Badge
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-4">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="relative group rounded-lg overflow-hidden hover:shadow-md transition-all"
              >
                {/* Badge Image */}
                <img
                  src={`${baseUrl}${badge.image.replace(/\\/g, "/")}`}
                  alt={badge.name}
                  className="w-full h-auto aspect-square object-contain bg-gray-100 p-2"
                />

                {/* Edit Icon (appears on hover) */}
                <div
                  onClick={() => handleEdit(badge)}
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
                  title="Edit badge"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto p-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Badge
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trigger
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {badges.map((badge) => (
                  <tr key={badge.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={`${baseUrl}${badge.image.replace(/\\/g, "/")}`}
                        alt={badge.name}
                        className="h-10 w-10"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {badge.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {badge.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {badge.triggerType} {badge.triggerCondition}{" "}
                        {badge.conditionValue}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(badge.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleEdit(badge)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(badge._id)}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListBadges;
