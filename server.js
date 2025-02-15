// import cors from "cors";
// import express from "express";
// import { PrismaClient } from "@prisma/client";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import dotenv from "dotenv";
// import { z } from "zod";
// import nodemailer from "nodemailer";
// import crypto from "crypto";

// dotenv.config();

// const prisma = new PrismaClient();
// const app = express();
// const PORT = 3000;
// const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
// const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "your_refresh_secret";

// app.use(express.json());
// app.use(cors({ origin: "https://shanhai87.github.io" }));

// // Функция генерации Access и Refresh токенов
// const generateTokens = (userId) => {
//   const accessToken = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "1h" });
//   const refreshToken = jwt.sign({ id: userId }, JWT_REFRESH_SECRET, { expiresIn: "7d" });

//   return { accessToken, refreshToken };
// };

// // Определяем схему валидации
// const registerSchema = z.object({
//   name: z.string().min(2, "Имя должно содержать хотя бы 2 символа"),
//   email: z.string().email("Некорректный email"),
//   password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
// });

// const loginSchema = z.object({
//   email: z.string().email("Некорректный email"),
//   password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
// });

// // ✅ Регистрация пользователя (с Refresh-токеном)
// app.post('/register', async (req, res) => {
//   const parseResult = registerSchema.safeParse(req.body);
//   if (!parseResult.success) {
//     return res.status(400).json({ error: parseResult.error.format() });
//   }

//   const { name, email, password } = parseResult.data;

//   try {
//     const existingUser = await prisma.user.findUnique({ where: { email } });
//     if (existingUser) {
//       return res.status(400).json({ error: 'Email уже зарегистрирован' });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const { accessToken, refreshToken } = generateTokens(email);

//     const newUser = await prisma.user.create({
//       data: { name, email, password: hashedPassword, refreshToken },
//     });

//     res.status(201).json({ accessToken, refreshToken, user: { id: newUser.id, name, email } });
//   } catch (error) {
//     res.status(500).json({ error: 'Ошибка регистрации' });
//   }
// });

// // ✅ Логин пользователя (с Refresh-токеном)
// app.post('/login', async (req, res) => {
//   const parseResult = loginSchema.safeParse(req.body);
//   if (!parseResult.success) {
//     return res.status(400).json({ error: parseResult.error.format() });
//   }

//   const { email, password } = parseResult.data;

//   try {
//     const user = await prisma.user.findUnique({ where: { email } });
//     if (!user) {
//       return res.status(401).json({ error: 'Неверный email или пароль' });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(401).json({ error: 'Неверный email или пароль' });
//     }

//     const { accessToken, refreshToken } = generateTokens(user.id);

//     // Обновляем Refresh-токен в базе данных
//     await prisma.user.update({
//       where: { email },
//       data: { refreshToken },
//     });

//     res.json({ accessToken, refreshToken, user: { id: user.id, name: user.name, email: user.email } });
//   } catch (error) {
//     res.status(500).json({ error: 'Ошибка входа' });
//   }
// });

// app.post('/refresh', async (req, res) => {
//   const { refreshToken } = req.body;
//   if (!refreshToken) {
//     return res.status(401).json({ error: 'Токен отсутствует' });
//   }

//   try {
//     // Проверяем, есть ли Refresh-токен в базе данных
//     const user = await prisma.user.findUnique({ where: { refreshToken } });
//     if (!user) {
//       return res.status(403).json({ error: 'Неверный токен' });
//     }

//     // Проверяем Refresh-токен
//     jwt.verify(refreshToken, JWT_REFRESH_SECRET, async (err, decoded) => {
//       if (err) {
//         return res.status(403).json({ error: 'Токен недействителен' });
//       }

//       // Генерируем новый Access-токен
//       const accessToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });

//       res.json({ accessToken });
//     });
//   } catch (error) {
//     res.status(500).json({ error: 'Ошибка сервера' });
//   }
// });

// app.post('/logout', async (req, res) => {
//   const { refreshToken } = req.body;

//   if (!refreshToken) {
//     return res.status(400).json({ error: "Токен отсутствует" });
//   }

//   try {
//     // Проверяем, существует ли Refresh-токен в базе
//     const user = await prisma.user.findUnique({ where: { refreshToken } });
//     if (!user) {
//       return res.status(403).json({ error: "Неверный токен" });
//     }

