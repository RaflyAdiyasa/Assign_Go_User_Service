import express from 'express';
import { addNIM, addMultipleNIMs, getAllNIMs, deactivateNIM, activateNIM } from '../controllers/nimController.js';
import { verifyJWT } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All routes require admin access
router.use(verifyJWT, isAdmin);

router.post('/', addNIM);
router.post('/bulk', addMultipleNIMs);
router.get('/', getAllNIMs);
router.put('/deactivate/:nimId', deactivateNIM);
router.put('/activate/:nimId', activateNIM);

export default router;
