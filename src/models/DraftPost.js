const mongoose = require('mongoose');

const draftPostSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    trend: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trend',
      required: true
    },
    angle: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['draft'],
      default: 'draft'
    },
    scheduledFor: {
      type: Date
    },
    postedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('DraftPost', draftPostSchema);
