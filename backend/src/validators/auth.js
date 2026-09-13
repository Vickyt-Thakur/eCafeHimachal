import { z } from 'zod';

const mobile = z.string().trim().regex(/^[0-9]{10}$/, 'Enter a valid 10-digit mobile number.');
const password = z.string().min(8, 'Password must be at least 8 characters.').max(72);

const customerFields = z.object({
  name: z.string().trim().min(2, 'Enter your full name.').max(100),
  mobile,
  email: z.string().trim().email('Enter a valid email address.').optional().or(z.literal('')),
  password,
  confirmPassword: z.string(),
});

const matchingPasswords = (schema) => schema.refine((data) => data.password === data.confirmPassword, { message: 'Passwords do not match.', path: ['confirmPassword'] });

export const customerRegistrationSchema = matchingPasswords(customerFields);

export const partnerRegistrationSchema = matchingPasswords(customerFields.extend({
  businessName: z.string().trim().min(2, 'Enter your cyber cafe or business name.').max(120),
  email: z.string().trim().email('Enter a valid email address.'),
  address: z.string().trim().min(5, 'Enter your address.').max(300),
  city: z.string().trim().min(2, 'Enter your city.').max(80),
  state: z.string().trim().min(2, 'Enter your state.').max(80),
}));

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, 'Enter your mobile number or email.'),
  password: z.string().min(1, 'Enter your password.'),
});
