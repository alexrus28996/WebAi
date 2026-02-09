class BaseSchedulerProvider {
  /**
   * Schedule a post for later publishing.
   * @param {Object} payload
   * @param {string} payload.workspaceId
   * @param {string} payload.draftId
   * @param {string} payload.text
   * @param {Date} payload.scheduledTime
   * @returns {Promise<{externalId: string, status: string}>}
   */
  async schedulePost({ workspaceId, draftId, text, scheduledTime }) {
    throw new Error('schedulePost not implemented.');
  }

  /**
   * Publish a post immediately.
   * @param {Object} payload
   * @param {string} payload.workspaceId
   * @param {string} payload.draftId
   * @param {string} payload.text
   * @returns {Promise<{externalId: string, status: string}>}
   */
  async publishNow({ workspaceId, draftId, text }) {
    throw new Error('publishNow not implemented.');
  }

  /**
   * Get the provider status for a scheduled post.
   * @param {Object} payload
   * @param {string} payload.externalId
   * @returns {Promise<{status: string}>}
   */
  async getStatus({ externalId }) {
    throw new Error('getStatus not implemented.');
  }
}

module.exports = BaseSchedulerProvider;
