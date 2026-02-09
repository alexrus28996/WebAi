const { z } = require('zod');

const createRuleSchema = z.object({
  niche: z.string({ required_error: 'niche is required.' }).min(1, 'niche is required.'),
  audience: z.string({ required_error: 'audience is required.' }).min(1, 'audience is required.'),
  tone: z.string({ required_error: 'tone is required.' }).min(1, 'tone is required.'),
  frequency: z.string({ required_error: 'frequency is required.' }).min(1, 'frequency is required.'),
  preferredTime: z.string({ required_error: 'preferredTime is required.' }).min(1, 'preferredTime is required.'),
  autoGenerate: z.boolean({ required_error: 'autoGenerate is required.' })
});

module.exports = {
  createRuleSchema
};
