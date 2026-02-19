import { useState, FormEvent } from 'react';
import './LoginForm.css';

type Props = {
  onSubmit: (id: string, pw: string, type?: 'classic' | 'toss') => void;
  loading: boolean;
  errorMessage: string;
};

export function LoginForm({ onSubmit, loading, errorMessage }: Props) {
  const [classicId, setClassicId] = useState('');
  const [classicPw, setClassicPw] = useState('');
  const [tossId, setTossId] = useState('');
  const [tossPw, setTossPw] = useState('');

  const handleClassicSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!classicId.trim() || !classicPw) return;
    onSubmit(classicId.trim(), classicPw, 'classic');
  };

  const handleTossSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!tossId.trim() || !tossPw) return;
    onSubmit(tossId.trim(), tossPw, 'toss');
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <form className="login-box" onSubmit={handleClassicSubmit}>
          <div className="naver-logo">
            <span>KUCN</span>
          </div>
          <input
            type="text"
            placeholder="아이디"
            value={classicId}
            onChange={(e) => setClassicId(e.target.value)}
            autoFocus
            required
            disabled={loading}
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={classicPw}
            onChange={(e) => setClassicPw(e.target.value)}
            required
            disabled={loading}
            autoComplete="current-password"
          />
          {errorMessage && <p className="error-msg">{errorMessage}</p>}
          <button type="submit" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
        
        <div className="login-divider"></div>

        <form className="login-box login-box-toss" onSubmit={handleTossSubmit}>
          <div className="toss-logo">
            <span>KUCN</span>
          </div>
          <input
            type="text"
            placeholder="아이디"
            value={tossId}
            onChange={(e) => setTossId(e.target.value)}
            required
            disabled={loading}
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={tossPw}
            onChange={(e) => setTossPw(e.target.value)}
            required
            disabled={loading}
            autoComplete="current-password"
          />
          {errorMessage && <p className="error-msg">{errorMessage}</p>}
          <button type="submit" className="toss-login-btn" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  );
}
