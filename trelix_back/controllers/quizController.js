const Quiz = require("../models/quizModel");  // Your Quiz model
const multer = require("multer");
const path = require("path");


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads')); 
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname); 
    }
});

const upload = multer({ storage }); 


const createQuiz = async (req, res) => {
    try {
        const { title, description, questions } = req.body;

        // Ensure that the 'questions' field is an array and is non-empty
        if (!Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ message: "'questions' field must be a non-empty array" });
        }

        // Construct the quiz data, including the optional file upload
        const quizData = {
            title,
            description,
            questions,  // This assumes that 'questions' is an array of questions
            file: req.file ? req.file.path : null,  // Handle file upload if present
        };

        // Create a new Quiz document using the data
        const newQuiz = new Quiz(quizData);
        
        // Save the new quiz to the database
        await newQuiz.save();

        // Send a success response with the created quiz
        res.status(201).json({ message: "Quiz created successfully", quiz: newQuiz });
    } catch (error) {
        console.error("Error creating quiz:", error);  // Log the error for debugging purposes
        res.status(500).json({ message: "Server error", error: error.message });
    }
};




const getAllQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find(); 
        res.status(200).json(quizzes);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch quizzes", error });
    }
};


const getQuizById = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.quizId); 

        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        res.status(200).json(quiz);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch quiz", error });
    }
};


const updateQuiz = async (req, res) => {
    try {
        const { title, description, questions } = req.body;

        const quizData = {
            title,
            description,
            questions,
            file: req.file ? req.file.path : null, 
        };

        const updatedQuiz = await Quiz.findByIdAndUpdate(req.params.quizId, quizData, { new: true });

        if (!updatedQuiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        res.status(200).json({ message: "Quiz updated successfully", quiz: updatedQuiz });
    } catch (error) {
        res.status(500).json({ message: "Failed to update quiz", error });
    }
};


const deleteQuiz = async (req, res) => {
    try {
        const deletedQuiz = await Quiz.findByIdAndDelete(req.params.quizId); 

        if (!deletedQuiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        res.status(200).json({ message: "Quiz deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete quiz", error });
    }
};


module.exports = {
    createQuiz,
    getAllQuizzes,
    getQuizById,
    updateQuiz,
    deleteQuiz,
    upload,  
};
