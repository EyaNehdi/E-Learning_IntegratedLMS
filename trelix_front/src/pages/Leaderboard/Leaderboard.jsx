import DailyQuizz from "../../components/Leaderboard/DailyQuizz"
import Leader from "../../components/Leaderboard/Leader"
import axios from 'axios';
import { useState,useEffect } from "react";
import io from 'socket.io-client';
import '../../components/css/Leaderboard.css'
import Rewards from "../../components/Leaderboard/Rewards";


function Leaderboard() {
  const [quiz, setQuiz] = useState(null);
  const [countdown, setCountdown] = useState(60);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the active quiz when the component mounts
  const fetchActiveQuiz = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/quiz/active');
      
      if (response.data.quiz) {
        setQuiz(response.data.quiz);
        
        // Set countdown if we have a nextResetTime
        if (response.data.nextResetTime) {
          const nextReset = new Date(response.data.nextResetTime).getTime();
          const now = Date.now();
          const timeLeft = Math.max((nextReset - now) / 1000, 0);
          setCountdown(timeLeft);
        }
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching active quiz:', error.response ? error.response.data : error.message);
      setError(error.response?.data?.message ||"Failed to load the quiz. Please try again later.");
      setLoading(false);
    }
  };

// Establish socket connection
useEffect(() => {
  console.log("Setting up socket connection...");
  const socket = io("http://localhost:5000", {
    transports: ['websocket', 'polling']
  });

  // Connection status monitoring
  socket.on('connect', () => {
    console.log('Socket connected!', socket.id);
    fetchActiveQuiz(); // Fetch quiz when connected
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err);
    setError("Connection error. Trying to reconnect...");
  });

  // Listen for active quiz updates
  socket.on("activeQuizUpdate", (data) => {
    console.log("Received active quiz update:", data);
    if (data.title) {
      setQuiz(prevQuiz => ({
        ...prevQuiz,
        title: data.title ||prevQuiz?.title,
        nextResetTime: data.nextResetTime || prevQuiz?.nextResetTime
      }));
    }

    if (data.nextResetTime) {
      const nextReset = new Date(data.nextResetTime).getTime();
      const now = Date.now();
      const timeLeft = Math.max((nextReset - now) / 1000, 0);
      setCountdown(timeLeft);
    }
  });

    // Listen for timer updates
    socket.on("timerUpdate", (data) => {
      // console.log("Timer update:", data.timeLeft);
      // Only update countdown if we get a valid time
      if (data.timeLeft !== null) {
        setCountdown(data.timeLeft);
      }
    });

    // Clean up on component unmount
    return () => {
      console.log("Disconnecting socket");
      socket.disconnect();
    };
  }, []); 

 // Format the countdown time as HH:MM:SS
 const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return "00:00:00";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

return (
  <div className="leaderboard-page-container">
    <div className="leaderboard-page-content">
      <div className="leaderboard-left-section">
        <Leader />
      </div>
      
      {/* Right Section - Split into Two Columns */}
      <div className="leaderboard-right-section">
        <div className="leaderboard-main-content">
          {/* Left Column - Quiz Title, Timer, Instructions, and Daily Quiz */}
          <div className="quiz-column">
            <div className="quiz-header-container">
              {loading ? (
                <p>Loading quiz...</p>
              ) : error ? (
                <p className="error-message">{error}</p>
              ) : quiz ? (
                <div className="quiz-details">
                  <h3>{quiz.title}</h3>
                  <h4> ⏳ Time Left: {formatTime(countdown)}</h4>
                </div>
              ) : (
                <p>Loading quiz...</p>
              )}
            </div>

            <div className="quiz-instructions-container">
              <ul>
                <li>You will get 5 questions</li>
                <li>Your score will be displayed in the leaderboard.</li>
                <li>Play and earn points to access our paid courses.</li>
                <li>Be careful , You have to answer within the time limit.</li>
                <li>Try to manage your time.</li>
                <li>You can also win badges for playing daily.</li>
                <li>Good luck!</li>
              </ul>
            </div>

            <div className="daily-quiz-container">
              <DailyQuizz />
            </div>
          </div>

          {/* Right Column - Rewards */}
          <div className="rewards-column">
            <Rewards />
          </div>
        </div>
      </div>
    </div>
  </div>
);

}

export default Leaderboard