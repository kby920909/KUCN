import { Router, Request, Response } from 'express';
import { query } from '../db';

export const authRouter = Router();

const useLocalDb = process.env.USE_LOCAL_DB === '1';
const TABLE = useLocalDb ? 'USERS' : (process.env.DB_TABLE ?? 'USERS');
const USER_ID_COL = useLocalDb ? 'USER_ID' : (process.env.DB_USER_ID_COL ?? 'USER_ID');
const PASSWORD_COL = useLocalDb ? 'PASSWORD' : (process.env.DB_PASSWORD_COL ?? 'PASSWORD');

interface LoginBody {
  userId?: string;
  password?: string;
}

interface UserRow {
  [key: string]: unknown;
}

interface SessionData {
  userId: string;
  employeeId: string;
  loginTime: number;
}

// Express Session 타입 확장
declare module 'express-session' {
  interface SessionData {
    user?: SessionData;
  }
}

// 사번 생성 함수 (6자리 숫자)
function generateEmployeeId(userId: string): string {
  // 특정 아이디에 대해 고정 사번 할당
  if (userId.toLowerCase() === 'rlaqudduq997') {
    return '013001';
  }
  
  // 다른 사용자에 대해서는 랜덤 6자리 숫자 생성
  // 사용자별로 일관된 사번을 위해 userId의 해시값 기반으로 생성
  const hash = userId.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);
  
  // 음수 방지 및 6자리 숫자로 변환
  const num = Math.abs(hash) % 1000000;
  return String(num).padStart(6, '0');
}

authRouter.post('/login', async (req: Request, res: Response) => {
  const { userId, password } = req.body as LoginBody;

  if (!userId || !password) {
    return res.status(400).json({
      success: false,
      message: '아이디와 비밀번호를 입력해 주세요.',
    });
  }

  try {
    const sql = `SELECT ${USER_ID_COL}, ${PASSWORD_COL} FROM ${TABLE} WHERE ${USER_ID_COL} = :userId`;
    const rows = await query<UserRow>(sql, { userId: userId.trim() });

    if (!rows || rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: '아이디 또는 비밀번호가 올바르지 않습니다.',
      });
    }

    const user = rows[0]!;
    const dbPassword = String(
      user[PASSWORD_COL] ?? user[PASSWORD_COL.toUpperCase()] ?? user[PASSWORD_COL.toLowerCase()] ?? ''
    );

    if (dbPassword !== password) {
      return res.status(401).json({
        success: false,
        message: '아이디 또는 비밀번호가 올바르지 않습니다.',
      });
    }

    const dbUserId =
      user[USER_ID_COL] ?? user[USER_ID_COL.toUpperCase()] ?? user[USER_ID_COL.toLowerCase()] ?? userId;
    const trimmedUserId = String(dbUserId).trim();
    
    // 사번 생성
    const employeeId = generateEmployeeId(trimmedUserId);
    
    // 세션에 사용자 정보 저장
    const sessionData: SessionData = {
      userId: trimmedUserId,
      employeeId: employeeId,
      loginTime: Date.now(),
    };
    
    req.session.user = sessionData;
    
    res.status(200).json({
      success: true,
      userId: trimmedUserId,
      employeeId: employeeId,
    });
  } catch (err) {
    console.error('Login DB error:', err);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
    });
  }
});

// 세션 확인 엔드포인트
authRouter.get('/session', (req: Request, res: Response) => {
  if (req.session.user) {
    const sessionData = req.session.user as SessionData;
    const now = Date.now();
    const loginTime = sessionData.loginTime;
    const elapsedMinutes = Math.floor((now - loginTime) / (60 * 1000));
    const remainingMinutes = 30 - elapsedMinutes;
    
    if (remainingMinutes <= 0) {
      // 세션 만료
      req.session.destroy(() => {});
      return res.status(401).json({
        success: false,
        message: '세션이 만료되었습니다.',
      });
    }
    
    return res.status(200).json({
      success: true,
      userId: sessionData.userId,
      employeeId: sessionData.employeeId,
      remainingMinutes: remainingMinutes,
    });
  }
  
  res.status(401).json({
    success: false,
    message: '로그인이 필요합니다.',
  });
});

// 세션 연장 엔드포인트 (30분 추가)
authRouter.post('/extend', (req: Request, res: Response) => {
  if (req.session.user) {
    const sessionData = req.session.user as SessionData;
    // 로그인 시간을 현재 시간으로 갱신하여 30분 추가
    sessionData.loginTime = Date.now();
    req.session.user = sessionData;
    
    return res.status(200).json({
      success: true,
      message: '세션이 30분 연장되었습니다.',
      remainingMinutes: 30,
    });
  }
  
  res.status(401).json({
    success: false,
    message: '로그인이 필요합니다.',
  });
});

// 로그아웃 엔드포인트
authRouter.post('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({
        success: false,
        message: '로그아웃 중 오류가 발생했습니다.',
      });
    }
    
    res.status(200).json({
      success: true,
      message: '로그아웃되었습니다.',
    });
  });
});
