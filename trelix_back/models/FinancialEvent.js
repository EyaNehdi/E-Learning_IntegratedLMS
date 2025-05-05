const mongoose = require('mongoose');

const financialEventSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
        type: String,
        enum: ['balance_topup', 'purchase', 'refund', 'admin_adjustment'],
        required: true,
    },
    amount: { type: Number, required: true },
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    relatedObject: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'relatedModel',
    },
    relatedModel: {
        type: String,
        enum: ['Product', 'Course'],
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
    createdAt: { type: Date, default: Date.now },
});

const FinancialEvent = mongoose.model('FinancialEvent', financialEventSchema);
module.exports = FinancialEvent;
