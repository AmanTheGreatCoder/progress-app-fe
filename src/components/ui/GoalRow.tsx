import React from 'react';
import { Card } from './Card';
import { StreakChip } from './StreakChip';
import { Pill } from './Pill';
import { ProgressBar } from './ProgressBar';
import type { Goal } from '../../types';

interface GoalRowProps {
  goal: Goal;
  onClick: () => void;
}

export const goalPct = (g: Goal) => g.taskTotal === 0 ? 0 : Math.round((g.taskDone / g.taskTotal) * 100);

export const daysBetween = (a: string, b: string) => Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000));
export const TODAY = '2026-05-23'; // Hardcoded today as in demo
export const goalDaysLeft = (g: Goal) => daysBetween(TODAY, g.end);

export const GoalRow: React.FC<GoalRowProps> = ({ goal, onClick }) => {
  const pct = goalPct(goal);
  const catColor = `var(--c-${goal.category.toLowerCase()})`;
  const days = goalDaysLeft(goal);
  
  return (
    <Card onClick={onClick} pad={16} style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12,
          background: `color-mix(in srgb, ${catColor} 22%, transparent)`,
          color: catColor,
          display: 'grid', placeItems: 'center',
          fontSize: 20, flexShrink: 0,
        }}>{goal.icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div style={{
              color: 'var(--text-primary)', fontSize: 15, fontWeight: 600,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{goal.title}</div>
            <StreakChip days={goal.streak}/>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <Pill color={catColor} bg={`color-mix(in srgb, ${catColor} 12%, transparent)`} dot>{goal.category}</Pill>
            <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
              {goal.taskDone}/{goal.taskTotal} tasks · {days}d left
            </span>
          </div>
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <ProgressBar value={pct} color={catColor}/>
            </div>
            <span style={{
              color: 'var(--text-primary)', fontSize: 13, fontWeight: 700, minWidth: 36, textAlign: 'right',
            }}>{pct}%</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
