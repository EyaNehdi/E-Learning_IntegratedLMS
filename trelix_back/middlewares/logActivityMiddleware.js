const ActivityLog = require("../models/ActivityLog.model");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const socket = require('../utils/socket');

const logActivity = async (req, action, target, targetId, technicalDetails) => {
    try {
        const log = new ActivityLog({
            user: req.actingUser ? req.actingUser.id : null,
            action,
            target,
            targetId,
            solved: false,
            reviews: [],
            technicalDetails: {
                endpoint: req.originalUrl,
                method: req.method,
                status: technicalDetails.status || "SUCCESS",
            },
            advancedInfo: {},
        });

        const savedLog = await log.save();
        const populatedLog = await ActivityLog.findById(savedLog._id).populate('user');
        if (target === 'Auth') {
            socket.emitNewLoginUser({
                action,
                user: req.actingUser,
                timestamp: new Date(),
            });
        }
        socket.emitNewLog(populatedLog);
    } catch (err) {
        console.error('Error logging activity:', err);
    }
};

const logActivityMiddleware = (action, target, targetId = null, advancedInfo = {}) => {
    return (req, res, next) => {
        const startTime = Date.now();

        res.on('finish', async () => {
            const status = res.statusCode >= 400 ? 'FAILURE' : 'SUCCESS';
            if (target === 'Auth') {
                if (!res.locals.fullyLoggedIn || !req.actingUser || status !== 'SUCCESS') {
                    return;
                }
            }
            const responseMessage = res.responseBody?.message || res.responseBody?.error || null;
            let finalTargetId = targetId;

            if (!finalTargetId && res.body) {
                try {
                    const responseData = typeof res.body === 'string'
                        ? JSON.parse(res.body)
                        : res.body;
                    finalTargetId = responseData?._id || responseData?.id || null;
                } catch (e) {
                    // Ignore parsing errors
                }
            }

            await logActivity(
                req,
                action,
                target,
                finalTargetId,
                {
                    status,
                    advancedInfo: {
                        responseStatus: res.statusCode,
                        durationMs: Date.now() - startTime,
                        message: responseMessage,
                        ...advancedInfo,
                    },
                }
            );
        });

        const originalJson = res.json;
        const originalSend = res.send;

        res.json = function (body) {
            res.body = body;
            return originalJson.call(this, body);
        };

        res.send = function (body) {
            res.body = body;
            return originalSend.call(this, body);
        };

        next();
    };
};

const identifyActingUser = async (req, res, next) => {
    const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];

    if (!token) {
        req.actingUser = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('_id firstName lastName');

        req.actingUser = user ? {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
        } : null;
    } catch (error) {
        req.actingUser = null;
    }
    next();
};

module.exports = { logActivityMiddleware, identifyActingUser };
