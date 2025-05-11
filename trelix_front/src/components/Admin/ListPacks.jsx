import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Eye, Edit, Archive, ArchiveRestore, Plus } from "lucide-react";
import "./ResponsiveStyle.css";
import { useOutletContext } from "react-router-dom";

function ListPacks() {
  const { packs, setPacks } = useOutletContext();

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleArchive = async (packId) => {
    setLoading(true);
    setMessage("");
    try {
      await axios.put(
        `${import.meta.env.VITE_API_PROXY}/api/admin/archive-pack/${packId}`
      );
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

  const handleUnarchive = async (packId) => {
    setLoading(true);
    setMessage("");
    try {
      await axios.put(
        `${import.meta.env.VITE_API_PROXY}/api/admin/unarchive-pack/${packId}`
      );
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
    <div className="page-container">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h2 className="text-2xl font-semibold">Stored Packs</h2>
        <button
          className="custom-btn-create"
          onClick={() => navigate("create")}
          title="Create a new pack"
        >
          <Plus size={16} className="mr-2" /> Create New Pack
        </button>
      </div>

      {message && (
        <div
          className={`mb-4 p-4 rounded-md ${
            message.includes("successfully")
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      {loading ? (
        <p>Loading packs...</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {packs.map((pack) => {
            const isActive = pack.isActive;
            return (
              <div
                key={pack._id}
                className={`p-4 border rounded flex flex-col justify-between ${
                  isActive
                    ? "bg-white text-gray-900"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                <div>
                  <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
                    {pack.name}
                    {!isActive && (
                      <span className="text-xs bg-gray-300 text-gray-700 px-2 py-0.5 rounded-full">
                        Archived
                      </span>
                    )}
                  </h3>
                  <p className="mb-1 text-sm">{pack.description}</p>
                  <p className="mb-1 text-sm font-medium">
                    {pack.price / 100} {pack.currency.toUpperCase()}
                  </p>
                  <p className="mb-2 text-sm">Coins: {pack.coinAmount}</p>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => navigate(`edit/${pack._id}`)}
                    className="custom-outline-btn edit-btn"
                    title="Edit pack"
                  >
                    <Edit size={16} className="mr-1" /> Edit
                  </button>
                  {isActive ? (
                    <button
                      onClick={() => handleArchive(pack._id)}
                      disabled={loading}
                      className="custom-outline-btn archive-btn"
                      title="Archive pack"
                    >
                      <Archive size={16} className="mr-1" /> Archive
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUnarchive(pack._id)}
                      disabled={loading}
                      className="custom-outline-btn unarchive-btn"
                      title="Unarchive pack"
                    >
                      <ArchiveRestore size={16} className="mr-1" /> Unarchive
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`${pack._id}`)}
                    className="custom-outline-btn view-btn"
                    title="View pack details"
                  >
                    <Eye size={16} className="mr-1" /> View
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ListPacks;
