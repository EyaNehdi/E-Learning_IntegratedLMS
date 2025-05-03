import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Headeradmin from "./Headeradmin";
import { Coins } from "lucide-react";

const StoreManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [pack, setPack] = useState({
    name: "",
    description: "",
    price: 0,
    coinAmount: 0,
  });

  const [errors, setErrors] = useState({
    name: "",
    description: "",
    price: 0,
    coinAmount: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    if (isEditing) {
      setIsLoading(true);
      axios
        .get(`/api/admin/pack/${id}`)
        .then((res) => {
          const data = res.data;
          console.log("Fetched pack data:", data);
          setPack({
            name: data.name || "",
            description: data.description || "",
            price: data.price ? data.price / 100 : 0,
          });
        })
        .catch((err) => console.error("Error fetching pack:", err))
        .finally(() => setIsLoading(false));
    }
  }, [id]);
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPack((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...pack,
        price: pack.price * 100, // convert to cents
      };

      if (isEditing) {
        await axios.put(`/api/admin/update-pack/${id}`, payload);
      } else {
        await axios.post("/api/admin/addPack", payload);
      }

      navigate("/storeAdmin");
    } catch (err) {
      console.error("Failed to save pack:", err);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <Headeradmin />
      <div className="container mx-auto px-4 py-6">
        <div className="card shadow-sm ctm-border-radius w-full">
          <div className="card-header bg-white p-4 border-b">
            <div className="flex justify-between items-center">
              <h4 className="text-xl font-semibold">{isEditing ? "Edit Pack" : "Create Pack"}</h4>
              <button
                onClick={() => navigate("/storeAdmin")}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md flex items-center"
              >
                <i className="fa fa-arrow-left mr-2"></i>
                Back to Packs
              </button>
            </div>
          </div>
          <div className="card-body p-6">
          {isLoading ? (
    <p>Loading pack data...</p>
  ) : (
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Name<span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="name"
                  value={pack.name}
                  onChange={handleChange}
                  required
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Description<span className="text-danger">*</span>
                </label>
                <textarea
                  className="form-control w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="description"
                  value={pack.description}
                  onChange={handleChange}
                  rows={4}
                  required
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Price in Euros<span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  className="form-control w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="price"
                  value={pack.price || 0}
                  onChange={handleChange}
                  required
                  min={0}
                  
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Coin Amount <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  className="form-control w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="coinAmount"
                  value={pack.coinAmount || 0}
                  onChange={handleChange}
                  required
                  min={0}
                
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>

              <div className="flex justify-center gap-4 mt-8">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md" type="submit">
                  {isEditing ? "Update" : "Create"}
                </button>
               
              </div>
            </form>
  )}
          </div>
        </div>
      </div>
    </div>
  )
};

export default StoreManagement;
