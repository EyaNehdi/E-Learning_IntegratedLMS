const Exam = require("../models/ExamModel");
const multer = require("multer");
const path = require("path");
const { Parser } = require("json2csv");

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


// Get exam by ID
const getExamById = async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam) return res.status(404).json({ message: "Exam not found" });

        res.status(200).json(exam);
    } catch (error) {
        console.error("Error fetching exam:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Create new exam
const createExam = async (req, res) => {
    try {
        const { title, description, duration, passingScore, startDate, endDate, questions, totalPoints, isPublished } = req.body;
        
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
            originalFile,
        });

        await newExam.save();
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


module.exports = {
    getExams,
    getExamById,
    createExam,
    updateExam,
    deleteExam,
    publishExam,
    duplicateExam,
    exportAllExamResults,
    upload
};
