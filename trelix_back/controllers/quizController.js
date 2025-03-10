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
        const { quizName, description, questions } = req.body;

        // Validate request body
        if (!quizName || !description || !questions || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ message: "All fields are required, and questions must be an array with at least one question." });
        }

        // Validate each question
        for (const question of questions) {
            if (!question.question || !question.options || !Array.isArray(question.options) || question.options.length < 2 || !question.answer) {
                return res.status(400).json({ message: "Each question must have a question text, at least two options, and a correct answer." });
            }
        }

        // Create a new quiz
        const newQuiz = new Quiz({
            quizName,
            description,
            questions,
        });

        // Save quiz to the database
        await newQuiz.save();

        return res.status(201).json({ message: "Quiz created successfully!", quiz: newQuiz });
    } catch (error) {
        console.error("Error creating quiz:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};




const getAllQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find().lean(); // Use lean() for better performance
        if (!quizzes.length) {
            return res.status(404).json({ message: "No quizzes found" });
        }
        res.status(200).json(quizzes);
    } catch (error) {
        console.error("Error fetching quizzes:", error);
        res.status(500).json({ message: "Failed to fetch quizzes", error: error.message });
    }
};


const getQuizById = async (req, res) => {
    try {
        const quizId = req.params.quizId;
        console.log("Fetching quiz for ID:", quizId); // Debugging

        if (!quizId || quizId.length !== 24) { // MongoDB ObjectID length check
            return res.status(400).json({ message: "Invalid quiz ID" });
        }

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        res.status(200).json(quiz);
    } catch (error) {
        console.error("Error fetching quiz:", error); // Log actual error
        res.status(500).json({ message: "Failed to fetch quiz", error: error.message });
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
