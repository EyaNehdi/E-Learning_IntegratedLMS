import { useEffect, useState } from "react";
import Tooltip from "@mui/material/Tooltip";
import Divider from "@mui/material/Divider";
import { Award, Download } from "lucide-react";
import { Link, useOutletContext } from "react-router-dom";
import axios from "axios";

const baseUrl = "http://localhost:5000";

const Achievements = () => {
  const { user } = useOutletContext();
  const [achievements, setAchievements] = useState(null);
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState([]);

  const fetchAchievements = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/certificates/getProgress?userId=${user._id}`
      );
      setAchievements(response.data);
    } catch (error) {
      console.error("Error fetching achievements:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      const fetchCertificates = async () => {
        try {
          const response = await axios.get(
            `http://localhost:5000/certificates/getUserCertificates?userId=${user._id}`
          );
          setCertificates(response.data.certificates);
        } catch (error) {
          console.error("Error fetching certificates:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchAchievements();
      fetchCertificates();
    }
  }, [user]);

  const maxBadges = 9;
  const maxCourses = 3;

  // Common card style
  const cardStyle = {
    backgroundColor: "#fff",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    height: "100%",
    position: "relative",
  };

  // Smaller heading style
  const cardTitleStyle = {
    fontSize: "1.2rem",
    marginBottom: "10px",
  };

  // Subtitle style
  const subtitleStyle = {
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#555",
    marginBottom: "5px",
  };

  // Card container style with hover state management
  const CardContainer = ({ children, linkTo, style = {}, height }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
      <div
        style={{ ...style, position: "relative" }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={{ ...cardStyle, height: height }}>{children}</div>
      </div>
    );
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* First Row: Account Life (30%) and Badges (70%) */}
      <div className="row" style={{ marginTop: "20px", marginBottom: "20px" }}>
        {/* Account Life Section - 30% */}
        <div className="col-12 col-md-4">
          <CardContainer linkTo="/account-life" height="180px">
            <h3 style={cardTitleStyle}>
              {user?.firstName} {user?.lastName}
            </h3>
            <Divider style={{ margin: "8px 0" }} />
            <div style={{ marginTop: "10px" }}>
              <p style={subtitleStyle}>Account Life</p>
              <p style={{ fontSize: "0.9rem", margin: "0 0 10px 0" }}>
                {achievements?.accountLife}
              </p>

              <p style={subtitleStyle}>Account Created</p>
              <p style={{ fontSize: "0.9rem", margin: "0" }}>
                {achievements?.accountCreatedAt}
              </p>
            </div>
          </CardContainer>
        </div>

        {/* Badges Earned Section - 70% */}
        <div className="col-12 col-md-8">
          <CardContainer linkTo="/badges" height="180px">
            <h3 style={cardTitleStyle}>Badges Earned</h3>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {achievements?.badges.slice(0, maxBadges).map((badge, index) => (
                <Tooltip
                  key={index}
                  title={
                    <div>
                      <strong>{badge.name}</strong>
                      <br />
                      {badge.description}
                      <br />
                      <small>
                        Earned at:{" "}
                        {new Date(badge.earnedAt).toLocaleDateString()}
                      </small>
                    </div>
                  }
                  placement="top"
                >
                  <img
                    src={badge.image}
                    alt={badge.name}
                    style={{
                      width: "45px",
                      height: "45px",
                      borderRadius: "50%",
                      cursor: "pointer",
                    }}
                  />
                </Tooltip>
              ))}
              {achievements?.badges.length > maxBadges && (
                <Tooltip title="View all badges" placement="top">
                  <div
                    style={{
                      width: "45px",
                      height: "45px",
                      backgroundColor: "#f1f1f1",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: "50%",
                      cursor: "pointer",
                      fontSize: "20px",
                    }}
                  >
                    +
                  </div>
                </Tooltip>
              )}
            </div>
          </CardContainer>
        </div>
      </div>

      {/* Second Row: Three equal sections */}
      <div className="row" style={{ marginBottom: "20px" }}>
        {/* Course Progress Section */}
        <div className="col-12 col-md-4">
          <CardContainer linkTo="/course-progress" height="200px">
            <h3 style={cardTitleStyle}>Course Progress</h3>
            <p style={{ fontSize: "0.9rem" }}>
              {achievements?.courseProgress.completed} /{" "}
              {achievements?.courseProgress.coursesEnrolled} Courses Completed
            </p>
            <div
              style={{
                backgroundColor: "#f1f1f1",
                height: "10px",
                borderRadius: "5px",
                marginTop: "10px",
              }}
            >
              <div
                className="progress"
                style={{
                  width: `${achievements?.courseProgress.percentage}%`,
                  backgroundColor: "#6045ff",
                  height: "100%",
                  borderRadius: "5px",
                }}
              ></div>
            </div>
          </CardContainer>
        </div>

        {/* Courses Enrolled Section */}
        <div className="col-12 col-md-4">
          <CardContainer linkTo="/courses" height="200px">
            <h3 style={cardTitleStyle}>Courses Enrolled</h3>
            <p style={{ fontSize: "0.9rem" }}>
              {achievements?.courseProgress.coursesEnrolled} courses enrolled
            </p>
            <Divider style={{ margin: "8px 0" }} />
            {/* <p style={subtitleStyle}>Latest courses:</p>
            <ul
              style={{ paddingLeft: "20px", fontSize: "0.9rem", margin: "0" }}
            >
              {achievements?.latestCourses
                .slice(0, maxCourses)
                .map((course, index) => (
                  <li key={index}>{course}</li>
                ))}
              {achievements?.latestCourses.length > maxCourses && (
                <li>
                  <Link to="/courses" style={{ textDecoration: "none" }}>
                    ...
                  </Link>
                </li>
              )}
            </ul> */}
          </CardContainer>
        </div>

        {/* Quizzes Section */}
        <div className="col-12 col-md-4">
          <CardContainer linkTo="/quizzes" height="200px">
            <h3 style={cardTitleStyle}>Quizzes Completed</h3>
            <p style={{ fontSize: "0.9rem" }}>
              {achievements?.quizzesCompleted} quizzes completed
            </p>
            <Divider style={{ margin: "8px 0" }} />
            {/* <h3 style={subtitleStyle}>Success Rate</h3>
            <p style={{ fontSize: "0.9rem" }}>
              {achievements?.quizzesCompleted100} quizzes completed with 100%
              success
              <br />
              Success Rate:{" "}
              {Math.round(
                (achievements?.quizzesCompleted100 /
                  achievements?.quizzesCompleted) *
                  100
              )}
              %
            </p> */}
          </CardContainer>
        </div>
      </div>

      {/* Third Row: Certifications (Full Width) */}
      <div
        style={{
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "1.5rem",
        }}
      >
        {/* Header Section */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "2rem",
            paddingBottom: "1rem",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <Award
            style={{
              color: "#4f46e5",
              marginRight: "1rem",
              width: "1.75rem",
              height: "1.75rem",
            }}
          />
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "600",
              color: "#1f2937",
              margin: 0,
            }}
          >
            Certifications Earned
          </h2>
        </div>

        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "200px",
            }}
          >
            <div
              style={{
                width: "2.5rem",
                height: "2.5rem",
                border: "4px solid #e5e7eb",
                borderTopColor: "#4f46e5",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            ></div>
          </div>
        ) : certificates.length === 0 ? (
          <div
            style={{
              backgroundColor: "#f9fafb",
              borderRadius: "0.5rem",
              padding: "2rem",
              textAlign: "center",
              border: "1px dashed #e5e7eb",
            }}
          >
            <p
              style={{
                color: "#6b7280",
                margin: 0,
                fontSize: "1rem",
              }}
            >
              No certifications earned yet. Complete courses to earn
              certificates.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {certificates.map((cert, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: "white",
                  borderRadius: "0.5rem",
                  border: "1px solid #e5e7eb",
                  overflow: "hidden",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  ":hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  },
                }}
              >
                <div
                  style={{
                    display: "flex",
                    padding: "1.25rem",
                    gap: "1rem",
                  }}
                >
                  {/* Certificate Logo */}
                  <div
                    style={{
                      flexShrink: 0,
                      width: "3.5rem",
                      height: "3.5rem",
                      borderRadius: "0.375rem",
                      border: "1px solid #e5e7eb",
                      backgroundColor: "#f9fafb",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={cert.logo}
                      alt={cert.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        padding: "0.5rem",
                      }}
                    />
                  </div>

                  {/* Certificate Details */}
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        fontSize: "1rem",
                        fontWeight: "600",
                        color: "#1f2937",
                        margin: "0 0 0.5rem 0",
                      }}
                    >
                      {cert.name}
                    </h3>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "0.25rem",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "#6b7280",
                          marginRight: "0.5rem",
                        }}
                      >
                        Issuer:
                      </span>
                      <span
                        style={{
                          fontSize: "0.875rem",
                          color: "#4b5563",
                          fontWeight: "500",
                        }}
                      >
                        {cert.issuer}
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "0.75rem",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "#6b7280",
                          marginRight: "0.5rem",
                        }}
                      >
                        Issued:
                      </span>
                      <span
                        style={{
                          fontSize: "0.875rem",
                          color: "#4b5563",
                        }}
                      >
                        {new Date(cert.issuedDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    {/* Action Button */}
                    {cert.pdfUrl ? (
                      <a
                        href={`${baseUrl}/download-certificate/${cert.pdfUrl
                          .split("/")
                          .pop()}`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "0.5rem 1rem",
                          borderRadius: "0.375rem",
                          backgroundColor: "#4f46e5",
                          color: "white",
                          textDecoration: "none",
                          fontSize: "0.875rem",
                          fontWeight: "500",
                          transition: "background-color 0.2s",
                          width: "100%",
                          textAlign: "center",
                        }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.backgroundColor = "#4338ca")
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.backgroundColor = "#4f46e5")
                        }
                      >
                        <Download
                          style={{
                            width: "1rem",
                            height: "1rem",
                            marginRight: "0.5rem",
                          }}
                        />
                        Download Certificate
                      </a>
                    ) : (
                      <button
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "0.5rem 1rem",
                          borderRadius: "0.375rem",
                          backgroundColor: "#f3f4f6",
                          color: "#6b7280",
                          border: "none",
                          cursor: "not-allowed",
                          fontSize: "0.875rem",
                          fontWeight: "500",
                          width: "100%",
                        }}
                      >
                        Certificate Not Available
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Achievements;
