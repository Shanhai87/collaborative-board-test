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

