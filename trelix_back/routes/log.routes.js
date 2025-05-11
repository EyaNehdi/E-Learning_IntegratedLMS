const ActivityLog = require('../models/ActivityLog.model');
const express = require('express');
const { emitLogSolved, emitNewReview } = require('../utils/socket');
const router = express.Router();

router.get('/thread/:id',
    async (req, res) => {
        try {
            const { id } = req.params;
            const log = await ActivityLog.findById(id).populate('reviews.reviewer', 'firstName lastName');
            const thread = log.reviews;
            res.status(200).json(thread);
        } catch (error) {
            console.error('Error fetching log thread:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

router.get('/recent-logins', async (req, res) => {
    try {
        const recentLogins = await ActivityLog.aggregate([
            { $match: { action: "login" } },
            { $sort: { createdAt: -1 } }, // latest first
            {
                $group: {
                    _id: "$user",
                    lastLogin: { $first: "$createdAt" },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userDetails",
                },
            },
            { $unwind: "$userDetails" },
            {
                $project: {
                    _id: 0,
                    action: { $literal: "login" },
                    timestamp: "$lastLogin",
                    user: {
                        id: "$userDetails._id",
                        firstName: "$userDetails.firstName",
                        lastName: "$userDetails.lastName",
                        role: "$userDetails.role"
                    }
                },
            },
            { $sort: { timestamp: -1 } },
            { $limit: 20 },
        ]);

        res.json(recentLogins);
    } catch (err) {
        console.error("Error fetching recent logins:", err);
        res.status(500).json({ error: "Failed to fetch recent logins" });
    }
});


module.exports = router;