import { z } from 'zod';

export const serviceSchema = z.object({
  name: z.string().trim().min(2, 'Service name is required.').max(100),
  description: z.string().trim().min(3, 'Short description is required.').max(180),
  category: z.string().trim().min(2).max(80).optional(),
  customerPrice: z.coerce.number().nonnegative('Customer price cannot be negative.'),
  partnerPrice: z.coerce.number().nonnegative('Partner price cannot be negative.'),
  icon: z.string().trim().max(40).optional(),
  isActive: z.boolean().optional(),
});
