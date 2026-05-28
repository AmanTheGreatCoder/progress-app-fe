import React, { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import { GoalRow } from '../../components/ui/GoalRow';
import type { Goal } from '../../types';

interface GoalsListProps {
  goals: Goal[];
  onOpenGoal: (id: string) => void;
  onCreateGoal: () => void;
}

export const GoalsList: React.FC<GoalsListProps> = ({ goals, onOpenGoal, onCreateGoal }) => {
  const [tab, setTab] = useState<'active' | 'archived'>('active');
  const filtered = goals.filter(g => tab === 'active' ? !g.archived : g.archived);
  const activeCount = goals.filter(g => !g.archived).length;
  const archivedCount = goals.filter(g => g.archived).length;

  return (
    <div style={{ padding: '0px 0 140px' }}>
      <div className="flex items-center justify-between" style={{ padding: '8px 20px 20px', paddingTop: 0 }}>
        <div>
          <div style={{ color: 'var(--text-primary)', fontSize: 28, fontWeight: 700, letterSpacing: -0.4 }}>Goals</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 2 }}>
            {activeCount} active · {archivedCount} archived
          </div>
        </div>
        <button
          onClick={onCreateGoal}
          aria-label="Create new goal"
          style={{
            width: 44, height: 44, borderRadius: 14,
            background: 'var(--primary)', border: 'none',
            display: 'grid', placeItems: 'center', cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(124,106,247,0.35)',
          }}
        >
          <Icon name="plus" size={22} color="#fff" stroke={2.4} />
        </button>
      </div>

      <div style={{ padding: '0 20px 20px' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          background: 'var(--surface)', borderRadius: 12, padding: 4,
          border: '1px solid var(--border)',
        }}>
          {([
            { id: 'active' as const, label: 'Active', count: activeCount },
            { id: 'archived' as const, label: 'Archived', count: archivedCount },
          ] as const).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '10px 12px', borderRadius: 9,
                background: tab === t.id ? 'var(--surface2)' : 'transparent',
                color: tab === t.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600,
                transition: 'all 200ms',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              {t.label}
              <span style={{
                fontSize: 11, padding: '1px 6px', borderRadius: 8,
                background: tab === t.id ? 'var(--primary)' : 'var(--bg)',
                color: tab === t.id ? '#fff' : 'var(--text-tertiary)',
              }}>{t.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 20px' }}>
        {filtered.map(g => (
          <GoalRow key={g.id} goal={g} onClick={() => onOpenGoal(g.id)} />
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14 }}>
            No {tab} goals found.
          </div>
        )}
      </div>
    </div>
  );
};
