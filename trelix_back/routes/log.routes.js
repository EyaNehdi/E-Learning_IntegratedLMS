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

module.exports = router;