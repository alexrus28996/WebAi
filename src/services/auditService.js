const AuditLog = require('../models/AuditLog');

const logAuditEvent = async (payload) => {
  try {
    await AuditLog.create(payload);
  } catch (error) {
    console.error('Audit log failure:', error);
  }
};

module.exports = {
  logAuditEvent
};
