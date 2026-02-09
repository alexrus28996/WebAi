const mongoose = require('mongoose');

const trendSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true
    },
    url: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    source: {
      type: String,
      required: true
    },
    publishedAt: {
      type: Date,
      required: true
    },
    fetchedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['new', 'used', 'ignored'],
      default: 'new'
    },
    titleNormalized: {
      type: String,
      required: true
    },
    urlNormalized: {
      type: String,
      required: true
    },
    contentHash: {
      type: String
    }
  },
  { timestamps: true }
);

trendSchema.index({ workspaceId: 1, urlNormalized: 1 }, { unique: true });
trendSchema.index({ workspaceId: 1, titleNormalized: 1, publishedAt: 1 });

module.exports = mongoose.model('Trend', trendSchema);
