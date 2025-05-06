const Exam = require("../models/ExamModel");
const multer = require("multer");
const path = require("path");
const { Parser } = require("json2csv");
const Course = require("../models/course");
const mongoose = require('mongoose');

const moment = require('moment'); // Assure-toi que cette ligne est présente
const notifier = require('node-notifier');
const ExamAttempt = require("../models/ExamAttempt");

const User = require('../models/userModel');
const ExamResult = require('../models/ExamResult');


// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// Get all exams
const getExams = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const totalExams = await Exam.countDocuments(); // Count total exams
    const exams = await Exam.find().skip(skip).limit(limitNumber); // Fetch paginated exams

    res.status(200).json({
      exams,
      totalPages: Math.ceil(totalExams / limitNumber) || 1, // Calculate total pages
    });
  } catch (error) {
    console.error("Error fetching exams:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const getallExams = async (req, res) => {
  try {
    // Fetch all exams without pagination
    const exams = await Exam.find(); // Get all exams

    res.status(200).json({
      exams, // Return all exams
      totalPages: 1, // Since we're returning all exams, there's only 1 page
    });
  } catch (error) {
    console.error("Error fetching exams:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getExamss = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const totalExams = await Exam.countDocuments(); // Count total exams
    const exams = await Exam.find()
      .populate("questions") // Populate questions
      .skip(skip)
      .limit(limitNumber);

    res.status(200).json({
      exams,
      totalPages: Math.ceil(totalExams / limitNumber) || 1, // Calculate total pages
    });
  } catch (error) {
    console.error("Error fetching exams:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// Get exam by ID
const getExamById = async (req, res) => {
  try {
    const { id } = req.params; // Extract ID from request parameters
    const exam = await Exam.findById(id).populate("questions"); // Fetch the exam and populate questions

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    res.status(200).json(exam);
  } catch (error) {
    console.error("Error fetching exam by ID:", error);
    res.status(500).json({ message: "Server error" });
  }
};



const sendDesktopNotification = (subject, message) => {
  notifier.notify({
    title: subject,
    message: message,
    sound: true, // optionnel, pour jouer un son
    wait: true    // optionnel, pour attendre que l'utilisateur ferme la notification
  });
};

// Create new exam
const createExam = async (req, res) => {
  try {
    const { title, description, duration, passingScore, startDate, endDate, questions, totalPoints, isPublished, user } = req.body;

    const originalFile = req.file
      ? {
        name: req.file.originalname,
        path: req.file.filename,
        size: req.file.size,
        type: req.file.mimetype,
      }
      : null;

    const newExam = new Exam({
      title,
      description,
      duration,
      passingScore,
      startDate,
      endDate,
      questions,
      totalPoints,
      isPublished,
      user,
      originalFile,
    });

    // Sauvegarder l'examen
    await newExam.save();

    // Vérifier si l'examen commence dans 3 jours après la sauvegarde
    const examStartDate = moment(newExam.startDate); // Date de début de l'examen
    const threeDaysBefore = examStartDate.clone().subtract(3, 'days'); // 3 jours avant la date de début

    if (moment().isSame(threeDaysBefore, 'day')) {
      const subject = `Rappel : Un examen dans 3 jours !`;
      const message = `L'examen "${newExam.title}" commence le ${examStartDate.format('LL')}. Préparez-vous !`;

      // Fonction fictive pour envoyer la notification
      sendDesktopNotification(subject, message);
    }

    res.status(201).json(newExam);
  } catch (error) {
    console.error("Error creating exam:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// Update exam
const updateExam = async (req, res) => {
  try {
    const updatedExam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedExam) return res.status(404).json({ message: "Exam not found" });

    res.status(200).json(updatedExam);
  } catch (error) {
    console.error("Error updating exam:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete exam
const deleteExam = async (req, res) => {
  try {
    const { examId } = req.params; // Corrected from req.params.id to req.params.examId
    console.log("Exam ID received in backend:", examId); // Debugging

    const deletedExam = await Exam.findByIdAndDelete(examId);
    if (!deletedExam) return res.status(404).json({ message: "Exam not found" });

    res.status(200).json({ message: "Exam deleted successfully" });
  } catch (error) {
    console.error("Error deleting exam:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const publishExam = async (req, res) => {
  try {
    const { examId } = req.params;

    // Find the exam by ID
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    // Toggle the isPublished status
    exam.isPublished = !exam.isPublished;
    await exam.save();

    res.status(200).json({ message: `Exam ${exam.isPublished ? "published" : "hidden"} successfully`, exam });
  } catch (error) {
    console.error("Error updating exam status:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const duplicateExam = async (req, res) => {
  try {
    const { examId } = req.params;

    // Find the existing exam
    const originalExam = await Exam.findById(examId);
    if (!originalExam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    // Find how many copies exist already
    const copyCount = await Exam.countDocuments({ title: new RegExp(`^${originalExam.title} \\(Copy \\d+\\)$`, "i") });

    // Generate a new title with an incrementing copy number
    const newTitle = `${originalExam.title} (Copy ${copyCount + 1})`;

    // Create a new exam object with the same values
    const duplicatedExam = new Exam({
      title: newTitle,
      description: originalExam.description,
      totalPoints: originalExam.totalPoints,
      passingScore: originalExam.passingScore,
      duration: originalExam.duration,
      startDate: originalExam.startDate,
      endDate: originalExam.endDate,
      questions: originalExam.questions,
      createdBy: originalExam.createdBy,
    });

    // Save the duplicated exam
    await duplicatedExam.save();

    res.status(201).json({ message: "Exam duplicated successfully", duplicatedExam });
  } catch (error) {
    console.error("Error duplicating exam:", error);
    res.status(500).json({ message: "Failed to duplicate exam" });
  }
};


const exportAllExamResults = async (req, res) => {
  try {
    const exams = await Exam.find().populate("questions"); // Populate questions if needed

    if (!exams.length) {
      return res.status(404).json({ message: "No exams found" });
    }

    // Convert the exams data into CSV format
    const fields = ["title", "description", "totalPoints", "passingScore", "duration"];
    const json2csvParser = new Parser({ fields });
    const csvData = json2csvParser.parse(exams);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=all_exams_results.csv");
    res.status(200).send(csvData);
  } catch (error) {
    console.error("Error exporting all exam results:", error);
    res.status(500).json({ message: "Failed to export all exam results" });
  }
};
const assignExamsToCourse = async (req, res) => {
  try {
    const { courseId, examIds } = req.body;

    if (!courseId || !examIds || examIds.length === 0) {
      return res.status(400).json({ message: "Course ID and at least one exam ID are required." });
    }

    // Ensure course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found." });
    }

    // Ensure exams exist
    const exams = await Exam.find({ _id: { $in: examIds } });
    if (exams.length !== examIds.length) {
      return res.status(404).json({ message: "One or more exams not found." });
    }

    // Add exams to the course
    course.exams = [...new Set([...course.exams, ...examIds])]; // Avoid duplicates
    await course.save();

    res.status(200).json({ message: "Exams assigned successfully!", course });
  } catch (error) {
    console.error("Error assigning exams to course:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const getRandomExamFromCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Check if the course exists and populate the 'exams' field
    const course = await Course.findById(courseId).populate('exams');
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Filter the exams to only include those where isPublished = true
    const publishedExams = course.exams.filter(exam => exam.isPublished === true);

    // If there are published exams, select a random one
    if (publishedExams.length > 0) {
      const randomExam = publishedExams[Math.floor(Math.random() * publishedExams.length)];
      res.status(200).json(randomExam); // Send back the random published exam
    } else {
      return res.status(404).json({ message: "No published exams available for this course" });
    }
  } catch (error) {
    console.error("Error fetching random exam:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getuserattempts = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Fetch all exam attempts by the user
    const attempts = await Result.find({ user: userId }).populate("quiz");

    // If no attempts found, return an empty array
    if (!attempts || attempts.length === 0) {
      return res.json([]); // Returning an empty array instead of an error
    }

    // Format response data
    const formattedAttempts = attempts.map((attempt) => ({
      quizId: attempt.quiz?._id, // Corrected to use populated `quiz`
      quizTitle: attempt.quiz?.title || "Unknown Exam", // Corrected to use populated `quiz`
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
const handleSubmitExam = async (req, res) => {
  try {
    const { examId } = req.params;
    const { userId, answers } = req.body;  // Assuming answers is an array of user answers

    // Check if the exam exists
    const exam = await Exam.findById(examId).populate('questions.correctAnswer');
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    let score = 0;

    // Loop through the questions and compare answers
    exam.questions.forEach((question, index) => {
      const userAnswer = answers[index]; // User's answer for the current question
      const correctAnswer = question.correctAnswer;

      // Compare the answer (case-sensitive or case-insensitive based on your preference)
      if (userAnswer === correctAnswer) {
        score += question.points; // Add points for correct answer
      }
    });
    const results = calculateResults(exam, answers)
    // Create a new ExamResult entry with the calculated score
    const newExamResult = new ExamResult({
      user: userId,
      exam: examId,
      score,
      answers,
    });
    const attempt = new ExamAttempt({
      userId,
      examId,
      answers,
      results,
      submittedAt: new Date(),
    })

    await attempt.save()

    // Save the result
    await newExamResult.save();

    res.status(200).json({ message: "Exam submitted successfully", result: newExamResult });
  } catch (error) {
    console.error("Error submitting exam:", error);
    res.status(500).json({ message: "Error submitting exam" });
  }
};
function calculateResults(exam, answers) {
  const questions = exam.questions || []
  let correctCount = 0
  let incorrectCount = 0
  let score = 0
  let totalPoints = 0
  let unansweredCount = 0

  const questionResults = questions.map((question, index) => {
    const userAnswer = answers[index]

    // Skip scoring for essay questions
    if (question.type === "essay") {
      totalPoints += question.points || 1
      return {
        questionId: question._id,
        question: question.question,
        userAnswer,
        type: question.type,
        needsGrading: true,
        points: question.points || 1,
        earnedPoints: "Pending",
        options: question.options,
      }
    }

    // For short answer, we'll do a simple match
    let isCorrect = false
    if (question.type === "short_answer") {
      isCorrect = userAnswer && userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()
    } else {
      isCorrect = userAnswer === question.correctAnswer
    }

    if (!userAnswer && userAnswer !== false) {
      unansweredCount++
    } else if (isCorrect) {
      correctCount++
    } else {
      incorrectCount++
    }

    const points = question.points || 1
    totalPoints += points
    if (isCorrect) score += points

    return {
      questionId: question._id,
      question: question.question,
      userAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect,
      type: question.type,
      points: points,
      earnedPoints: isCorrect ? points : 0,
      options: question.options,
    }
  })

  const percentageScore = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0
  const passingScore = exam.passingScore || 60
  const passed = percentageScore >= passingScore

  return {
    score,
    totalPoints,
    percentageScore,
    correctCount,
    incorrectCount,
    unansweredCount,
    totalQuestions: questions.length,
    passed,
    passingScore,
    questionResults,
  }
}
const checkAttempt = async (req, res) => {
  try {
    const { courseId, userId } = req.params
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ error: "Course not found" })
    }
    const exams = await Exam.find({ _id: { $in: course.exams } })

    if (exams.length === 0) {
      return res.status(200).json({
        hasAttempted: false,
        message: "No exams available for this course.",
      })
    }
    const examIds = exams.map((exam) => exam._id)
    const attempt = await ExamAttempt.findOne({
      userId,
      examId: { $in: examIds },
    }).populate("examId")

    if (attempt) {
      const user = await User.findById(userId)
        .select('certificatesOwned')
        .populate({
          path: 'certificatesOwned.certificateId',
          model: 'Certificate',
          select: 'courseId'
        });

      const certificateForCourse = user.certificatesOwned.find(cert =>
        cert.certificateId && cert.certificateId.courseId.equals(courseId)
      );
      return res.status(200).json({
        hasAttempted: true,
        results: attempt.results,
        examId: attempt.examId,
        courseSlug: course.slug,
        certificateEarned: !!certificateForCourse,
      })
    }

    // User has not taken any exam for this course
    return res.status(200).json({
      hasAttempted: false,
    })
  } catch (error) {
    console.error("Error checking exam attempt:", error)
    res.status(500).json({ error: "Server error" })
  }
}


const checkstatus = async (req, res) => {
  try {
    const { courseId, userId } = req.params

    // Find the latest attempt for this user and course
    const attempt = await ExamAttempt.findOne({
      userId,
      courseId,
      passed: true, // Only find passed attempts
    }).sort({ createdAt: -1 }) // Get the most recent

    return res.json({
      hasPassed: !!attempt,
      attempt: attempt,
    })
  } catch (error) {
    console.error("Error checking exam status:", error)
    return res.status(500).json({ error: "Server error" })
  }
}


module.exports = {
  getExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
  publishExam,
  duplicateExam,
  exportAllExamResults,
  getExamss,
  assignExamsToCourse,
  getRandomExamFromCourse,
  getuserattempts,
  handleSubmitExam,
  checkAttempt,
  checkstatus,
  upload,
  getallExams
};
