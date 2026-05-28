import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@shared/context/AppContext';
import { Card } from '@shared/components/ui/Card';
import { Icon } from '@shared/components/ui/Icon';
import { TaskRow } from '@shared/components/ui/TaskRow';
import { GoalRow } from '@shared/components/ui/GoalRow';
import { todayDate } from '@shared/utils/dateUtils';
import { goalDaysLeft, goalPct } from '@shared/utils/goalUtils';
import { PRIORITY_ORDER } from '@shared/constants';

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
    <div className="pb-[140px]">

      {/* Greeting */}
      <div className="pt-2 px-5 pb-5">
        <div className="text-c-text2 text-sm tracking-label uppercase">
          {Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(todayDate())} · {Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(todayDate())}
        </div>
        <div className="text-c-text1 text-3xl font-bold mt-1 tracking-tight">
          Morning, Alex
        </div>
      </div>

      {/* Streak + summary stats */}
      <div className="px-5 pb-5">
        <Card pad={18} style={{ background: 'linear-gradient(135deg, var(--surface) 0%, #20203a 100%)' }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-c-text2 text-xs tracking-label uppercase font-semibold">
                Best streak
              </div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-c-text1 text-[36px] font-bold tracking-tighter">{totalStreak}</span>
                <span className="text-c-text2 text-base">days</span>
              </div>
            </div>
            <div
              className="w-16 h-16 rounded-[20px] grid place-items-center"
              style={{ background: 'radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--secondary) 33%, transparent), color-mix(in srgb, var(--primary) 22%, transparent))' }}
            >
              <Icon name="flame" size={32} color="var(--secondary)" stroke={2} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-[18px] pt-4 border-t border-c-border">
            {[
              { v: `${doneToday}/${todays.length}`, l: 'Tasks today' },
              { v: active.length, l: 'Active goals' },
              { v: `${avgProgress}%`, l: 'Avg progress' },
            ].map((s, i) => (
              <div key={i}>
                <div className="text-c-text1 text-xl font-bold">{s.v}</div>
                <div className="text-c-text2 text-2xs mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Today's tasks */}
      <div className="flex justify-between items-center px-5 pb-3">
        <h3 className="text-c-text1 text-lg font-bold m-0">Today</h3>
        <button
          onClick={() => navigate('/tasks')}
          className="bg-transparent border-none text-c-primary text-sm font-semibold cursor-pointer p-0"
        >
          See all
        </button>
      </div>
      <div className="px-5 pb-6">
        <Card pad={0} className="overflow-hidden">
          {todays.map((t, i) => (
            <div key={t.id} style={{ borderBottom: i === todays.length - 1 ? 'none' : '1px solid var(--border)' }}>
              <TaskRow task={t} onToggle={() => toggleTask(t.id)} />
            </div>
          ))}
          {todays.length === 0 && (
            <div className="p-5 text-center text-c-text2 text-base">
              No tasks scheduled for today.
            </div>
          )}
        </Card>
      </div>

      {/* Active goals */}
      <div className="flex justify-between items-center px-5 pb-3">
        <h3 className="text-c-text1 text-lg font-bold m-0">Active goals</h3>
        <button
          onClick={() => navigate('/goals')}
          className="bg-transparent border-none text-c-primary text-sm font-semibold cursor-pointer p-0"
        >
          See all
        </button>
      </div>
      <div className="px-5">
        {sorted.slice(0, 3).map(g => (
          <GoalRow key={g.id} goal={g} onClick={() => navigate(`/goals?id=${g.id}`)} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
