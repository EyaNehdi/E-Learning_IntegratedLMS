const User = require('../models/userModel');

const getUsers = async (req, res) => {
    try {
        const users = await User.find().select("firstName lastName email role");
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("firstName lastName email role");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
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
        const user = await User.findByIdAndUpdate(req.params.id,req.body,{new:true});
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
module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser };