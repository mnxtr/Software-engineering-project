import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDatabase } from './config/database.js';
import authRoutes from './routes/auth.js';
import menuRoutes from './routes/menu.js';
import orderRoutes from './routes/orders.js';
import userRoutes from './routes/users.js';
import vendorRoutes from './routes/vendor.js';
import adminRoutes from './routes/admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp({ initialize = true } = {}) {
  const app = express();

  app.use(cors());
  app.use(express.json());

  if (initialize) {
    initializeDatabase();
  }

  app.use('/api/auth', authRoutes);
  app.use('/api/menu', menuRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/vendor', vendorRoutes);
  app.use('/api/admin', adminRoutes);

  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'NSU Companion API is running' });
  });

  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(clientDist, 'index.html'));
    }
  });

  return app;
}
