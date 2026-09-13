import { Router } from 'express';
import { createService, deleteService, listAdminServices, listPublicServices, listServicesForUser, updateService } from '../controllers/serviceController.js';
import { allowRoles, requireAuth } from '../middleware/auth.js';

const router = Router();
router.get('/public', listPublicServices);
router.get('/mine', requireAuth, allowRoles('CUSTOMER', 'PARTNER'), listServicesForUser);
router.get('/admin', requireAuth, allowRoles('ADMIN'), listAdminServices);
router.post('/admin', requireAuth, allowRoles('ADMIN'), createService);
router.put('/admin/:id', requireAuth, allowRoles('ADMIN'), updateService);
router.delete('/admin/:id', requireAuth, allowRoles('ADMIN'), deleteService);

export default router;
