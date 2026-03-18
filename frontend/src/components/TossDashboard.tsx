import { useState, useEffect } from 'react';
import './TossDashboard.css';
import { useApiAuth } from '../config/env';
import { checkSession, extendSession } from '../api/auth';
import { fetchInbox, fetchSent, sendMail } from '../api/mail';
import { useBackHandler } from '../hooks/useBackButton';

const SESSION_KEY = 'kucn_session';
const SESSION_EXPIRY_KEY = 'kucn_session_expiry';

// localStorage 기반 세션 확인
function checkLocalSession(): { userId: string; employeeId: string; remainingMinutes: number } | null {
  const sessionData = localStorage.getItem(SESSION_KEY);
  const expiry = localStorage.getItem(SESSION_EXPIRY_KEY);
  
  if (!sessionData || !expiry) {
    return null;
  }
  
  const now = Date.now();
  const expiryTime = parseInt(expiry, 10);
  const remainingMs = expiryTime - now;
  const remainingMinutes = Math.max(0, Math.floor(remainingMs / (60 * 1000)));
  
  if (remainingMinutes <= 0) {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_EXPIRY_KEY);
    return null;
  }
  
  try {
    const data = JSON.parse(sessionData);
    return { ...data, remainingMinutes };
  } catch {
    return null;
  }
}

// 세션 연장 (30분 추가)
function extendLocalSession(): boolean {
  const sessionData = localStorage.getItem(SESSION_KEY);
  if (!sessionData) {
    return false;
  }
  
  try {
    const data = JSON.parse(sessionData);
    const expiryTime = Date.now() + 30 * 60 * 1000; // 30분 추가
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
    localStorage.setItem(SESSION_EXPIRY_KEY, expiryTime.toString());
    return true;
  } catch {
    return false;
  }
}

type Props = {
  userId: string;
  onLogout: () => void;
  onSwitchToClassic: () => void;
  onBackButton: () => void;
};

type PageType = 'main' | 'notice' | 'announcement' | 'hr' | 'calendar' | 'mail';

type Article = {
  id: string;
  title: string;
  date: string;
  author: string;
  category: PageType;
  content: string;
};

const articles: Record<string, Article> = {
  'notice-1': {
    id: 'notice-1',
    title: '2026년 상반기 조직 개편 안내',
    date: '2026.02.19',
    author: '인사팀',
    category: 'notice',
    content: `안녕하세요. 인사팀입니다.

2026년 상반기 조직 개편에 대해 안내드립니다.

1. 개편 목적
- 업무 효율성 향상 및 조직 역량 강화
- 신규 사업 확대에 따른 조직 구조 최적화

2. 주요 변경 사항
- 신규 사업부 신설
- 기존 부서 간 업무 재배치
- 인력 재배치 및 신규 채용

3. 시행 일정
- 2026년 3월 1일부터 시행 예정
- 상세 일정은 추후 공지 예정

자세한 내용은 인사팀으로 문의 부탁드립니다.`
  },
  'notice-2': {
    id: 'notice-2',
    title: '신규 프로젝트 팀 구성 공지',
    date: '2026.02.18',
    author: '경영지원팀',
    category: 'notice',
    content: '신규 프로젝트 팀 구성에 대한 상세 내용입니다.'
  },
  'announcement-1': {
    id: 'announcement-1',
    title: '2026년 신입사원 채용 공고',
    date: '2026.02.19',
    author: '인사팀',
    category: 'announcement',
    content: '2026년 신입사원 채용 공고 상세 내용입니다.'
  },
  'hr-1': {
    id: 'hr-1',
    title: '신입사원 입사 안내',
    date: '2026.02.19',
    author: '인사팀',
    category: 'hr',
    content: '신입사원 입사 안내 상세 내용입니다.'
  }
};

type MailBoxType = 'inbox' | 'sent';

type MailItem = {
  id: number;
  fromUserId: string;
  toUserId: string;
  subject: string;
  body: string;
  createdAt: string;
  isRead: number;
};

