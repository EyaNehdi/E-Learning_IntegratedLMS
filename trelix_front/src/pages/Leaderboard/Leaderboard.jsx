import DailyQuizz from "../../components/dailyQuizz"
import Leader from "../../components/Leader"
import axios from 'axios';
import { useState,useEffect } from "react";
import io from 'socket.io-client';
import '../../components/css/Leaderboard.css'


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
  <>
  <Leader />
  {/* Wrapper for positioning DailyQuizz */}
  <div style={{
      position: "absolute",
      right: "0px",  // Adjust to move it to the right
      top: "0px",   // Adjust to move it down
      width: "unset",  // Prevents forced shrinking
      maxWidth: "100%", // Ensures it doesn’t go beyond screen width
    }}>
      <DailyQuizz />
    </div>
    <div style={{
      position: "absolute",
      right: "400px",
      top: "600px",
      textAlign: "center",
      fontSize: "24px",
      fontWeight: "bold",
      color: countdown <= 10 ? "red" : "black", // Red when time is low
      }}>
      {loading ? (
        <p>Loading quiz...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : quiz ? (
        <>
          <div>
          
            <h3>{quiz.title}</h3>
            <h4> ⏳ Time Left: {formatTime(countdown)}</h4>
          </div>
          
        </>
      ) : (
      <p>Loading quiz...</p>
      )}
  </div>
  <ul style={{
      position: "absolute",
      right: "300px",
      top: "700px",
      listStyle: "circle",
      textAlign:"left",
      fontWeight:"bold"
      }}>
              <li>You will get 5 questions</li>
              <li>Play and earn points to have access to our paid courses</li>
            </ul>
  </>
)

}

export default Leaderboard
