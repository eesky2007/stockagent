import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { appRouter } from './trpc.js';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { authMiddleware, callbackHandler, loginHandler, logoutHandler } from './auth.js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 5175);
const frontendOrigin = process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173';

app.use(cors({ origin: frontendOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(authMiddleware);

app.get('/api/auth/login', loginHandler);
app.get('/api/auth/callback', callbackHandler);
app.post('/api/auth/logout', logoutHandler);
app.get('/api/auth/me', (req, res) => {
  res.json({ user: req.authUser ?? null });
});

app.use('/api/trpc', (req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body || req.query);
  next();
}, createExpressMiddleware({
  router: appRouter,
  createContext: ({ req }) => ({ user: req.authUser })
}));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`StockAgent backend listening on http://localhost:${port}`);
});
