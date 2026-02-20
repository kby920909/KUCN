import { useState, useEffect } from 'react';
import { LoginForm } from './components/LoginForm';
import { LoginSuccess } from './components/LoginSuccess';
import { TossDashboard } from './components/TossDashboard';
import { useApiAuth } from './config/env';
import { login as apiLogin, checkSession, logout as apiLogout } from './api/auth';
import { useBackButtonSetup, useBackHandler } from './hooks/useBackButton';

export type AuthState = 'idle' | 'loading' | 'success' | 'error';
export type DashboardType = 'classic' | 'toss';

const DASHBOARD_TYPE_KEY = 'dashboardType';
const SESSION_KEY = 'kucn_session';
const SESSION_EXPIRY_KEY = 'kucn_session_expiry';

// 사번 생성 함수 (6자리 숫자)
function generateEmployeeId(userId: string): string {
  if (userId.toLowerCase() === 'rlaqudduq997') return '013001';
  const hash = userId.split('').reduce((acc, char) => ((acc << 5) - acc) + char.charCodeAt(0), 0);
  return String(Math.abs(hash) % 1000000).padStart(6, '0');
}

function checkLocalSession(): { userId: string; employeeId: string } | null {
  const sessionData = localStorage.getItem(SESSION_KEY);
  const expiry = localStorage.getItem(SESSION_EXPIRY_KEY);
  if (!sessionData || !expiry) return null;
  const expiryTime = parseInt(expiry, 10);
  if (Date.now() > expiryTime) {
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

  const apiAuth = useApiAuth();

  const handleExitConfirm = () => {
    if (window.confirm('종료하시겠습니까?')) {
      import('@capacitor/app').then(({ App }) => App.exitApp());
    }
  };

  useBackButtonSetup();

  // 초기 로드 시 세션 확인
  useEffect(() => {
    const restoreSession = async () => {
      if (apiAuth) {
        try {
          const res = await checkSession();
          if (res.ok) {
            const data = await res.json();
            setUserId(data.userId);
            setState('success');
          } else {
            setState('idle');
          }
        } catch {
          setState('idle');
        }
      } else {
        const session = checkLocalSession();
        if (session) {
          setUserId(session.userId);
          setState('success');
        } else {
          setState('idle');
        }
      }
    };
    restoreSession();
  }, [apiAuth]);

  // 타이틀 설정
  useEffect(() => {
    if (state === 'success' && userId) {
      document.title = 'KUCN';
    } else {
      document.title = 'KUCN 로그인';
    }
  }, [state, userId]);

  const handleLogin = async (id: string, pw: string, type: DashboardType = 'classic') => {
    if (!id.trim() || !pw.trim()) {
      setErrorMessage('아이디와 비밀번호를 입력해 주세요.');
      setState('error');
      return;
    }

    setState('loading');
    setErrorMessage('');
    setDashboardType(type);
    localStorage.setItem(DASHBOARD_TYPE_KEY, type);

    if (apiAuth) {
      try {
        const res = await apiLogin(id.trim(), pw);
        if (res.ok) {
          const data = await res.json();
          setUserId(data.userId ?? id.trim());
          setState('success');
        } else {
          const err = await res.json().catch(() => ({}));
          setErrorMessage(err.message ?? '로그인에 실패했습니다.');
          setState('error');
        }
      } catch {
        setErrorMessage('서버에 연결할 수 없습니다. API 서버를 실행해 주세요.');
        setState('error');
      }
    } else {
      setTimeout(() => {
        const employeeId = generateEmployeeId(id.trim());
        const sessionData = { userId: id.trim(), employeeId };
        const expiryTime = Date.now() + 30 * 60 * 1000;
        localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
        localStorage.setItem(SESSION_EXPIRY_KEY, expiryTime.toString());
        setUserId(id.trim());
        setState('success');
      }, 300);
    }
  };

  const handleLogout = async () => {
    if (apiAuth) {
      try {
        await apiLogout();
      } catch {}
    } else {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(SESSION_EXPIRY_KEY);
    }
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

  if (state === 'success' && userId) {
    if (dashboardType === 'toss') {
      return (
        <TossDashboard
          userId={userId}
          onLogout={handleLogout}
          onSwitchToClassic={() => handleSwitchDashboard('classic')}
          onBackButton={handleExitConfirm}
        />
      );
    }
    return (
      <LoginSuccess
        userId={userId}
        onLogout={handleLogout}
        onSwitchToToss={() => handleSwitchDashboard('toss')}
        onBackButton={handleExitConfirm}
      />
    );
  }

  useBackHandler(handleExitConfirm);

  const isLoading = state === 'loading';

  return (
    <LoginForm
      onSubmit={handleLogin}
      loading={isLoading}
      errorMessage={errorMessage}
    />
  );
}
