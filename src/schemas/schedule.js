const { z } = require('zod');

const scheduleCreateSchema = z.object({
  draftId: z.string({ required_error: 'draftId is required.' }).min(1, 'draftId is required.'),
  scheduledTime: z
    .string({ required_error: 'scheduledTime is required.' })
    .min(1, 'scheduledTime is required.')
    .refine((value) => !Number.isNaN(Date.parse(value)), {
      message: 'scheduledTime must be a valid ISO string.'
    })
});

module.exports = {
  scheduleCreateSchema
};
