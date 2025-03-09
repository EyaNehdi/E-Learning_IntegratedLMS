import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuthStore } from "../../store/authStore";
function QuizzLeaderboard() {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuthStore();
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [quizId, setQuizId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/quiz/active-questions", {
                    headers: { Authorization: `Bearer ${user?.token}` }
                });
                setQuestions(res.data.questions);
                setQuizId(res.data.quizId);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching quiz questions:", error);
                setLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchQuestions();
        } else {
            navigate("/login"); // Redirect if not authenticated
        }
    }, [isAuthenticated, navigate, user?.token]);

    // Handle selecting an answer
    const handleAnswerChange = (questionId, selectedOption) => {
        setAnswers((prev) => ({ ...prev, [questionId]: selectedOption }));
    };

    // Navigate to next question
    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    // Navigate to previous question
    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    // Submit quiz
    const handleSubmit = async () => {
        try {
            // Calculate score based on the answers
            let score = 0;
            let passed = false;
    
            questions.forEach((question) => {
                if (answers[question._id] === question.correctAnswer) {
                    score += 1;
                }
            });
    
            // Set passed condition (for example, passed if score > 50% of questions)
            passed = score / questions.length >= 0.5;
    
            const res = await axios.post("http://localhost:5000/api/quiz/submit", {
                quizId,
                score,
                passed
            }, {
                headers: { Authorization: `Bearer ${user?.token}` }
            });
    
            alert(`Quiz completed! Your score: ${res.data.attempt.score}`);
            navigate("/leaderboard");
        } catch (error) {
            console.error("Error submitting quiz:", error);
        }
    };

    if (loading) return <p>Loading quiz...</p>;
    if (!questions.length) return <p>No questions available.</p>;

    const currentQuestion = questions[currentQuestionIndex];
    return (
        <div className="quiz-container">
            <h2>Question {currentQuestionIndex + 1} / {questions.length}</h2>
            <p>{currentQuestion?.question}</p>

            <div className="options">
                {currentQuestion?.options.map((option, index) => (
                    <label key={index} className="option">
                        <input
                            type="radio"
                            name={`question-${currentQuestion._id}`}
                            value={option}
                            checked={answers[currentQuestion._id] === option}
                            onChange={() => handleAnswerChange(currentQuestion._id, option)}
                        />
                        {option}
                    </label>
                ))}
            </div>

            <div className="navigation">
                <button onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
                    Previous
                </button>
                {currentQuestionIndex < questions.length - 1 ? (
                    <button onClick={handleNext}>Next</button>
                ) : (
                    <button onClick={handleSubmit}>Submit</button>
                )}
            </div>
        </div>
    );

}

export default QuizzLeaderboard
