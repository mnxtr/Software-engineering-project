import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './config/database.js';
import authRoutes from './routes/auth.js';
import menuRoutes from './routes/menu.js';
import orderRoutes from './routes/orders.js';
import userRoutes from './routes/users.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

initializeDatabase();

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'NSU Cafeteria API is running' });
});

app.listen(PORT, () => {
  console.log(`NSU Cafeteria Server running on port ${PORT}`);
});