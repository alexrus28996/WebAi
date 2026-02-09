const BaseSchedulerProvider = require('./baseSchedulerProvider');

class MockSchedulerProvider extends BaseSchedulerProvider {
  constructor() {
    super();
    this.statusMap = new Map();
  }

  async schedulePost({ draftId }) {
    const externalId = `mock_${draftId}_${Date.now()}`;
    this.statusMap.set(externalId, 'queued');
    return { externalId, status: 'queued' };
  }

  async publishNow({ draftId }) {
    const externalId = `mock_${draftId}_${Date.now()}`;
    this.statusMap.set(externalId, 'posted');
    return { externalId, status: 'posted' };
  }

  async getStatus({ externalId }) {
    return { status: this.statusMap.get(externalId) || 'unknown' };
  }
}

module.exports = new MockSchedulerProvider();
