import React, { useState, useCallback } from 'react';
import { Icon } from '@shared/components/ui/Icon';
import type { Goal } from '@shared/types';
import { CATEGORIES, PRIORITIES } from '@shared/constants';
import type { Category, Priority } from '@shared/types';

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
  onSave: (draft: GoalFormDraft) => Promise<void>;
}

export const GoalForm: React.FC<GoalFormProps> = ({ initialGoal, onBack, onSave }) => {
  const [draft, setDraft] = useState<GoalFormDraft>({
    title:           initialGoal?.title     || '',
    category:        (initialGoal?.category as Category) || 'Health',
    priority:        (initialGoal?.priority as Priority) || 'Medium',
    startDate:       initialGoal?.start     || new Date().toISOString().slice(0, 10),
    deadline:        initialGoal?.end       || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    targetFrequency: 5,
  });

  const canSave = draft.title.trim().length > 0;
  const [saving, setSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!canSave || saving) return;
    setSaving(true);
    try { await onSave(draft); } finally { setSaving(false); }
  }, [canSave, saving, onSave, draft]);

  return (
    <div
      className="slide-in-right fixed inset-0 z-[100] bg-c-bg overflow-y-auto pb-24"
    >
      {/* ── App bar ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-2 pb-3">
        <button
          onClick={onBack}
          aria-label="Close form"
          className="w-10 h-10 rounded-xl bg-transparent border-none grid place-items-center cursor-pointer"
        >
          <Icon name="x" size={22} color="var(--text-primary)" />
        </button>

        <span className="text-lg font-semibold text-c-text1">
          {initialGoal ? 'Edit Goal' : 'New Goal'}
        </span>

        <button
          onClick={handleSave}
          disabled={!canSave || saving}
          className={[
            'px-4 py-2 rounded-[10px] bg-c-primary border-none text-white text-sm font-semibold inline-flex items-center gap-2',
            canSave && !saving ? 'cursor-pointer opacity-100' : 'cursor-default opacity-50',
          ].join(' ')}
        >
          {saving && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
              style={{ transformOrigin: 'center', animation: 'spin 0.75s linear infinite' }}>
              <circle cx="12" cy="12" r="9" strokeDasharray="32 56" />
            </svg>
          )}
          {initialGoal ? 'Save' : 'Create'}
        </button>
      </div>

      {/* ── Fields ───────────────────────────────────────────────── */}
      <div className="px-5 flex flex-col gap-5">

        {/* Title */}
        <div>
          <label className="block text-2xs font-bold text-c-text2 uppercase tracking-label mb-2">
            Goal Title
          </label>
          <input
            value={draft.title}
            onChange={e => setDraft({ ...draft, title: e.target.value })}
            placeholder="E.g., Read 10 books"
            className="w-full px-4 py-3.5 rounded-xl border border-c-border bg-c-surface text-c-text1 text-lg outline-none box-border"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-2xs font-bold text-c-text2 uppercase tracking-label mb-2">
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => {
              const isSelected = draft.category === c;
              return (
                <button
                  key={c}
                  onClick={() => setDraft({ ...draft, category: c })}
                  className={[
                    'px-3.5 py-2.5 rounded-[10px] font-semibold cursor-pointer border text-sm',
                    isSelected
                      ? 'border-c-primary bg-primary-soft text-c-primary'
                      : 'border-c-border bg-c-surface text-c-text1',
                  ].join(' ')}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-2xs font-bold text-c-text2 uppercase tracking-label mb-2">
            Priority
          </label>
          <div className="flex gap-2">
            {PRIORITIES.map(p => {
              const isSelected = draft.priority === p;
              return (
                <button
                  key={p}
                  onClick={() => setDraft({ ...draft, priority: p })}
                  className={[
                    'px-3.5 py-2.5 rounded-[10px] font-semibold cursor-pointer border text-sm',
                    isSelected
                      ? 'border-c-primary bg-primary-soft text-c-primary'
                      : 'border-c-border bg-c-surface text-c-text1',
                  ].join(' ')}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        {/* Date range */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-2xs font-bold text-c-text2 uppercase tracking-label mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={draft.startDate}
              onChange={e => setDraft({ ...draft, startDate: e.target.value })}
              className="w-full px-3 py-3 rounded-xl border border-c-border bg-c-surface text-c-text1 text-base outline-none box-border"
            />
          </div>
          <div className="flex-1">
            <label className="block text-2xs font-bold text-c-text2 uppercase tracking-label mb-2">
              Deadline
            </label>
            <input
              type="date"
              value={draft.deadline}
              onChange={e => setDraft({ ...draft, deadline: e.target.value })}
              className="w-full px-3 py-3 rounded-xl border border-c-border bg-c-surface text-c-text1 text-base outline-none box-border"
            />
          </div>
        </div>

      </div>
    </div>
  );
};