//     // Удаляем Refresh-токен у пользователя
//     await prisma.user.update({
//       where: { id: user.id },
//       data: { refreshToken: null },
//     });

//     res.json({ message: "Выход выполнен успешно" });
//   } catch (error) {
//     res.status(500).json({ error: "Ошибка сервера" });
//   }
// });

// // 📌 Настраиваем почтовый сервис
// const transporter = nodemailer.createTransport({
//   service: "Gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// // ✅ Генерация ссылки для сброса пароля
// app.post('/forgot-password', async (req, res) => {
//   const { email } = req.body;

//   if (!email) {
//     return res.status(400).json({ error: "Введите email" });
//   }

//   try {
//     // Ищем пользователя
//     const user = await prisma.user.findUnique({ where: { email } });
//     if (!user) {
//       return res.status(404).json({ error: "Пользователь не найден" });
//     }

//     // Генерируем уникальный токен
//     const resetToken = crypto.randomBytes(32).toString("hex");

//     // Сохраняем токен в базе (на 15 минут)
//     await prisma.user.update({
//       where: { email },
//       data: { resetToken },
//     });

//     // Формируем ссылку для восстановления
//     const resetLink = `https://shanhai87.github.io/reset-password?token=${resetToken}`;

//     // Отправляем email
//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: "Восстановление пароля",
//       text: `Для сброса пароля перейдите по ссылке: ${resetLink}`,
//     });

//     res.json({ message: "Письмо отправлено" });
//   } catch (error) {
//     res.status(500).json({ error: "Ошибка сервера" });
//   }
// });

// app.post('/reset-password', async (req, res) => {
//   const { token, newPassword } = req.body;

//   if (!token || !newPassword) {
//     return res.status(400).json({ error: "Заполните все поля" });
//   }

//   try {
//     // Ищем пользователя с этим токеном
//     const user = await prisma.user.findUnique({ where: { resetToken: token } });

//     if (!user) {
//       return res.status(400).json({ error: "Неверный или устаревший токен" });
//     }

//     // Хешируем новый пароль
//     const hashedPassword = await bcrypt.hash(newPassword, 10);

//     // Обновляем пароль и удаляем токен
//     await prisma.user.update({
//       where: { id: user.id },
//       data: { password: hashedPassword, resetToken: null },
//     });

//     res.json({ message: "Пароль успешно изменён" });
//   } catch (error) {
//     res.status(500).json({ error: "Ошибка сервера" });
//   }
// });

// app.patch('/update-profile', authenticateToken, async (req, res) => {
//   const { name, email, currentPassword, newPassword } = req.body;

//   try {
//     const user = await prisma.user.findUnique({
//       where: { id: req.user.id },
//     });

//     if (!user) {
//       return res.status(404).json({ error: "Пользователь не найден" });
//     }

//     let updatedData = {};

//     // ✅ Изменение имени
//     if (name) {
//       updatedData.name = name;
//     }

//     // ✅ Изменение email (если он не занят другим пользователем)
//     if (email && email !== user.email) {
//       const existingUser = await prisma.user.findUnique({ where: { email } });
//       if (existingUser) {
//         return res.status(400).json({ error: "Email уже используется" });
//       }
//       updatedData.email = email;
//     }

//     // ✅ Изменение пароля
//     if (currentPassword && newPassword) {
//       const isMatch = await bcrypt.compare(currentPassword, user.password);
//       if (!isMatch) {
//         return res.status(401).json({ error: "Неверный текущий пароль" });
//       }

//       updatedData.password = await bcrypt.hash(newPassword, 10);
//     }

//     // Обновляем данные в базе
//     const updatedUser = await prisma.user.update({
//       where: { id: req.user.id },
//       data: updatedData,
//     });

//     res.json({
//       message: "Профиль обновлен",
//       user: { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email },
//     });
//   } catch (error) {
//     res.status(500).json({ error: "Ошибка обновления профиля" });
//   }
// });

// // ✅ Запуск сервера
// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();
app.use(express.json());
// app.use(cors({ origin: 'https://shanhai87.github.io/board' }));

app.use('/api', authRoutes);

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});

