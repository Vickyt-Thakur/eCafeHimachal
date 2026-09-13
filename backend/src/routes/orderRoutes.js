import { Router } from 'express';
import { createOrder, getAdminOrder, getMyOrder, listAdminOrders, listMyOrders, updateAdminOrderStatus } from '../controllers/orderController.js';
import { allowRoles, requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);
router.post('/', allowRoles('CUSTOMER', 'PARTNER'), createOrder);
router.get('/mine', allowRoles('CUSTOMER', 'PARTNER'), listMyOrders);
router.get('/mine/:id', allowRoles('CUSTOMER', 'PARTNER'), getMyOrder);
router.get('/admin/all', allowRoles('ADMIN'), listAdminOrders);
router.get('/admin/:id', allowRoles('ADMIN'), getAdminOrder);
router.patch('/admin/:id/status', allowRoles('ADMIN'), updateAdminOrderStatus);

export default router;
