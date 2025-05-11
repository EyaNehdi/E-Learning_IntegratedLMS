import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Edit, PlusCircle, ArchiveRestore, ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import "./ResponsiveStyle.css";

const ViewPack = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pack, setPack] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchPack = async () => {
    try {
      const [packRes, statsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_PROXY}/api/admin/pack/${id}`),
        axios.get(
          `${import.meta.env.VITE_API_PROXY}/api/finance/pack/${id}/analytics`
        ),
      ]);
      setPack(packRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Error fetching pack data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPack();
  }, [id]);

  const handleArchive = async () => {
    setLoading(true);
    setMessage("");
    try {
      await axios.put(
        `${import.meta.env.VITE_API_PROXY}/api/admin/archive-pack/${pack._id}`
      );
      setMessage("Pack archived successfully!");
      fetchPack();
    } catch (error) {
      console.error("Error archiving pack:", error);
      setMessage("Failed to archive pack. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnarchive = async () => {
    setLoading(true);
    setMessage("");
    try {
      await axios.put(
        `${import.meta.env.VITE_API_PROXY}/api/admin/unarchive-pack/${pack._id}`
      );
      setMessage("Pack unarchived successfully!");
      fetchPack();
    } catch (error) {
      console.error("Error unarchiving pack:", error);
      setMessage("Failed to unarchive pack. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => navigate(`/storeAdmin/edit/${id}`);
  const handleCreate = () => navigate(`/storeAdmin/create`);
  const handleBack = () =>
    navigate(`/storeAdmin`, { state: { refresh: true } });

  if (loading)
    return <div className="text-center py-6">Loading pack details...</div>;
  if (!pack)
    return <div className="text-center py-6 text-red-500">Pack not found.</div>;

  return (
    <div className="page-container max-w-7xl mx-auto px-4">
      <div className="bg-white p-6 rounded-lg border w-full">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
          <h2 className="custom-form-title">Pack Overview</h2>
          <div className="flex flex-wrap gap-2">
            <button
              className="custom-outline-btn view-btn"
              onClick={handleBack}
              title="Go back to list"
            >
              <ArrowLeft size={16} className="mr-2" /> Back
            </button>
            <button
              className="custom-btn-create"
              onClick={handleCreate}
              title="Create new pack"
            >
              <PlusCircle size={16} className="mr-2" /> New Pack
            </button>
            <button
              className="custom-outline-btn edit-btn"
              onClick={handleEdit}
              title="Edit this pack"
            >
              <Edit size={16} className="mr-2" /> Edit
            </button>
            <button
              className="custom-outline-btn archive-btn"
              title="Archive/Unarchive this pack"
              onClick={pack.isActive ? handleArchive : handleUnarchive}
            >
              <ArchiveRestore size={16} className="mr-2" />
              {pack.isActive ? "Archive" : "Unarchive"}
            </button>
          </div>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded border">
              <h3 className="text-lg font-bold text-blue-800 mb-2">
                {pack.name}
              </h3>
              <p className="text-gray-600 mb-3">{pack.description}</p>
              <div className="text-blue-600 text-xl font-semibold">
                {(pack.price / 100).toFixed(2)} EUR
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="bg-yellow-100 text-yellow-800 p-3 rounded-full w-16 h-16 flex items-center justify-center text-xl font-bold">
                  {pack.coinAmount}
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    pack.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-300 text-gray-700"
                  }`}
                >
                  {pack.isActive ? "Active" : "Archived"}
                </span>
              </div>
            </div>

            {stats && (
              <div className="bg-white p-4 rounded border">
                <h4 className="text-md font-semibold mb-2">
                  Purchase Insights
                </h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>
                    <strong>Total Purchases:</strong> {stats.totalPurchases}
                  </li>
                  <li>
                    <strong>Unique Buyers:</strong> {stats.uniqueBuyers}
                  </li>
                  <li>
                    <strong>Last Purchase:</strong>{" "}
                    {formatDistanceToNow(new Date(stats.lastPurchase))} ago
                  </li>
                  <li>
                    <strong>Compared Popularity:</strong> Top {stats.rank} of{" "}
                    {stats.totalPacks}
                  </li>
                </ul>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded border text-center">
            <h3 className="text-lg font-bold mb-4">Client Preview</h3>
            <div className="relative overflow-hidden rounded-xl transition-all duration-300 border">
              <div className="bg-white p-6 border-t-4 border-blue-500">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold">{pack.name}</h3>
                  <div className="flex items-center text-2xl font-bold text-blue-600">
                    <span className="text-yellow-500 mr-1">🪙</span>
                    {(pack.price / 100).toFixed(2)} EUR
                  </div>
                </div>
                <div className="mb-6">
                  <div className="flex justify-center my-4">
                    <div className="relative">
                      <div className="absolute -top-1 -right-1 flex">
                        <span className="text-yellow-500 text-2xl transform -rotate-12">
                          🪙
                        </span>
                      </div>
                      <div className="absolute -top-1 -left-1 flex">
                        <span className="text-yellow-500 text-xl transform rotate-12">
                          🪙
                        </span>
                      </div>
                      <div className="bg-yellow-100 rounded-full p-4 flex items-center justify-center w-20 h-20">
                        <span className="text-yellow-800 font-bold text-xl">
                          {pack.coinAmount}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 text-center">
                    {pack.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewPack;
