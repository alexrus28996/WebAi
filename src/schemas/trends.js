const { z } = require('zod');

const updateTrendStatusSchema = z.object({
  status: z.enum(['new', 'used', 'ignored'], {
    required_error: 'status is required.',
    invalid_type_error: 'status must be one of new, used, ignored.'
  })
});

module.exports = {
  updateTrendStatusSchema
};
