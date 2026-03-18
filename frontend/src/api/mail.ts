import { API_BASE } from '../config/api';

export async function fetchInbox(): Promise<Response> {
  return fetch(`${API_BASE}/mail/inbox`, {
    method: 'GET',
    credentials: 'include',
  });
}

export async function fetchSent(): Promise<Response> {
  return fetch(`${API_BASE}/mail/sent`, {
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
    body: JSON.stringify({ toUserId, subject, body }),
  });
}

