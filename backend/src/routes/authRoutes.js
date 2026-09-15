import { Router } from 'express';
import { login, loginAdmin, loginCustomer, loginPartner, logout, me, registerCustomer, registerPartner } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/register/customer', registerCustomer);
router.post('/register/partner', registerPartner);
router.post('/login/customer', loginCustomer);
router.post('/login/partner', loginPartner);
router.post('/login/admin', loginAdmin);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', requireAuth, me);

export default router;
