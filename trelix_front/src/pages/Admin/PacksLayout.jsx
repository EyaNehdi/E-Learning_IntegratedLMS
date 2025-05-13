import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import PageContainer from "../../layout/PageContainer";

const PacksLayout = () => {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchPacks = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_PROXY}/api/admin/packs`
        );
        setPacks(res.data);
      } catch (err) {
        console.error("Failed to load packs", err);
      } finally {
        setLoading(false);
      }
    };

    if (location.state?.refresh || packs.length === 0) {
      fetchPacks();
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  return (
    <PageContainer>
      {loading ? (
        <div className="text-center py-4">Loading packs...</div>
      ) : (
        <Outlet context={{ packs, setPacks }} />
      )}
    </PageContainer>
  );
};

export default PacksLayout;
