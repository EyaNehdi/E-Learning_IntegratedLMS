
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useOutletContext } from "react-router-dom";
function AddQuiz() {
    const [quizType, setQuizType] = useState('text');  // Default value is 'text'
    const [question, setQuestion] = useState('');
    const [answers, setAnswers] = useState(['']); // For storing answers
    const [selectedAnswer, setSelectedAnswer] = useState('');

    // Handle change of quiz type
    const handleQuizTypeChange = (e) => {
        setQuizType(e.target.value);
        setAnswers(['']); // Reset answers when quiz type changes
    };

    // Handle question input change
    const handleQuestionChange = (e) => {
        setQuestion(e.target.value);
    };

    // Handle answer input change
    const handleAnswerChange = (index, value) => {
        const updatedAnswers = [...answers];
        updatedAnswers[index] = value;
        setAnswers(updatedAnswers);
    };

    // Handle adding new answer fields
    const addAnswerField = () => {
        setAnswers([...answers, '']);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
      
        const formData = new FormData();
      
        // Create the array of questions
        const questions = [{
            question: question,
            answers: answers // assuming this is an array of possible answers
        }];
      
        // Append all necessary data to formData
        formData.append("quizType", quizType);
        formData.append("questions", JSON.stringify(questions)); // Send questions as a stringified array
      
        // If the selectedAnswer exists (for radio/checkbox types), add it to the form data
        if (quizType === 'radio' || quizType === 'checkbox') {
            formData.append("selectedAnswer", selectedAnswer);
        }
      
        try {
            const response = await axios.post("http://localhost:5000/quiz/add", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
      
            if (response.status === 201) {
                alert("Quiz added successfully!");
                // Optionally clear form or redirect
            } else {
                alert("Failed to add quiz.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert(error.response?.data?.message || "Failed to add quiz.");
        }
    };
    
    
    
    return (




        <section className="dashboard-sec">
            <h2 className="display-5 border-bottom pb-3 mb-4">Chapters</h2>
            <div className="course-tab">
                <ul className="nav" id="myTab" role="tablist">
                    <ul className="nav" id="myTab" role="tablist">
                        <li className="nav-item">
                            <button className="nav-link active" data-bs-toggle="tab" data-bs-target="#profile">Add Quiz</button>
                        </li>
                        <li className="nav-item">
                            <button className="nav-link" data-bs-toggle="tab" data-bs-target="#list">All chapters</button>
                        </li>
                        <li className="nav-item">
                            <button className="nav-link" data-bs-toggle="tab" data-bs-target="#withdrawal">Edit chapter</button>
                        </li>
                        <li className="nav-item">
                            <button className="nav-link" data-bs-toggle="tab" data-bs-target="#social">Delete chapter</button>
                        </li>


                    </ul>
                </ul>
                <div className="tab-content" id="myTabContent">
                    <div className="tab-pane fade" id="profile" role="tabpanel">
                        <div className="tab-pane fade show active" id="addChapter">
                            <form onSubmit={handleSubmit} className="profile-form mt-5">
                            <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700">Quiz Type</label>
    <div className="mt-2 space-y-2">
        <div>
            <input 
                type="radio" 
                id="text" 
                name="quizType" 
                value="text"
                checked={quizType === 'text'}
                onChange={handleQuizTypeChange}
                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
            />
            <label htmlFor="text" className="ml-2 text-sm text-gray-600">Text</label>
        </div>
        <div>
            <input 
                type="radio" 
                id="radio" 
                name="quizType" 
                value="radio"
                checked={quizType === 'radio'}
                onChange={handleQuizTypeChange}
                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
            />
            <label htmlFor="radio" className="ml-2 text-sm text-gray-600">Radio</label>
        </div>
        <div>
            <input 
                type="radio" 
                id="checkbox" 
                name="quizType" 
                value="checkbox"
                checked={quizType === 'checkbox'}
                onChange={handleQuizTypeChange}
                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
            />
            <label htmlFor="checkbox" className="ml-2 text-sm text-gray-600">Checkbox</label>
        </div>
        <div>
            <input 
                type="radio" 
                id="label" 
                name="quizType" 
                value="label"
                checked={quizType === 'label'}
                onChange={handleQuizTypeChange}
                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
            />
            <label htmlFor="label" className="ml-2 text-sm text-gray-600">Label</label>
        </div>
    </div>
</div>




                                <div className="mb-4">
                                    <label htmlFor="question" className="block text-sm font-medium text-gray-700">Question</label>
                                    <input
                                        id="question"
                                        type="text"
                                        value={question}
                                        onChange={handleQuestionChange}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        required
                                    />
                                </div>

                                {/* Render input fields based on quizType */}
                                {quizType === 'text' && (
                                    <div className="mb-4">
                                        <label htmlFor="answer" className="block text-sm font-medium text-gray-700">Answer</label>
                                        <input
                                            id="answer"
                                            type="text"
                                            value={answers[0]}
                                            onChange={(e) => handleAnswerChange(0, e.target.value)}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            required
                                        />
                                    </div>
                                )}

{quizType === 'radio' && (
    <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Answers</label>
        {answers.map((answer, index) => (
            <div key={index} className="flex items-center">
                <input
                    type="radio"
                    id={`answer-${index}`}
                    name="radioAnswer"
                    value={answer}
                    checked={selectedAnswer === answer}
                    onChange={(e) => setSelectedAnswer(e.target.value)} // Update selectedAnswer
                    className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <input
                    type="text"
                    value={answer}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    className="ml-2 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                />
            </div>
        ))}
        <button type="button" onClick={addAnswerField} className="mt-2 text-indigo-600">Add Answer</button>
    </div>
)}

{quizType === 'checkbox' && (
    <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Answers</label>
        {answers.map((answer, index) => (
            <div key={index} className="flex items-center">
                <input
                    type="checkbox"
                    id={`answer-${index}`}
                    value={answer}
                    className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                />
                <input
                    type="text"
                    value={answer}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    className="ml-2 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                />
            </div>
        ))}
        <button type="button" onClick={addAnswerField} className="mt-2 text-indigo-600">Add Answer</button>
    </div>
)}

                                {quizType === 'label' && (
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700">Answers</label>
                                        {answers.map((answer, index) => (
                                            <div key={index} className="flex items-center">
                                                <label htmlFor={`answer-${index}`} className="ml-2 mt-1 block w-full text-gray-700">
                                                    {answer}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={answer}
                                                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                                                    className="ml-2 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    required
                                                />
                                            </div>
                                        ))}
                                        <button type="button" onClick={addAnswerField} className="mt-2 text-indigo-600">Add Label</button>
                                    </div>
                                )}

                                <button type="submit" className="btn btn-sm btn-primary mt-3">Add Quiz</button>
                            </form>
                        </div>
                    </div>
                    <div className="tab-pane fade" id="list" role="tabpanel">



                    </div>


                </div>
            </div>
        </section>



    );
}

export default AddQuiz;
