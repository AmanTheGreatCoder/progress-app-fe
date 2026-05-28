import React, { useState } from 'react';
import { Icon } from '../../components/ui/Icon';
import type { Goal } from '../../types';
import { CATEGORIES, PRIORITIES } from '../../constants';
import type { Category, Priority } from '../../types';

interface GoalFormDraft {
  title: string;
  category: Category;
  priority: Priority;
  startDate: string;
  deadline: string;
  targetFrequency: number;
}

interface GoalFormProps {
  initialGoal?: Goal;
  onBack: () => void;
  onSave: (draft: GoalFormDraft) => void;
}

export const GoalForm: React.FC<GoalFormProps> = ({ initialGoal, onBack, onSave }) => {
  const [draft, setDraft] = useState<GoalFormDraft>({
    title: initialGoal?.title || '',
    category: (initialGoal?.category as Category) || 'Health',
    priority: (initialGoal?.priority as Priority) || 'Medium',
    startDate: initialGoal?.start || new Date().toISOString().slice(0, 10),
    deadline: initialGoal?.end || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    targetFrequency: 5,
  });

  const canSave = draft.title.trim().length > 0;

  return (
    <div className="slide-in-right" style={{ padding: '0 0 100px', position: 'fixed', inset: 0, zIndex: 100, background: 'var(--bg)', overflowY: 'auto' }}>
      <div className="flex items-center justify-between" style={{ padding: '8px 16px 12px' }}>
        <button
          onClick={onBack}
          aria-label="Close form"
          style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'transparent', border: 'none',
            display: 'grid', placeItems: 'center', cursor: 'pointer',
          }}
        >
          <Icon name="x" size={22} color="var(--text-primary)" />
        </button>
        <span style={{ color: 'var(--text-primary)', fontSize: 16, fontWeight: 600 }}>
          {initialGoal ? 'Edit Goal' : 'New Goal'}
        </span>
        <button
          onClick={() => { if (canSave) onSave(draft); }}
          style={{
            padding: '8px 16px', borderRadius: 10,
            background: 'var(--primary)', border: 'none', color: '#fff',
            fontSize: 13, fontWeight: 600, cursor: canSave ? 'pointer' : 'default',
            opacity: canSave ? 1 : 0.5,
          }}
        >
          {initialGoal ? 'Save' : 'Create'}
        </button>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Title */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 }}>
            Goal Title
          </label>
          <input
            value={draft.title}
            onChange={e => setDraft({ ...draft, title: e.target.value })}
            placeholder="E.g., Read 10 books"
            style={{
              width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border)',
              background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 16, outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Category */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 }}>
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setDraft({ ...draft, category: c })}
                style={{
                  padding: '10px 14px', borderRadius: 10,
                  border: `1px solid ${draft.category === c ? 'var(--primary)' : 'var(--border)'}`,
                  background: draft.category === c ? 'color-mix(in srgb, var(--primary) 15%, transparent)' : 'var(--surface)',
                  color: draft.category === c ? 'var(--primary)' : 'var(--text-primary)',
                  fontWeight: 600, cursor: 'pointer',
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Priority */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 }}>
            Priority
          </label>
          <div className="flex gap-2">
            {PRIORITIES.map(p => (
              <button
                key={p}
                onClick={() => setDraft({ ...draft, priority: p })}
                style={{
                  padding: '10px 14px', borderRadius: 10,
                  border: `1px solid ${draft.priority === p ? 'var(--primary)' : 'var(--border)'}`,
                  background: draft.priority === p ? 'color-mix(in srgb, var(--primary) 15%, transparent)' : 'var(--surface)',
                  color: draft.priority === p ? 'var(--primary)' : 'var(--text-primary)',
                  fontWeight: 600, cursor: 'pointer',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Date range */}
        <div className="flex gap-3" style={{ marginBottom: 20 }}>
          <div className="flex-1">
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 }}>
              Start Date
            </label>
            <input
              type="date"
              value={draft.startDate}
              onChange={e => setDraft({ ...draft, startDate: e.target.value })}
              style={{
                width: '100%', padding: '12px', borderRadius: 12, border: '1px solid var(--border)',
                background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 14, outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div className="flex-1">
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 }}>
              Deadline
            </label>
            <input
              type="date"
              value={draft.deadline}
              onChange={e => setDraft({ ...draft, deadline: e.target.value })}
              style={{
                width: '100%', padding: '12px', borderRadius: 12, border: '1px solid var(--border)',
                background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 14, outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
