import { useState, useEffect } from "react";
import axios from "axios";
import { Coins } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { getRedirectSlug } from "../../utils/redirectSlug";

function Store() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, checkAuth } = useAuthStore();

  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [redirecting, setRedirecting] = useState(false);
  const [postPaymentLoading, setPostPaymentLoading] = useState(false);
  const [purchaseType, setPurchaseType] = useState("topup"); // default is topup

  useEffect(() => {
    const slug = getRedirectSlug();
    if (slug && typeof slug === "string" && slug.trim() !== "") {
      setPurchaseType("course");
    } else {
      setPurchaseType("topup");
    }
  }, []);

  useEffect(() => {
    const sessionId = new URLSearchParams(location.search).get("session_id");
    if (sessionId) {
      setPostPaymentLoading(true);
      const verifySession = async () => {
        try {
          const response = await axios.get(
            `${
              import.meta.env.VITE_API_PROXY
            }/stripe/verify-session/${sessionId}`,
            {
              withCredentials: true,
            }
          );
          setMessage(response.data.message || "Payment successful!");
          await checkAuth();
          const waitForUser = () =>
            new Promise((resolve) => {
              const interval = setInterval(() => {
                const user = useAuthStore.getState().user;
                if (user) {
                  clearInterval(interval);
                  resolve(user);
                }
              }, 100);
            });
          await waitForUser();
          navigate("/store", { replace: true });
        } catch (err) {
          console.error("Session verification failed:", err);
          setMessage(
            err.response?.data?.message || "Payment verification failed."
          );
          navigate("/store", { replace: true });
        }
      };
      verifySession();
    }
  }, [location, navigate, checkAuth]);

  // Fetch packs
  useEffect(() => {
    const fetchPacks = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_PROXY}/api/admin/packs`,
          {
            withCredentials: true,
          }
        );
        const activePacks = response.data.filter((pack) => pack.isActive);
        setPacks(activePacks);
        setError(null);
      } catch (err) {
        console.error("Error fetching packs:", err);
        setError("Failed to load packs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPacks();
  }, []);

  const handlePackClick = async (pack) => {
    if (!isAuthenticated) {
      setMessage("Please log in to proceed with the purchase.");
      navigate("/login");
      return;
    }
    if (pack.isActive && !redirecting) {
      setRedirecting(true);
      setMessage("");
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_PROXY}/stripe/create-checkout-session`,
          {
            packId: pack._id,
            userId: user._id,
            type: purchaseType,
          },
          {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          }
        );
        if (response.data.url) {
          window.location.href = response.data.url;
        } else {
          throw new Error("No checkout URL returned");
        }
      } catch (err) {
        console.error("Error initiating checkout:", err);
        setMessage(
          err.response?.data?.message ||
            "Failed to initiate checkout. Please try again."
        );
        setRedirecting(false);
      }
    }
  };

  if (postPaymentLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">
            Updating your balance and redirecting...
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent"></div>
          <p className="mt-2 text-gray-600">Loading packs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center bg-red-50 p-6 rounded-lg max-w-md">
          <div className="text-red-500 text-5xl mb-4">
            <i className="fa fa-exclamation-circle"></i>
          </div>
          <h2 className="text-xl font-bold text-red-700 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <header className="mb-12 text-center">
          <div className="flex justify-between items-center mb-4">
            <div className="flex justify-center">
              <div className="bg-yellow-400 text-yellow-800 rounded-full p-4 inline-block">
                <Coins size={40} />
              </div>
            </div>
            {isAuthenticated && (
              <div className="text-lg font-semibold text-gray-700">
                Your Balance:{" "}
                <span className="text-yellow-600">
                  🪙 {user?.balance || 0} Trelix Coins
                </span>
              </div>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Trelix Store</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Select from our range of Trelix packs to get started. Each pack
            offers different amounts of our digital currency at competitive
            prices.
          </p>
        </header>

        {message && (
          <div
            className={`mb-8 p-4 rounded-lg max-w-2xl mx-auto ${
              message.includes("successful")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        {packs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">
              No active packs available at the moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packs.map((pack) => {
              const isDisabled = !pack.isActive || redirecting;

              return (
                <div
                  key={pack._id}
                  onClick={() => handlePackClick(pack)}
                  className={`
                    relative overflow-hidden rounded-xl shadow-md transition-all duration-300
                    ${
                      isDisabled
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:shadow-lg transform hover:-translate-y-1 cursor-pointer"
                    }
                  `}
                >
                  {isDisabled && (
                    <div className="absolute inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center z-10">
                      <span className="bg-gray-800 text-white px-4 py-2 rounded-full text-sm font-medium">
                        {redirecting
                          ? "Redirecting..."
                          : "Currently Unavailable"}
                      </span>
                    </div>
                  )}
                  <div className="bg-white p-6 border-t-4 border-blue-500">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold">{pack.name}</h3>
                      <div className="flex items-center text-2xl font-bold text-blue-600">
                        <span className="text-yellow-500 mr-1">🪙</span>
                        {(pack.price / 100).toFixed(2)}{" "}
                        {pack.currency.toUpperCase()}
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
                              {pack.coinAmount ||
                                pack.description.match(/\d+/)?.[0] ||
                                "?"}
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Store;
