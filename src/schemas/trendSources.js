const { z } = require('zod');

const httpUrlSchema = z
  .string({ required_error: 'url is required.' })
  .url('url must be a valid URL.')
  .refine((value) => value.startsWith('http://') || value.startsWith('https://'), {
    message: 'url must start with http:// or https://.'
  });

const createTrendSourceSchema = z.object({
  name: z.string({ required_error: 'name is required.' }).min(1, 'name is required.'),
  url: httpUrlSchema,
  freshnessHours: z.number().int().positive().optional().default(48),
  enabled: z.boolean().optional().default(true)
});

const updateTrendSourceSchema = z
  .object({
    name: z.string().min(1, 'name is required.').optional(),
    url: httpUrlSchema.optional(),
    freshnessHours: z.number().int().positive().optional(),
    enabled: z.boolean().optional()
  })
  .strict();

module.exports = {
  createTrendSourceSchema,
  updateTrendSourceSchema
};
