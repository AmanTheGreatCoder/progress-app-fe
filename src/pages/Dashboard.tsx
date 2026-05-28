import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Icon } from '../components/ui/Icon';
import { TaskRow } from '../components/ui/TaskRow';
import { GoalRow, goalDaysLeft, goalPct } from '../components/ui/GoalRow';
import { todayDate } from '../utils/dateUtils';

const PRIORITY_ORDER: Record<string, number> = { High: 0, Medium: 1, Low: 2 };

const Dashboard: React.FC = () => {
  const { goals, tasks, toggleTask } = useAppContext();
  const navigate = useNavigate();

  const todayStr = new Date().toISOString().split('T')[0];
  const todays = tasks.filter(t => t.due === 'Today' || t.due === todayStr);
  const doneToday = todays.filter(t => t.done).length;
  const active = goals.filter(g => !g.archived);

  const sorted = [...active].sort((a, b) => {
    const pDiff = (PRIORITY_ORDER[a.priority] ?? 3) - (PRIORITY_ORDER[b.priority] ?? 3);
    if (pDiff !== 0) return pDiff;
    return goalDaysLeft(a) - goalDaysLeft(b);
  });

  const totalStreak = active.length > 0 ? Math.max(...active.map(g => g.streak || 0)) : 0;
  const avgProgress = active.length > 0 ? Math.round(active.reduce((s, g) => s + goalPct(g), 0) / active.length) : 0;

  return (
    <div style={{ padding: '0px 0 140px' }}>

      {/* Greeting */}
      <div style={{ padding: '8px 20px 20px' }}>
        <div style={{ color: 'var(--text-secondary)', fontSize: 13, letterSpacing: 0.4, textTransform: 'uppercase' }}>
          {Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(todayDate())} · {Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(todayDate())}
        </div>
        <div style={{ color: 'var(--text-primary)', fontSize: 28, fontWeight: 700, marginTop: 4, letterSpacing: -0.4 }}>
          Morning, Alex
        </div>
      </div>

      {/* Streak + summary stats */}
      <div style={{ padding: '0 20px 20px' }}>
        <Card pad={18} style={{ background: 'linear-gradient(135deg, var(--surface) 0%, #20203a 100%)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between">
            <div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 12, letterSpacing: 0.4, textTransform: 'uppercase', fontWeight: 600 }}>
                Best streak
              </div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span style={{ color: 'var(--text-primary)', fontSize: 36, fontWeight: 700, letterSpacing: -1 }}>{totalStreak}</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>days</span>
              </div>
            </div>
            <div style={{
              width: 64, height: 64, borderRadius: 20,
              background: 'radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--secondary) 33%, transparent), color-mix(in srgb, var(--primary) 22%, transparent))',
              display: 'grid', placeItems: 'center',
            }}>
              <Icon name="flame" size={32} color="var(--secondary)" stroke={2} />
            </div>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12,
            marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--border)',
          }}>
            {[
              { v: `${doneToday}/${todays.length}`, l: 'Tasks today' },
              { v: active.length, l: 'Active goals' },
              { v: `${avgProgress}%`, l: 'Avg progress' },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ color: 'var(--text-primary)', fontSize: 18, fontWeight: 700 }}>{s.v}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 11, marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Today's tasks */}
      <div className="flex justify-between items-center" style={{ padding: '0 20px 12px' }}>
        <h3 style={{ color: 'var(--text-primary)', fontSize: 16, fontWeight: 700, margin: 0 }}>Today</h3>
        <button
          onClick={() => navigate('/tasks')}
          style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0 }}
        >
          See all
        </button>
      </div>
      <div style={{ padding: '0 20px 24px' }}>
        <Card pad={0} style={{ overflow: 'hidden' }}>
          {todays.map((t, i) => (
            <div key={t.id} style={{ borderBottom: i === todays.length - 1 ? 'none' : '1px solid var(--border)' }}>
              <TaskRow task={t} goal={goals.find(g => g.id === t.goalId)} onToggle={() => toggleTask(t.id)} />
            </div>
          ))}
          {todays.length === 0 && (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14 }}>
              No tasks scheduled for today.
            </div>
          )}
        </Card>
      </div>

      {/* Active goals */}
      <div className="flex justify-between items-center" style={{ padding: '0 20px 12px' }}>
        <h3 style={{ color: 'var(--text-primary)', fontSize: 16, fontWeight: 700, margin: 0 }}>Active goals</h3>
        <button
          onClick={() => navigate('/goals')}
          style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0 }}
        >
          See all
        </button>
      </div>
      <div style={{ padding: '0 20px' }}>
        {sorted.slice(0, 3).map(g => (
          <GoalRow key={g.id} goal={g} onClick={() => navigate(`/goals?id=${g.id}`)} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
