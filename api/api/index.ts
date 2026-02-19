// Vercel Serverless Function용 진입점
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { authRouter } from '../src/routes/auth';

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());

// 세션 설정 (Vercel 환경에서는 메모리 스토어 사용, 프로덕션에서는 Redis 권장)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS 사용 시 true
    httpOnly: true,
    maxAge: 30 * 60 * 1000, // 30분 (밀리초)
  },
  name: 'sessionId',
}));

app.use('/api/auth', authRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Vercel Serverless Function용 export
export default app;
