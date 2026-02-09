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
    meta: {
      angleUsed: {
        type: String
      },
      angleReused: {
        type: Boolean,
        default: false
      },
      generationDate: {
        type: String
      }
    },
    content: {
      type: String,
      required: true
    },
    aiMeta: {
      provider: {
        type: String
      },
      model: {
        type: String
      },
      tokensUsed: {
        type: Number
      }
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'posted'],
      default: 'draft'
    },
    similarityScore: {
      type: Number,
      default: 0
    },
    generationAttempts: {
      type: Number,
      default: 1
    },
    angleReused: {
      type: Boolean,
      default: false
    },
    forceAccepted: {
      type: Boolean,
      default: false
    },
    scheduledTime: {
      type: Date
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
