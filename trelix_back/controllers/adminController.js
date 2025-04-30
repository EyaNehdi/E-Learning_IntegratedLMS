const ActivityLog = require('../models/ActivityLog.model');
const User = require('../models/userModel');

const getUsers = async (req, res) => {
    try {
        const users = await User.find().select("firstName lastName email role isActive accountCreatedAt");
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

const getUserById = async (req, res) => {
    try {
        const { id } = req.params; // Extracting ID from request params

        if (!id) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const user = await User.findById(id).select("firstName lastName email role skils profilePhoto Bio");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

const createUser = async (req, res) => {
    try {
        const user = await User.create(req.body);
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
const updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(user);
    }
    catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "User deleted" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

const getAuditLogs = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const logs = await ActivityLog.find({ target: { $ne: 'Auth' } })
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('user', '_id firstName lastName')
            .lean();

        res.status(200).json(logs);
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({
            error: 'Failed to fetch audit logs',
        });
    }
}

const archiveUser = async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await User.findByIdAndUpdate(userId, { isActive: false }, { new: true });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({
            message: "User archived successfully",
            user,
        });
    } catch (error) {
        console.error("Error archiving user:", error);
        res.status(500).json({ message: "Failed to archive user" });
    }
}

const unarchiveUser = async (req, res) => {
    const userId = req.params.id;
    try {
        const user = await User.findByIdAndUpdate(userId, { isActive: true }, { new: true });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({
            message: "User unarchived successfully",
            user,
        });
    } catch (error) {
        console.error("Error unarchiving user:", error);
        res.status(500).json({ message: "Failed to unarchive user" });
    }
};

const countStudents = async (req, res) => {
    try {
        const count = await User.countDocuments({ role: "student" });
        console.log("Students : ", count);
        res.status(200).json({ count });
    } catch (error) {
        console.error("Error counting students:", error);
        res.status(500).json({ message: "Server error" });
    }
};
const countInstructors = async (req, res) => {
    try {
        const count = await User.countDocuments({ role: "instructor" });
        res.status(200).json({ count });
    } catch (error) {
        console.error("Error counting instructors:", error);
        res.status(500).json({ message: "Server error" });
    }
}
const getInstructors = async (req, res) => {
    try {
        const instructors = await User.find({ role: "instructor" })
            .select("firstName lastName email role isActive accountCreatedAt skils profilePhoto Bio");
        res.status(200).json(instructors);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

// In your user routes file
const UserStats = async (req, res) => {
    try {
        const total = await User.countDocuments();
        const students = await User.countDocuments({ role: 'student' });
        const instructors = await User.countDocuments({ role: 'instructor' });
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const previousTotal = await User.countDocuments({
            accountCreatedAt: { $lt: oneWeekAgo }
        });

        const growth = total - previousTotal;
        const growthPercentage = previousTotal > 0
            ? ((growth / previousTotal) * 100).toFixed(1)
            : 100;
        return res.json({
            total,
            students,
            instructors,
            growth,
            growthPercentage
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching user stats' });
    }
};

const RegistrationStats = async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        const result = await User.aggregate([
            {
                $match: {
                    accountCreatedAt: { $gte: startDate },
                    role: { $in: ["student", "instructor"] }
                }
            },
            {
                $project: {
                    date: {
                        $dateToString: { format: "%Y-%m-%d", date: "$accountCreatedAt" }
                    },
                    role: 1
                }
            },
            {
                $group: {
                    _id: "$date",
                    count: { $sum: 1 },
                    roles: {
                        $push: "$role"
                    }
                }
            },
            {
                $addFields: {
                    roles: {
                        student: { $size: { $filter: { input: "$roles", as: "role", cond: { $eq: ["$$role", "student"] } } } },
                        instructor: { $size: { $filter: { input: "$roles", as: "role", cond: { $eq: ["$$role", "instructor"] } } } }
                    }
                }
            },
            {
                $sort: { "_id": 1 }
            },
            {
                $project: {
                    date: "$_id",
                    count: 1,
                    roles: 1,
                    _id: 0
                }
            }
        ]);

        res.json(result);
    } catch (error) {
        console.error("Error fetching registration trends:", error);
        res.status(500).json({ message: "Error fetching registration trends" });
    }
};


module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getAuditLogs,
    archiveUser,
    unarchiveUser,
    countStudents,
    countInstructors,
    getInstructors,
    UserStats,
    RegistrationStats
};