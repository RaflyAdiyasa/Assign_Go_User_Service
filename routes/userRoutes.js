import express from 'express';
import { getAllUsers, getUserStats, getUserProfile, updateUserProfile, updatePassword } from '../controllers/userController.js';
import { verifyJWT } from '../middleware/authMiddleware.js';
import { isAdmin } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Protected routes for all authenticated users
router.get('/profile', verifyJWT, getUserProfile);
router.put('/profile', verifyJWT, updateUserProfile);
router.put('/password', verifyJWT, updatePassword);

// Admin-only routes
router.get('/', verifyJWT, isAdmin, getAllUsers);
router.get('/stats', verifyJWT, isAdmin, getUserStats);

export default router;