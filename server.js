import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();
app.use(express.json());
// Настроим CORS
app.use(cors({
  origin: 'https://shanhai87.github.io/board', // Разрешаем доступ только с этого домена
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use('/api', authRoutes);

app.listen(3000, '0.0.0.0', () => {
  console.log('Server running on http://localhost:3000');
});

