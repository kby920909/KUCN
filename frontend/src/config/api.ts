import { Capacitor } from '@capacitor/core';

/**
 * API 서버 URL 설정
 * 
 * 웹 개발 모드: /api (Vite proxy 사용)
 * 안드로이드 앱: 실제 서버 IP 주소 사용
 * 
 * 안드로이드 앱에서 사용하려면:
 * 1. PC와 안드로이드 기기가 같은 Wi-Fi 네트워크에 연결되어 있어야 함
 * 2. PC의 로컬 IP 주소를 확인 (예: ipconfig 명령어)
 * 3. 아래 API_SERVER_URL을 해당 IP로 변경
 */

// 개발 서버 IP 주소 (안드로이드 앱에서 사용)
// PC의 로컬 IP 주소로 변경하세요 (예: http://192.168.0.100:3000)
const DEV_API_SERVER = 'http://192.168.5.49:3000';

// 프로덕션 서버 URL (실제 배포 시 사용)
// 환경 변수에서 가져오거나 직접 설정
const PROD_API_SERVER = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace(/\/api$/, '') // /api 제거
  : 'https://your-production-server.com';

// 환경에 따라 API URL 결정
const getApiBase = (): string => {
  // 안드로이드 앱인 경우
  if (Capacitor.isNativePlatform()) {
    // 개발 모드인지 프로덕션 모드인지 확인
    const isDev = import.meta.env.DEV;
    return isDev ? `${DEV_API_SERVER}/api` : `${PROD_API_SERVER}/api`;
  }
  
  // 웹 브라우저인 경우 (Vite proxy 사용)
  return '/api';
};

export const API_BASE = getApiBase();

// 디버깅용 (개발 중에만 콘솔에 출력)
if (import.meta.env.DEV) {
  console.log('API Base URL:', API_BASE);
  console.log('Platform:', Capacitor.isNativePlatform() ? 'Native (Android)' : 'Web');
}
