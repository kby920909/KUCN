import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

// 앱 전역 뒤로가기 핸들러 (등록한 컴포넌트가 제어)
const backHandlerRef = { current: null as (() => void) | null };

export function getBackHandlerRef() {
  return backHandlerRef;
}

/**
 * 안드로이드 뒤로가기 버튼 - 전역 리스너 1회 등록
 */
export function useBackButtonSetup() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const listener = App.addListener('backButton', () => {
      backHandlerRef.current?.();
    });

    return () => {
      listener.then((l) => l.remove());
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
