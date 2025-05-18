import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { clearRedirectSlug, getRedirectSlug } from "../utils/redirectSlug";
import { useAuthStore } from "../store/authStore";
import { useRef } from "react";

const PostPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const sessionId = new URLSearchParams(location.search).get("session_id");
  const [isProcessing, setIsProcessing] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const hasRun = useRef(false);
  
  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!sessionId || !hydrated) return;
    hasRun.current = true;

    const verifyAndRedirect = async () => {
      try {
        const res = await axios.get(
          `${
            import.meta.env.VITE_API_PROXY
          }/stripe/verify-session/${sessionId}`,
          { withCredentials: true }
        );

        await checkAuth();

        const slug = getRedirectSlug();
        clearRedirectSlug();
        setIsProcessing(true);
        if (slug) {
          try {
            const purchaseRes = await axios.post(
              `${import.meta.env.VITE_API_PROXY}/purchases/purchase`,
              { courseSlug: slug },
              { withCredentials: true }
            );

            if (purchaseRes.status === 200) {
              toast.success("Course unlocked!");
              sessionStorage.setItem("showRedirectToast", "true");
              sessionStorage.setItem("cameFromPayment", "true");
              navigate(`/chapters/${slug}`);
            } else {
              toast.error("Course purchase failed.");
              navigate("/store");
            }
          } catch (purchaseErr) {
            if (purchaseErr?.response?.status === 403) {
              toast.error(
                "You still don’t have enough balance to unlock the course."
              );
            } else {
              toast.error("Purchase attempt failed. Please try again.");
            }
            navigate("/store");
          }
        }
      } catch (err) {
        console.error("PostPayment error:", err);
        toast.error("Payment verification failed.");
        navigate("/store");
      } finally {
        setIsProcessing(false);
      }
    };

    verifyAndRedirect();
  }, [sessionId, hydrated]);

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-600 text-lg">
          {isProcessing ? "Unlocking course..." : "Verifying payment..."}
        </p>
      </div>
    </div>
  );
};

export default PostPayment;
