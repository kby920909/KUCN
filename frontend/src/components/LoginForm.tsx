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
  const [apkDownloading, setApkDownloading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!classicId.trim() || !classicPw) return;
    onSubmit(classicId.trim(), classicPw, 'classic');
  };

  const apkUrl = `${window.location.origin}/app-debug.apk`;

  const handleApkDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    setApkDownloading(true);
    try {
      const res = await fetch(apkUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'KUCN.apk';
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(apkUrl, '_blank');
    } finally {
      setApkDownloading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <form className="login-box" onSubmit={handleSubmit}>
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

        <div className="apk-download-section">
          <button
            type="button"
            onClick={handleApkDownload}
            className="apk-download-btn"
            disabled={apkDownloading}
          >
            {apkDownloading ? '다운로드 중...' : '📱 Android 앱 다운로드'}
          </button>
        </div>
      </div>
    </div>
  );
}
