import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, ChevronLeft, ChevronRight, LayoutGrid, List, Flame } from 'lucide-react';
import './Dashboard.css';

const GRADE_CONFIG: Record<string, { label: string; color: string; ring: string }> = {
  S: { label: 'S', color: '#FFD60A', ring: '#FFD60A' },
  A: { label: 'A', color: '#30D158', ring: '#30D158' },
  B: { label: 'B', color: '#0A84FF', ring: '#0A84FF' },
  C: { label: 'C', color: '#FF9F0A', ring: '#FF9F0A' },
  D: { label: 'D', color: '#FF453A', ring: '#FF453A' },
};

function getGrade(score: number) {
  if (score >= 50) return GRADE_CONFIG.S;
  if (score >= 40) return GRADE_CONFIG.A;
  if (score >= 30) return GRADE_CONFIG.B;
  if (score >= 20) return GRADE_CONFIG.C;
  return GRADE_CONFIG.D;
}

const R = 54;
const CIRC = 2 * Math.PI * R;

const ScoreRing = ({ score, grade }: { score: number; grade: typeof GRADE_CONFIG.S }) => {
  const maxScore = 120;
  const pct = Math.min(score / maxScore, 1);
  const offset = CIRC * (1 - pct);

  return (
    <div className="score-ring-wrap">
      <svg viewBox="0 0 120 120" className="score-ring-svg">
        <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
        <circle
          cx="60" cy="60" r={R}
          fill="none"
          stroke={grade.ring}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
          style={{
            transition: 'stroke-dashoffset 1.1s cubic-bezier(0.34,1.56,0.64,1)',
            filter: `drop-shadow(0 0 6px ${grade.ring}66)`
          }}
        />
      </svg>
      <div className="score-ring-inner">
        <span className="score-ring-number">{score}</span>
        <span className="score-ring-label">pts</span>
        <span className="grade-pill" style={{ background: grade.color + '1A', color: grade.color }}>
          Grade {grade.label}
        </span>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  
  const today = new Date().toISOString().split('T')[0];
  const [viewDate, setViewDate] = useState(today);
  const [weekView, setWeekView] = useState(false);
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/api/dashboard?date=${viewDate}`);
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [viewDate]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleSync = async () => {
    setSyncing(true);
    setSyncMsg('');
    try {
      const res = await fetch('http://localhost:3001/api/sync', { method: 'POST' });
      const d = await res.json();
      setSyncMsg(`Synced ${d.synced} tasks`);
      fetchDashboard();
    } catch {
      setSyncMsg('Sync failed');
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncMsg(''), 3000);
    }
  };

  if (loading) return (
    <div className="dashboard">
      <div className="skeleton" style={{ height: 52, marginBottom: 4 }} />
      <div className="skeleton" style={{ height: 256, borderRadius: 22 }} />
      <div className="skeleton" style={{ height: 80 }} />
      <div className="skeleton" style={{ height: 210 }} />
    </div>
  );

  if (error) return (
    <div className="error-state fade-up">
      <p>{error}</p>
      <button className="sync-btn" onClick={handleSync}>Retry Sync</button>
    </div>
  );

  if (!data) return null;

  const {
    dailyScores,
    currentScore,
    streak,
    tagBreakdown,
    viewDone,
    totalView,
    completionPct,
    highDone,
    sortedDays,
    maxDayScore
  } = data;

  const grade = getGrade(currentScore);
  const dateObj = new Date(viewDate + 'T12:00:00');
  const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const isToday = viewDate === today;

  const navigateDate = (offset: number) => {
    const d = new Date(viewDate + 'T12:00:00');
    d.setDate(d.getDate() + offset);
    setViewDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dash-header fade-up">
        <div>
          <h1 className="dash-title">Daily Progress</h1>
          <div className="dash-date-nav">
            <button className="date-nav-btn" onClick={() => navigateDate(-1)}><ChevronLeft size={16} /></button>
            <p className="dash-date">{isToday ? `Today, ${dateStr}` : dateStr}</p>
            <button className="date-nav-btn" onClick={() => navigateDate(1)} disabled={isToday}><ChevronRight size={16} /></button>
          </div>
        </div>
        <button className={`sync-icon-btn ${syncing ? 'spinning' : ''}`} onClick={handleSync} title="Sync from Notion">
          <RefreshCw size={17} strokeWidth={2} />
        </button>
      </header>

      {syncMsg && <div className="sync-toast fade-up">{syncMsg}</div>}

      {/* Score Ring Card */}
      <section className="fade-up fade-up-1">
        <div className="score-card">
          <ScoreRing score={currentScore} grade={grade} />
          <p className="score-subtitle">{isToday ? "Today's Score" : "Score for " + dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
          {streak > 0 && (
             <div className="streak-badge">
               <Flame size={14} color="var(--orange)" />
               <span>{streak} Day Streak</span>
             </div>
          )}
        </div>
      </section>

      {/* Stats — single card with dividers */}
      <section className="fade-up fade-up-2">
        <div className="stats-card">
          <div className="stat-cell">
            <span className="stat-val">{viewDone}<span className="stat-of">/{totalView}</span></span>
            <span className="stat-lbl">Done</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-cell">
            <span className="stat-val">{completionPct}<span className="stat-of">%</span></span>
            <span className="stat-lbl">Rate</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-cell">
            <span className="stat-val">{highDone}</span>
            <span className="stat-lbl">High ✓</span>
          </div>
        </div>
      </section>
      
      {/* Tag Breakdown */}
      {(tagBreakdown.Work > 0 || tagBreakdown.Health > 0 || tagBreakdown.Personal > 0) && (
        <section className="fade-up fade-up-2">
           <div className="tag-breakdown">
             {tagBreakdown.Work > 0 && <div className="tag-stat work"><span className="tag-val">{tagBreakdown.Work}</span><span className="tag-name">Work</span></div>}
             {tagBreakdown.Health > 0 && <div className="tag-stat health"><span className="tag-val">{tagBreakdown.Health}</span><span className="tag-name">Health</span></div>}
             {tagBreakdown.Personal > 0 && <div className="tag-stat personal"><span className="tag-val">{tagBreakdown.Personal}</span><span className="tag-name">Personal</span></div>}
           </div>
        </section>
      )}

      {/* Weekly Chart */}
      <section className="weekly-section fade-up fade-up-3">
        <div className="weekly-header">
           <h2 className="section-title">Weekly History</h2>
           <button className="view-toggle" onClick={() => setWeekView(!weekView)}>
             {weekView ? <List size={14} /> : <LayoutGrid size={14} />}
           </button>
        </div>
        
        {weekView ? (
          <div className="history-grid">
            {Array.from({ length: 7 }).map((_, i) => {
               const d = new Date();
               d.setDate(d.getDate() - (6 - i));
               const dStr = d.toISOString().split('T')[0];
               const s = dailyScores[dStr] || 0;
               const g = getGrade(s);
               return (
                 <div key={dStr} className="grid-day" style={{ background: s > 0 ? g.color + '22' : 'var(--bg-2)', borderColor: s > 0 ? g.color + '55' : 'transparent' }}>
                    <span className="g-day">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                    <span className="g-score" style={{ color: s > 0 ? g.color : 'var(--text-3)' }}>{s > 0 ? g.label : '-'}</span>
                 </div>
               );
            })}
          </div>
        ) : (
          <div className="history-list">
            {sortedDays.map(([date, score], i) => {
              const g = getGrade(score);
              const barPct = (score / maxDayScore) * 100;
              const isTodayRow = date === today;
              return (
                <div key={date} className="history-row fade-up" style={{ animationDelay: `${0.22 + i * 0.05}s` }}>
                  <span className={`history-day ${isTodayRow ? 'today' : ''}`}>
                    {isTodayRow ? 'Today' : new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  <div className="history-bar-bg">
                    <div
                      className="history-bar-fill"
                      style={{ width: `${barPct}%`, background: g.ring }}
                    />
                  </div>
                  <span className="history-score" style={{ color: g.color }}>{score}</span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
