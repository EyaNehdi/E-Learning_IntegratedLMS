import DailyQuizz from "../../components/dailyQuizz"
import Footer from "../../components/Footer"
import Leader from "../../components/Leader"
import axios from 'axios';
import { useState,useEffect } from "react";
import io from 'socket.io-client';



function Leaderboard() {
  const [quiz, setQuiz] = useState(null);
  const [countdown, setCountdown] = useState(60); // Default 60 seconds
  const [nextResetTime, setNextResetTime] = useState(null);

  // Fetch the active quiz when the component mounts
  const fetchActiveQuiz = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/quiz/active'); 
      setQuiz(response.data.quiz); 
      if (response.data.nextResetTime) {
        const nextReset = new Date(response.data.nextResetTime).getTime();
        const now = Date.now();
        const timeLeft = Math.max((nextReset - now) / 1000, 0);
        setCountdown(timeLeft);
        setNextResetTime(nextReset);
      }
    } catch (error) {
      console.error('Error fetching active quiz:', error);
    }
  };
// Initialize socket connection
useEffect(() => {
  const socket = io("http://localhost:5000"); // Replace with your backend URL

  // Listen for active quiz updates
  socket.on("activeQuizUpdate", (data) => {
      console.log("Received active quiz update:", data);
      setQuiz({ title: data.title, nextResetTime: data.nextResetTime });

      // Calculate countdown based on reset time
      const nextReset = new Date(data.nextResetTime).getTime();
      const now = Date.now();
      const timeLeft = Math.max((nextReset - now) / 1000, 0);
      setCountdown(timeLeft);
  });

  // Listen for timer updates (every second)
  socket.on("timerUpdate", (data) => {
      setCountdown(data.timeLeft);
  });

  // Cleanup on component unmount
  return () => {
      socket.disconnect();
  };
}, []);
  useEffect(() => {
    
    fetchActiveQuiz();
    const intervalId = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown > 1) {
          return prevCountdown - 1;
        } else {
          clearInterval(intervalId);
          fetchActiveQuiz(); // Fetch new quiz when countdown reaches 0
          return 0;
        }
      });
    }, 1000); // Update every second

    return () => clearInterval(intervalId);
  }, []);

 // Convert seconds to HH:MM:SS format
const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return "00:00:00"; // Handle NaN cases

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
      {quiz ? (
        <>
          <div>
            <h3>{quiz.title}</h3>
             <h4> ⏳ Time Left: 
              {formatTime(countdown)}</h4>
          </div>
        </>
      ) : (
        <p>Loading quiz...</p>
      )}
    </div>
    <Footer />

    </>
  )
}

export default Leaderboard
