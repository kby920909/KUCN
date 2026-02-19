import { API_BASE } from '../config/api';

export async function login(
  userId: string,
  password: string
): Promise<Response> {
  return fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // 세션 쿠키를 포함하기 위해 필요
    body: JSON.stringify({ userId, password }),
  });
}

export async function checkSession(): Promise<Response> {
  return fetch(`${API_BASE}/auth/session`, {
    method: 'GET',
    credentials: 'include',
  });
}

export async function extendSession(): Promise<Response> {
  return fetch(`${API_BASE}/auth/extend`, {
    method: 'POST',
    credentials: 'include',
  });
}

export async function logout(): Promise<Response> {
  return fetch(`${API_BASE}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
}
