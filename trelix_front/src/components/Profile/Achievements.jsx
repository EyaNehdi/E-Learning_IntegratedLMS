import { useEffect, useState } from "react";
import Tooltip from "@mui/material/Tooltip";
import Divider from "@mui/material/Divider";
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
      console.log(achievements);
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
        <Link
          to={linkTo}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            zIndex: 1,
            display: isHovered ? "block" : "none",
          }}
        >
          <button className="btn btn-primary btn-sm">View</button>
        </Link>
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
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h3 className="card-title">Certifications Earned</h3>

              {loading ? (
                <p>Loading certificates...</p>
              ) : certificates.length === 0 ? (
                <p>No certifications earned yet.</p>
              ) : (
                <div className="row">
                  {certificates.map((cert, index) => (
                    <div key={index} className="col-md-6 col-lg-4 mb-3">
                      <div
                        style={{
                          border: "1px solid #ddd",
                          padding: "16px",
                          borderRadius: "10px",
                          backgroundColor: "#fff",
                          display: "flex",
                          alignItems: "flex-start",
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                          gap: "16px",
                          maxWidth: "500px",
                        }}
                      >
                        <img
                          src={cert.logo}
                          alt={cert.name}
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                            objectPosition: "center",
                            borderRadius: "6px",
                            border: "1px solid #ccc",
                            backgroundColor: "#f0f0f0",
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <h4
                            style={{
                              fontSize: "1rem",
                              fontWeight: "600",
                              margin: "0 0 6px 0",
                              color: "#333",
                            }}
                          >
                            {cert.name}
                          </h4>
                          <p
                            style={{
                              fontSize: "0.85rem",
                              margin: "0 0 4px 0",
                              color: "#555",
                            }}
                          >
                            <strong>Issuer:</strong> {cert.issuer}
                          </p>
                          <p
                            style={{
                              fontSize: "0.8rem",
                              margin: "0 0 8px 0",
                              color: "#777",
                            }}
                          >
                            <strong>Issued:</strong>{" "}
                            {new Date(cert.issuedDate).toLocaleDateString()}
                          </p>
                          {cert.pdfUrl ? (
                            <a
                              href={`${baseUrl}/download-certificate/${cert.pdfUrl
                                .split("/")
                                .pop()}`}
                              className="btn btn-sm btn-primary"
                              style={{
                                fontSize: "0.8rem",
                                padding: "6px 12px",
                                borderRadius: "4px",
                                backgroundColor: "#007bff",
                                color: "#fff",
                                textDecoration: "none",
                                display: "inline-block",
                              }}
                            >
                              Download Certificate
                            </a>
                          ) : (
                            <button
                              className="btn btn-sm btn-secondary"
                              disabled
                              style={{
                                fontSize: "0.8rem",
                                padding: "6px 12px",
                                borderRadius: "4px",
                                backgroundColor: "#ccc",
                                color: "#666",
                                cursor: "not-allowed",
                              }}
                            >
                              No PDF Available
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
        </div>
      </div>
    </div>
  );
};

export default Achievements;
