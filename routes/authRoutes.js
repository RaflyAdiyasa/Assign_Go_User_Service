// routes/authRoutes.js
import express from 'express';
import { register, login, refreshToken, logout } from '../controllers/authController.js';
import { verifyJWT } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', verifyJWT, logout);

export default router;