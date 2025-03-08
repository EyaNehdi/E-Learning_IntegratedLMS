import "./video.css"
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useOutletContext } from "react-router-dom";
import QuizModal from "../Quiz/QuizModal";

const ChapterContent = () => {
    const { id } = useParams();
    const [chapters, setChapters] = useState([]);

    const [loading, setLoading] = useState(true);
    const [showPDF, setShowPDF] = useState(false);

    useEffect(() => {
        // Fetch chapters from the backend
        axios
            .get("http://localhost:5000/chapter/get")
            .then((response) => {
                setChapters(response.data);
            })
            .catch((error) => {
                console.error("Error fetching chapters:", error);
            });

    }, []);
    const [profile, setProfile] = useState([]);
    useEffect(() => {
        const selectedChapter = chapters.find((chapter) => chapter._id === id);

        if (selectedChapter) {
            console.log("Selected Chapter:", selectedChapter.title);

            axios.get(`http://localhost:5000/api/admin/user/${selectedChapter.userid}`)
                .then(response => {
                    console.log('Instructor data:', response.data);
                    setProfile(response.data); // Store instructor profile
                })
                .catch(error => {
                    console.error('Error fetching instructor data:', error);
                });
        }
    }, [id, chapters]);
    const togglePDF = () => {
        setShowPDF((prev) => !prev);
        if (!showPDF) {
            setTimeout(() => {
                document.getElementById("pdf-container")?.scrollIntoView({ behavior: "smooth" });
            }, 300);
        }
    };
    /////////quiizzzzzz

    const [isPDFRead, setIsPDFRead] = useState(false); // Track if the PDF has been read
    const [showQuiz, setShowQuiz] = useState(false); // Track if the quiz should be shown
    const [isVideoWatched, setIsVideoWatched] = useState(false);
    const videoRef = useRef(null);
    const handleVideoEnd = () => setIsVideoWatched(true);

    const handlePDFRead = () => {
        setIsPDFRead(true); // Set the PDF as read
    };

    const handleQuizVisibility = () => {
        if (isPDFRead) {
            setShowQuiz(true); // Show the quiz after the PDF is read
        } else {
            alert("Please read the entire PDF before starting the quiz.");
        }
    };


    return (
        <section className="course-lession bg-shade sec-padding overflow-hidden">
            <div className="container-fluid px-0">
                <div className="row">

                    <div className="col-lg-8">
                        <div className="lesstion-wrap">

                            <div>
                                {chapters
                                    .filter((chapter) => chapter._id === id)
                                    .map((chapter) => (
                                        <div key={chapter._id} className="lesson-content">
                                            {/* Video Section */}
                                            <video
                                                className="clip w-full"
                                                ref={videoRef}
                                                controls
                                                autoPlay
                                                muted
                                                width="100%"
                                                height="100%"
                                                onEnded={handleVideoEnd} // Detect when the video ends
                                            >
                                                <source src={`http://localhost:5000${chapter.video}`} type="video/mp4" />
                                                Your browser does not support the video tag.
                                            </video>

                                            {/* Enroll & Show PDF Button */}
                                            {chapter.pdf && (
                                                <div className="enroll-section">
                                                    <button className="enroll-btn" onClick={togglePDF}>
                                                        {showPDF ? "❌ Hide PDF" : "📖 View Course PDF"}
                                                    </button>
                                                </div>
                                            )}

                                            {/* PDF Section */}
                                            {showPDF && chapter.pdf && (
                                                <div id="pdf-container" className="pdf-container">
                                                    <h3>📚 Course PDF</h3>
                                                    <iframe
                                                        src={`http://localhost:5000${chapter.pdf}`}
                                                        className="pdf-viewer"
                                                        onLoad={handlePDFRead} // Trigger when PDF is loaded
                                                    />
                                                    <button className="mark-as-read-btn" onClick={handlePDFRead}>
                                                        ✅
                                                    </button>
                                                </div>
                                            )}

                                            {/* Show Quiz Button After Completing Video & PDF */}
                                            {isVideoWatched && isPDFRead && !showQuiz && (
                                                <button
                                                    className="start-quiz-btn bg-green-500 text-white font-bold py-3 px-6 rounded-full text-lg transform transition duration-300 ease-in-out hover:bg-green-600 hover:scale-105 shadow-lg focus:outline-none"
                                                    onClick={handleQuizVisibility}
                                                >
                                                    Start Quiz
                                                </button>
                                            )}

                                            {/* Quiz Modal (Semi-Window) */}
                                            <QuizModal showQuiz={showQuiz} onClose={() => setShowQuiz(false)} />
                                        </div>
                                    ))}
                            </div>


                            <div className="lession-content bg-white p-5">
                                <ul className="nav" id="myTab" role="tablist">
                                    <li className="nav-item" role="presentation">
                                        <button className="nav-link active" id="home-tab" data-bs-toggle="tab" data-bs-target="#home" type="button" role="tab" aria-controls="home" aria-selected="true">Overview</button>
                                    </li>
                                    <li className="nav-item" role="presentation">
                                        <button className="nav-link" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile" type="button" role="tab" aria-controls="profile" aria-selected="false">Instructors</button>
                                    </li>
                                    <li className="nav-item" role="presentation">
                                        <button className="nav-link" id="contact-tab" data-bs-toggle="tab" data-bs-target="#contact" type="button" role="tab" aria-controls="contact" aria-selected="false">Reviews</button>
                                    </li>
                                </ul>
                                <div className="tab-content py-4" id="myTabContent">
                                    {chapters
                                        .filter((chapter) => chapter._id === id)
                                        .map((chapter) => (

                                            <div key={chapter._id} className="tab-pane fade show active" id="home" role="tabpanel" aria-labelledby="home-tab">
                                                <h3 className="display-5 mb-4">{chapter.title}</h3>
                                                <p>{chapter.description}</p>
                                                <h5>What you'll learn throughout the course?</h5>
                                                <ul>
                                                    <li>What does set and get do?</li>
                                                    <li>I dont understand his explanation</li>
                                                    <li>Function from an object instance</li>
                                                </ul>
                                                <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Magnam, doloremque! Eligendi, tempore quisquam officiis porro deserunt debitis odio atque magnam! Necessitatibus vero facilis perspiciatis mollitia recusandae eaque ullam! Nesciunt, fugiat?</p>
                                            </div>
                                        ))}
                                    <div className="tab-pane fade" id="profile" role="tabpanel" aria-labelledby="profile-tab">


                                        {profile ? (
                                            <> {/* Fragment to wrap adjacent elements */}
                                                <h3 className="display-4 mb-5">{profile.firstName + " " + profile.lastName}</h3> {/* Check if profile data is available */}
                                                <div className="author-card d-md-flex align-items-center border rounded-2 bg-shade p-3">
                                                    <div className="author-img">
                                                        <img src={`http://localhost:5000${profile.profilePhoto}`} alt="Instructor" className="img-fluid rounded-3" />
                                                    </div>

                                                    <div className="author-text">
                                                        <h4>{profile.name}</h4>
                                                        <small className="text-muted">{profile.role || "Instructor"}</small>
                                                        <p>{profile.Bio || "No bio available."}</p>

                                                        <div className="social-share white mt-3">
                                                            <a href=""><i className="feather-icon icon-facebook" /></a>
                                                            <a href=""><i className="feather-icon icon-twitter" /></a>
                                                            <a href=""><i className="feather-icon icon-youtube" /></a>
                                                            <a href=""><i className="feather-icon icon-linkedin" /></a>
                                                            <a href={`mailto:${profile.email}`} target="_blank" rel="noopener noreferrer">
                                                                <i className="feather-icon icon-mail" /> {/* Assuming you have a mail icon */}
                                                                <span>{profile.email}</span>
                                                            </a>

                                                        </div>

                                                    </div>
                                                </div>

                                            </>
                                        ) : (
                                            <p>Loading instructor details...</p>
                                        )}
                                    </div>
                                    <div className="tab-pane fade" id="contact" role="tabpanel" aria-labelledby="contact-tab">
                                        <div className="course-rate d-flex justify-content-between align-items-center mb-5 pb-5 border-bottom">
                                            <div className="ratings-stat text-center shadow-sm p-4">
                                                <h3 className="display-1 mb-0">4.8</h3>
                                                <div className="ratings">
                                                    <img src="/assets/images/icons/star.png" alt />
                                                    <img src="/assets/images/icons/star.png" alt />
                                                    <img src="/assets/images/icons/star.png" alt />
                                                    <img src="/assets/images/icons/star.png" alt />
                                                    <img src="/assets/images/icons/star.png" alt />
                                                </div>
                                                <div className="course-rate__summary-text">
                                                    12 Ratings
                                                </div>
                                            </div>
                                            <div className="ratings-details">
                                                <div className="d-flex align-items-center">
                                                    <span>5 <img src="/assets/images/icons/star.png" alt /></span>
                                                    <div className="progress" role="progressbar" aria-label="Basic example" aria-valuenow={0} aria-valuemin={0} aria-valuemax={100}>
                                                        <div className="progress-bar" style={{ width: '100%' }} />
                                                    </div>
                                                </div>
                                                <div className="d-flex align-items-center">
                                                    <span>4 <img src="/assets/images/icons/star.png" alt /></span>
                                                    <div className="progress" role="progressbar" aria-label="Basic example" aria-valuenow={25} aria-valuemin={0} aria-valuemax={100}>
                                                        <div className="progress-bar" style={{ width: '75%' }} />
                                                    </div>
                                                </div>
                                                <div className="d-flex align-items-center">
                                                    <span>3 <img src="/assets/images/icons/star.png" alt /></span>
                                                    <div className="progress" role="progressbar" aria-label="Basic example" aria-valuenow={0} aria-valuemin={0} aria-valuemax={100}>
                                                        <div className="progress-bar" style={{ width: '50%' }} />
                                                    </div>
                                                </div>
                                                <div className="d-flex align-items-center">
                                                    <span>2 <img src="/assets/images/icons/star.png" alt /></span>
                                                    <div className="progress" role="progressbar" aria-label="Basic example" aria-valuenow={25} aria-valuemin={0} aria-valuemax={100}>
                                                        <div className="progress-bar" style={{ width: '25%' }} />
                                                    </div>
                                                </div>
                                                <div className="d-flex align-items-center">
                                                    <span>1 <img src="/assets/images/icons/star.png" alt /></span>
                                                    <div className="progress" role="progressbar" aria-label="Basic example" aria-valuenow={0} aria-valuemin={0} aria-valuemax={100}>
                                                        <div className="progress-bar" style={{ width: '0%' }} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="post-comments">
                                            <ol className="comment-list list-unstyled">
                                                <li>
                                                    <article className="comment-entry">
                                                        <div className="d-sm-flex align-items-top">
                                                            <div className="comment-thumb">
                                                                <img width={80} className="img-fluid rounded-circle" src="/assets/images/avatar5.png" alt="Comments" />
                                                            </div>
                                                            <div className="commentor ms-lg-4 bg-shade p-4 rounded-2">
                                                                <div className="d-flex justify-content-between mb-3">
                                                                    <div className="comment-head">
                                                                        <h4 className="display-5 mb-0">Johnathon Smith</h4>
                                                                        <small className="text-muted">Nov 12, 2022 at 12:12 am</small>
                                                                    </div>
                                                                    <div className="ratings pt-2">
                                                                        <img src="/assets/images/icons/star.png" alt="Star" />
                                                                        <img src="/assets/images/icons/star.png" alt="Star" />
                                                                        <img src="/assets/images/icons/star.png" alt="Star" />
                                                                        <img src="/assets/images/icons/star.png" alt="Star" />
                                                                        <img src="/assets/images/icons/star.png" alt="Star" />
                                                                    </div>
                                                                </div>
                                                                <p>Mauris non dignissim purus, ac commodo diam. Donec sit amet lacinia
                                                                    nulla. Aliquam quis purus in justo pulvinar tempor.</p>
                                                            </div>
                                                        </div>
                                                    </article>
                                                    <ol className="children">
                                                        <li>
                                                            <article className="comment-entry">
                                                                <div className="d-sm-flex align-items-top">
                                                                    <div className="comment-thumb">
                                                                        <img width={80} className="img-fluid rounded-circle" src="/assets/images/avatar3.png" alt="Comments" />
                                                                    </div>
                                                                    <div className="commentor ms-lg-4 bg-shade p-4 rounded-2">
                                                                        <div className="d-flex justify-content-between mb-3">
                                                                            <div className="comment-head">
                                                                                <h4 className="display-5 mb-0">Andrew Dian</h4>
                                                                                <small className="text-muted">Nov 12, 2022 at 12:12 am</small>
                                                                            </div>
                                                                            <div className="ratings pt-2">
                                                                                <img src="/assets/images/icons/star.png" alt="Star" />
                                                                                <img src="/assets/images/icons/star.png" alt="Star" />
                                                                                <img src="/assets/images/icons/star.png" alt="Star" />
                                                                                <img src="/assets/images/icons/star.png" alt="Star" />
                                                                                <img src="/assets/images/icons/star-half.png" alt="Star" />
                                                                            </div>
                                                                        </div>
                                                                        <p>Mauris non dignissim purus, ac commodo diam. Donec sit amet
                                                                            lacinia nulla. Aliquam quis purus in justo
                                                                            pulvinar tempor.</p>
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
                                                                <img width={80} className="img-fluid rounded-circle" src="/assets/images/avatar4.png" alt="Comments" />
                                                            </div>
                                                            <div className="commentor ms-lg-4 bg-shade p-4 rounded-2">
                                                                <div className="d-flex justify-content-between mb-3">
                                                                    <div className="comment-head">
                                                                        <h4 className="display-5 mb-0">Mc Donald</h4>
                                                                        <small className="text-muted">Nov 12, 2022 at 12:12 am</small>
                                                                    </div>
                                                                    <div className="ratings pt-2">
                                                                        <img src="/assets/images/icons/star.png" alt="Star" />
                                                                        <img src="/assets/images/icons/star.png" alt="Star" />
                                                                        <img src="/assets/images/icons/star.png" alt="Star" />
                                                                        <img src="/assets/images/icons/star.png" alt="Star" />
                                                                        <img src="/assets/images/icons/star-half.png" alt="Star" />
                                                                    </div>
                                                                </div>
                                                                <p>Mauris non dignissim purus, ac commodo diam. Donec sit amet lacinia
                                                                    nulla. Aliquam quis purus in justo
                                                                    pulvinar tempor.</p>
                                                            </div>
                                                        </div>
                                                    </article>
                                                </li>
                                            </ol>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </section>
    )
}

export default ChapterContent