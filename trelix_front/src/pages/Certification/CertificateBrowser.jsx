import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
} from "@mui/material";
import { useProfileStore } from "../../store/profileStore";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SchoolIcon from "@mui/icons-material/School";
import { Form, Spinner } from "react-bootstrap";

const CertificateBrowser = () => {
  const [certificates, setCertificates] = useState([]);
  const [filteredCertificates, setFilteredCertificates] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const { user, fetchUser } = useProfileStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user) {
      fetchCertificates();
    }
  }, [user]);

  const fetchCertificates = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/certificates/getCertAll?userId=${user._id}`
      );
      setCertificates(response.data);
    } catch (error) {
      console.error("Error fetching certificates:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = certificates;
    if (categoryFilter) {
      filtered = filtered.filter((cert) => cert.category === categoryFilter);
    }
    if (statusFilter) {
      filtered = filtered.filter((cert) =>
        statusFilter === "owned" ? cert.isOwned : !cert.isOwned
      );
    }
    setFilteredCertificates(filtered);
  }, [categoryFilter, statusFilter, certificates]);

  return (
    <div className="container mt-4">
      <h2>Browse Certificates</h2>

      {/* Filters */}
      <div className="d-flex gap-2 mb-3">
        {/* <Form.Select onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          <option value="Web Development">Web Development</option>
          <option value="Cloud Computing">Cloud Computing</option>
        </Form.Select> */}

        <Form.Select onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="owned">Owned</option>
          <option value="not-owned">Not Owned</option>
        </Form.Select>
      </div>

      {/* Loading Spinner */}
      {loading ? (
        <div className="text-center mt-4">
          <Spinner animation="border" />
        </div>
      ) : (
        <div className="row">
          {filteredCertificates.length > 0 ? (
            filteredCertificates.map((cert) => (
              <div key={cert._id} className="col-md-4 mb-4">
                <Card
                  sx={{
                    height: 320, // Fixed height
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: 2,
                  }}
                >
                  <CardMedia
                    component="img"
                    image="/assets/images/certif.png"
                    alt={cert.name}
                    sx={{ height: 140, objectFit: "contain", padding: 1 }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight="bold">
                      {cert.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {cert.description}
                    </Typography>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "14px",
                        marginTop: 8,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <strong>Offered by:</strong> <span>{cert.issuer}</span>
                        {cert.issuerType === "platform" && (
                          <img
                            src="/assets/images/ss.png"
                            alt="Platform"
                            style={{ width: "20px", height: "20px" }}
                          />
                        )}
                      </div>
                      {cert.isOwned && (
                        <div>
                          <strong>Acquired On:</strong>{" "}
                          <span>
                            {cert.acquiredOn
                              ? new Date(cert.acquiredOn).toLocaleDateString()
                              : "N/A"}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>

                  <CardContent sx={{ textAlign: "center", paddingBottom: 2 }}>
                    {cert.isOwned ? (
                      <>
                        <Button
                          variant="contained"
                          color="success"
                          href={`/certificates/view/${cert._id}`}
                          startIcon={<VisibilityIcon />}
                          sx={{
                            fontSize: "14px",
                            padding: "6px 12px",
                            minWidth: "120px",
                          }}
                        >
                          View
                        </Button>

                        {cert.pdfUrl && (
                          <Button
                            variant="outlined"
                            color="primary"
                            href={cert.pdfUrl}
                            startIcon={<DownloadIcon />}
                            sx={{
                              fontSize: "14px",
                              padding: "6px 12px",
                              minWidth: "120px",
                              marginLeft: "10px",
                            }}
                          >
                            Download
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button
                        variant="contained"
                        color="primary"
                        href={`/chapters/${cert.courseId}`}
                        startIcon={<SchoolIcon />}
                        sx={{
                          fontSize: "14px",
                          padding: "6px 12px",
                          minWidth: "130px",
                        }}
                      >
                        Enroll Now
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))
          ) : (
            <p className="text-center mt-4">No certificates found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CertificateBrowser;
