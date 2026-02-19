import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import os from 'os';
import { authRouter } from './routes/auth';

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

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, '0.0.0.0', () => {
  const ip = getLocalIp();
  console.log(`API 서버: http://localhost:${port}`);
  if (ip) console.log(`다른 PC 접속: http://${ip}:${port}`);
});
