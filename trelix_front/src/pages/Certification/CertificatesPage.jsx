import axios from "axios";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useProfileStore } from "../../store/profileStore";

const CertificatesPage = () => {
  const [certificates, setCertificates] = useState([]);
  const { user } = useProfileStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchCertificates();
    }
  }, [user]);

  const fetchCertificates = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/certificates/getCertAll?userId=${user?._id}`
      );
      setCertificates(response.data);
    } catch (error) {
      console.error("Error fetching certificates:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Browse Certificates</h2>
      <Outlet
        context={{
          certificates,
          loading,
        }}
      />
    </div>
  );
};

export default CertificatesPage;
