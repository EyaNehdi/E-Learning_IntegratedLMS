const cron = require('node-cron')
const QuizLeaderboard = require ('../models/quizzLeaderboardModel.js');
const QuizLeaderboardAttempt = require('../models/quizzLeaderboardAttemptsModel.js');


// Declare io instance for emitting events
let io;

const initializeSocket = (_io) => {
    io = _io;  // Assign the io instance passed from app.js
  
    io.on('connection', (socket) => {
        console.log('A user connected');
        socket.emit('activeQuizUpdate', { message: 'Welcome to the quiz!' });
    
        socket.on('disconnect', () => {
            console.log('A user disconnected');
        });
    });
}
//admin adds quizzes
const addQuizz = async (req, res) => {
    try {
        const { title, questions } = req.body;

        // Validate the incoming data
        if (!title || !questions || questions.length === 0) {
            return res.status(400).json({ message: "Title and questions are required" });
        }

        // Create a new quiz instance
        const newQuiz = new QuizLeaderboard({
            title,
            questions,
            date: new Date().toISOString().split('T')[0], // Setting the current date as quiz date (YYYY-MM-DD)
            isActive: false, // Default state can be inactive until admin activates it
        });

        // Save the quiz to the database
        await newQuiz.save();

        res.status(201).json({ message: "Quiz added successfully", quiz: newQuiz });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error adding quiz", error: err.message });
    }
}
//shuffle random quizz for today :
async function shuffleQuiz() {
    try {
            // Deactivate all quizzes before selecting one
            await QuizLeaderboard.updateMany({}, { $set: { isActive: false } });
            // Fetch all quizzes 
        const quizzes = await QuizLeaderboard.find({});
        if (quizzes.length === 0) {
            console.log("No quizzes found...");
        } else {

            // Select a random quiz to activate
            const randomIndex = Math.floor(Math.random() * quizzes.length);
            const selectedQuiz = quizzes[randomIndex];

            // Set the selected quiz as active
            selectedQuiz.isActive = true;
            // Set the quiz activation time (next minute)
        const now = new Date();
        now.setMinutes(now.getMinutes() + 1); // Next minute
        now.setSeconds(0, 0);
        selectedQuiz.nextResetTime = now; // Store this in DB
            await selectedQuiz.save();

            console.log(`All quizzes have been deactivated. Quiz titled "${selectedQuiz.title}" is now active!`);
      // Emit the updated quiz data to the front-end
      if (io) {
        io.emit('activeQuizUpdate', {
            title: selectedQuiz.title,
            nextResetTime: selectedQuiz.nextResetTime
        });

        // Emit timer updates every second until reset time
        const interval = setInterval(() => {
            const timeLeft = Math.max((new Date(selectedQuiz.nextResetTime).getTime() - Date.now()) / 1000, 0);
            io.emit('timerUpdate', { timeLeft });

            if (timeLeft <= 0) {
                clearInterval(interval);
            }
        }, 1000);
    }
}
        } catch (err) {
        console.error("Error shuffling quiz:", err);
    }
}
//get active quizz
const activeQuizz = async (req, res) => {
    console.log('Fetching active quiz...');
    try {
      const now = new Date();
      const currentMinute = now.getMinutes(); // Get current minute
      const today = now.toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
  
      // Find the quiz that's active for today
      const activeQuiz = await QuizLeaderboard.findOne({ isActive: true });
  
      if (!activeQuiz) {
        return res.status(404).json({ message: 'No active quiz for today.' });
      }
  
      res.json({
        quiz: activeQuiz,
        nextResetTime: activeQuiz.nextResetTime, // Send reset time to frontend
    });
   // Emit the quiz and countdown to all clients
   if (io) {
    io.emit('activeQuizUpdate', {
        title: activeQuiz.title, // Changed from selectedQuiz to activeQuiz
        nextResetTime: activeQuiz.nextResetTime
    });

    // Emit timer updates every second until reset time
    const interval = setInterval(() => {
        const timeLeft = Math.max((new Date(activeQuiz.nextResetTime).getTime() - Date.now()) / 1000, 0);
        io.emit('timerUpdate', { timeLeft });

        // Stop emitting when the time is up
        if (timeLeft <= 0) {
            clearInterval(interval);
        }
    }, 1000);
  }
} catch (err) {
      console.error('Error fetching active quiz:', err);
      res.status(500).json({ message: 'Error fetching active quiz' });
    }
  }
//Check User Attempt
const checkUserAttempt = async (req, res) => {
    console.log("Request received for quiz attempt check:", req.params.quizId);
    try {
        const userId = req.userId; 
        console.log(userId);
        const quizId = req.params.quizId;
        console.log(quizId);

        const attempt = await QuizLeaderboardAttempt.findOne({ userId, quizId });

        // If attempt exists, check if it has passed or not
        if (attempt) {
            return res.json({ attempted: true, passed: attempt.passed });
        } else {
            return res.json({ attempted: false });
        }
    } catch (error) {
        res.status(500).json({ message: "Error checking quiz attempt." });
    }
};
// fetch active quizz questions :
const activeQuizQuestions = async (req, res) => {
    try {
        // const activeQuiz = await activeQuiz().activeQuiz.populate("questions");
        const activeQuiz = await QuizLeaderboard.findOne({ isActive: true }).populate("questions");
        if (!activeQuiz) {
            return res.status(404).json({ message: "No active quiz found" });
        }
        res.json({ questions: activeQuiz.questions, quizId: activeQuiz._id });
    } catch (error) {
        console.error("Error fetching active quiz questions:", error);
        res.status(500).json({ message: "Server error" });
    }
}
//Submit quizz
const submitQuiz = async (req, res) => {
    try {
        const { quizId, score, passed } = req.body;
        const userId = req.user._id;

        // 1. Check if the user has already passed the quiz (before they even attempt)
        const existingPassedAttempt = await QuizLeaderboardAttempt.findOne({ userId, quizId, passed: true });
        if (existingPassedAttempt) {
            return res.status(400).json({ message: "You have already passed this quiz!" });
        }

        // 2. Check if the user has already attempted this quiz (whether passed or not)
        const existingAttempt = await QuizLeaderboardAttempt.findOne({ userId, quizId });
        if (existingAttempt) {
            return res.status(400).json({ message: "You have already attempted this quiz." });
        }

        // 3. Save the new attempt, whether they pass or not
        const newAttempt = new QuizLeaderboardAttempt({
            userId,
            quizId,
            score,
            completed: true,
            passed
        });

        await newAttempt.save();
        res.json({ message: "Quiz submitted successfully!", attempt: newAttempt });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error submitting quiz." });
    }
}

//daily task 
const task = cron.schedule('* * * * *', () => {
    console.log("Running cron job to shuffle quiz...");

    // Check the time and log when the job is triggered
    const now = new Date();
    console.log(`Cron job triggered at: ${now.toISOString()}`);
    shuffleQuiz();
});
task.start(); // Start the cron job once, outside the function
console.log("Cron job started...");
module.exports = { shuffleQuiz,
    addQuizz,
    activeQuizz,
    initializeSocket,
    checkUserAttempt,
    activeQuizQuestions,
    submitQuiz
 };
