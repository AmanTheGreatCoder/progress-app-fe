import React, { useState } from 'react';
import { Icon } from '@shared/components/ui/Icon';
import { GoalRow } from '@shared/components/ui/GoalRow';
import type { Goal } from '@shared/types';

interface GoalsListProps {
  goals: Goal[];
  onOpenGoal: (id: string) => void;
  onCreateGoal: () => void;
}

export const GoalsList: React.FC<GoalsListProps> = ({ goals, onOpenGoal, onCreateGoal }) => {
  const [tab, setTab] = useState<'active' | 'archived'>('active');
  const filtered     = goals.filter(g => tab === 'active' ? !g.archived : g.archived);
  const activeCount  = goals.filter(g => !g.archived).length;
  const archivedCount = goals.filter(g => g.archived).length;

  return (
    <div className="pb-36">
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 pb-5">
        <div>
          <h1 className="text-3xl font-bold text-c-text1 tracking-tight">Goals</h1>
          <p className="text-sm text-c-text2 mt-0.5">
            {activeCount} active · {archivedCount} archived
          </p>
        </div>
        <button
          onClick={onCreateGoal}
          aria-label="Create new goal"
          className="w-11 h-11 rounded-card bg-c-primary grid place-items-center cursor-pointer border-none shadow-primary-sm flex-shrink-0"
        >
          <Icon name="plus" size={22} color="#fff" stroke={2.4} />
        </button>
      </div>

      {/* ── Tabs ─────────────────────────────────────────────────── */}
      <div className="px-5 pb-5">
        <div className="grid grid-cols-2 bg-c-surface border border-c-border rounded-xl p-1">
          {([
            { id: 'active'   as const, label: 'Active',   count: activeCount   },
            { id: 'archived' as const, label: 'Archived', count: archivedCount },
          ] as const).map(t => {
            const isActive = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={[
                  'flex items-center justify-center gap-1.5 rounded-[9px] px-3 py-2.5',
                  'text-sm font-semibold border-none cursor-pointer transition-all duration-200',
                  isActive
                    ? 'bg-c-surface2 text-c-text1'
                    : 'bg-transparent text-c-text2',
                ].join(' ')}
              >
                {t.label}
                <span className={[
                  'text-2xs font-bold py-px px-1.5 rounded-lg',
                  isActive ? 'bg-c-primary text-white' : 'bg-c-bg text-c-text3',
                ].join(' ')}>
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Goal list ────────────────────────────────────────────── */}
      <div className="px-5">
        {filtered.map(g => (
          <GoalRow key={g.id} goal={g} onClick={() => onOpenGoal(g.id)} />
        ))}
        {filtered.length === 0 && (
          <p className="py-16 text-center text-c-text2 text-base">
            No {tab} goals found.
          </p>
        )}
      </div>
    </div>
  );
};
