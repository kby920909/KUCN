import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import os from 'os';
import { authRouter } from './routes/auth';
import { mailRouter } from './routes/mail';

const app = express();
const port = process.env.PORT ?? 3000;

function getLocalIp(): string | null {
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    const addrs = ifaces[name]!;
    for (const addr of addrs) {
      if (addr.family === 'IPv4' && !addr.internal) return addr.address;
    }
  }
  return null;
}

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());

// DB 없이 로그인 (index.ts 아이디/비밀번호 사용). USE_INDEX_LOGIN=1 일 때만 적용
const USE_INDEX_LOGIN = process.env.USE_INDEX_LOGIN === '1';
const LOGIN_USER_ID = 'admin';
const LOGIN_PASSWORD = 'admin123';
app.set('useIndexLogin', USE_INDEX_LOGIN);
app.set('loginCredentials', { userId: LOGIN_USER_ID, password: LOGIN_PASSWORD });

// 세션 설정 (30분 만료)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // HTTPS 사용 시 true로 변경
    httpOnly: true,
    maxAge: 30 * 60 * 1000, // 30분 (밀리초)
  },
  name: 'sessionId',
}));

app.use('/api/auth', authRouter);
app.use('/api/mail', mailRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, '0.0.0.0', () => {
  const ip = getLocalIp();
  console.log(`API 서버: http://localhost:${port}`);
  if (ip) console.log(`다른 PC 접속: http://${ip}:${port}`);
});
