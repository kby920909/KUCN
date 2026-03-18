import { Router, Request, Response } from 'express';
import { query } from '../db';

export const mailRouter = Router();

interface SendMailBody {
  toUserId?: string;
  subject?: string;
  body?: string;
  _userId?: string; // 세션 없는 환경(Vercel 프로덕션)에서 프론트가 전달하는 userId
}

interface MailRow {
  [key: string]: unknown;
}

/**
 * userId 결정 우선순위:
 * 1. express-session 세션 (로컬 개발, API 로그인)
 * 2. 요청 body / query 의 _userId (Vercel 프로덕션 - localStorage 로그인)
 */
function resolveUserId(req: Request): string | null {
  // express-session에 user가 있으면 우선 사용
  const sessionUser = req.session.user as { userId?: string } | undefined;
  if (sessionUser?.userId) return sessionUser.userId;

  const fallback =
    (req.method === 'GET'
      ? (req.query._userId as string | undefined)
      : (req.body?._userId as string | undefined)) ?? '';

  return fallback.trim() || null;
}

// 받은메일함
mailRouter.get('/inbox', async (req: Request, res: Response) => {
  const userId = resolveUserId(req);
  if (!userId) {
    return res.status(401).json({ success: false, message: '로그인이 필요합니다.' });
  }

  try {
    const rows = await query<MailRow>(
      `SELECT
        ID as id,
        FROM_USER_ID as fromUserId,
        TO_USER_ID as toUserId,
        SUBJECT as subject,
        BODY as body,
        CREATED_AT as createdAt,
        IS_READ as isRead
      FROM MAILS
      WHERE TO_USER_ID = :userId
      ORDER BY CREATED_AT DESC`,
      { userId }
    );
    return res.json({ success: true, items: rows });
  } catch (err) {
    console.error('Inbox fetch error:', err);
    return res.status(500).json({ success: false, message: '받은메일함을 불러오는 중 오류가 발생했습니다.' });
  }
});

// 보낸메일함
mailRouter.get('/sent', async (req: Request, res: Response) => {
  const userId = resolveUserId(req);
  if (!userId) {
    return res.status(401).json({ success: false, message: '로그인이 필요합니다.' });
  }

  try {
    const rows = await query<MailRow>(
      `SELECT
        ID as id,
        FROM_USER_ID as fromUserId,
        TO_USER_ID as toUserId,
        SUBJECT as subject,
        BODY as body,
        CREATED_AT as createdAt,
        IS_READ as isRead
      FROM MAILS
      WHERE FROM_USER_ID = :userId
      ORDER BY CREATED_AT DESC`,
      { userId }
    );
    return res.json({ success: true, items: rows });
  } catch (err) {
    console.error('Sent fetch error:', err);
    return res.status(500).json({ success: false, message: '보낸메일함을 불러오는 중 오류가 발생했습니다.' });
  }
});

// 메일 보내기
mailRouter.post('/send', async (req: Request, res: Response) => {
  const fromUserId = resolveUserId(req);
  if (!fromUserId) {
    return res.status(401).json({ success: false, message: '로그인이 필요합니다.' });
  }

  const { toUserId, subject, body } = req.body as SendMailBody;

  if (!toUserId || !subject || !body) {
    return res.status(400).json({ success: false, message: '받는 사람, 제목, 내용을 모두 입력해 주세요.' });
  }

  try {
    await query(
      `INSERT INTO MAILS (FROM_USER_ID, TO_USER_ID, SUBJECT, BODY, CREATED_AT, IS_READ)
       VALUES (:fromUserId, :toUserId, :subject, :body, CURRENT_TIMESTAMP, 0)`,
      {
        fromUserId,
        toUserId: toUserId.trim(),
        subject: subject.trim(),
        body: body.trim(),
      }
    );
    return res.status(201).json({ success: true, message: '메일이 발송되었습니다.' });
  } catch (err) {
    console.error('Send mail error:', err);
    return res.status(500).json({ success: false, message: '메일 발송 중 오류가 발생했습니다.' });
  }
});
