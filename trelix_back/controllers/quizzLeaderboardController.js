const Quiz = require ('../models/quizzLeaderboardModel.js');
// Admin adds a new quiz
const addQuizz = async (req, res) => {
    try {
        const { title, questions } = req.body;

        const newQuiz = new Quiz({ title, questions });
        await newQuiz.save();

        res.status(201).json({ message: "Quiz added successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//user fetches the daily quizz
const getDailyQuizz = async (req, res) => {
    const quiz = await Quiz.findOne({ isActive: true });

    if (!quiz) {
        return res.status(404).json({ message: "No quiz available today" });
    }

    res.json(quiz);
};

//fetch scores on leaderboard 
const getScoresLeaderBoard = async (req,res) =>{
    const today = new Date().toISOString().split("T")[0];

    const leaderboard = await UserAttempt.aggregate([
        { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
        { $unwind: "$user" },
        { $match: { quizId: today } },
        { $group: { _id: "$userId", name: { $first: "$user.name" }, totalScore: { $sum: "$score" } } },
        { $sort: { totalScore: -1 } },
        { $limit: 10 }
    ]);

    res.json(leaderboard);
}


//daily task 
cron.schedule("0 0 * * *", async () => {
    try {
        // Find all quizzes
        const allQuizzes = await Quiz.find({});
        if (allQuizzes.length === 0) {
            console.log("No quizzes available.");
            return;
        }

        // shuffle
        const randomQuiz = allQuizzes[Math.floor(Math.random() * allQuizzes.length)];

        // Deactivate any previous active quiz
        await Quiz.updateMany({}, { isActive: false });

        // Activate the selected quiz
        await Quiz.findByIdAndUpdate(randomQuiz._id, { isActive: true });

        console.log(`Today's quiz is: ${randomQuiz.title}`);
    } catch (error) {
        console.error("Error in cron job:", error);
    }
});

module.exports = { addQuizz,
    getDailyQuizz,
    getScoresLeaderBoard
 };
