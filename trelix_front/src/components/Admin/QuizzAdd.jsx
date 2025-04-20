import { useState } from "react";
import axios from "axios";
import Headeradmin from "./Headeradmin";
function QuizzAdd() {
    const [title, setTitle] = useState("");
    const [questions, setQuestions] = useState([{ question: "", options: ["", "", "", ""], correctAnswer: "" }]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleTitleChange = (e) => setTitle(e.target.value);

    const handleQuestionChange = (index, e) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index][e.target.name] = e.target.value;
        setQuestions(updatedQuestions);
    };

    const handleOptionChange = (questionIndex, optionIndex, e) => {
        const updatedQuestions = [...questions];
        updatedQuestions[questionIndex].options[optionIndex] = e.target.value;
        setQuestions(updatedQuestions);
    };

    const addQuestion = () => {
        setQuestions([...questions, { question: "", options: ["", "", "", ""], correctAnswer: "" }]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
             await axios.post("/api/quiz/addQuiz", { title, questions });
            alert("Quiz added successfully!");
            setTitle("");
            setQuestions([{ question: "", options: ["", "", "", ""], correctAnswer: "" }]);
        } catch (err) {
            setError("Error adding quiz");
        } finally {
            setLoading(false);
        }
    };

  return (
    <>
     <div>
  {/* Mirrored from dleohr.dreamstechnologies.com/template-1/dleohr-horizontal/leave.html by HTTrack Website Copier/3.x [XR&CO'2014], Fri, 21 Feb 2025 08:53:58 GMT */}
  {/* Required meta tags */}
  <meta charSet="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Add Quizz</title>
  {/* Favicon */}
  <link rel="icon" type="image/x-icon" href="assetss/img/favicon.png" />
 <div>
  {/* Bootstrap CSS */}
  <link rel="stylesheet" href="assetss/css/bootstrap.min.css" />
  {/* Linearicon Font */}
  <link rel="stylesheet" href="assetss/css/lnr-icon.css" />
  {/* Fontawesome CSS */}
  <link rel="stylesheet" href="assetss/css/font-awesome.min.css" />
  {/* Custom CSS */}
  <link rel="stylesheet" href="assetss/css/style.css" />
  <div>
    <link rel="stylesheet" href="assetss/css/bootstrap.min.css" />
    <link rel="stylesheet" href="assetss/css/lnr-icon.css" />
    <link rel="stylesheet" href="assetss/css/font-awesome.min.css" />
    <link rel="stylesheet" href="assetss/css/style.css" />
  </div>
</div>
    <div className="page-wrapper" style={{
    marginBlock: "2px"}}>
      <div className="container-fluid">
        <div className="row">
          <div className=" col-xl-3 col-lg-4 col-md-12 theiaStickySidebar">
            <aside className="sidebar sidebar-user">
              <div className="card ctm-border-radius shadow-sm">
                <div className="card-body py-4">
                  <div className="row">
                    <div className="col-md-12 mr-auto text-left">
                      <div className="custom-search input-group">
                        <div className="custom-breadcrumb">
                          <ol className="breadcrumb no-bg-color d-inline-block p-0 m-0 mb-2">
                            <li className="breadcrumb-item d-inline-block"><a href="index.html" className="text-dark">Home</a></li>
                            <li className="breadcrumb-item d-inline-block active">Leave</li>
                          </ol>
                          <h4 className="text-dark">Add Quizz</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
          
            </aside>
          </div>
          <div className="col-xl-9 col-lg-8 col-md-12">
            <div className="row">
              <div className="col-md-12">
                <div className="card ctm-border-radius shadow-sm">
                  <div className="card-header">
                    <h4 className="card-title mb-0">Add New Quiz</h4>
                  </div>
                  <div className="card-body">
                  <form onSubmit={handleSubmit}>
            <div>
                <label>Title:</label>
                <input type="text" value={title} onChange={handleTitleChange} required />
            </div>
            {questions.map((q, index) => (
                <div key={index}>
                    <div>
                        <label>Question {index + 1}:</label>
                        <input
                            type="text"
                            name="question"
                            value={q.question}
                            onChange={(e) => handleQuestionChange(index, e)}
                            required
                        />
                    </div>
                    <div>
                        <label>Options:</label>
                        {q.options.map((option, optionIndex) => (
                            <input
                                key={optionIndex}
                                type="text"
                                value={option}
                                onChange={(e) => handleOptionChange(index, optionIndex, e)}
                                required
                            />
                        ))}
                    </div>
                    <div>
                        <label>Correct Answer:</label>
                        <input
                            type="text"
                            name="correctAnswer"
                            value={q.correctAnswer}
                            onChange={(e) => handleQuestionChange(index, e)}
                            required
                        />
                    </div>
                </div>
            ))}
            <button type="button" className="btn btn-danger text-white ctm-border-radius mt-4" onClick={addQuestion}>
                Add Another Question
            </button>
            <button className="btn btn-theme button-1 text-white ctm-border-radius mt-4" type="submit">
                {loading ? "Adding..." : "Add Quiz"}
            </button>
            {error && <p>{error}</p>}
        </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
 
  {/* Inner Wrapper */}
  <div className="sidebar-overlay" id="sidebar_overlay" />
  {/* jQuery */}
  {/* Bootstrap Core JS */}
  {/* Sticky sidebar JS */}
  {/* Select2 JS */}
  {/* Datetimepicker JS */}
  {/* Custom Js */}
  {/* Mirrored from dleohr.dreamstechnologies.com/template-1/dleohr-horizontal/leave.html by HTTrack Website Copier/3.x [XR&CO'2014], Fri, 21 Feb 2025 08:54:05 GMT */}
</div>
</>
  )};
export default QuizzAdd;
