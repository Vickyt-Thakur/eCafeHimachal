import { Router } from 'express';
import { createPaymentOrder, verifyPayment } from '../controllers/paymentController.js';
import { allowRoles, requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, allowRoles('CUSTOMER', 'PARTNER'));
router.post('/create-order', createPaymentOrder);
router.post('/verify', verifyPayment);

export default router;
