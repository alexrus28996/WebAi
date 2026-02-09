const mongoose = require('mongoose');

const postingRulesSchema = new mongoose.Schema(
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
    niche: {
      type: String,
      required: true
    },
    audience: {
      type: String,
      required: true
    },
    tone: {
      type: String,
      required: true
    },
    frequency: {
      type: String,
      required: true
    },
    timeWindow: {
      type: String,
      required: true
    },
    autoPublish: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('PostingRules', postingRulesSchema);
