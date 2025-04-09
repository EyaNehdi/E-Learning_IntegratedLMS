
"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useProfileStore } from "../../store/profileStore"
import { Link, useParams, useNavigate } from "react-router-dom"


const ListChapters = () => {
  const { id, courseid } = useParams();
  const navigate = useNavigate();

  const [chapters, setChapters] = useState([]);
  const [completedChapters, setCompletedChapters] = useState([]);
  const { user, fetchUser, clearUser } = useProfileStore();
  const [loading, setLoading] = useState(true);

  // Store courseid in localStorage if it's not already there
  useEffect(() => {
    if (courseid) {
      localStorage.setItem("courseid", courseid);
    }
  }, [courseid]);


  // Retrieve courseid from localStorage if it's not available from useParams
  const storedCourseId = localStorage.getItem("courseid");
  const finalCourseId = courseid || storedCourseId;
  const [chapters, setChapters] = useState([])
  const [completedChapters, setCompletedChapters] = useState([])
  const { user, fetchUser, clearUser } = useProfileStore()
  const [loading, setLoading] = useState(true)
  const [courseDetails, setCourseDetails] = useState(null)


  // Fetch the user data on mount
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    console.log("user after fetch", user);
  }, [user]);

  console.log("Course ID:", finalCourseId);

  // Fetch course details
  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!courseid) {
        console.error("Course ID is not defined")
        return
      }

      try {
        const response = await axios.get(`http://localhost:5000/course/${courseid}`)
        setCourseDetails(response.data)
        console.log("Course details:", response.data)
      } catch (error) {
        console.error("Error fetching course details:", error)
      }
    }

    fetchCourseDetails()
  }, [courseid])

  useEffect(() => {
    const fetchChapters = async () => {
      console.log("Course ID:", finalCourseId);
      if (!finalCourseId) {
        console.error("Course ID is not defined");
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:5000/chapter/course/${finalCourseId}`
        );
        setChapters(response.data.chapters);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching chapters:", error);
        setLoading(false);
      }
    };

    fetchChapters();
  }, [finalCourseId]);
  useEffect(() => {
    // Ensure that user is available before making the request
    if (user && user._id) {
      axios
        .get("http://localhost:5000/api/auth/completedchapters", {
          params: {
            userId: user._id, // Pass user ID as query param
            chapterId: id, // Pass the chapter ID as query param
          },
        })
        .then((response) => {
          setCompletedChapters(response.data.completedChapters);
          console.log("Completed chapters data: ", response.data);
        })
        .catch((error) => {
          console.error("Error fetching completed chapters:", error);
        });
    }
  }, [user, id]);

  const handleCompleteChapter = (chapterId) => {
    if (!user || !user._id) {
      console.error("User is not logged in");
      return;
    }

    // When a chapter is completed, update the backend
    axios
      .post("http://localhost:5000/user/mark-chapter-completed", {
        userId: user._id, // Get the logged-in user's ID
        chapterId: chapterId,
      })
      .then((response) => {
        // Check if the response contains updated completed chapters
        if (response.data.completedChapters) {
          setCompletedChapters(response.data.completedChapters);
        }
      })
      .catch((error) => {
        console.error("Error marking chapter as completed:", error);
      });
  };

  // Check if all chapters are completed
  const areAllChaptersCompleted = () => {
    if (chapters.length === 0) return false;
    return chapters.every((chapter) => completedChapters.includes(chapter._id));
  };

  // Handle starting the exam
  const handleStartExam = () => {
    if (!areAllChaptersCompleted()) {
      alert("Please complete all chapters before starting the exam.");
      return;
    }

    // Navigate to the exam page

    navigate(`/exams/${storedCourseId}`);
  };

  const handleEarnCertificate = async (provider) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/certificates/issueCertificate",
        {
          userId: user._id,
          courseId: finalCourseId,
          provider,
        }
      );

      console.log("Certificate Earned Successfully:", response.data);
      alert("Congratulations! You have earned a certificate.");
    } catch (error) {
      console.error(
        "Error earning certificate:",
        error.response?.data || error
      );
      alert(error.response?.data?.error || "An error occurred.");
    }
  };

    navigate(`/exams`)
  }

  // Format price with currency symbol
  const formatPrice = (price, currency = "EUR") => {
    if (price === 0 || price === "0") return "Gratuit"

    const currencySymbols = {
      USD: "$",
      EUR: "€",
      DZD: "د.ج",
    }

    const symbol = currencySymbols[currency] || currencySymbols.EUR
    return `${price} ${symbol}`
  }


  return (
    <div>
      {/* Course Section */}
      <section className="bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row">
            {/* Sidebar on the left */}
            <div className="lg:w-1/3 mb-6 lg:mb-0 lg:pr-6">
              <aside className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">
                  Chapter Content
                </h1>
                <div className="space-y-3">
                  {chapters.map((chapter) => {
                    const isCompleted = completedChapters.includes(chapter._id);
                    return (
                      <Link
                        key={chapter._id}
                        className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-all duration-200 
                          ${
                            isCompleted
                              ? "bg-green-50 hover:bg-green-100 border border-green-200 text-green-800"
                              : "bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 hover:border-blue-300"
                          } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
                        to={`/chapters/${finalCourseId}/content/${chapter._id}`}
                      >
                        <span className="font-medium">{chapter.title}</span>

                        {/* Progress Indicator */}
                        {isCompleted ? (
                          <span className="text-green-600 flex-shrink-0">
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
                            className="text-gray-400 hover:text-blue-500 cursor-pointer flex-shrink-0"
                            onClick={(e) => {
                              e.preventDefault();
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
                    );
                  })}
                </div>

                {/* Start Exam Button */}
                <div className="mt-8">
                  <button
                    onClick={handleStartExam}
                    disabled={!areAllChaptersCompleted() || loading}
                    className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      areAllChaptersCompleted() && !loading
                        ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {loading ? "Loading..." : "Start Exam"}
                  </button>
                  <button
                    onClick={() => handleEarnCertificate("Trelix")}
                    disabled={!areAllChaptersCompleted() || loading}
                    className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      areAllChaptersCompleted() && !loading
                        ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                        : "bg-gray-400 cursor-not-allowed d-non"
                    }`}
                  >
                    {loading ? "Loading..." : "Earn Certificate"}
                  </button>
                  {!areAllChaptersCompleted() && !loading && (
                    <p className="text-sm text-gray-500 mt-2">
                      Complete all chapters to unlock the exam
                    </p>
                  )}
                </div>
              </aside>
            </div>

            <article className="course-details">
              <img className="rounded-3 img-fluid" src="/assets/images/ces.png" alt="Course" />
              <div className="course-details-meta d-lg-flex align-items-center justify-content-between">
                <div className="d-flex">
                 
                  <div className="avatar-info ms-3">
                    <h6> Niveau de cours</h6>
                    <span  className="mute-alt">{courseDetails ? courseDetails.level : "Chargement..."}</span>
                  </div>
                </div>
                <div className="course-reviews">
                  <h6>Module</h6>
                  <div className="d-flex align-items-center">
                    <div className="ratings">
                    </div>
                    <span  className="mute-alt">{courseDetails ? courseDetails.categorie : "Chargement..."}</span>
                  </div>
                </div>
                <div className="course-cat">
                  <h6>Prix</h6>
                  <span className="mute-alt">
                    {courseDetails ? formatPrice(courseDetails.price, courseDetails.currency) : "Chargement..."}
                  </span>
                </div>
              </div>
              {/* Course Tabs Start */}
              <div className="course-nav">
                <ul className="nav" id="myTab" role="tablist">
                  <li className="nav-item" role="presentation">
                    <button
                      className="nav-link active"
                      id="home-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#home"
                      type="button"
                      role="tab"
                      aria-controls="home"
                      aria-selected="true"
                    >
                      <i className="feather-icon icon-bookmark" /> Overview
                    </button>
                  </li>
                </ul>
                <div className="tab-content inner-sec" id="myTabContent">
                  <div className="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
                    <h2 className="display-4 fw-bold">
                      {courseDetails ? courseDetails.title : "Chargement du cours..."}
                    </h2>
                    <p>
                    <span  className="mute-alt">{courseDetails ? courseDetails.description : "Chargement..."}</span>

                    </p>
                   
                   
                  </div>
                  <div className="tab-pane fade" id="profile" role="tabpanel" aria-labelledby="profile-tab">
                    <h2 className="display-4 fw-bold">Course Content</h2>
                    <div className="accordion-2" id="accordion-course">
                      <div className="accordion-item">
                        <h2 className="accordion-header" id="headingOne">
                          <button
                            className="accordion-button"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#collapseOne"
                            aria-expanded="true"
                            aria-controls="collapseOne"
                          >
                            Understanding UI and UX Design
                            <sub className="ms-2">/ 2 hours 30min</sub>
                          </button>
                        </h2>
                        <div
                          id="collapseOne"
                          className="accordion-collapse collapse show"
                          aria-labelledby="headingOne"
                          data-bs-parent="#accordion-course"
                        >
                          <div className="accordion-body">
                            <div className="lesson-items">
                              <ul className="list-unstyled">
                                <li>
                                  <a href="#" className="d-flex justify-content-between align-items-center">
                                    <span className="lesson-title">
                                      <img src="assets/images/icons/video.png" alt="Video" />
                                      Persona Development
                                    </span>
                                    <span>
                                      51.08
                                      <img src="assets/images/icons/lock.png" alt="Lock" />
                                    </span>
                                  </a>
                                </li>
                                <li>
                                  <a href="#" className="d-flex justify-content-between align-items-center">
                                    <span className="lesson-title">
                                      <img src="assets/images/icons/video.png" alt="Video" />
                                      User Research
                                    </span>
                                    <span>
                                      3.32
                                      <img src="assets/images/icons/lock.png" alt="Lock" />
                                    </span>
                                  </a>
                                </li>
                                <li>
                                  <a href="#" className="d-flex justify-content-between align-items-center">
                                    <span className="lesson-title">
                                      <img src="assets/images/icons/video.png" alt="Video" />
                                      Persona Development
                                    </span>
                                    <span>
                                      2.08
                                      <img src="assets/images/icons/lock.png" alt="Lock" />
                                    </span>
                                  </a>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="accordion-item">
                        <h2 className="accordion-header" id="heading2">
                          <button
                            className="accordion-button collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#collapse2"
                            aria-expanded="true"
                            aria-controls="collapse2"
                          >
                            Roles in UI/UX Design
                            <sub className="ms-2">/ 3 hours 10min</sub>
                          </button>
                        </h2>
                        <div
                          id="collapse2"
                          className="accordion-collapse collapse"
                          aria-labelledby="heading2"
                          data-bs-parent="#accordion-course"
                        >
                          <div className="accordion-body">
                            <div className="lesson-items">
                              <ul className="list-unstyled">
                                <li>
                                  <a href="#" className="d-flex justify-content-between align-items-center">
                                    <span className="lesson-title">
                                      <img src="assets/images/icons/video.png" alt="Video" />
                                      User Research
                                    </span>
                                    <span>
                                      3.08
                                      <img src="assets/images/icons/lock.png" alt="Lock" />
                                    </span>
                                  </a>
                                </li>
                                <li>
                                  <a href="#" className="d-flex justify-content-between align-items-center">
                                    <span className="lesson-title">
                                      <img src="assets/images/icons/video.png" alt="Video" />
                                      Persona Development
                                    </span>
                                    <span>
                                      3.08
                                      <img src="assets/images/icons/lock.png" alt="Lock" />
                                    </span>
                                  </a>
                                </li>
                                <li>
                                  <a href="#" className="d-flex justify-content-between align-items-center">
                                    <span className="lesson-title">
                                      <img src="assets/images/icons/video.png" alt="Video" />
                                      Persona Development
                                    </span>
                                    <span>
                                      3.08
                                      <img src="assets/images/icons/lock.png" alt="Lock" />
                                    </span>
                                  </a>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="accordion-item">
                        <h2 className="accordion-header" id="heading3">
                          <button
                            className="accordion-button collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#collapse3"
                            aria-expanded="true"
                            aria-controls="collapse3"
                          >
                            Principles UI/UX Design
                            <sub className="ms-2">/ 3 hours 10min</sub>
                          </button>
                        </h2>
                        <div
                          id="collapse3"
                          className="accordion-collapse collapse"
                          aria-labelledby="heading3"
                          data-bs-parent="#accordion-course"
                        >
                          <div className="accordion-body">
                            <div className="lesson-items">
                              <ul className="list-unstyled">
                                <li>
                                  <a href="#" className="d-flex justify-content-between align-items-center">
                                    <span className="lesson-title">
                                      <img src="assets/images/icons/video.png" alt="Video" />
                                      User Research
                                    </span>
                                    <span>
                                      3.08
                                      <img src="assets/images/icons/lock.png" alt="Lock" />
                                    </span>
                                  </a>
                                </li>
                                <li>
                                  <a href="#" className="d-flex justify-content-between align-items-center">
                                    <span className="lesson-title">
                                      <img src="assets/images/icons/video.png" alt="Video" />
                                      Persona Development
                                    </span>
                                    <span>
                                      3.08
                                      <img src="assets/images/icons/lock.png" alt="Lock" />
                                    </span>
                                  </a>
                                </li>
                                <li>
                                  <a href="#" className="d-flex justify-content-between align-items-center">
                                    <span className="lesson-title">
                                      <img src="assets/images/icons/video.png" alt="Video" />
                                      Persona Development
                                    </span>
                                    <span>
                                      3.08
                                      <img src="assets/images/icons/lock.png" alt="Lock" />
                                    </span>
                                  </a>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="accordion-item">
                        <h2 className="accordion-header" id="heading4">
                          <button
                            className="accordion-button collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#collapse4"
                            aria-expanded="true"
                            aria-controls="collapse4"
                          >
                            User Research Techniques
                            <sub className="ms-2">/ 3 hours 10min</sub>
                          </button>
                        </h2>
                        <div
                          id="collapse4"
                          className="accordion-collapse collapse"
                          aria-labelledby="heading4"
                          data-bs-parent="#accordion-course"
                        >
                          <div className="accordion-body">
                            <div className="lesson-items">
                              <ul className="list-unstyled">
                                <li>
                                  <a href="#" className="d-flex justify-content-between align-items-center">
                                    <span className="lesson-title">
                                      <img src="images/icons/video.png" alt="Video" />
                                      User Research
                                    </span>
                                    <span>
                                      3.08
                                      <img src="assets/assets/images/icons/lock.png" alt="Lock" />
                                    </span>
                                  </a>
                                </li>
                                <li>
                                  <a href="#" className="d-flex justify-content-between align-items-center">
                                    <span className="lesson-title">
                                      <img src="assets/images/icons/video.png" alt="Video" />
                                      Persona Development
                                    </span>
                                    <span>
                                      3.08
                                      <img src="assets/images/icons/lock.png" alt="Lock" />
                                    </span>
                                  </a>
                                </li>
                                <li>
                                  <a href="#" className="d-flex justify-content-between align-items-center">
                                    <span className="lesson-title">
                                      <img src="assets/images/icons/video.png" alt="Video" />
                                      Persona Development
                                    </span>
                                    <span>
                                      3.08
                                      <img src="images/icons/lock.png" alt="Lock" />
                                    </span>
                                  </a>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="accordion-item">
                        <h2 className="accordion-header" id="heading5">
                          <button
                            className="accordion-button collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#collapse5"
                            aria-expanded="true"
                            aria-controls="collapse5"
                          >
                            Creating User Personal
                            <sub className="ms-2">/ 3 hours 10min</sub>
                          </button>
                        </h2>
                        <div
                          id="collapse5"
                          className="accordion-collapse collapse"
                          aria-labelledby="heading5"
                          data-bs-parent="#accordion-course"
                        >
                          <div className="accordion-body">
                            <div className="lesson-items">
                              <ul className="list-unstyled">
                                <li>
                                  <a href="#" className="d-flex justify-content-between align-items-center">
                                    <span className="lesson-title">
                                      <img src="assets/images/icons/video.png" alt="Video" />
                                      User Research
                                    </span>
                                    <span>
                                      3.08
                                      <img src="assets/images/icons/lock.png" alt="Lock" />
                                    </span>
                                  </a>
                                </li>
                                <li>
                                  <a href="#" className="d-flex justify-content-between align-items-center">
                                    <span className="lesson-title">
                                      <img src="assets/images/icons/video.png" alt="Video" />
                                      Persona Development
                                    </span>
                                    <span>
                                      3.08
                                      <img src="assets/images/icons/lock.png" alt="Lock" />
                                    </span>
                                  </a>
                                </li>
                                <li>
                                  <a href="#" className="d-flex justify-content-between align-items-center">
                                    <span className="lesson-title">
                                      <img src="images/icons/video.png" alt="Video" />
                                      Persona Development
                                    </span>
                                    <span>
                                      3.08
                                      <img src="images/icons/lock.png" alt="Lock" />
                                    </span>
                                  </a>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="accordion-item">
                        <h2 className="accordion-header" id="heading6">
                          <button
                            className="accordion-button collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#collapse6"
                            aria-expanded="true"
                            aria-controls="collapse6"
                          >
                            User Research Techniques
                            <sub className="ms-2">/ 3 hours 10min</sub>
                          </button>
                        </h2>
                        <div
                          id="collapse6"
                          className="accordion-collapse collapse"
                          aria-labelledby="heading6"
                          data-bs-parent="#accordion-course"
                        >
                          <div className="accordion-body">
                            <div className="lesson-items">
                              <ul className="list-unstyled">
                                <li>
                                  <a href="#" className="d-flex justify-content-between align-items-center">
                                    <span className="lesson-title">
                                      <img src="images/icons/video.png" alt="Video" />
                                      User Research
                                    </span>
                                    <span>
                                      3.08
                                      <img src="images/icons/lock.png" alt="Lock" />
                                    </span>
                                  </a>
                                </li>
                                <li>
                                  <a href="#" className="d-flex justify-content-between align-items-center">
                                    <span className="lesson-title">
                                      <img src="images/icons/video.png" alt="Video" />
                                      Persona Development
                                    </span>
                                    <span>
                                      3.08
                                      <img src="images/icons/lock.png" alt="Lock" />
                                    </span>
                                  </a>
                                </li>
                                <li>
                                  <a href="#" className="d-flex justify-content-between align-items-center">
                                    <span className="lesson-title">
                                      <img src="images/icons/video.png" alt="Video" />
                                      Persona Development
                                    </span>
                                    <span>
                                      3.08
                                      <img src="images/icons/lock.png" alt="Lock" />
                                    </span>
                                  </a>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Accordion Item End */}
                    </div>
                    {/* Accordion Wrap End */}
                  </div>
                  {/* Tab Item End */}
                  <div className="tab-pane fade" id="contact" role="tabpanel" aria-labelledby="contact-tab">
                    <h2 className="display-4">Instructor</h2>
                    <div className="author-card d-flex align-items-center border rounded-2 bg-shade p-3">
                      <div className="author-img">
                        <img src="images/instructor-lg.jpg" alt="Instructor" className="img-fluid rounded-3" />
                      </div>
                      <div className="author-text">
                        <h4>Maria Rivera, M.A.</h4>
                        <small className="text-mute">Arts Instructor</small>
                        <p>
                          This is a comprehensive outline, and the actual content and duration of each module may vary
                          based on the course format and duration. Hands-on activities, case studies, and real-world
                          projects should be integrated throughout the course to enhance practical skills.
                        </p>
                        <div className="social-share white mt-3">
                          <a href="#">
                            <i className="feather-icon icon-facebook" />
                          </a>
                          <a href="#">
                            <i className="feather-icon icon-twitter" />
                          </a>
                          <a href="#">
                            <i className="feather-icon icon-youtube" />
                          </a>
                          <a href="#">
                            <i className="feather-icon icon-linkedin" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Tab Item End */}
                  <div className="tab-pane fade" id="review" role="tabpanel" aria-labelledby="review-tab">
                    <h2 className="display-4">Reviews (02)</h2>
                    <div className="entry-comments mt-5">
                      <div className="post-comments">
                        <ol className="comment-list list-unstyled">
                          <li>
                            <article className="comment-entry">
                              <div className="d-sm-flex align-items-top">
                                <div className="comment-thumb">
                                  <img
                                    width={80}
                                    className="img-fluid rounded-circle"
                                    src="images/avatar5.png"
                                    alt="Comments"
                                  />
                                </div>
                                <div className="commentor ms-lg-4 bg-shade p-4 rounded-2">
                                  <div className="d-flex justify-content-between mb-3">
                                    <div className="comment-head">
                                      <h4 className="display-5 mb-0">Johnathon Smith</h4>
                                      <small className="text-muted">Nov 12, 2022 at 12:12 am</small>
                                    </div>
                                    <div className="ratings pt-2">
                                      <img src="images/icons/star.png" alt="Star" />
                                      <img src="images/icons/star.png" alt="Star" />
                                      <img src="images/icons/star.png" alt="Star" />
                                      <img src="images/icons/star.png" alt="Star" />
                                      <img src="images/icons/star.png" alt="Star" />
                                    </div>
                                  </div>
                                  <p>
                                    Mauris non dignissim purus, ac commodo diam. Donec sit amet lacinia nulla. Aliquam
                                    quis purus in justo pulvinar tempor.
                                  </p>
                                </div>
                              </div>
                            </article>
                            <ol className="children">
                              <li>
                                <article className="comment-entry">
                                  <div className="d-sm-flex align-items-top">
                                    <div className="comment-thumb">
                                      <img
                                        width={80}
                                        className="img-fluid rounded-circle"
                                        src="images/avatar3.png"
                                        alt="Comments"
                                      />
                                    </div>
                                    <div className="commentor ms-lg-4 bg-shade p-4 rounded-2">
                                      <div className="d-flex justify-content-between mb-3">
                                        <div className="comment-head">
                                          <h4 className="display-5 mb-0">Andrew Dian</h4>
                                          <small className="text-muted">Nov 12, 2022 at 12:12 am</small>
                                        </div>
                                        <div className="ratings pt-2">
                                          <img src="images/icons/star.png" alt="Star" />
                                          <img src="images/icons/star.png" alt="Star" />
                                          <img src="images/icons/star.png" alt="Star" />
                                          <img src="images/icons/star.png" alt="Star" />
                                          <img src="images/icons/star-half.png" alt="Star" />
                                        </div>
                                      </div>
                                      <p>
                                        Mauris non dignissim purus, ac commodo diam. Donec sit amet lacinia nulla.
                                        Aliquam quis purus in justo pulvinar tempor.
                                      </p>
                                    </div>
                                  </div>
                                </article>
                              </li>
                            </ol>
                          </li>
                          <li>
                            <article className="comment-entry">
                              <div className="d-sm-flex align-items-top">
                                <div className="comment-thumb">
                                  <img
                                    width={80}
                                    className="img-fluid rounded-circle"
                                    src="images/avatar4.png"
                                    alt="Comments"
                                  />
                                </div>
                                <div className="commentor ms-lg-4 bg-shade p-4 rounded-2">
                                  <div className="d-flex justify-content-between mb-3">
                                    <div className="comment-head">
                                      <h4 className="display-5 mb-0">Mc Donald</h4>
                                      <small className="text-muted">Nov 12, 2022 at 12:12 am</small>
                                    </div>
                                    <div className="ratings pt-2">
                                      <img src="images/icons/star.png" alt="Star" />
                                      <img src="images/icons/star.png" alt="Star" />
                                      <img src="images/icons/star.png" alt="Star" />
                                      <img src="images/icons/star.png" alt="Star" />
                                      <img src="images/icons/star-half.png" alt="Star" />
                                    </div>
                                  </div>
                                  <p>
                                    Mauris non dignissim purus, ac commodo diam. Donec sit amet lacinia nulla. Aliquam
                                    quis purus in justo pulvinar tempor.
                                  </p>
                                </div>
                              </div>
                            </article>
                          </li>
                        </ol>
                      </div>
                      <div className="contact-form contact2-sec mt-5">
                        <h3 className="display-4">Add a Review</h3>
                        <div className="d-flex align-items-center">
                          <span>Rate This Course:</span>
                          <div className="ratings ms-2">
                            <img src="images/icons/star-nil.png" alt="Star" />
                            <img src="images/icons/star-nil.png" alt="Star" />
                            <img src="images/icons/star-nil.png" alt="Star" />
                            <img src="images/icons/star-nil.png" alt="Star" />
                            <img src="images/icons/star-nil.png" alt="Star" />
                          </div>
                        </div>
                        <form action="#" className="row gy-3 mt-4">
                          <div className="col-lg-6 form-group">
                            <input type="text" placeholder="Your Name" />
                          </div>
                          <div className="col-lg-6 form-group">
                            <input type="text" placeholder="Email Address" />
                          </div>
                          <div className="col-lg-12 form-group">
                            <textarea name="message" id="message" rows={8} placeholder="Comment" defaultValue={""} />
                          </div>
                          <div className="form-group">
                            <input type="checkbox" id="check" />
                            <label htmlFor="check">
                              Save my name, email, and website in this browser for the next time I comment.
                            </label>
                          </div>
                          <div className="col-lg-12">
                            <button className="btn btn-primary mt-4">Leave a Review</button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                  {/* Tab Item End */}
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ListChapters;
