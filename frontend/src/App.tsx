import { useState, useEffect } from 'react';
import { LoginForm } from './components/LoginForm';
import { LoginSuccess } from './components/LoginSuccess';
import { TossDashboard } from './components/TossDashboard';

export type AuthState = 'idle' | 'loading' | 'success' | 'error';
export type DashboardType = 'classic' | 'toss';

const DASHBOARD_TYPE_KEY = 'dashboardType';
const SESSION_KEY = 'kucn_session';
const SESSION_EXPIRY_KEY = 'kucn_session_expiry';

// 사번 생성 함수 (6자리 숫자)
function generateEmployeeId(userId: string): string {
  // 특정 아이디에 대해 고정 사번 할당
  if (userId.toLowerCase() === 'rlaqudduq997') {
    return '013001';
  }
  
  // 다른 사용자에 대해서는 랜덤 6자리 숫자 생성
  // 사용자별로 일관된 사번을 위해 userId의 해시값 기반으로 생성
  const hash = userId.split('').reduce((acc, char) => {
    return ((acc << 5) - acc) + char.charCodeAt(0);
  }, 0);
  
  // 음수 방지 및 6자리 숫자로 변환
  const num = Math.abs(hash) % 1000000;
  return String(num).padStart(6, '0');
}

// 세션 확인 함수
function checkLocalSession(): { userId: string; employeeId: string } | null {
  const sessionData = localStorage.getItem(SESSION_KEY);
  const expiry = localStorage.getItem(SESSION_EXPIRY_KEY);
  
  if (!sessionData || !expiry) {
    return null;
  }
  
  const now = Date.now();
  const expiryTime = parseInt(expiry, 10);
  
  // 세션 만료 확인 (30분)
  if (now > expiryTime) {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_EXPIRY_KEY);
    return null;
  }
  
  try {
    return JSON.parse(sessionData);
  } catch {
    return null;
  }
}

export function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [state, setState] = useState<AuthState>('loading'); // 초기 로딩 상태
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [dashboardType, setDashboardType] = useState<DashboardType>(() => {
    // localStorage에서 저장된 dashboardType 불러오기
    const saved = localStorage.getItem(DASHBOARD_TYPE_KEY);
    return (saved === 'toss' || saved === 'classic') ? saved : 'classic';
  });

  // 초기 로드 시 세션 확인 (localStorage 기반)
  useEffect(() => {
    const session = checkLocalSession();
    if (session) {
      setUserId(session.userId);
      setState('success');
    } else {
      setState('idle');
    }
  }, []);

  // 타이틀 설정
  useEffect(() => {
    if (state === 'success' && userId) {
      document.title = 'KUCN';
    } else {
      document.title = 'KUCN 로그인';
    }
  }, [state, userId]);

  const handleLogin = (id: string, pw: string, type: DashboardType = 'classic') => {
    // 입력 검증
    if (!id.trim() || !pw.trim()) {
      setErrorMessage('아이디와 비밀번호를 입력해 주세요.');
      setState('error');
      return;
    }

    setState('loading');
    setErrorMessage('');
    setDashboardType(type);
    localStorage.setItem(DASHBOARD_TYPE_KEY, type);

    // 더미 로그인: 입력만 있으면 로그인 성공
    // 실제로는 비밀번호 검증 없이 바로 로그인 처리
    setTimeout(() => {
      const employeeId = generateEmployeeId(id.trim());
      const sessionData = {
        userId: id.trim(),
        employeeId: employeeId,
      };
      
      // 세션 정보를 localStorage에 저장 (30분 만료)
      const expiryTime = Date.now() + 30 * 60 * 1000; // 30분
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
      localStorage.setItem(SESSION_EXPIRY_KEY, expiryTime.toString());
      
      setUserId(id.trim());
      setState('success');
    }, 300); // 로딩 효과를 위한 짧은 딜레이
  };

  const handleLogout = () => {
    // localStorage에서 세션 정보 제거
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_EXPIRY_KEY);
    setUserId(null);
    setState('idle');
    setErrorMessage('');
    setDashboardType('classic');
    localStorage.removeItem(DASHBOARD_TYPE_KEY);
  };

  const handleSwitchDashboard = (type: DashboardType) => {
    setDashboardType(type);
    localStorage.setItem(DASHBOARD_TYPE_KEY, type); // localStorage에 저장
  };

  // 로딩 중일 때는 아무것도 표시하지 않음 (또는 로딩 스피너)
  if (state === 'loading') {
    return null; // 또는 로딩 스피너 컴포넌트
  }

  if (state === 'success' && userId) {
    if (dashboardType === 'toss') {
      return <TossDashboard userId={userId} onLogout={handleLogout} onSwitchToClassic={() => handleSwitchDashboard('classic')} />;
    }
    return <LoginSuccess userId={userId} onLogout={handleLogout} onSwitchToToss={() => handleSwitchDashboard('toss')} />;
  }

  return (
    <LoginForm
      onSubmit={handleLogin}
      loading={false}
      errorMessage={errorMessage}
    />
  );
}
