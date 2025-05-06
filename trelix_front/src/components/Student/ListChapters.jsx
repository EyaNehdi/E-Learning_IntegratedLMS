import { useState, useEffect } from "react";
import axios from "axios";
import { useProfileStore } from "../../store/profileStore";
import {
  Link,
  Outlet,
  useParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Swal from "sweetalert2";
import "../Instructor/stylecontent.css";
const ListChapters = () => {
  const { slugCourse } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [finalCourseId, setFinalCourseId] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [completedChapters, setCompletedChapters] = useState([]);
  const { user, fetchUser } = useProfileStore();
  const [loading, setLoading] = useState(true);
  const [courseDetails, setCourseDetails] = useState(null);
  const isChapterSelected = location.pathname.includes("/content/");
  const [hasAccess, setHasAccess] = useState(false);
  const [certificateEarned, setCertificateEarned] = useState(false);
  const [loadingCertificate, setLoadingCertificate] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const fetchCourseDetails = async () => {
    if (!slugCourse) {
      console.error("Course ID is not defined");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:5000/chapter/course/${slugCourse}`
      );
      if (response) {
        setCertificateEarned(response.data.certificateEarned);
        setCourseDetails(response.data.courseInfo);
        setFinalCourseId(response.data.courseInfo._id);
        setChapters(response.data.courseInfo.chapters);
        const chaptersData =
          response.data.chaptersWithCompletion ||
          response.data.courseInfo.chapters;
        const completed = chaptersData
          .filter((chapter) => chapter.isCompleted)
          .map((chapter) => chapter._id);
        setCompletedChapters(completed);
        setHasAccess(true);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);

      if (error.response?.status === 403) {
        const { courseId, courseSlug, courseTitle, coursePrice, userBalance } =
          error.response.data;

        const canAfford = userBalance >= coursePrice;

        const result = await Swal.fire({
          title: "Access Denied",
          html: `
            <p>You need to purchase <b>${courseTitle}</b> to view its chapters.</p>
            <p>Price: $${coursePrice} | Your balance: $${userBalance}</p>
            ${
              canAfford
                ? "<p>You have enough balance to purchase this course.</p>"
                : '<p style="color:red;">Insufficient balance. Please visit the store.</p>'
            }
          `,
          icon: "warning",
          didOpen: () => {
            document.body.classList.add("blur-background-access");
          },
          willClose: () => {
            document.body.classList.remove("blur-background-access");
          },
          showCancelButton: true,
          cancelButtonText: "Return",
          showDenyButton: true,
          denyButtonText: "Store",
          confirmButtonText: canAfford ? "Purchase" : "Purchase (Disabled)",
          confirmButtonColor: canAfford ? "#3085d6" : "#aaa",
          customClass: {
            confirmButton: "swal-custom-confirm-button",
            cancelButton: "swal-custom-cancel-button",
            denyButton: "swal-custom-deny-button",
            popup: "swal-custom-popup",
          },
          allowOutsideClick: false,
          preConfirm: () => {
            if (!canAfford) {
              Swal.showValidationMessage("You do not have enough balance.");
              return false;
            }
          },
        });

        if (!canAfford) {
          setTimeout(() => {
            const confirmButton = document.querySelector(
              ".swal-custom-confirm-button"
            );
            if (confirmButton) {
              confirmButton.setAttribute("disabled", "disabled");
            }
          }, 0);
        }

        if (result.isConfirmed && canAfford) {
          try {
            const purchaseResponse = await axios.post(
              "http://localhost:5000/purchases/purchase",
              { courseId },
              { withCredentials: true }
            );
            Swal.fire("Purchase Successful!", "", "success");
            fetchCourseDetails();
            setHasAccess(true);
          } catch (purchaseError) {
            console.error("Purchase failed:", purchaseError);
            Swal.fire("Operation failed", "Please try again later.", "error");
          }
        } else if (result.isDenied) {
          navigate("/store");
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          navigate("/allcours");
        }
      } else if (error.response?.status === 404) {
        navigate("/allcours", {
          state: { error: "Course not found" },
        });
      } else {
        console.error("Error fetching course details:", error);
      }
    }
  };

  useEffect(() => {
    if (slugCourse) {
      fetchCourseDetails();
    }
  }, [slugCourse]);

  const handleCompleteChapter = async (chapterId) => {
    console.log("Function called with chapterId:", chapterId);

    try {
      const response = await axios.post(
        "http://localhost:5000/chapter/markCompleted",
        {},
        {
          params: { userId: user._id, chapterId },
          withCredentials: true,
        }
      );

      if (response.data.completedChapters) {
        setCompletedChapters(response.data.completedChapters);
        console.log("am triggered 2");
      }
    } catch (error) {
      console.error("Error marking chapter as completed:", error);
    }
  };

  const areAllChaptersCompleted = () => {
    if (chapters.length === 0) return false;
    return chapters.every((chapter) => completedChapters.includes(chapter._id));
  };

  const handleStartExam = () => {
    if (!areAllChaptersCompleted()) {
      alert("Please complete all chapters before starting the exam.");
      return;
    }
    navigate(`/exams/${finalCourseId}`);
  };

  const handleEarnCertificate = async (provider) => {
    setLoadingCertificate(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/certificates/issueCertificate",
        {
          userId: user._id,
          courseId: finalCourseId,
          provider,
        }
      );
      setCertificateEarned(true);
      setLoadingCertificate(false);
    } catch (error) {
      setLoadingCertificate(false);
      console.error(
        "Error earning certificate:",
        error.response?.data || error
      );
    }
  };

  const formatPrice = (price, currency = "EUR") => {
    if (price === 0 || price === "0") return "Gratuit";

    const currencySymbols = {
      USD: "$",
      EUR: "€",
      DZD: "د.ج",
    };

    const symbol = currencySymbols[currency] || currencySymbols.EUR;
    return `${price} ${symbol}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header
        style={{
          backgroundColor: "#ffffff",
          borderBottom: "1px solid #e5e7eb",
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div
          style={{
            maxWidth: "72rem",
            margin: "0 auto",
            padding: "1rem 1.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: window.innerWidth < 768 ? "column" : "row",
              gap: "1rem",
              alignItems: window.innerWidth < 768 ? "flex-start" : "center",
              justifyContent: "space-between",
            }}
          >
            {/* Title Section with improved styling */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  backgroundColor: "#eff6ff",
                  padding: "0.5rem",
                  borderRadius: "0.5rem",
                  marginRight: "0.75rem",
                }}
              >
                {/* Light bulb icon placeholder */}
                <div
                  style={{
                    width: "1.5rem",
                    height: "1.5rem",
                    backgroundColor: "#3b82f6",
                    borderRadius: "50%",
                  }}
                ></div>
              </div>
              <h1
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "700",
                }}
              >
                {courseDetails ? courseDetails.title : "Course Content"}
              </h1>
            </div>

            {/* Course Info and Button Section */}
            <div
              style={{
                display: "flex",
                flexDirection: window.innerWidth < 768 ? "column" : "row",
                alignItems: window.innerWidth < 768 ? "flex-start" : "center",
                gap: "0.75rem",
              }}
            >
              {/* Course Details with improved styling */}
              {courseDetails && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                    marginRight: "0.5rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        color: "#6b7280",
                        marginRight: "0.5rem",
                      }}
                    >
                      Level:
                    </span>
                    <span
                      style={{
                        padding: "0.25rem 0.75rem",
                        backgroundColor: "#eff6ff",
                        color: "#1e40af",
                        fontSize: "0.75rem",
                        fontWeight: "500",
                        borderRadius: "9999px",
                      }}
                    >
                      {courseDetails.level || "All Levels"}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        textTransform: "uppercase",
                        color: "#6b7280",
                        marginRight: "0.5rem",
                      }}
                    >
                      Price:
                    </span>
                    <span
                      style={{
                        padding: "0.25rem 0.75rem",
                        backgroundColor: "#ecfdf5",
                        color: "#065f46",
                        fontSize: "0.75rem",
                        fontWeight: "500",
                        borderRadius: "9999px",
                      }}
                    >
                      {formatPrice(courseDetails.price, courseDetails.currency)}
                    </span>
                  </div>
                </div>
              )}

              {/* Certificate Button with fixed width to prevent text wrapping */}
              {courseDetails?.categorie &&
                !["OpenLearn", "OpenClassrooms"].includes(
                  courseDetails.categorie
                ) && (
                  <>
                    {areAllChaptersCompleted() && !loadingCertificate && (
                      <button
                        onClick={
                          certificateEarned
                            ? () => navigate("/certificates")
                            : () => handleEarnCertificate("Trelix")
                        }
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          whiteSpace: "nowrap",
                          padding: "0.5rem 1rem",
                          borderRadius: "0.375rem",
                          fontWeight: "500",
                          fontSize: "0.875rem",
                          minWidth: "9rem",
                          transition: "all 0.2s ease",
                          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                          border: "none",
                          cursor: "pointer",
                          letterSpacing: "0.01em",
                          animation: certificateEarned
                            ? "none"
                            : "subtle-pulse 2s infinite ease-in-out",
                          ...(certificateEarned
                            ? {
                                backgroundColor: "#e0e7ff",
                                color: "#4338ca",
                              }
                            : {
                                backgroundColor: "#4f46e5",
                                color: "#ffffff",
                              }),
                        }}
                        onMouseEnter={(e) => {
                          if (certificateEarned) {
                            e.currentTarget.style.backgroundColor = "#c7d2fe";
                            e.currentTarget.style.boxShadow =
                              "0 2px 4px rgba(0, 0, 0, 0.1)";
                          } else {
                            e.currentTarget.style.backgroundColor = "#4338ca";
                            e.currentTarget.style.boxShadow =
                              "0 2px 4px rgba(0, 0, 0, 0.1)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (certificateEarned) {
                            e.currentTarget.style.backgroundColor = "#e0e7ff";
                            e.currentTarget.style.boxShadow =
                              "0 1px 2px rgba(0, 0, 0, 0.05)";
                          } else {
                            e.currentTarget.style.backgroundColor = "#4f46e5";
                            e.currentTarget.style.boxShadow =
                              "0 1px 2px rgba(0, 0, 0, 0.05)";
                          }
                        }}
                      >
                        {certificateEarned
                          ? "View Certificate"
                          : "Earn Certificate"}
                      </button>
                    )}

                    {/* Loading state with improved styling */}
                    {loadingCertificate && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          whiteSpace: "nowrap",
                          padding: "0.5rem 1rem",
                          backgroundColor: "#f3f4f6",
                          color: "#4b5563",
                          borderRadius: "0.375rem",
                          fontSize: "0.875rem",
                          minWidth: "9rem",
                          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                          position: "relative",
                          paddingLeft: "1.75rem",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            left: "0.75rem",
                            width: "0.75rem",
                            height: "0.75rem",
                            border: "2px solid #9ca3af",
                            borderBottomColor: "transparent",
                            borderRadius: "50%",
                            display: "inline-block",
                            animation: "spin 1s linear infinite",
                          }}
                        ></div>
                        Processing...
                      </div>
                    )}
                  </>
                )}
            </div>
          </div>
        </div>
      </header>
      {/* Main content area with sidebar and content */}

      {!hasAccess ? (
        <></>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Chapter List */}
          <aside className="w-80 bg-white border-r shadow-sm flex-shrink-0 overflow-auto">
            <div className="p-5 border-b bg-gray-50">
              <h2 className="text-lg font-bold text-gray-800 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-blue-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                </svg>
                Chapters
              </h2>
            </div>

            <div className="p-4 space-y-3">
              {chapters.map((chapter) => {
                const isCompleted =
                  chapter.isCompleted ||
                  completedChapters.includes(chapter._id);
                const isActive = location.pathname.includes(
                  `/content/${chapter._id}`
                );

                return (
                  <div key={chapter._id} className="relative">
                    <Link
                      key={chapter._id}
                      className={`flex items-center justify-between w-full px-5 py-3.5 rounded-md transition-all duration-200 
              ${isActive ? "bg-blue-50 shadow-sm" : ""}
              ${
                isCompleted
                  ? "bg-white border-l-4 border-l-green-500 border-y border-r border-gray-100 text-gray-800 hover:bg-gray-50"
                  : "bg-white border border-gray-100 text-gray-800 hover:bg-gray-50 hover:border-gray-200"
              }`}
                      to={`/chapters/${slugCourse}/content/${chapter._id}`}
                      onClick={() => {
                        if (!isCompleted) {
                          console.log("sah");
                          handleCompleteChapter(chapter._id);
                        }
                      }}
                    >
                      <span
                        className={`font-medium ${
                          isActive ? "text-blue-700" : ""
                        }`}
                      >
                        {chapter.title}
                      </span>

                      {isCompleted ? (
                        <span className="text-green-600 flex-shrink-0 bg-green-50 p-1 rounded-full">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      ) : (
                        <span
                          style={{
                            color: "gray",
                            fontSize: "1.2rem",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            console.log("sah");

                            handleCompleteChapter(chapter._id);
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      )}
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="p-4 border-t mt-4">
              {/* Exam button */}
              <button
                onClick={handleStartExam}
                disabled={!areAllChaptersCompleted() || loading}
                style={{
                  width: "100%",
                  padding: "14px 20px",
                  borderRadius: "6px",
                  fontWeight: "500",
                  color: "white",
                  backgroundColor:
                    areAllChaptersCompleted() && !loading
                      ? "#2563eb"
                      : "#9ca3af",
                  border: "none",
                  cursor:
                    areAllChaptersCompleted() && !loading
                      ? "pointer"
                      : "not-allowed",
                  opacity: areAllChaptersCompleted() && !loading ? "1" : "0.75",
                  marginBottom: "12px",
                  transition: "background-color 0.2s",
                }}
              >
                {loading ? "Loading..." : "Start Exam"}
              </button>

              {!areAllChaptersCompleted() && !loading && (
                <div className="text-center p-3 bg-yellow-50 rounded-md border border-yellow-100">
                  <p className="text-sm text-yellow-800">
                    Complete all {chapters.length} chapters to unlock the exam
                  </p>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{
                        width: `${
                          (completedChapters.length / chapters.length) * 100
                        }%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {completedChapters.length} of {chapters.length} chapters
                    completed
                  </p>
                </div>
              )}
            </div>
          </aside>

          {/* Main content area */}
          <main className="flex-1 overflow-auto p-6">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-6">
              {isChapterSelected ? (
                // If a chapter is selected, show the chapter content
                <Outlet />
              ) : (
                // If no chapter is selected, show the course details
                <article className="course-details">
                  {courseDetails && (
                    <>
                      <img
                        className="w-full h-64 object-cover rounded-lg mb-6"
                        src="/assets/images/ces.png"
                        alt="Course"
                      />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div>
                            <h6 className="font-semibold">Niveau de cours</h6>
                            <span className="text-gray-600">
                              {courseDetails.level || "Non spécifié"}
                            </span>
                          </div>
                        </div>
                        <div>
                          <h6 className="font-semibold">Module</h6>
                          <span className="text-gray-600">
                            {courseDetails.categorie || "Non spécifié"}
                          </span>
                        </div>
                        <div>
                          <h6 className="font-semibold">Prix</h6>
                          <span className="text-gray-600">
                            {formatPrice(
                              courseDetails.price,
                              courseDetails.currency
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="course-content">
                        <h2 className="text-3xl font-bold mb-4">
                          {courseDetails.title}
                        </h2>
                        <div className="mb-8">
                          <p className="text-gray-700">
                            {courseDetails.description}
                          </p>
                        </div>

                        {/* Course objectives or additional info */}
                        {courseDetails.objectives && (
                          <div className="mt-6">
                            <h3 className="text-xl font-semibold mb-3">
                              Objectifs du cours
                            </h3>
                            <ul className="list-disc pl-5 space-y-2">
                              {courseDetails.objectives.map(
                                (objective, index) => (
                                  <li key={index} className="text-gray-700">
                                    {objective}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}

                        {/* Call to action */}
                        <div className="mt-8 text-center">
                          <p className="text-lg mb-4">
                            Sélectionnez un chapitre dans le menu pour commencer
                            à apprendre
                          </p>
                          {chapters.length > 0 && (
                            <Link
                              to={`/chapters/${finalCourseId}/content/${chapters[0]._id}`}
                              className="inline-flex items-center py-3.5 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-md hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 mr-2"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Commencer le premier chapitre
                            </Link>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {!courseDetails && !loading && (
                    <div className="text-center py-12">
                      <h2 className="text-2xl font-bold text-gray-700">
                        Détails du cours non disponibles
                      </h2>
                      <p className="text-gray-600 mt-2">
                        Les informations sur ce cours n'ont pas pu être
                        chargées.
                      </p>
                    </div>
                  )}

                  {loading && (
                    <div className="flex justify-center items-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                </article>
              )}
            </div>
          </main>
        </div>
      )}
    </div>
  );
};

export default ListChapters;
