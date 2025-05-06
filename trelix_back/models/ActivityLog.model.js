const mongoose = require("mongoose");

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
    },
    action: {
      type: String,
      required: true,
    },
    target: {
      type: String,
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "target",
      default: null,
    },
    solved: {
      type: Boolean,
      default: false,
    },
    reviews: [
      {
        reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        comment: { type: String },
        resolved: { type: Boolean, default: false },
        timestamp: { type: Date, default: Date.now },
      }
    ],
    technicalDetails: {
      status: {
        type: String,
        enum: ["SUCCESS", "FAILURE"],
        default: "SUCCESS",
        required: false,
      },
      method: {
        type: String,
        required: true,
      },
      endpoint: {
        type: String,
        required: true,
      },
    },
    advancedInfo: {
      type: mongoose.Schema.Types.Mixed,
      required: false,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);


const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
module.exports = ActivityLog;
