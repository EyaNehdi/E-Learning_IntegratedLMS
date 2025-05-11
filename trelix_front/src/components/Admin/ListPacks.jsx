import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Headeradmin from "./Headeradmin";

function ListPacks() {
  const navigate = useNavigate();
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(""); // For success/error messages

  // Fetch packs on mount
  useEffect(() => {
    const fetchPacks = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:5000/api/admin/packs");
        setPacks(response.data);
      } catch (error) {
        console.error("Error fetching packs:", error);
        setMessage("Failed to load packs. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchPacks();
  }, []);

  // Handle archiving a pack (set isActive to false)
  const handleArchive = async (packId) => {
    setLoading(true);
    setMessage("");
    try {
      await axios.put(`http://localhost:5000/api/admin/archive-pack/${packId}`);
      // Update the packs state to reflect the inactive status
      setPacks((prevPacks) =>
        prevPacks.map((pack) =>
          pack._id === packId ? { ...pack, isActive: false } : pack
        )
      );
      setMessage("Pack archived successfully!");
    } catch (error) {
      console.error("Error archiving pack:", error);
      setMessage("Failed to archive pack. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle unarchiving a pack (set isActive to true)
  const handleUnarchive = async (packId) => {
    setLoading(true);
    setMessage("");
    try {
      await axios.put(`http://localhost:5000/api/admin/unarchive-pack/${packId}`);
      // Update the packs state to reflect the active status
      setPacks((prevPacks) =>
        prevPacks.map((pack) =>
          pack._id === packId ? { ...pack, isActive: true } : pack
        )
      );
      setMessage("Pack unarchived successfully!");
    } catch (error) {
      console.error("Error unarchiving pack:", error);
      setMessage("Failed to unarchive pack. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <Headeradmin />
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Stored Packs</h2>
          <button
            onClick={() => navigate("/product")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <i className="fa fa-plus mr-2"></i>
            Add New Pack
          </button>
        </div>

        {message && (
          <div
            className={`mb-4 p-4 rounded-md ${
              message.includes("successfully") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        {loading ? (
          <p>Loading packs...</p>
        ) : (
          <div className="card shadow-sm ctm-border-radius w-full">
            <div className="card-body">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold">Stored Packs</h2>
              </div>
              <div className="table-responsive" style={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}>
                <table className="table custom-table table-hover w-full" style={{ borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th className="border px-4 py-2 bg-gray-100">Pack Name</th>
                      <th className="border px-4 py-2 bg-gray-100">Description</th>
                      <th className="border px-4 py-2 bg-gray-100">Price</th>
                      <th className="border px-4 py-2 bg-gray-100">Status</th>
                      <th className="border px-4 py-2 bg-gray-100">Coin Amount</th>
                      <th className="border px-4 py-2 bg-gray-100">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {packs.map((pack) => {
                      const isActive = pack.isActive; // Define isActive for each pack
                      const rowClass = isActive ? "text-gray-900" : "bg-gray-100 text-gray-500 italic";

                      return (
                        <tr key={pack._id} className={rowClass}>
                          <td className="border px-4 py-2">
                            <div className="flex items-center gap-2">
                              <span>{pack.name}</span>
                              {!isActive && (
                            <span className="text-xs bg-gray-300 text-gray-700 px-2 py-0.5 rounded-full">
                              Archived
                            </span>
                          )}
                            </div>
                          </td>
                          <td className="border px-4 py-2">{pack.description}</td>
                          <td className="capitalize border px-4 py-2">
                            {pack.price / 100} {pack.currency.toUpperCase()} {/* Display price in euros */}
                          </td>
                          <td className="border px-4 py-2">
                            {isActive ? "Active" : "Archived"}
                          </td>
                          <td>
                          <div className="flex items-center gap-2">
                              <span>{pack.coinAmount}</span>
                              
                            </div>
                            </td>
                          <td className="border px-4 py-2">
                            <span
                              title="View Pack"
                              onClick={() => navigate(`/admin/packs/${pack._id}`)}
                              className="text-blue-500 hover:text-blue-700 cursor-pointer mr-3"
                            >
                              <i className="fa fa-eye" />
                            </span>
                            <span
                              title="Edit Pack"
                              onClick={() => navigate(`/product/${pack._id}`)}
                              className="text-green-600 hover:text-green-800 cursor-pointer mr-3"
                            >
                              <i className="fa fa-pencil" />
                            </span>
                            {isActive ? (
                              <span
                                title="Archive Pack"
                                onClick={() => handleArchive(pack._id)}
                                className={`text-yellow-600 hover:text-yellow-800 cursor-pointer ${
                                  loading ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                              >
                                <i className="fa fa-archive" />
                              </span>
                            ) : (
                              <span
                                title="Unarchive Pack"
                                onClick={() => handleUnarchive(pack._id)}
                                className={`text-gray-500 hover:text-black cursor-pointer ${
                                  loading ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                              >
                                <i className="fa fa-undo" />
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ListPacks;