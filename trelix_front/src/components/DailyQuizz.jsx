import './css/dailyQuizz.css';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useEffect,useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
function DailyQuizz() {
    const { user, isAuthenticated } = useAuthStore();
    const navigate = useNavigate();
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [hasAttempted, setHasAttempted] = useState(false);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
    const socket = io('http://localhost:5000'); // Adjust to your backend URL
        
        socket.on('activeQuizUpdate', (quizData) => {
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
    console.log('Active Quiz ID:', activeQuiz?._id);
    if (isAuthenticated && user) {
        console.log('Active Quiz ID:', activeQuiz?._id);
        try {
            // Ensure activeQuiz has a valid _id
            if (activeQuiz && activeQuiz._id) {
                const res = await axios.get(`http://localhost:5000/api/quiz/check-attempt/${activeQuiz._id}`)
                

                // Log the response after the request completes
                console.log("API Response:", res.data);

                // Check if the user has already passed the quiz
                if (res.data.passed) {
                  alert("You have already passed this quiz! Come back tomorrow for a new one.");
              } else if (res.data.attempted) {
                  alert("You have already attempted this quiz today. Come back tomorrow.");
              } else {
                  navigate("/quiz");
              }
              }else {
                console.error("Active quiz ID is invalid");
            }
        } catch (error) {
            console.error("Error checking attempt:", error.response?.data || error.message); // Log detailed error message
        }
    } else {
        alert("You need to be logged in to join the quiz!");
    }
};

  return (
    <div id="container">
    <div className="container-inner">
      <div className="content">
        <p className="typing">Daily quiz available...</p>
      </div>
      <div className="buttons">
      {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <button type="button" className="confirm" onClick={handleJoinQuiz} disabled={!activeQuiz}>
                            {hasAttempted ? "Come back later" : "Join now"}
                        </button>
                    )}
      </div>
    </div>
  </div>
  )
}

export default DailyQuizz

