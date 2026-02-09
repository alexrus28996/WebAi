const mongoose = require('mongoose');

const scheduledPostSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true
    },
    draftId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DraftPost',
      required: true
    },
    scheduledTime: {
      type: Date,
      required: true
    },
    provider: {
      type: String,
      default: 'mock'
    },
    externalId: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: ['queued', 'posted', 'failed'],
      default: 'queued'
    },
    attempts: {
      type: Number,
      default: 0
    },
    lastError: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

scheduledPostSchema.index({ workspaceId: 1, draftId: 1 }, { unique: true });

module.exports = mongoose.model('ScheduledPost', scheduledPostSchema);
