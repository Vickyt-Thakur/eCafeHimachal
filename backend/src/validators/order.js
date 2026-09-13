import { z } from 'zod';
import { ORDER_STATUSES } from '../models/Order.js';

export const createOrderSchema = z.object({ serviceId: z.string().regex(/^[a-f\d]{24}$/i, 'Select a valid service.') });
export const updateOrderStatusSchema = z.object({ status: z.enum(ORDER_STATUSES), adminNote: z.string().trim().max(1000).optional() });
