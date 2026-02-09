const mongoose = require('mongoose');

const trendSourceSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    enabled: {
      type: Boolean,
      default: true
    },
    freshnessHours: {
      type: Number,
      default: 48
    },
    lastFetchedAt: {
      type: Date,
      default: null
    },
    lastError: {
      type: String,
      default: null
    },
    lastErrorAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('TrendSource', trendSourceSchema);
