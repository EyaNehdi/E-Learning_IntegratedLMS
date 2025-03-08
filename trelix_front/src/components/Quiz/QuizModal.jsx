import { useState, useEffect } from "react";

const QuizModal = ({ showQuiz, onClose }) => {
    const questions = [
        {
            id: 1,
            type: "text",
            question: "What is the main topic of this chapter?"
        },
        {
            id: 2,
            type: "radio",
            question: "Which of these is a key concept in this chapter?",
            options: ["Data Structures", "History", "Geography"]
        },
        {
            id: 4,
            type: "label",
            question: "Which is the capital of France?",
            options: ["Paris", "Berlin", "Madrid"]
        }
    ];

    const [timeLeft, setTimeLeft] = useState(60); // Timer (seconds)
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        if (!showQuiz || isSubmitted) return;

        if (timeLeft === 0) {
            handleSubmit();
            return;
        }

        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timer);
    }, [showQuiz, timeLeft, isSubmitted]);

    const handleChange = (e) => {
        setAnswers({ ...answers, [questions[currentQuestion].id]: e.target.value });
    };

    const handleLabelClick = (option) => {
        setAnswers({ ...answers, [questions[currentQuestion].id]: option });
    };

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handleBack = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
        }
    };

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        setIsSubmitted(true);
        alert("⏳ Time is up! Quiz submitted automatically.");
    };

    if (!showQuiz) return null;

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-3/4 md:w-1/2">
                {/* Header - Progress */}
                <h2 className="text-2xl font-bold mb-2">📖 Quiz</h2>
                <p className="text-gray-600">Question {currentQuestion + 1} of {questions.length}</p>

                {/* Timer */}
                <div className={`text-lg font-semibold mb-3 ${timeLeft <= 10 ? "text-red-500" : "text-green-600"}`}>
                    ⏳ Time Left: {timeLeft} sec
                </div>

                {/* Quiz Form */}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold">{questions[currentQuestion].question}</label>

                        {/* Answer Selection */}
                        {questions[currentQuestion].type === "text" && (
                            <input
                                type="text"
                                value={answers[questions[currentQuestion].id] || ""}
                                onChange={handleChange}
                                className="border p-2 w-full rounded-md"
                                required
                            />
                        )}

                        {questions[currentQuestion].type === "radio" && (
                            <div className="mt-2">
                                {questions[currentQuestion].options.map((option, index) => (
                                    <label key={index} className="block">
                                        <input
                                            type="radio"
                                            name="radio-answer"
                                            value={option}
                                            checked={answers[questions[currentQuestion].id] === option}
                                            onChange={handleChange}
                                            className="mr-2"
                                            required
                                        />
                                        {option}
                                    </label>
                                ))}
                            </div>
                        )}

                        {questions[currentQuestion].type === "dropdown" && (
                            <select
                                value={answers[questions[currentQuestion].id] || ""}
                                onChange={handleChange}
                                className="border p-2 w-full rounded-md"
                                required
                            >
                                <option value="">Select an option</option>
                                {questions[currentQuestion].options.map((option, index) => (
                                    <option key={index} value={option}>{option}</option>
                                ))}
                            </select>
                        )}

                        {questions[currentQuestion].type === "label" && (
                            <div className="mt-2">
                                {questions[currentQuestion].options.map((option, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => handleLabelClick(option)}
                                        className={`block p-2 border w-full text-left rounded-md mb-1 
                                            ${answers[questions[currentQuestion].id] === option ? "bg-blue-500 text-white" : "bg-gray-100"}
                                        `}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between">
                        <button
                            type="button"
                            onClick={handleBack}
                            className={`px-4 py-2 rounded-md font-bold ${currentQuestion === 0 ? "bg-gray-400 cursor-not-allowed" : "bg-yellow-500 hover:bg-yellow-600 text-white"}`}
                            disabled={currentQuestion === 0}
                        >
                            ← Back
                        </button>

                        {currentQuestion < questions.length - 1 ? (
                            <button
                                type="button"
                                onClick={handleNext}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md font-bold"
                            >
                                Next →
                            </button>
                        ) : (
                            <button
                                type="submit"
                                className={`px-4 py-2 rounded-md text-white font-bold ${timeLeft === 0 || isSubmitted ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"}`}
                                disabled={timeLeft === 0 || isSubmitted}
                            >
                                {isSubmitted ? "✅ Submitted" : "Submit"}
                            </button>
                        )}
                    </div>
                </form>

                {/* Close Button */}
                <button
                    className="mt-4 w-full p-2 rounded-md bg-red-500 text-white font-bold hover:bg-red-600"
                    onClick={onClose}
                >
                    ❌ Close
                </button>
            </div>
        </div>
    );
};

export default QuizModal;
