import express from 'express';
import { registerUser, loginUser, confirmEmail } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/confirm/:token', confirmEmail);

export default router;
