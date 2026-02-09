const mongoose = require('mongoose');

const trendSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    source: {
      type: String,
      default: 'mock'
    },
    score: {
      type: Number,
      default: 0
    },
    fetchedAt: {
      type: Date,
      default: Date.now
    },
    publishedAt: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['new'],
      default: 'new'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Trend', trendSchema);
