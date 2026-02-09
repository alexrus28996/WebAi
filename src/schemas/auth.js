const { z } = require('zod');

const signupSchema = z.object({
  name: z.string({ required_error: 'name is required.' }).min(1, 'name is required.'),
  email: z.string({ required_error: 'email is required.' }).email('email must be a valid email address.'),
  password: z.string({ required_error: 'password is required.' }).min(6, 'password must be at least 6 characters.'),
  workspaceName: z.string().min(1, 'workspaceName cannot be empty.').optional()
});

const loginSchema = z.object({
  email: z.string({ required_error: 'email is required.' }).email('email must be a valid email address.'),
  password: z.string({ required_error: 'password is required.' }).min(6, 'password must be at least 6 characters.')
});

module.exports = {
  signupSchema,
  loginSchema
};
