import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

// Capacitor 초기화 (안드로이드 앱에서만 사용)
// 웹 개발 모드에서는 동적 import로 처리하여 오류 방지
(async () => {
  try {
    const { Capacitor } = await import('@capacitor/core');
    if (Capacitor.isNativePlatform()) {
      const { StatusBar, Style } = await import('@capacitor/status-bar');
      StatusBar.setStyle({ style: Style.Dark });
      StatusBar.setBackgroundColor({ color: '#ffffff' });
    }
  } catch (error) {
    // 웹 개발 모드에서는 Capacitor가 없어도 정상 작동
    // 에러를 무시하고 계속 진행
  }
})();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
