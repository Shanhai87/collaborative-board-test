import bcrypt from 'bcryptjs';
import jwt from 'jwt-simple';
import { PrismaClient } from '@prisma/client';
import { sendConfirmationEmail } from '../services/emailService.js';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Заполните все поля' });
  }

  try {
    // Проверка, существует ли пользователь
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаём нового пользователя
    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    // Генерируем токен для подтверждения email
    const token = jwt.encode({ id: newUser.id }, JWT_SECRET);

    // Отправляем email с подтверждением
    await sendConfirmationEmail(email, token);

    res.status(201).json({ message: 'Пользователь создан, проверьте почту для подтверждения' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при регистрации' });
  }
};

export const confirmEmail = async (req, res) => {
  const { token } = req.query;

  try {
    // Расшифровываем токен
    const decoded = jwt.decode(token, JWT_SECRET);

    // Обновляем пользователя
    const user = await prisma.user.update({
      where: { id: decoded.id },
      data: { verified: true },
    });

    res.status(200).json({ message: 'Email подтверждён успешно' });
  } catch (error) {
    res.status(400).json({ error: 'Неверный или просроченный токен' });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Заполните все поля' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    if (!user.verified) {
      return res.status(400).json({ error: 'Почта не подтверждена' });
    }

    const token = jwt.encode({ id: user.id }, JWT_SECRET);

    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при входе' });
  }
};
