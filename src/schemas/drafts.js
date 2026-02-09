const { z } = require('zod');

const generateDraftSchema = z.object({
  trendId: z.string({ required_error: 'trendId is required.' }).min(1, 'trendId is required.'),
  angle: z.string({ required_error: 'angle is required.' }).min(1, 'angle is required.')
});

module.exports = {
  generateDraftSchema
};
