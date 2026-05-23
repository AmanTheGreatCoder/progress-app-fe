import { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';

const Analytics = () => {
  const [data, setData] = useState<{ goalStats: any[], avgCompletion: number } | null>(null);

  useEffect(() => {
    fetch('http://localhost:3001/api/analytics')
      .then(r => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  if (!data) return null;

  const { goalStats, avgCompletion } = data;

  return (
    <div className="analytics-page">
      <header className="analytics-header fade-up">
        <h1 className="analytics-title">Analytics</h1>
        <p className="analytics-subtitle">Goal Completion Rate History</p>
      </header>

      <div className="analytics-overview fade-up fade-up-1">
        <div className="avg-rate-card">
           <BarChart3 size={28} color="var(--accent)" />
           <div className="avg-rate-info">
             <span className="avg-val">{avgCompletion}%</span>
             <span className="avg-lbl">Average Completion</span>
           </div>
        </div>
      </div>

      <div className="goal-history-list fade-up fade-up-2">
        {goalStats.map(g => (
          <div key={g.id} className="goal-history-card">
            <div className="gh-header">
              <span className="gh-title">{g.title}</span>
              <span className="gh-pct" style={{ color: g.pct >= 100 ? 'var(--green)' : 'var(--text-1)' }}>{g.pct}%</span>
            </div>
            <div className="gh-bar-bg">
              <div className="gh-bar-fill" style={{ width: `${Math.min(g.pct, 100)}%`, background: g.pct >= 100 ? 'var(--green)' : 'var(--accent)' }} />
            </div>
            <div className="gh-footer">
              <span className="gh-cat">{g.category || 'Uncategorized'}</span>
              <span className="gh-prog">{g.done} / {g.total} completed</span>
            </div>
          </div>
        ))}
        {goalStats.length === 0 && (
          <div className="empty-analytics">
            <p>No goals found. Create some goals to see your completion history.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
