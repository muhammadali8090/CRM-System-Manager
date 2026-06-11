import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { errorHandler } from './middleware/errorMiddleware.js';
import { seedDemoUsers } from './services/authService.js';

import authRoutes from './routes/authRoutes.js';
import prospectRoutes from './routes/prospectRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import dealRoutes from './routes/dealRoutes.js';
import exportRoutes from './routes/exportRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/crm_db';

app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json());

app.get('/api/health', (_req, res) =>
  res.json({ success: true, message: 'Server is running' })
);

app.use('/api/auth', authRoutes);
app.use('/api/prospects', prospectRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/export', exportRoutes);

app.use(errorHandler);

async function start() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[DB] Connected to MongoDB');
    await seedDemoUsers();
    console.log('[SEED] Demo users seeded');
    app.listen(PORT, () => {
      console.log(`[SERVER] Running on port ${PORT}`);
    });
  } catch (err) {
    console.error('[STARTUP] Failed to start server:', err);
    process.exit(1);
  }
}

start();
