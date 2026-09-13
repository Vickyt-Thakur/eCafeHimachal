import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid order reference.');
export const createPaymentSchema = z.object({ orderId: objectId });
export const verifyPaymentSchema = z.object({
  orderId: objectId,
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});
