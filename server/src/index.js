import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import { attachUser } from './middleware/auth.js';
import apiRoutes from './routes/index.js';
import { notFound, errorHandler } from './middleware/error.js';
import { seedIfEmpty } from './seed/seed.js';

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  // Ensure default categories & sample data exist on first boot.
  await seedIfEmpty();

  const app = express();

  app.use(cors({ origin: process.env.CLIENT_ORIGIN || true, credentials: true }));
  app.use(express.json({ limit: '2mb' }));
  if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

  // Attach req.user / req.userId (single-user demo mode when no token).
  app.use(attachUser);

  app.use('/api', apiRoutes);

  app.use(notFound);
  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`🚀 Meal Planner API listening on http://localhost:${PORT}/api`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
