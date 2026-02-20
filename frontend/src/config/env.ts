/**
 * 개발 모드(npm run dev) → API 서버 사용 (로그인 API 필요)
 * 프로덕션 빌드(Vercel 등) → 더미 로그인 (localStorage, API 없음)
 */
export const useApiAuth = (): boolean => {
  return import.meta.env.DEV;
};
