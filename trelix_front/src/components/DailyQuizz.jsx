import './css/dailyQuizz.css';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
function DailyQuizz() {
    const { user, isAuthenticated } = useAuthStore();
    const navigate = useNavigate();
  
    const handleJoinQuiz = () => {
      if (isAuthenticated && user) {
        navigate(`/quizz/${user._id}`); // Redirect with userId in the URL path
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
        <button type="button" className="confirm" onClick={handleJoinQuiz}>Join now</button>
      </div>
    </div>
  </div>
  )
}

export default DailyQuizz

