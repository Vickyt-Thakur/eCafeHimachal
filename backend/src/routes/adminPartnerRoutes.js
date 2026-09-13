import { Router } from 'express';
import { listPartners, updatePartnerStatus } from '../controllers/adminPartnerController.js';
import { allowRoles, requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, allowRoles('ADMIN'));
router.get('/partners', listPartners);
router.patch('/partners/:id/status', updatePartnerStatus);

export default router;
