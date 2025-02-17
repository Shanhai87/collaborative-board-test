import express from 'express';
import { registerUser, loginUser, confirmEmail } from '../controllers/authController.js';
import authenticateToken from '../middlewares/authenticateToken.js';

const router = express.Router();

// Регистрация пользователя
router.post('/register', registerUser);

// Вход пользователя
router.post('/login', loginUser);

// Подтверждение email
router.get('/confirm-email', confirmEmail);

// Защищенный маршрут профиля
router.get('/profile', authenticateToken, (req, res) => {
  res.json({ message: 'Вы вошли в профиль', user: req.user });
});

export default router;
