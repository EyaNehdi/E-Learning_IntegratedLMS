// import '../css/dailyQuizz.css';
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import Swal from "sweetalert2";
function DailyQuizz() {
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [hasAttempted, setHasAttempted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const socket = io(`${import.meta.env.VITE_API_PROXY}`); // Adjust to your backend URL

    socket.on("activeQuizUpdate", (quizData) => {
      console.log("Received active quiz update:", quizData);
      setActiveQuiz(quizData);
      setLoading(false);

      // Ensure the quiz data is valid before setting it
      if (quizData && quizData._id) {
        setActiveQuiz(quizData);
        setLoading(false);
      } else {
        console.error("Invalid quiz data received:", quizData);
      }
    });
    return () => {
      socket.disconnect(); // Clean up the socket connection on unmount
    };
  }, []);

  const handleJoinQuiz = async () => {
    console.log("Active Quiz ID:", activeQuiz?._id);
    if (isAuthenticated && user) {
      console.log("Active Quiz ID:", activeQuiz?._id);
      try {
        // Ensure activeQuiz has a valid _id
        if (activeQuiz && activeQuiz._id) {
          const res = await axios.get(
            `${import.meta.env.VITE_API_PROXY}/api/quiz/check-attempt/${
              activeQuiz._id
            }`
          );

          // Log the response after the request completes
          console.log("API Response:", res.data);

          // Check if the user has already passed the quiz
          if (res.data.passed) {
            Swal.fire({
              icon: "info",
              title: "Quiz Completed",
              text: "You have already passed this quiz! Come back tomorrow for a new one.",
              confirmButtonColor: "#3085d6",
              width: "400px",
              customClass: {
                confirmButton: "swal-wide-button",
              },
            });
          } else if (res.data.attempted) {
            Swal.fire({
              icon: "warning",
              title: "Already Attempted",
              text: "You have already attempted this quiz today. Come back tomorrow.",
              confirmButtonColor: "#f39c12",
              width: "400px",
              customClass: {
                confirmButton: "swal-wide-button",
              },
            });
          } else {
            navigate("/quiz");
          }
        } else {
          console.error("Active quiz ID is invalid");
        }
      } catch (error) {
        console.error(
          "Error checking attempt:",
          error.response?.data || error.message
        ); // Log detailed error message
      }
    } else {
      Swal.fire({
        icon: "error",
        title: "Not Logged In",
        text: "You need to be logged in to join the quiz!",
        confirmButtonColor: "#d33",
      });
    }
  };

  return (
    <div id="container">
      <div className="container-inner">
        <div className="buttons">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <button
              type="button"
              className="confirm"
              onClick={handleJoinQuiz}
              disabled={!activeQuiz}
              style={{
                padding: "10px 20px",
                fontSize: "15px",
                fontWeight: "600",
                borderRadius: "6px",
                border: "none",
                cursor: activeQuiz ? "pointer" : "not-allowed",
                transition: "all 0.2s ease",
                backgroundColor: hasAttempted ? "#f3f4f6" : "#4f46e5",
                color: hasAttempted ? "#4b5563" : "#ffffff",
                opacity: activeQuiz ? "1" : "0.7",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                minWidth: "120px",
                textAlign: "center",
              }}
              onMouseOver={(e) => {
                if (activeQuiz) {
                  e.target.style.backgroundColor = hasAttempted
                    ? "#e5e7eb"
                    : "#4338ca";
                  e.target.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.12)";
                }
              }}
              onMouseOut={(e) => {
                if (activeQuiz) {
                  e.target.style.backgroundColor = hasAttempted
                    ? "#f3f4f6"
                    : "#4f46e5";
                  e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
                }
              }}
            >
              {hasAttempted ? "Come back later" : "Join now"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default DailyQuizz;
