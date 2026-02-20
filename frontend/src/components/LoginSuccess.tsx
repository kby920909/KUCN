import { useState, useEffect } from 'react';
import './Dashboard.css';
import { useApiAuth } from '../config/env';
import { checkSession, extendSession } from '../api/auth';
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
  onSwitchToToss: () => void;
  onBackButton: () => void;
};

type PageType = 'main' | 'notice' | 'announcement' | 'hr' | 'calendar' | 'hr-write';

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
    content: `경영지원팀에서 신규 프로젝트 팀 구성에 대해 공지드립니다.

새로운 프로젝트를 위해 전사 차원의 프로젝트 팀을 구성하게 되었습니다.

1. 프로젝트 개요
- 프로젝트명: 디지털 전환 프로젝트
- 기간: 2026년 3월 ~ 12월
- 목표: 업무 프로세스 디지털화

2. 팀 구성
- 프로젝트 매니저: 1명
- 개발팀: 5명
- 기획팀: 3명
- 운영팀: 2명

3. 참여 희망자 모집
- 지원 기간: 2월 20일 ~ 2월 25일
- 지원 방법: 경영지원팀으로 이메일 제출

많은 관심과 참여 부탁드립니다.`
  },
  'notice-3': {
    id: 'notice-3',
    title: '사내 복지 프로그램 안내',
    date: '2026.02.17',
    author: '총무팀',
    category: 'notice',
    content: `총무팀에서 사내 복지 프로그램에 대해 안내드립니다.

직원들의 건강과 워라밸 향상을 위한 다양한 복지 프로그램을 운영합니다.

1. 건강검진 지원
- 연 1회 정기 건강검진 실시
- 추가 검진 항목 선택 가능

2. 문화 생활 지원
- 영화 관람권 월 2매 제공
- 도서 구매비 지원

3. 체육 활동 지원
- 헬스장 이용료 지원
- 사내 동아리 활동 지원

4. 교육 지원
- 자격증 취득비 지원
- 온라인 강의 수강 지원

자세한 내용은 총무팀으로 문의 바랍니다.`
  },
  'announcement-1': {
    id: 'announcement-1',
    title: '시스템 점검 안내 (2/20 02:00~04:00)',
    date: '2026.02.19',
    author: 'IT팀',
    category: 'announcement',
    content: `IT팀에서 시스템 점검 일정을 안내드립니다.

서버 안정성 향상을 위한 정기 점검을 실시합니다.

1. 점검 일시
- 일시: 2026년 2월 20일 (목) 02:00 ~ 04:00
- 소요 시간: 약 2시간

2. 점검 영향
- 점검 시간 동안 모든 시스템 이용 불가
- 이메일, 파일 서버, 인트라넷 등 일시 중단

3. 주의 사항
- 점검 전 중요한 작업 저장 필수
- 점검 시간 전 로그아웃 권장

점검 완료 후 정상 이용 가능합니다.
불편을 드려 죄송합니다.`
  },
  'announcement-2': {
    id: 'announcement-2',
    title: '보안 정책 변경 안내',
    date: '2026.02.18',
    author: '보안팀',
    category: 'announcement',
    content: `보안팀에서 보안 정책 변경 사항을 안내드립니다.

정보 보안 강화를 위해 보안 정책을 개선하였습니다.

1. 비밀번호 정책 변경
- 최소 12자 이상 필수
- 영문, 숫자, 특수문자 조합 필수
- 90일마다 비밀번호 변경

2. 2단계 인증 도입
- 주요 시스템 접근 시 2단계 인증 필수
- 모바일 앱 또는 SMS 인증

3. 외부 메일 차단 강화
- 의심스러운 첨부파일 자동 차단
- 외부 링크 클릭 시 경고 메시지

4. 시행 일정
- 2026년 3월 1일부터 시행
- 기존 비밀번호는 3월 31일까지 변경 필수

자세한 내용은 보안팀으로 문의 바랍니다.`
  },
  'announcement-3': {
    id: 'announcement-3',
    title: '연차 사용 가이드 업데이트',
    date: '2026.02.17',
    author: '인사팀',
    category: 'announcement',
    content: `인사팀에서 연차 사용 가이드가 업데이트되었음을 안내드립니다.

연차 사용 관련 정책이 일부 변경되었습니다.

1. 연차 발생 기준
- 입사일 기준 매년 발생
- 근속 1년차: 15일
- 근속 2년차 이상: 20일

2. 연차 사용 기한
- 발생일로부터 1년 이내 사용
- 미사용 연차는 소멸

3. 연차 신청 방법
- 인사시스템에서 온라인 신청
- 최소 3일 전 신청 필수
- 팀장 승인 후 사용 가능

4. 변경 사항
- 반차 사용 가능 시간 확대
- 연차 연계 사용 시 추가 혜택

자세한 내용은 인사시스템에서 확인하실 수 있습니다.`
  },
  'hr-1': {
    id: 'hr-1',
    title: '신입사원 입사 안내',
    date: '2026.02.19',
    author: '인사팀',
    category: 'hr',
    content: `인사팀에서 신입사원 입사에 대해 안내드립니다.

2026년 상반기 신입사원이 입사합니다.

1. 입사 일정
- 입사일: 2026년 3월 1일 (월)
- 오리엔테이션: 3월 1일 ~ 3일

2. 신입사원 정보
- 총 15명 입사 예정
- 각 부서별 배치 예정

3. 멘토 지정
- 각 신입사원마다 멘토 1명 지정
- 멘토는 입사 전까지 지정 예정

4. 준비 사항
- 사무실 배치 및 장비 준비
- 명함 및 출입증 발급

신입사원들의 따뜻한 환영 부탁드립니다.`
  },
  'hr-2': {
    id: 'hr-2',
    title: '인사이동 발령 공지',
    date: '2026.02.18',
    author: '인사팀',
    category: 'hr',
    content: `인사팀에서 인사이동 발령에 대해 공지드립니다.

2026년 상반기 정기 인사이동이 실시됩니다.

1. 발령 일시
- 발령일: 2026년 3월 1일
- 이전일: 2026년 2월 28일

2. 주요 이동 사항
- 부서 간 이동: 총 25명
- 승진: 총 8명
- 신규 임용: 총 5명

3. 이동 대상자
- 개별 통보 완료
- 상세 내용은 인사시스템에서 확인 가능

4. 준비 사항
- 업무 인수인계 완료
- 사무실 이전 준비

자세한 내용은 인사팀으로 문의 바랍니다.`
  },
  'hr-3': {
    id: 'hr-3',
    title: '승진 발령 안내',
    date: '2026.02.17',
    author: '인사팀',
    category: 'hr',
    content: `인사팀에서 승진 발령에 대해 안내드립니다.

2026년 상반기 승진 발령이 확정되었습니다.

1. 승진 일시
- 발령일: 2026년 3월 1일
- 시상식: 2026년 3월 5일 예정

2. 승진 인원
- 부장 승진: 2명
- 차장 승진: 3명
- 과장 승진: 3명

3. 승진 기준
- 업무 성과 및 역량 평가
- 근속 기간 및 자격 요건

4. 축하
- 승진하신 분들께 축하 인사드립니다.
- 앞으로도 더욱 발전하는 모습 기대합니다.

자세한 내용은 인사팀으로 문의 바랍니다.`
  }
};

