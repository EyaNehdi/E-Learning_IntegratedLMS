import { useState } from "react";
import axios from "axios";

function QuizzAdd() {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState([
    { question: "", options: ["", "", "", ""], correctAnswer: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTitleChange = (e) => setTitle(e.target.value);

  const handleQuestionChange = (index, e) => {
    const updated = [...questions];
    updated[index][e.target.name] = e.target.value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, oIndex, e) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = e.target.value;
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", options: ["", "", "", ""], correctAnswer: "" },
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await axios.post("/api/quiz/addQuiz", { title, questions });
      alert("Quiz added successfully!");
      setTitle("");
      setQuestions([
        { question: "", options: ["", "", "", ""], correctAnswer: "" },
      ]);
    } catch {
      setError("Error adding quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="custom-user-container">
      <div className="custom-form-wrapper">
        <h2 className="custom-form-title">Add Quiz</h2>
        <form className="custom-user-form" onSubmit={handleSubmit}>
          <div className="custom-form-group">
            <label htmlFor="title">Quiz Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={handleTitleChange}
              required
            />
          </div>

          {questions.map((q, index) => (
            <div key={index} className="user-detail-box">
              <div className="custom-form-group">
                <label>Question {index + 1}</label>
                <input
                  type="text"
                  name="question"
                  value={q.question}
                  onChange={(e) => handleQuestionChange(index, e)}
                  required
                />
              </div>

              <div className="custom-form-row">
                {q.options.map((option, optIndex) => (
                  <div className="custom-form-group" key={optIndex}>
                    <label>Option {optIndex + 1}</label>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, optIndex, e)}
                      required
                    />
                  </div>
                ))}
              </div>

              <div className="custom-form-group">
                <label>Select Correct Answer</label>
                <select
                  value={q.correctAnswer}
                  onChange={(e) =>
                    handleQuestionChange(index, {
                      target: { name: "correctAnswer", value: e.target.value },
                    })
                  }
                  required
                >
                  <option value="" disabled>
                    Select correct answer
                  </option>
                  {q.options.map((opt, i) => (
                    <option key={i} value={opt}>
                      {opt || `Option ${i + 1}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="custom-form-actions">
                <button
                  type="button"
                  className="custom-btn-secondary"
                  onClick={() =>
                    setQuestions((prev) => prev.filter((_, i) => i !== index))
                  }
                >
                  Remove Question
                </button>
              </div>
            </div>
          ))}

          <div className="custom-form-actions">
            <button
              type="button"
              onClick={addQuestion}
              className="custom-outline-btn create-btn"
            >
              + Add Another Question
            </button>
          </div>

          <div className="custom-form-actions">
            <button
              type="submit"
              className="custom-btn-primary"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Quiz"}
            </button>
            <button
              type="button"
              onClick={() => {
                setTitle("");
                setQuestions([
                  {
                    question: "",
                    options: ["", "", "", ""],
                    correctAnswer: "",
                  },
                ]);
              }}
              className="custom-btn-secondary"
            >
              Clear All
            </button>
          </div>

          {error && <p className="custom-error-text">{error}</p>}
        </form>
      </div>
    </div>
  );
}

export default QuizzAdd;
