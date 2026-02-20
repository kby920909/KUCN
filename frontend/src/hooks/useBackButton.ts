import { useEffect } from 'react';

// 앱 전역 뒤로가기 핸들러 (등록한 컴포넌트가 제어)
const backHandlerRef = { current: null as (() => void) | null };

/**
 * 안드로이드 뒤로가기 버튼 - 전역 리스너 1회 등록
 * 원격 URL 로드 시 브리지 준비 대기
 */
export function useBackButtonSetup() {
  useEffect(() => {
    let handle: { remove: () => Promise<void> } | null = null;

    const setup = async () => {
      try {
        const { Capacitor } = await import('@capacitor/core');
        if (!Capacitor.isNativePlatform()) return;

        const { App } = await import('@capacitor/app');
        await new Promise((r) => setTimeout(r, 300));
        handle = await App.addListener('backButton', () => {
          backHandlerRef.current?.();
        });
      } catch {
        // 웹 환경 등에서는 무시
      }
    };

    setup();
    return () => {
      handle?.remove?.();
    };
  }, []);
}

/**
 * 현재 화면의 뒤로가기 핸들러 등록
 */
export function useBackHandler(handler: () => void) {
  useEffect(() => {
    backHandlerRef.current = handler;
    return () => {
      backHandlerRef.current = null;
    };
  });
}