export function LoginSuccess({ userId, onLogout, onSwitchToToss, onBackButton }: Props) {
  const apiAuth = useApiAuth();
  const [currentPage, setCurrentPage] = useState<PageType>('main');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [isExtending, setIsExtending] = useState<boolean>(false);

  const handleBack = () => {
    if (selectedArticle) {
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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [hrFormData, setHrFormData] = useState({
    title: '',
    content: '',
    date: ''
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(year, month, day);
    setSelectedDate(clickedDate);
    const dateStr = `${clickedDate.getFullYear()}-${String(clickedDate.getMonth() + 1).padStart(2, '0')}-${String(clickedDate.getDate()).padStart(2, '0')}`;
    setHrFormData({
      title: '',
      content: '',
      date: dateStr
    });
    setCurrentPage('hr-write');
    setSelectedArticle(null);
  };

  const handleHrFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('인사통지서가 등록되었습니다.');
    setHrFormData({ title: '', content: '', date: '' });
    setCurrentPage('hr');
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

  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  const renderCalendarDays = () => {
    const days = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = 
        date.getDate() === new Date().getDate() &&
        date.getMonth() === new Date().getMonth() &&
        date.getFullYear() === new Date().getFullYear();
      const isSelected = selectedDate && 
        date.getDate() === selectedDate.getDate() &&
        date.getMonth() === selectedDate.getMonth() &&
        date.getFullYear() === selectedDate.getFullYear();

      days.push(
        <div
          key={day}
          className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
          onClick={() => handleDateClick(day)}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  const renderArticleDetail = (article: Article) => {
    const categoryNames: Record<PageType, string> = {
      'main': '메인',
      'notice': '사내통신문',
      'announcement': '공지사항',
      'hr': '인사통지서',
      'calendar': '달력',
      'hr-write': '인사통지서 작성'
    };

    return (
      <div className="article-detail">
        <button className="back-button" onClick={handleBackToList}>
          ← 목록으로
        </button>
        <div className="article-header">
          <span className="article-category">{categoryNames[article.category]}</span>
          <h1 className="article-title">{article.title}</h1>
          <div className="article-meta">
            <span className="article-author">{article.author}</span>
            <span className="article-date">{article.date}</span>
          </div>
        </div>
        <div className="article-content">
          {article.content.split('\n').map((line, idx) => (
            <p key={idx}>{line || '\u00A0'}</p>
          ))}
        </div>
      </div>
    );
  };

  const renderHrWriteForm = () => {
    return (
      <div className="hr-write-form">
        <div className="form-header">
          <h2 className="form-title">인사통지서 작성</h2>
          <button className="back-button" onClick={() => {
            setCurrentPage('hr');
            setHrFormData({ title: '', content: '', date: '' });
          }}>
            <span className="back-icon">←</span>
            <span className="back-text">목록</span>
          </button>
        </div>
        <form onSubmit={handleHrFormSubmit} className="hr-form">
          <div className="form-group">
            <label className="form-label">제목</label>
            <input
              type="text"
              className="form-input"
              value={hrFormData.title}
              onChange={(e) => setHrFormData({ ...hrFormData, title: e.target.value })}
              placeholder="인사통지서 제목을 입력하세요"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">날짜</label>
            <input
              type="date"
              className="form-input"
              value={hrFormData.date}
              onChange={(e) => setHrFormData({ ...hrFormData, date: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">내용</label>
            <textarea
              className="form-textarea"
              value={hrFormData.content}
              onChange={(e) => setHrFormData({ ...hrFormData, content: e.target.value })}
              placeholder="인사통지서 내용을 입력하세요"
              rows={15}
              required
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => {
              setCurrentPage('hr');
              setHrFormData({ title: '', content: '', date: '' });
            }}>
              취소
            </button>
            <button type="submit" className="btn-submit">
              등록하기
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderMainDashboard = () => (
    <div className="dashboard-grid">
      <section className="dashboard-card">
        <h2 className="card-title">사내통신문</h2>
        <div className="card-content">
          <ul className="notice-list">
            <li onClick={() => handleArticleClick('notice-1')}>
              <span className="notice-date">2026.02.19</span>
              <span className="notice-text">2026년 상반기 조직 개편 안내</span>
            </li>
            <li onClick={() => handleArticleClick('notice-2')}>
              <span className="notice-date">2026.02.18</span>
              <span className="notice-text">신규 프로젝트 팀 구성 공지</span>
            </li>
            <li onClick={() => handleArticleClick('notice-3')}>
              <span className="notice-date">2026.02.17</span>
              <span className="notice-text">사내 복지 프로그램 안내</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="dashboard-card">
        <h2 className="card-title">공지사항</h2>
        <div className="card-content">
          <ul className="notice-list">
            <li onClick={() => handleArticleClick('announcement-1')}>
              <span className="notice-date">2026.02.19</span>
              <span className="notice-text">시스템 점검 안내 (2/20 02:00~04:00)</span>
            </li>
            <li onClick={() => handleArticleClick('announcement-2')}>
              <span className="notice-date">2026.02.18</span>
              <span className="notice-text">보안 정책 변경 안내</span>
            </li>
            <li onClick={() => handleArticleClick('announcement-3')}>
              <span className="notice-date">2026.02.17</span>
              <span className="notice-text">연차 사용 가이드 업데이트</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="dashboard-card">
        <h2 className="card-title">인사통지서</h2>
        <div className="card-content">
          <ul className="notice-list">
            <li onClick={() => handleArticleClick('hr-1')}>
              <span className="notice-date">2026.02.19</span>
              <span className="notice-text">신입사원 입사 안내</span>
            </li>
            <li onClick={() => handleArticleClick('hr-2')}>
              <span className="notice-date">2026.02.18</span>
              <span className="notice-text">인사이동 발령 공지</span>
            </li>
            <li onClick={() => handleArticleClick('hr-3')}>
              <span className="notice-date">2026.02.17</span>
              <span className="notice-text">승진 발령 안내</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="dashboard-card calendar-card">
        <h2 className="card-title">달력</h2>
        <div className="card-content">
          <div className="calendar-wrapper">
            <div className="calendar-header">
              <button className="calendar-nav-btn" onClick={prevMonth}>‹</button>
              <span className="calendar-month-year">
                {year}년 {monthNames[month]}
              </span>
              <button className="calendar-nav-btn" onClick={nextMonth}>›</button>
            </div>
            <div className="calendar-weekdays">
              {weekDays.map((day) => (
                <div key={day} className="calendar-weekday">{day}</div>
              ))}
            </div>
            <div className="calendar-days">
              {renderCalendarDays()}
            </div>
            {selectedDate && (
              <div className="calendar-selected">
                선택된 날짜: {selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );

  const renderPageContent = () => {
    if (selectedArticle) {
      return renderArticleDetail(selectedArticle);
    }

    if (currentPage === 'hr-write') {
      return renderHrWriteForm();
    }

    switch (currentPage) {
      case 'notice':
        return (
          <div className="page-content">
            <h2 className="page-title">사내통신문</h2>
            <div className="page-list">
              <div className="page-item" onClick={() => handleArticleClick('notice-1')}>
                <span className="item-date">2026.02.19</span>
                <span className="item-title">2026년 상반기 조직 개편 안내</span>
                <span className="item-author">인사팀</span>
              </div>
              <div className="page-item" onClick={() => handleArticleClick('notice-2')}>
                <span className="item-date">2026.02.18</span>
                <span className="item-title">신규 프로젝트 팀 구성 공지</span>
                <span className="item-author">경영지원팀</span>
              </div>
              <div className="page-item" onClick={() => handleArticleClick('notice-3')}>
                <span className="item-date">2026.02.17</span>
                <span className="item-title">사내 복지 프로그램 안내</span>
                <span className="item-author">총무팀</span>
              </div>
              <div className="page-item" onClick={() => handleArticleClick('notice-1')}>
                <span className="item-date">2026.02.16</span>
                <span className="item-title">월간 사내소식지 발행 안내</span>
                <span className="item-author">홍보팀</span>
              </div>
              <div className="page-item" onClick={() => handleArticleClick('notice-2')}>
                <span className="item-date">2026.02.15</span>
                <span className="item-title">사내 동아리 모집 공지</span>
                <span className="item-author">인사팀</span>
              </div>
            </div>
          </div>
        );
      case 'announcement':
        return (
          <div className="page-content">
            <h2 className="page-title">공지사항</h2>
            <div className="page-list">
              <div className="page-item" onClick={() => handleArticleClick('announcement-1')}>
                <span className="item-date">2026.02.19</span>
                <span className="item-title">시스템 점검 안내 (2/20 02:00~04:00)</span>
                <span className="item-author">IT팀</span>
              </div>
              <div className="page-item" onClick={() => handleArticleClick('announcement-2')}>
                <span className="item-date">2026.02.18</span>
                <span className="item-title">보안 정책 변경 안내</span>
                <span className="item-author">보안팀</span>
              </div>
              <div className="page-item" onClick={() => handleArticleClick('announcement-3')}>
                <span className="item-date">2026.02.17</span>
                <span className="item-title">연차 사용 가이드 업데이트</span>
                <span className="item-author">인사팀</span>
              </div>
              <div className="page-item" onClick={() => handleArticleClick('announcement-1')}>
                <span className="item-date">2026.02.16</span>
                <span className="item-title">출입증 재발급 안내</span>
                <span className="item-author">총무팀</span>
              </div>
              <div className="page-item" onClick={() => handleArticleClick('announcement-2')}>
                <span className="item-date">2026.02.15</span>
                <span className="item-title">주차장 이용 규정 변경 공지</span>
                <span className="item-author">총무팀</span>
              </div>
            </div>
          </div>
        );
      case 'hr':
        return (
          <div className="page-content">
            <h2 className="page-title">인사통지서</h2>
            <div className="page-list">
              <div className="page-item" onClick={() => handleArticleClick('hr-1')}>
                <span className="item-date">2026.02.19</span>
                <span className="item-title">신입사원 입사 안내</span>
                <span className="item-author">인사팀</span>
              </div>
              <div className="page-item" onClick={() => handleArticleClick('hr-2')}>
                <span className="item-date">2026.02.18</span>
                <span className="item-title">인사이동 발령 공지</span>
                <span className="item-author">인사팀</span>
              </div>
              <div className="page-item" onClick={() => handleArticleClick('hr-3')}>
                <span className="item-date">2026.02.17</span>
                <span className="item-title">승진 발령 안내</span>
                <span className="item-author">인사팀</span>
              </div>
              <div className="page-item" onClick={() => handleArticleClick('hr-1')}>
                <span className="item-date">2026.02.16</span>
                <span className="item-title">부서 이동 발령 공지</span>
                <span className="item-author">인사팀</span>
              </div>
              <div className="page-item" onClick={() => handleArticleClick('hr-2')}>
                <span className="item-date">2026.02.15</span>
                <span className="item-title">신규 임원 임명 안내</span>
                <span className="item-author">인사팀</span>
              </div>
            </div>
          </div>
        );
      case 'calendar':
        return (
          <div className="page-content calendar-page">
            <h2 className="page-title">달력</h2>
            <div className="calendar-full-wrapper">
              <div className="calendar-header">
                <button className="calendar-nav-btn" onClick={prevMonth}>‹</button>
                <span className="calendar-month-year">
                  {year}년 {monthNames[month]}
                </span>
                <button className="calendar-nav-btn" onClick={nextMonth}>›</button>
              </div>
              <div className="calendar-weekdays">
                {weekDays.map((day) => (
                  <div key={day} className="calendar-weekday">{day}</div>
                ))}
              </div>
              <div className="calendar-days">
                {renderCalendarDays()}
              </div>
              {selectedDate && (
                <div className="calendar-selected">
                  선택된 날짜: {selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일
                </div>
              )}
            </div>
          </div>
        );
      default:
        return renderMainDashboard();
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-top">
          <div className="header-left">
            <div 
              className="logo-container"
              onClick={() => {
                setCurrentPage('main');
                setSelectedArticle(null);
              }}
            >
              <span className="logo-text-kucn">KUCN</span>
              <span className="logo-subtitle">Korea United Communication Network</span>
            </div>
            <a 
              href="#" 
              className="logo-link"
              onClick={(e) => {
                e.preventDefault();
                setCurrentPage('main');
                setSelectedArticle(null);
              }}
            >
              <img 
                src="https://www.kup.co.kr/wp-content/themes/kup/images/logo.png" 
                alt="한국유나이티드제약" 
                className="company-logo"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const textEl = target.nextElementSibling as HTMLElement;
                  if (textEl && textEl.classList.contains('logo-text')) {
                    textEl.style.display = 'inline-block';
                  }
                }}
              />
            </a>
          </div>
          <div className="header-right">
            <div className="session-info">
              <span className="session-time">남은 시간: {formatTime(remainingSeconds)}</span>
              <button 
                className="extend-btn" 
                onClick={handleExtendSession}
                disabled={isExtending}
              >
                {isExtending ? '연장 중...' : '+30분'}
              </button>
            </div>
            <span className="welcome-message">{userId}님 환영합니다</span>
            <button className="logout-btn" onClick={onLogout}>로그아웃</button>
            <button className="switch-dashboard-btn" onClick={onSwitchToToss}>토스형</button>
          </div>
        </div>
        <nav className="main-nav">
          <button 
            className={`nav-item ${currentPage === 'main' && !selectedArticle ? 'active' : ''}`}
            onClick={() => {
              setCurrentPage('main');
              setSelectedArticle(null);
            }}
          >
            메인
          </button>
          <button 
            className={`nav-item ${currentPage === 'notice' && !selectedArticle ? 'active' : ''}`}
            onClick={() => {
              setCurrentPage('notice');
              setSelectedArticle(null);
            }}
          >
            사내통신문
          </button>
          <button 
            className={`nav-item ${currentPage === 'announcement' && !selectedArticle ? 'active' : ''}`}
            onClick={() => {
              setCurrentPage('announcement');
              setSelectedArticle(null);
            }}
          >
            공지사항
          </button>
          <button 
            className={`nav-item ${(currentPage === 'hr' || currentPage === 'hr-write') && !selectedArticle ? 'active' : ''}`}
            onClick={() => {
              setCurrentPage('hr');
              setSelectedArticle(null);
            }}
          >
            인사통지서
          </button>
          <button 
            className={`nav-item ${currentPage === 'calendar' && !selectedArticle ? 'active' : ''}`}
            onClick={() => {
              setCurrentPage('calendar');
              setSelectedArticle(null);
            }}
          >
            달력
          </button>
        </nav>
      </header>

      <main className="dashboard-main">
        {renderPageContent()}
      </main>

      <footer className="dashboard-footer">
        <div className="footer-content">
          <div className="footer-info">
            <p className="footer-company">한국유나이티드제약</p>
            <p className="footer-address">
              서울특별시 강남구 테헤란로 123 | 대표이사: 홍길동<br />
              사업자등록번호: 123-45-67890 | 통신판매업신고번호: 제2026-서울강남-0001호
            </p>
            <p className="footer-contact">
              Tel: 02-1234-5678 | Fax: 02-1234-5679 | Email: info@kup.co.kr
            </p>
          </div>
          <div className="footer-copyright">
            <p>Copyright © 2026 한국유나이티드제약. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
