const ActivityLog = require("../models/ActivityLog.model");

let io = null;

const initSocket = (socketInstance) => {
    io = socketInstance;

    io.on('connection', (socket) => {
        socket.on('add-review', async ({ logId, comment, reviewer }) => {
            try {
                const newReview = {
                    reviewer,
                    comment,
                    resolved: false,
                    timestamp: new Date(),
                };

                const updatedLog = await ActivityLog.findByIdAndUpdate(
                    logId,
                    { $push: { reviews: newReview } },
                    { new: true }
                ).populate('reviews.reviewer', 'firstName lastName');

                if (updatedLog) {
                    const latestReview = updatedLog.reviews[updatedLog.reviews.length - 1];
                    emitNewReview(logId, latestReview);
                }
            } catch (err) {
                console.error('Error in add-review socket handler:', err);
            }
        });

        // Handle resolving a log
        socket.on('resolve-log', async ({ logId }) => {
            try {
                const updatedLog = await ActivityLog.findByIdAndUpdate(
                    logId,
                    { solved: true },
                    { new: true }
                );

                if (updatedLog) {
                    emitLogSolved(logId);
                }
            } catch (err) {
                console.error('Error in resolve-log socket handler:', err);
            }
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });
};

const emitNewLog = (logData) => {
    if (io) {
        io.emit('new-audit-log', logData);
    }
};

const emitNewLoginUser = (logData) => {
    if (io) {
        io.emit('userEvent', logData);
    }
}

const emitNewReview = (logId, newReview) => {
    if (io) {
        io.emit('new-review', { logId, newReview });
    }
};

const emitLogSolved = (logId) => {
    if (io) {
        console.log("all done and clear");

        io.emit('log-solved', { logId });
    }
};

const emitEngagementSummary = (summary) => {
    if (io) {
        io.emit('engagementUpdate', {
            type: 'engagement',
            message: `${summary.updatedCount} users had engagement status updates`,
            timestamp: new Date(),
            details: {
                updatedUsers: summary.updatedUsers,
                timestamp: summary.timestamp
            }
        });
    }
};

module.exports = {
    initSocket,
    emitNewLog,
    emitNewReview,
    emitLogSolved,
    emitNewLoginUser,
    emitEngagementSummary
};
