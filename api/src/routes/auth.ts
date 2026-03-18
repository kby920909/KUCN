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

// ??? ???? ??? ?? ??
interface UserSessionData {
  userId: string;
  employeeId: string;
  loginTime: number;
}

// Express Session ?? ??
declare module 'express-session' {
  interface SessionData {
    user?: UserSessionData;
  }
}

// DB ??/??? ?? (???? Oracle SELECT ????)
authRouter.get('/db-check', async (_req: Request, res: Response) => {
  try {
    if (useLocalDb) {
      const rows = await query<{ c: number }>('SELECT COUNT(*) as c FROM USERS');
      const count = rows[0]?.c ?? rows[0]?.['C'] ?? 0;
      return res.json({
        ok: true,
        db: 'local',
        message: 'SQLite ?? ??',
        userCount: Number(count),
      });
    }
    await query<{ v: number }>('SELECT 1 as v FROM DUAL');
    const countRows = await query<{ c: number }>(
      `SELECT COUNT(*) as c FROM ${TABLE}`
    );
    const count = countRows[0]?.c ?? countRows[0]?.['C'] ?? 0;
    res.json({
      ok: true,
      db: 'oracle',
      message: 'Oracle ?? ??',
      userCount: Number(count),
    });
  } catch (err) {
    console.error('DB check error:', err);
    res.status(500).json({
      ok: false,
      db: useLocalDb ? 'local' : 'oracle',
      message: 'DB ?? ??',
      error: err instanceof Error ? err.message : String(err),
    });
  }
});

// ?? ?? ?? (6?? ??)
function generateEmployeeId(userId: string): string {
  if (userId.toLowerCase() === 'rlaqudduq997') {
    return '013001';
  }
  const hash = userId.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);
  const num = Math.abs(hash) % 1000000;
  return String(num).padStart(6, '0');
}

authRouter.post('/login', async (req: Request, res: Response) => {
  const { userId, password } = req.body as LoginBody;

  if (!userId || !password) {
    return res.status(400).json({
      success: false,
      message: '???? ????? ??? ???.',
    });
  }

  const useIndexLogin = req.app.get('useIndexLogin');
  const loginCredentials = req.app.get('loginCredentials') as { userId: string; password: string } | undefined;

  // index.ts ???/????? ??? (DB ?? ??)
  if (useIndexLogin && loginCredentials) {
    const trimmedUserId = userId.trim();
    if (trimmedUserId !== loginCredentials.userId || password !== loginCredentials.password) {
      return res.status(401).json({
        success: false,
        message: '??? ?? ????? ???? ????.',
      });
    }
    const employeeId = generateEmployeeId(trimmedUserId);
    const sessionData: UserSessionData = {
      userId: trimmedUserId,
      employeeId,
      loginTime: Date.now(),
    };
    req.session.user = sessionData;
    return res.status(200).json({
      success: true,
      userId: trimmedUserId,
      employeeId,
    });
  }

  // DB ???
  try {
    const sql = `SELECT ${USER_ID_COL}, ${PASSWORD_COL} FROM ${TABLE} WHERE ${USER_ID_COL} = :userId`;
    const rows = await query<UserRow>(sql, { userId: userId.trim() });

    if (!rows || rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: '??? ?? ????? ???? ????.',
      });
    }

    const user = rows[0]!;
    const dbPassword = String(
      user[PASSWORD_COL] ?? user[PASSWORD_COL.toUpperCase()] ?? user[PASSWORD_COL.toLowerCase()] ?? ''
    );

    if (dbPassword !== password) {
      return res.status(401).json({
        success: false,
        message: '??? ?? ????? ???? ????.',
      });
    }

    const dbUserId =
      user[USER_ID_COL] ?? user[USER_ID_COL.toUpperCase()] ?? user[USER_ID_COL.toLowerCase()] ?? userId;
    const trimmedUserId = String(dbUserId).trim();
    const employeeId = generateEmployeeId(trimmedUserId);
    const sessionData: UserSessionData = {
      userId: trimmedUserId,
      employeeId,
      loginTime: Date.now(),
    };
    req.session.user = sessionData;
    res.status(200).json({
      success: true,
      userId: trimmedUserId,
      employeeId,
    });
  } catch (err) {
    console.error('Login DB error:', err);
    res.status(500).json({
      success: false,
      message: '?? ??? ??????.',
    });
  }
});

// ?? ?? ?????
authRouter.get('/session', (req: Request, res: Response) => {
  if (req.session.user) {
    const sessionData = req.session.user as UserSessionData;
    const now = Date.now();
    const elapsedMinutes = Math.floor((now - sessionData.loginTime) / (60 * 1000));
    const remainingMinutes = 30 - elapsedMinutes;

    if (remainingMinutes <= 0) {
      req.session.destroy(() => {});
      return res.status(401).json({
        success: false,
        message: '??? ???????.',
      });
    }

    return res.status(200).json({
      success: true,
      userId: sessionData.userId,
      employeeId: sessionData.employeeId,
      remainingMinutes,
    });
  }

  res.status(401).json({
    success: false,
    message: '???? ?????.',
  });
});

// ?? ?? ????? (30? ??)
authRouter.post('/extend', (req: Request, res: Response) => {
  if (req.session.user) {
    const sessionData = req.session.user as UserSessionData;
    sessionData.loginTime = Date.now();
    req.session.user = sessionData;
    return res.status(200).json({
      success: true,
      message: '??? 30? ???????.',
      remainingMinutes: 30,
    });
  }

  res.status(401).json({
    success: false,
    message: '???? ?????.',
  });
});

// ???? ?????
authRouter.post('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({
        success: false,
        message: '???? ? ??? ??????.',
      });
    }
    res.status(200).json({
      success: true,
      message: '?????????.',
    });
  });
});
