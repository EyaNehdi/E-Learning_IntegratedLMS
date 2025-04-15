const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const badgeSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, default: "" },
    image: { type: String, default: null },
    triggerType: {
        type: String,
        enum: [
            'certificatesOwned',
            'completedChapters',
            'totalScore',
            'mfaEnabled',
            'role'
        ],
        required: true
    },
    triggerCondition: {
        type: String,
        enum: [
            '>',
            '===',
            '!=',
        ],
        required: true
    },
    conditionValue: mongoose.Schema.Types.Mixed,
},
    { timestamps: true });

module.exports = mongoose.model('Badge', badgeSchema);