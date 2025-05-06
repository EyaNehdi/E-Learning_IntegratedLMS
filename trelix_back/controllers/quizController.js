const Quiz = require("../models/quizModel");  // Your Quiz model
const multer = require("multer");
const path = require("path");
const Chapter = require("../models/chapterModels");

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




const assignedQuizToChapter = async (req, res) => {
    try {
        const { chapterId, quizIds } = req.body;

        // Validate input
        if (!chapterId || !quizIds || quizIds.length === 0) {
            return res.status(400).json({ success: false, message: "Chapter ID and quiz IDs are required." });
        }

        // Check if the chapter exists
        const chapter = await Chapter.findById(chapterId);
        if (!chapter) {
            return res.status(404).json({ success: false, message: "Chapter not found." });
        }

        // Check if all quizzes exist
        const quizzes = await Quiz.find({ _id: { $in: quizIds } });
        if (quizzes.length !== quizIds.length) {
            return res.status(404).json({ success: false, message: "One or more quizzes not found." });
        }

        // Assign quizzes to the chapter
        chapter.quizzes = [...new Set([...chapter.quizzes, ...quizIds])]; // Avoid duplicates
        await chapter.save();

        res.status(200).json({ success: true, message: "Quizzes successfully assigned to the chapter." });
    } catch (error) {
        console.error("Error assigning quizzes:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};
const getQuizzesByChapter = async (req, res) => {
    try {
      const { chapterId } = req.params;
  
      if (!chapterId) {
        return res.status(400).json({ message: "Chapter ID is required" });
      }
  
      // Find the chapter and get associated quizzes
      const chapter = await Chapter.findById(chapterId).populate("quizzes");
  
      if (!chapter) {
        return res.status(404).json({ message: "Chapter not found" });
      }
  
      res.json(chapter.quizzes);
    } catch (error) {
      console.error("Error fetching quizzes by chapter:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
  const Result =require('../models/Resultmodels');
  const saveresultuser = async (req, res) => {
    try {
      const { quizId, answers, userId } = req.body;
  
      // Validate input
      if (!quizId || !answers || !userId) {
        return res.status(400).json({ message: "Missing required fields" });
      }
  
      // Fetch the quiz from the database
      const quiz = await Quiz.findById(quizId).populate("questions");
  
      if (!quiz) {
        return res.status(404).json({ message: "Quiz not found" });
      }
  
      // Calculate the score
      let correctAnswers = 0;
      const totalQuestions = quiz.questions.length;
  
      quiz.questions.forEach((question, index) => {
        const userAnswer = answers[index];
        if (userAnswer && userAnswer === question.correctAnswer) {
          correctAnswers++;
        }
      });
      
      const score = (correctAnswers / totalQuestions) * 100;
  
      // Save the result to the database
      const result = new Result({
        user: userId,
        quiz: quizId,
        answers: answers,
        score: score,
        date: new Date(),
      });
  
      await result.save();
  
      // Respond with the saved result
      res.status(201).json({
        message: "Quiz results saved successfully",
        score: score,
        totalQuestions: totalQuestions,
        correctAnswers: correctAnswers,
        resultId: result._id,
      });
    } catch (error) {
      console.error("Error saving quiz results:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
  const getuserattempts = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        // Fetch all quiz attempts by the user
        const attempts = await Result.find({ user: userId }).populate("quiz");

        // If no attempts found, return an empty array instead of an error
        if (!attempts || attempts.length === 0) {
            return res.json([]); // Returning an empty array instead of a 404 error
        }

        // Format response data
        const formattedAttempts = attempts.map((attempt) => ({
            quizId: attempt.quiz?._id, // Using optional chaining to avoid errors
            quizTitle: attempt.quiz?.title || "Unknown Quiz",
            score: attempt.score,
            date: attempt.date,
            answers: attempt.answers,
        }));

        res.json(formattedAttempts);
    } catch (error) {
        console.error("Error fetching user attempts:", error);
        res.status(500).json({ message: "Server error" });
    }
};

  

  
  




module.exports = {
    createQuiz,
    getAllQuizzes,
    getQuizById,
    updateQuiz,
    deleteQuiz,
    assignedQuizToChapter,
    getQuizzesByChapter,
    saveresultuser,
    getuserattempts,
    upload,
};
