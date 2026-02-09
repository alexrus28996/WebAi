/**
 * Provider interface contract.
 *
 * @typedef {Object} LinkedInPostRequest
 * @property {string} trendTitle
 * @property {string} trendSource
 * @property {Date|string} publishedAt
 * @property {string} niche
 * @property {string} audience
 * @property {string} tone
 * @property {string} angle
 * @property {string[]} avoidTopics
 * @property {string[]} avoidPhrases
 *
 * @typedef {Object} LinkedInPostResponse
 * @property {string} text
 * @property {{provider: 'mock'|'openai', model?: string, tokensUsed?: number}} meta
 */

/**
 * @interface
 */
class BaseProvider {
  /**
   * @param {LinkedInPostRequest} _payload
   * @returns {Promise<LinkedInPostResponse>}
   */
  async generateLinkedInPost(_payload) {
    throw new Error('generateLinkedInPost must be implemented by provider.');
  }
}

module.exports = BaseProvider;
