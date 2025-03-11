const Chapter = require("../models/chapterModels");
const Course = require("../models/course");
const multer = require("multer");
const path = require("path");

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


// Get all chapters
const getChapters = async (req, res) => {
    try {
        // Fetching all chapters from the database
        const chapters = await Chapter.find();

        // Sending response with the fetched chapters
        res.status(200).json(chapters);
    } catch (error) {
        console.error("Error fetching chapters:", error); // Log error for debugging
        res.status(500).json({ message: "Server error" });
    }
};


// Create a new chapter
const createChapter = async (req, res) => {
    try {
        console.log("Received files:", req.files); // Debugging purpose

        const { title, description, courseId, userid } = req.body;
        
        if (!title || !userid) {
            return res.status(400).json({ message: "Title and userId are required" });
        }

        const pdfPath = req.files?.pdf ? `/uploads/${req.files.pdf[0].filename}` : null;
        const videoPath = req.files?.video ? `/uploads/${req.files.video[0].filename}` : null;
    

        const chapter = new Chapter({
            title,
            description,
            courseId,
            pdf: pdfPath,
            video: videoPath,
            userid,
        });

        await chapter.save();
        res.status(201).json(chapter);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Update a chapter
const updateChapter = async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title) {
            return res.status(400).json({ message: "Title is required" });
        }

        const chapter = await Chapter.findByIdAndUpdate(req.params.id, {
            title,
            description
        }, { new: true });

        if (!chapter) {
            return res.status(404).json({ message: "Chapter not found" });
        }

        res.status(200).json(chapter);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
const assignChapters = async (req, res) => {
    try {
        const { courseId, chapters } = req.body;

        if (!courseId || !chapters || chapters.length === 0) {
            return res.status(400).json({ message: "Course ID and chapters are required" });
        }

        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Update the course document by adding selected chapters
        course.chapters = [...new Set([...course.chapters, ...chapters])]; // Avoid duplicate chapters
        await course.save();

        res.status(200).json({ message: "Chapters assigned successfully", course });
    } catch (error) {
        console.error("Error in assignChapters:", error);
        res.status(500).json({ message: "Server error" });
    }
};
const getChaptersByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        // Check if the course exists
        const course = await Course.findById(courseId).populate('chapters'); 
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Send back only the chapters from this course
        res.status(200).json({ chapters: course.chapters });
    } catch (error) {
        console.error("Error fetching chapters:", error);
        res.status(500).json({ message: "Server error" });
    }
};


// Delete a chapter
const deleteChapter = async (req, res) => {
    const { id } = req.params; // Get the chapter ID from the URL
  
    try {
      const chapter = await Chapter.findByIdAndDelete(id); // Delete chapter by ID
  
      if (!chapter) {
        return res.status(404).json({ message: "Chapter not found" });
      }
  
      res.status(200).json({ message: "Chapter deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting chapter" });
    }
  };

module.exports = { getChapters,upload, createChapter, updateChapter, deleteChapter ,assignChapters ,getChaptersByCourse};