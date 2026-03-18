import { API_BASE } from '../config/api';

/** localStorage 세션에서 userId 추출 (Vercel 프로덕션 폴백용) */
function getLocalUserId(): string | null {
  try {
    const raw = localStorage.getItem('kucn_session');
    if (!raw) return null;
    const data = JSON.parse(raw);
    return typeof data.userId === 'string' ? data.userId : null;
  } catch {
    return null;
  }
}

export async function fetchInbox(): Promise<Response> {
  const userId = getLocalUserId();
  const params = userId ? `?_userId=${encodeURIComponent(userId)}` : '';
  return fetch(`${API_BASE}/mail/inbox${params}`, {
    method: 'GET',
    credentials: 'include',
  });
}

export async function fetchSent(): Promise<Response> {
  const userId = getLocalUserId();
  const params = userId ? `?_userId=${encodeURIComponent(userId)}` : '';
  return fetch(`${API_BASE}/mail/sent${params}`, {
    method: 'GET',
    credentials: 'include',
  });
}

export async function sendMail(
  toUserId: string,
  subject: string,
  body: string
): Promise<Response> {
  return fetch(`${API_BASE}/mail/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      toUserId,
      subject,
      body,
      _userId: getLocalUserId(), // 세션 없는 환경 폴백
    }),
  });
}
