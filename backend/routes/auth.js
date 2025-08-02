import express from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

//    POST /api/auth/register
//     Register a user
//  Public
router.post('/register', register);

//   POST /api/auth/login
//   Login user
//  Public
router.post('/login', login);

//   GET /api/auth/me
//   Get current user
//  Private
router.get('/me', auth, getMe);

export default router;