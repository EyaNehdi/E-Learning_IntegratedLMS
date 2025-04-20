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
        const logs = await ActivityLog.find()
            .sort({ createdAt: -1 })
            .limit(limit)
            .populate('user', '_id firstName lastName')
            .lean();
        console.log(logs);

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
        console.log("Students : ",count);
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
            .select("firstName lastName email role isActive accountCreatedAt");
        res.status(200).json(instructors);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};


module.exports = { getUsers,
     getUserById, 
     createUser,
      updateUser,
       deleteUser,
        getAuditLogs,
         archiveUser,
          unarchiveUser,
           countStudents ,
countInstructors,
getInstructors
 };