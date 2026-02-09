const mongoose = require('mongoose');

const schedulerConnectionSchema = new mongoose.Schema(
  {
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true
    },
    provider: {
      type: String,
      default: 'mock-provider'
    },
    status: {
      type: String,
      enum: ['connected', 'disconnected'],
      default: 'disconnected'
    },
    metadata: {
      type: Object,
      default: {}
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SchedulerConnection', schedulerConnectionSchema);
