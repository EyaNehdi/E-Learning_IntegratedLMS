import { useEffect, useState } from "react";
import { Card, CardContent, CardMedia, Typography } from "@mui/material";
import { Button } from "@mui/material";
import Pagination from "@mui/material/Pagination";
import { Eye, Download, X } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";

const BrowseCertificates = () => {
  const navigate = useNavigate();
  const { certificates, loading } = useOutletContext();
  useEffect(() => {
    if (!loading) {
      console.log(certificates);
    }
  }, [loading]);

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const itemsPerPage = 9;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCertificates = certificates.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const baseUrl = "http://localhost:5000";
  return (
    <div className="p-6">
      <Typography variant="h4" gutterBottom>
        My Certificates
      </Typography>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div
            className={`grid gap-6 ${
              selectedPdf
                ? "grid-cols-1"
                : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
            }`}
          >
            {currentCertificates.map((cert) => (
              <div
                key={cert.id}
                style={{
                  display: selectedPdf ? "none" : "block",
                }}
              >
                <Card className="shadow-lg rounded-lg">
                  <CardContent>
                    <CardMedia
                      component="img"
                      image={cert.logo}
                      alt={cert.issuer}
                      sx={{ width: 64, height: 64, marginBottom: 2 }}
                    />
                    <Typography variant="h6">{cert.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {cert.description}
                    </Typography>
                    <div className="mt-4 flex justify-between">
                      {cert.isOwned ? (
                        <>
                          <button
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              padding: "8px 16px",
                              borderRadius: "4px",
                              border: "1px solid #1976d2",
                              color: "#1976d2",
                              backgroundColor: "transparent",
                              cursor: "pointer",
                              fontSize: "0.875rem",
                              fontWeight: "500",
                              textTransform: "uppercase",
                              transition:
                                "background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,border-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
                              ":hover": {
                                backgroundColor: "rgba(25, 118, 210, 0.04)",
                                borderColor: "#1976d2",
                              },
                            }}
                            onClick={() =>
                              setSelectedPdf(
                                `${baseUrl}${cert.pdfUrl.replace(/\\/g, "/")}`
                              )
                            }
                          >
                            <Eye
                              style={{ marginRight: "8px", fontSize: "20px" }}
                            />
                            Preview
                          </button>
                        </>
                      ) : (
                        <button
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "8px 16px",
                            borderRadius: "4px",
                            border: "1px solid #4caf50",
                            color: "#4caf50",
                            backgroundColor: "transparent",
                            cursor: "pointer",
                            fontSize: "0.875rem",
                            fontWeight: "500",
                            textTransform: "uppercase",
                            transition: "all 0.3s ease",
                          }}
                          onMouseOver={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "rgba(76, 175, 80, 0.04)")
                          }
                          onMouseOut={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "transparent")
                          }
                          onClick={() => {
                            navigate(`/chapters/${cert.courseId}`);
                          }}
                        >
                          <span style={{ marginRight: "8px" }}>+</span>
                          Enroll Now
                        </button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {selectedPdf && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <Typography variant="h5">Certificate Preview</Typography>
                <button
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "8px 16px",
                    borderRadius: "4px",
                    border: "1px solid #d32f2f",
                    color: "#d32f2f",
                    backgroundColor: "transparent",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    textTransform: "uppercase",
                    transition:
                      "background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,border-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
                    ":hover": {
                      backgroundColor: "rgba(211, 47, 47, 0.04)",
                      borderColor: "#d32f2f",
                    },
                  }}
                  onClick={() => setSelectedPdf(null)}
                >
                  <X style={{ marginRight: "8px", fontSize: "20px" }} />
                  Close Preview
                </button>
              </div>
              <iframe
                src={selectedPdf}
                width="100%"
                height="600px"
                className="border rounded-lg"
              ></iframe>
            </div>
          )}

          <div className="flex justify-center mt-6">
            <Pagination
              count={Math.ceil(certificates.length / itemsPerPage)}
              page={currentPage}
              onChange={(_, page) => setCurrentPage(page)}
              color="primary"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default BrowseCertificates;
