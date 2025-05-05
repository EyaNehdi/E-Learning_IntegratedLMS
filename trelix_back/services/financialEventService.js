const FinancialEvent = require('../models/FinancialEvent');
const User = require('../models/userModel');
const socket = require('../utils/socket');

async function recordFinancialEvent({
    userId,
    type,
    amount,
    relatedObject = null,
    relatedModel = null,
    metadata = {},
}) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const balanceBefore = user.balance - amount;
    const balanceAfter = user.balance;

    const event = new FinancialEvent({
        user: userId,
        type,
        amount,
        balanceBefore,
        balanceAfter,
        relatedObject,
        relatedModel,
        metadata,
    });

    await event.save();

    socket.emitNewFinancialEvent({
        userId,
        type,
        amount,
        balanceBefore,
        balanceAfter,
        createdAt: event.createdAt,
    });

    return event;
}

module.exports = { recordFinancialEvent };