export function TossDashboard({ userId, onLogout, onSwitchToClassic, onBackButton }: Props) {
  const apiAuth = useApiAuth();
  const [currentPage, setCurrentPage] = useState<PageType>('main');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [isExtending, setIsExtending] = useState<boolean>(false);
  const [mailBox, setMailBox] = useState<MailBoxType>('inbox');
  const [mailItems, setMailItems] = useState<MailItem[]>([]);
  const [selectedMail, setSelectedMail] = useState<MailItem | null>(null);
  const [isLoadingMail, setIsLoadingMail] = useState<boolean>(false);
  const [mailError, setMailError] = useState<string | null>(null);
  const [composeMode, setComposeMode] = useState<boolean>(false);
  const [composeTo, setComposeTo] = useState<string>('');
  const [composeSubject, setComposeSubject] = useState<string>('');
  const [composeBody, setComposeBody] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, selectedArticle]);

  const handleBack = () => {
    if (selectedMail) {
      setSelectedMail(null);
    } else if (composeMode) {
      setComposeMode(false);
    } else if (selectedArticle) {
      setSelectedArticle(null);
    } else if (currentPage !== 'main') {
      setCurrentPage('main');
      setSelectedArticle(null);
    } else {
      onBackButton();
    }
  };

  useBackHandler(handleBack);

  useEffect(() => {
    const updateSessionTime = async () => {
      if (apiAuth) {
        try {
          const res = await checkSession();
          if (res.ok) {
            const data = await res.json();
            setRemainingSeconds((data.remainingMinutes ?? 0) * 60);
          } else {
            onLogout();
          }
        } catch {
          onLogout();
        }
      } else {
        const session = checkLocalSession();
        if (session) {
          setRemainingSeconds(session.remainingMinutes * 60);
        } else {
          onLogout();
        }
      }
    };

    updateSessionTime();
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          updateSessionTime();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [onLogout, apiAuth]);

  const handleExtendSession = async () => {
    setIsExtending(true);
    if (apiAuth) {
      try {
        const res = await extendSession();
        if (res.ok) {
          const data = await res.json();
          setRemainingSeconds((data.remainingMinutes ?? 30) * 60);
        }
      } catch {}
    } else if (extendLocalSession()) {
      const session = checkLocalSession();
      if (session) setRemainingSeconds(session.remainingMinutes * 60);
    }
    setIsExtending(false);
  };

  // 시간 포맷팅 (MM:SS)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleArticleClick = (articleId: string) => {
    const article = articles[articleId];
    if (article) {
      setSelectedArticle(article);
    }
  };

  const handleBackToList = () => {
    setSelectedArticle(null);
  };

  const renderPageContent = () => {
    if (selectedArticle) {
      return renderArticleDetail(selectedArticle);
    }

    if (currentPage === 'mail') {
      return (
        <div className="toss-page-content">
          {renderMailContent()}
        </div>
      );
    }

    switch (currentPage) {
      case 'notice':
        return (
          <div className="toss-page-content">
            <section className="toss-section">
              <h2 className="toss-section-title">
                <span className="toss-section-icon">📢</span>
                사내통신문
              </h2>
              <h3 className="toss-section-subtitle">회사 내부 소식과 공지사항을 확인하세요</h3>
              <div className="toss-card-grid">
                <div className="toss-card" onClick={() => handleArticleClick('notice-1')}>
                  <div className="toss-card-header">
                    <span className="toss-card-category">사내통신문</span>
                    <span className="toss-card-date">2026.02.19</span>
                  </div>
                  <h4 className="toss-card-title">2026년 상반기 조직 개편 안내</h4>
                  <p className="toss-card-author">인사팀</p>
                </div>
                <div className="toss-card" onClick={() => handleArticleClick('notice-2')}>
                  <div className="toss-card-header">
                    <span className="toss-card-category">사내통신문</span>
                    <span className="toss-card-date">2026.02.18</span>
                  </div>
                  <h4 className="toss-card-title">신규 프로젝트 팀 구성 공지</h4>
                  <p className="toss-card-author">경영지원팀</p>
                </div>
              </div>
            </section>
          </div>
        );
      case 'announcement':
        return (
          <div className="toss-page-content">
            <section className="toss-section">
              <h2 className="toss-section-title">
                <span className="toss-section-icon">📋</span>
                공지사항
              </h2>
              <h3 className="toss-section-subtitle">중요한 공지사항을 확인하세요</h3>
              <div className="toss-card-grid">
                <div className="toss-card" onClick={() => handleArticleClick('announcement-1')}>
                  <div className="toss-card-header">
                    <span className="toss-card-category">공지사항</span>
                    <span className="toss-card-date">2026.02.19</span>
                  </div>
                  <h4 className="toss-card-title">2026년 신입사원 채용 공고</h4>
                  <p className="toss-card-author">인사팀</p>
                </div>
              </div>
            </section>
          </div>
        );
      case 'hr':
        return (
          <div className="toss-page-content">
            <section className="toss-section">
              <h2 className="toss-section-title">
                <span className="toss-section-icon">👥</span>
                인사통지서
              </h2>
              <h3 className="toss-section-subtitle">인사 관련 통지서를 확인하세요</h3>
              <div className="toss-card-grid">
                <div className="toss-card" onClick={() => handleArticleClick('hr-1')}>
                  <div className="toss-card-header">
                    <span className="toss-card-category">인사통지서</span>
                    <span className="toss-card-date">2026.02.19</span>
                  </div>
                  <h4 className="toss-card-title">신입사원 입사 안내</h4>
                  <p className="toss-card-author">인사팀</p>
                </div>
              </div>
            </section>
          </div>
        );
      case 'calendar':
        return (
          <div className="toss-page-content">
            <section className="toss-section">
              <h2 className="toss-section-title">
                <span className="toss-section-icon">📅</span>
                달력
              </h2>
              <h3 className="toss-section-subtitle">일정을 확인하고 관리하세요</h3>
              <div className="toss-calendar-wrapper">
                <div className="toss-calendar">
                  <div className="toss-calendar-header">
                    <button className="toss-calendar-nav">‹</button>
                    <span className="toss-calendar-month">2026년 3월</span>
                    <button className="toss-calendar-nav">›</button>
                  </div>
                  <div className="toss-calendar-grid">
                    {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                      <div key={day} className="toss-calendar-weekday">{day}</div>
                    ))}
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <div key={day} className="toss-calendar-day">{day}</div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        );
      default:
        return renderMainDashboard();
    }
  };

  const loadMail = async (box: MailBoxType) => {
    setIsLoadingMail(true);
    setMailError(null);
    setSelectedMail(null);
    setComposeMode(false);
    try {
      const res = box === 'inbox' ? await fetchInbox() : await fetchSent();
      if (!res.ok) {
        setMailError('메일 목록을 불러오지 못했습니다.');
        setMailItems([]);
        return;
      }
      const data = await res.json();
      setMailItems((data.items ?? []) as MailItem[]);
    } catch {
      setMailError('메일 목록을 불러오는 중 오류가 발생했습니다.');
      setMailItems([]);
    } finally {
      setIsLoadingMail(false);
    }
  };

  useEffect(() => {
    if (currentPage === 'mail') {
      loadMail(mailBox);
    }
  }, [currentPage, mailBox]);

  const handleSendMail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo.trim() || !composeSubject.trim() || !composeBody.trim()) {
      alert('받는 사람, 제목, 내용을 모두 입력해 주세요.');
      return;
    }
    setIsSending(true);
    try {
      const res = await sendMail(composeTo, composeSubject, composeBody);
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        alert(data?.message ?? '메일 발송에 실패했습니다.');
        return;
      }
      alert('메일이 발송되었습니다.');
      setComposeTo('');
      setComposeSubject('');
      setComposeBody('');
      setComposeMode(false);
      loadMail(mailBox);
    } finally {
      setIsSending(false);
    }
  };

  const renderMailContent = () => {
    if (composeMode) {
      return (
        <div className="toss-mail-compose">
          <div className="toss-mail-compose-header">
            <h2 className="toss-mail-title">메일 보내기</h2>
            <button
              type="button"
              className="toss-mail-back-button"
              onClick={() => setComposeMode(false)}
            >
              취소
            </button>
          </div>
          <form className="toss-mail-form" onSubmit={handleSendMail}>
            <div className="toss-mail-form-row">
              <label className="toss-mail-label">받는 사람</label>
              <input
                type="text"
                className="toss-mail-input"
                value={composeTo}
                onChange={(e) => setComposeTo(e.target.value)}
                placeholder="USER_ID를 입력하세요 (예: admin)"
                required
              />
            </div>
            <div className="toss-mail-form-row">
              <label className="toss-mail-label">제목</label>
              <input
                type="text"
                className="toss-mail-input"
                value={composeSubject}
                onChange={(e) => setComposeSubject(e.target.value)}
                placeholder="메일 제목을 입력하세요"
                required
              />
            </div>
            <div className="toss-mail-form-row">
              <label className="toss-mail-label">내용</label>
              <textarea
                className="toss-mail-textarea"
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                placeholder="메일 내용을 입력하세요"
                rows={12}
                required
              />
            </div>
            <div className="toss-mail-actions">
              <button
                type="submit"
                className="toss-mail-send-button"
                disabled={isSending}
              >
                {isSending ? '발송 중...' : '보내기'}
              </button>
            </div>
          </form>
        </div>
      );
    }

    if (selectedMail) {
      return (
        <div className="toss-mail-detail">
          <button
            className="toss-back-button"
            onClick={() => setSelectedMail(null)}
          >
            ← 목록으로
          </button>
          <div className="toss-mail-detail-header">
            <h2 className="toss-mail-detail-subject">
              {selectedMail.subject}
            </h2>
            <div className="toss-mail-detail-meta">
              <span className="toss-mail-meta-item">
                보낸 사람: {selectedMail.fromUserId}
              </span>
              <span className="toss-mail-meta-item">
                받는 사람: {selectedMail.toUserId}
              </span>
              <span className="toss-mail-meta-item">
                보낸 시각: {selectedMail.createdAt}
              </span>
            </div>
          </div>
          <div className="toss-mail-detail-body">
            {selectedMail.body.split('\n').map((line, idx) => (
              <p key={idx}>{line || '\u00A0'}</p>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="toss-mail-layout">
        <div className="toss-mail-sidebar">
          <button
            className={`toss-mail-tab ${mailBox === 'inbox' ? 'active' : ''}`}
            onClick={() => setMailBox('inbox')}
          >
            받은메일함
          </button>
          <button
            className={`toss-mail-tab ${mailBox === 'sent' ? 'active' : ''}`}
            onClick={() => setMailBox('sent')}
          >
            보낸메일함
          </button>
          <button
            className="toss-mail-compose-button"
            onClick={() => setComposeMode(true)}
          >
            새 메일
          </button>
        </div>
        <div className="toss-mail-list-area">
          <div className="toss-mail-list-header">
            <h2 className="toss-mail-title">
              {mailBox === 'inbox' ? '받은메일함' : '보낸메일함'}
            </h2>
          </div>
          {isLoadingMail ? (
            <div className="toss-mail-empty">메일을 불러오는 중입니다...</div>
          ) : mailError ? (
            <div className="toss-mail-empty">{mailError}</div>
          ) : mailItems.length === 0 ? (
            <div className="toss-mail-empty">표시할 메일이 없습니다.</div>
          ) : (
            <ul className="toss-mail-list">
              {mailItems.map((mail) => (
                <li
                  key={mail.id}
                  className="toss-mail-item"
                  onClick={() => setSelectedMail(mail)}
                >
                  <div className="toss-mail-item-main">
                    <span className="toss-mail-item-subject">
                      {mail.subject}
                    </span>
                    <span className="toss-mail-item-preview">
                      {mail.body.length > 60
                        ? `${mail.body.slice(0, 60)}...`
                        : mail.body}
                    </span>
                  </div>
                  <div className="toss-mail-item-meta">
                    <span className="toss-mail-item-user">
                      {mailBox === 'inbox'
                        ? `보낸 사람: ${mail.fromUserId}`
                        : `받는 사람: ${mail.toUserId}`}
                    </span>
                    <span className="toss-mail-item-date">
                      {mail.createdAt}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  };

  const renderMainDashboard = () => {
    return (
      <>
        <section className="toss-hero">
          <h1 className="toss-hero-title">
            내 모든 업무 내역을 한눈에 조회하고 한 곳에서 관리하세요
          </h1>
          <p className="toss-hero-subtitle">
            이제껏 경험 못 했던 쉽고 편리한 업무 서비스, 함께라면 당신의 일상이 새로워질 거예요.
          </p>
        </section>

        <section className="toss-section">
          <h2 className="toss-section-title">
            <span className="toss-section-icon">📢</span>
            사내통신문
          </h2>
          <h3 className="toss-section-subtitle">회사 내부 소식과 공지사항을 확인하세요</h3>
          <div className="toss-card-grid">
            <div className="toss-card" onClick={() => handleArticleClick('notice-1')}>
              <div className="toss-card-header">
                <span className="toss-card-category">사내통신문</span>
                <span className="toss-card-date">2026.02.19</span>
              </div>
              <h4 className="toss-card-title">2026년 상반기 조직 개편 안내</h4>
              <p className="toss-card-author">인사팀</p>
            </div>
            <div className="toss-card" onClick={() => handleArticleClick('notice-2')}>
              <div className="toss-card-header">
                <span className="toss-card-category">사내통신문</span>
                <span className="toss-card-date">2026.02.18</span>
              </div>
              <h4 className="toss-card-title">신규 프로젝트 팀 구성 공지</h4>
              <p className="toss-card-author">경영지원팀</p>
            </div>
          </div>
        </section>

        <section className="toss-section">
          <h2 className="toss-section-title">
            <span className="toss-section-icon">📋</span>
            공지사항
          </h2>
          <h3 className="toss-section-subtitle">중요한 공지사항을 확인하세요</h3>
          <div className="toss-card-grid">
            <div className="toss-card" onClick={() => handleArticleClick('announcement-1')}>
              <div className="toss-card-header">
                <span className="toss-card-category">공지사항</span>
                <span className="toss-card-date">2026.02.19</span>
              </div>
              <h4 className="toss-card-title">2026년 신입사원 채용 공고</h4>
              <p className="toss-card-author">인사팀</p>
            </div>
          </div>
        </section>

        <section className="toss-section">
          <h2 className="toss-section-title">
            <span className="toss-section-icon">👥</span>
            인사통지서
          </h2>
          <h3 className="toss-section-subtitle">인사 관련 통지서를 확인하세요</h3>
          <div className="toss-card-grid">
            <div className="toss-card" onClick={() => handleArticleClick('hr-1')}>
              <div className="toss-card-header">
                <span className="toss-card-category">인사통지서</span>
                <span className="toss-card-date">2026.02.19</span>
              </div>
              <h4 className="toss-card-title">신입사원 입사 안내</h4>
              <p className="toss-card-author">인사팀</p>
            </div>
          </div>
        </section>

        <section className="toss-section">
          <h2 className="toss-section-title">
            <span className="toss-section-icon">📅</span>
            달력
          </h2>
          <h3 className="toss-section-subtitle">일정을 확인하고 관리하세요</h3>
          <div className="toss-calendar-wrapper">
            <div className="toss-calendar">
              <div className="toss-calendar-header">
                <button className="toss-calendar-nav">‹</button>
                <span className="toss-calendar-month">2026년 3월</span>
                <button className="toss-calendar-nav">›</button>
              </div>
              <div className="toss-calendar-grid">
                {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                  <div key={day} className="toss-calendar-weekday">{day}</div>
                ))}
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <div key={day} className="toss-calendar-day">{day}</div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </>
    );
  };

  const renderArticleDetail = (article: Article) => {
    return (
      <div className="toss-article-detail">
        <button className="toss-back-button" onClick={handleBackToList}>
          ← 목록으로
        </button>
        <div className="toss-article-header">
          <span className="toss-article-category">{article.category === 'notice' ? '사내통신문' : article.category === 'announcement' ? '공지사항' : '인사통지서'}</span>
          <h1 className="toss-article-title">{article.title}</h1>
          <div className="toss-article-meta">
            <span className="toss-article-author">{article.author}</span>
            <span className="toss-article-date">{article.date}</span>
          </div>
        </div>
        <div className="toss-article-content">
          {article.content.split('\n').map((line, idx) => (
            <p key={idx}>{line || '\u00A0'}</p>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="toss-dashboard-container">
      <header className="toss-header">
        <div className="toss-header-top">
          <div className="toss-header-content">
            <div className="toss-header-left">
              <div 
                className="toss-logo-container"
                onClick={() => {
                  setCurrentPage('main');
                  setSelectedArticle(null);
                }}
              >
                <span className="toss-logo-text">KUCN</span>
                <span className="toss-logo-subtitle">Korea United Communication Network</span>
              </div>
              <img 
                src="https://www.kup.co.kr/wp-content/themes/kup/images/logo.png" 
                alt="한국유나이티드제약" 
                className="toss-company-logo"
                onClick={() => {
                  setCurrentPage('main');
                  setSelectedArticle(null);
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <div className="toss-header-right">
              <div className="toss-session-info">
                <span className="toss-session-time">남은 시간: {formatTime(remainingSeconds)}</span>
                <button 
                  className="toss-extend-btn" 
                  onClick={handleExtendSession}
                  disabled={isExtending}
                >
                  {isExtending ? '연장 중...' : '+30분'}
                </button>
              </div>
              <span className="toss-welcome">{userId}님 환영합니다</span>
              <button className="toss-logout-btn" onClick={onLogout}>로그아웃</button>
              <button className="toss-switch-dashboard-btn" onClick={onSwitchToClassic}>네이버형</button>
            </div>
          </div>
        </div>
        <nav className="toss-nav">
          <div className="toss-nav-content">
            <button 
              className={`toss-nav-item ${currentPage === 'main' ? 'active' : ''}`}
              onClick={() => setCurrentPage('main')}
            >
              메인
            </button>
            <button 
              className={`toss-nav-item ${currentPage === 'notice' ? 'active' : ''}`}
              onClick={() => setCurrentPage('notice')}
            >
              사내통신문
            </button>
            <button 
              className={`toss-nav-item ${currentPage === 'announcement' ? 'active' : ''}`}
              onClick={() => setCurrentPage('announcement')}
            >
              공지사항
            </button>
            <button 
              className={`toss-nav-item ${currentPage === 'hr' ? 'active' : ''}`}
              onClick={() => setCurrentPage('hr')}
            >
              인사통지서
            </button>
            <button 
              className={`toss-nav-item ${currentPage === 'calendar' ? 'active' : ''}`}
              onClick={() => setCurrentPage('calendar')}
            >
              달력
            </button>
            <button 
              className={`toss-nav-item ${currentPage === 'mail' ? 'active' : ''}`}
              onClick={() => setCurrentPage('mail')}
            >
              메일
            </button>
          </div>
        </nav>
      </header>

      <main className="toss-main">
        {renderPageContent()}
      </main>

      <footer className="toss-footer">
        <div className="toss-footer-content">
          <div className="toss-footer-links">
            <div className="toss-footer-column">
              <h4 className="toss-footer-column-title">서비스</h4>
              <ul className="toss-footer-list">
                <li><a href="#">공지사항</a></li>
                <li><a href="#">자주 묻는 질문</a></li>
              </ul>
            </div>
            <div className="toss-footer-column">
              <h4 className="toss-footer-column-title">회사</h4>
              <ul className="toss-footer-list">
                <li><a href="#">회사 소개</a></li>
                <li><a href="#">채용</a></li>
              </ul>
            </div>
            <div className="toss-footer-column">
              <h4 className="toss-footer-column-title">고객센터</h4>
              <ul className="toss-footer-list">
                <li>전화: 02-1234-5678</li>
                <li>이메일: support@kup.co.kr</li>
              </ul>
            </div>
          </div>
          <div className="toss-footer-bottom">
            <p className="toss-footer-company"><strong>한국유나이티드제약</strong></p>
            <p className="toss-footer-info">사업자 등록번호 : 123-45-67890 | 대표 : 홍길동</p>
            <p className="toss-footer-info">서울특별시 강남구 테헤란로 123</p>
            <p className="toss-footer-copyright">Copyright 2026 한국유나이티드제약</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
