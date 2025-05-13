import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ResponsiveStyle.css";
import { useOutletContext } from "react-router-dom";
import { CheckCircle, XCircle } from "lucide-react";

const StoreManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { packs } = useOutletContext();
  const existingPacks = packs.length ? packs : [];

  const isEditing = !!id;

  const [pack, setPack] = useState({
    name: "",
    description: "",
    price: "0",
    coinAmount: 0,
  });

  const [errors, setErrors] = useState({});
  const [warning, setWarning] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEditing) {
      setIsLoading(true);
      axios
        .get(`/api/admin/pack/${id}`)
        .then((res) => {
          const data = res.data;
          setPack({
            name: data.name || "",
            description: data.description || "",
            price: data.price ? (data.price / 100).toFixed(2) : "0",
            coinAmount: data.coinAmount || 0,
          });
        })
        .catch((err) => console.error("Error fetching pack:", err))
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  useEffect(() => {
    const currentCoinAmount = Number(pack.coinAmount);
    const duplicate = existingPacks.find(
      (p) => Number(p.coinAmount) === currentCoinAmount && p._id !== id
    );
    setWarning(
      duplicate ? `Coin amount already used in: ${duplicate.name}` : ""
    );
  }, [pack.coinAmount, existingPacks, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "price") {
      const cleaned = value.replace(",", ".").replace(/[^0-9.]/g, "");
      setPack((prev) => ({ ...prev, [name]: cleaned }));
      return;
    }

    if (name === "coinAmount") {
      const numberValue = parseInt(value) || 0;
      setPack((prev) => ({ ...prev, [name]: numberValue }));
      return;
    }

    setPack((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!pack.name.trim()) newErrors.name = "Name is required.";
    if (!pack.description.trim())
      newErrors.description = "Description is required.";
    if (pack.coinAmount <= 0)
      newErrors.coinAmount = "Coin amount must be greater than zero.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const payload = {
        ...pack,
        price: Math.round(parseFloat(pack.price) * 100),
      };
      if (isEditing) {
        await axios.put(`/api/admin/update-pack/${id}`, payload);
      } else {
        await axios.post("/api/admin/addPack", payload);
        setPack({ name: "", description: "", price: "0", coinAmount: 0 });
      }
      navigate("/storeAdmin", { state: { refresh: true } });
    } catch (err) {
      console.error("Failed to save pack:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    pack.name.trim() &&
    pack.description.trim() &&
    parseFloat(pack.price) > 0 &&
    pack.coinAmount > 0;

  return (
    <div className="page-container">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="custom-form-wrapper w-full lg:w-1/2">
          <h2 className="custom-form-title">
            {isEditing ? "Edit Pack" : "Create New Pack"}
          </h2>
          <form onSubmit={handleSubmit} className="custom-user-form">
            <div className="custom-form-row">
              <div className="custom-form-group">
                <label htmlFor="name">
                  Name<span className="custom-required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={pack.name}
                  onChange={handleChange}
                />
                {errors.name && (
                  <p className="custom-error-text">{errors.name}</p>
                )}
              </div>

              <div className="custom-form-group">
                <label htmlFor="price">
                  Price (EUR)<span className="custom-required">*</span>
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  id="price"
                  name="price"
                  value={pack.price}
                  onChange={handleChange}
                />
                <small className="text-gray-500 text-xs mt-1">
                  Example: 1.99 or 1,99
                </small>
                {errors.price && (
                  <p className="custom-error-text">{errors.price}</p>
                )}
              </div>
            </div>

            <div className="custom-form-row">
              <div className="custom-form-group">
                <label htmlFor="coinAmount">
                  Coin Amount<span className="custom-required">*</span>
                </label>
                <input
                  type="number"
                  id="coinAmount"
                  name="coinAmount"
                  min={0}
                  value={pack.coinAmount}
                  onChange={handleChange}
                />
                {errors.coinAmount && (
                  <p className="custom-error-text">{errors.coinAmount}</p>
                )}
                {warning && (
                  <p className="text-yellow-600 text-sm mt-1">{warning}</p>
                )}
              </div>

              <div className="custom-form-group">
                <label htmlFor="description">
                  Description<span className="custom-required">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={pack.description}
                  onChange={handleChange}
                />
                {errors.description && (
                  <p className="custom-error-text">{errors.description}</p>
                )}
              </div>
            </div>

            <div className="custom-form-actions justify-start gap-3">
              <button
                type="submit"
                className="custom-outline-btn create-btn"
                disabled={!isFormValid || isSubmitting}
              >
                <CheckCircle size={16} className="mr-2" />
                {isEditing ? "Update Pack" : "Create Pack"}
              </button>
              <button
                type="button"
                className="custom-outline-btn archive-btn"
                onClick={() => navigate("/storeAdmin")}
              >
                <XCircle size={16} className="mr-2" /> Cancel
              </button>
            </div>
          </form>
        </div>

        <div className="custom-form-wrapper w-full lg:w-1/2">
          <h3 className="text-lg font-semibold mb-4">Pack Preview</h3>
          <div className="custom-pack-preview">
            <div className="bg-white p-6 border-t-4 border-blue-500">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">
                  {pack.name || "Pack Name"}
                </h3>
                <div className="flex items-center text-2xl font-bold text-blue-600">
                  <span className="text-yellow-500 mr-1">🪙</span>
                  {(parseFloat(pack.price) || 0).toFixed(2)} EUR
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
                        {pack.coinAmount || "?"}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-center">
                  {pack.description || "Short description about the pack."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreManagement;
