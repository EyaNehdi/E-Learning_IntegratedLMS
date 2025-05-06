const Badge = require('../models/Badge');
const fs = require('fs');
const path = require('path');

const createBadge = async (req, res) => {
    try {
        const { name, description, triggerType, triggerCondition, conditionValue } = req.body;

        let imagePath = null;
        if (req.file) {
            imagePath = `/uploads/badges/${req.file.filename}`;
        }

        const badge = new Badge({
            name,
            description,
            image: imagePath,
            triggerType,
            triggerCondition,
            conditionValue
        });

        await badge.save();

        res.status(201).json(badge);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

const getAllBadges = async (req, res) => {
    try {
        const badges = await Badge.find();
        res.status(200).json(badges);
    } catch (error) {
        console.error("Error fetching badges", error);
        res.status(500).json({ message: "server error" });
    }
};

const updateBadge = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        let imagePath = null;

        if (req.file) {
            const badge = await Badge.findById(id);
            if (badge.image) {
                const oldImagePath = path.join(__dirname, '..', badge.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            imagePath = `/uploads/badges/${req.file.filename}`;
            updates.image = imagePath;
        }

        const updatedBadge = await Badge.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        );

        if (!updatedBadge) {
            return res.status(404).json({ message: 'Badge not found' });
        }

        res.status(200).json(updatedBadge);
    } catch (error) {
        console.error("Error updating badge", error);
        res.status(500).json({ message: "Server error" });
    }
};

const deleteBadge = async (req, res) => {
    try {
        const { id } = req.params;
        const badge = await Badge.findById(id);

        if (!badge) {
            return res.status(404).json({ message: 'Badge not found' });
        }

        if (badge.image) {
            const imagePath = path.join(__dirname, '..', badge.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await Badge.findByIdAndDelete(id);
        res.status(200).json({ message: 'Badge deleted successfully' });
    } catch (error) {
        console.error("Error deleting badge", error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { createBadge, getAllBadges, updateBadge, deleteBadge }