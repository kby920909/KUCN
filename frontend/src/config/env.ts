/**
 * localhost → API 서버 사용 (로그인 API 필요)
 * Vercel 등 그 외 → 더미 로그인 (localStorage, API 없음)
 */
export const useApiAuth = (): boolean => {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1';
};
