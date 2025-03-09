import './css/dailyQuizz.css';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useEffect,useState } from 'react';
import axios from 'axios';
function DailyQuizz() {
    const { user, isAuthenticated } = useAuthStore();
    const navigate = useNavigate();
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [hasAttempted, setHasAttempted] = useState(false);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const fetchActiveQuiz = async () => {
          try {
              const response = await axios.get('http://localhost:5000/api/quiz/active');
              if (response.data.quiz) {
                  setActiveQuiz(response.data.quiz);
                  
                  // Check if user has already attempted this quiz
                  if (isAuthenticated && user) {
                    const token = user?.token; // Fetch the token from state
                    if (!token) return;
                
                    const attemptRes = await axios.get(
                        `http://localhost:5000/api/quiz/check-attempt/${response.data.quiz._id}`,
                        {
                            headers: { Authorization: `Bearer ${token}` }
                        }
                    );
                
                    setHasAttempted(attemptRes.data.attempted);
                    console.log("setHasAttempted"+ attemptRes.data.attempted);
                }
              }
          } catch (error) {
              console.error('Error fetching active quiz:', error.response?.data?.message);
          } finally {
              setLoading(false);
          }
      };
      fetchActiveQuiz();
  }, [isAuthenticated, user]);

  const handleJoinQuiz = async () => {
    if (isAuthenticated && user) {
        console.log('Active Quiz ID:', activeQuiz?._id);
        try {
            // Ensure activeQuiz has a valid _id
            if (activeQuiz && activeQuiz._id) {
                const res = await axios.get(`http://localhost:5000/api/quiz/check-attempt/${activeQuiz._id}`)
                

                // Log the response after the request completes
                console.log("API Response:", res.data);

                // Check if the user has already passed the quiz
                if (res.data.alreadyPassed) {
                    alert("You have already passed this quiz! Come back tomorrow for a new one.");
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

