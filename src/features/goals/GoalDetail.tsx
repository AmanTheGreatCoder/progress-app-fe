import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '@shared/components/ui/Icon';
import { goalPct, goalDaysLeft } from '@shared/utils/goalUtils';
import type { Goal, Task, ManualLog } from '@shared/types';
import { PRIORITY_META } from '@shared/constants';
import type { Goal as HookGoal } from '@shared/hooks/useGoals';
import { GoalHero } from './GoalHero';
import { LinkedSeriesSection } from './LinkedSeriesSection';
import { ProgressLogSection } from './ProgressLogSection';
import { DeleteModal } from './DeleteModal';

interface GoalDetailProps {
  goal: Goal;
  tasks: Task[];
  onBack: () => void;
  onEdit: () => void;
  onToggleTask: (id: string) => void;
  onOpenTask: (id: string) => void;
  onAddLog: (goalId: string, log: ManualLog) => void;
  onUpdateGoal: (id: string, updates: Partial<HookGoal>) => void;
  onDeleteGoal: (id: string) => void;
}

export const GoalDetail: React.FC<GoalDetailProps> = ({
  goal, onBack, onEdit, onAddLog, onUpdateGoal, onDeleteGoal,
}) => {
  const pct      = goalPct(goal);
  const catColor = `var(--c-${goal.category.toLowerCase()})`;
  const days     = goalDaysLeft(goal);
  const prioColor = PRIORITY_META[goal.priority as keyof typeof PRIORITY_META]?.color || 'var(--text-secondary)';

  const [ringPct,          setRingPct]          = useState(0);
  const [showOverflow,     setShowOverflow]     = useState(false);
  const [showDeleteConfirm,setShowDeleteConfirm] = useState(false);
  const overflowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setTimeout(() => setRingPct(pct), 120);
    return () => clearTimeout(id);
  }, [pct]);

  useEffect(() => {
    if (!showOverflow) return;
    const handler = (e: MouseEvent) => {
      if (overflowRef.current && !overflowRef.current.contains(e.target as Node)) {
        setShowOverflow(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showOverflow]);

  const handleArchive = () => {
    setShowOverflow(false);
    onUpdateGoal(goal.id, { archived: !goal.archived });
    onBack();
  };

  const handleDelete = () => {
    setShowDeleteConfirm(false);
    onDeleteGoal(goal.id);
    onBack();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-c-bg flex flex-col">

      {/* ── App bar ──────────────────────────────────────────────── */}
      <div className="flex items-center flex-shrink-0 relative bg-c-surface border-b border-c-border h-[58px] px-1">
        <button
          onClick={onBack}
          aria-label="Go back"
          className="w-12 h-12 rounded-full bg-transparent border-none cursor-pointer grid place-items-center flex-shrink-0"
        >
          <Icon name="arrow-left" size={22} color="var(--text-primary)" />
        </button>

        <div className="flex-1 overflow-hidden px-1">
          <div className="text-lg font-bold text-c-text1 truncate">{goal.title}</div>
          <div className="text-xs text-c-text2 mt-px">
            {goal.category} · {goal.archived ? 'Archived' : days > 0 ? `${days}d left` : 'Ended'}
          </div>
        </div>

        <div ref={overflowRef} className="relative flex-shrink-0">
          <button
            onClick={() => setShowOverflow(s => !s)}
            aria-label="More options"
            className="w-12 h-12 rounded-full bg-transparent border-none cursor-pointer grid place-items-center"
          >
            <Icon name="more-vertical" size={22} color="var(--text-primary)" />
          </button>

          {showOverflow && (
            <div className="absolute right-2 top-[52px] z-[300] bg-c-surface2 rounded-card border border-c-border shadow-overlay overflow-hidden min-w-[170px]">
              {[
                { icon: 'edit',  label: 'Edit goal',   action: () => { setShowOverflow(false); onEdit(); }, danger: false },
                { icon: goal.archived ? 'unarchive' : 'archive', label: goal.archived ? 'Unarchive' : 'Archive', action: handleArchive, danger: false },
                { icon: 'trash', label: 'Delete goal', action: () => { setShowOverflow(false); setShowDeleteConfirm(true); }, danger: true },
              ].map((item, i, arr) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className={[
                    'w-full flex items-center gap-3 px-4 py-3.5 bg-transparent border-none cursor-pointer text-sm font-medium text-left',
                    item.danger ? 'text-danger' : 'text-c-text1',
                    i < arr.length - 1 ? 'border-b border-c-border' : '',
                  ].join(' ')}
                >
                  <Icon name={item.icon} size={17} color={item.danger ? '#FF6B7A' : 'var(--text-tertiary)'} />
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Scrollable body ───────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto pb-28">
        <GoalHero
          goal={goal}
          pct={pct}
          ringPct={ringPct}
          catColor={catColor}
          prioColor={prioColor}
          days={days}
        />

        <div className="h-[6px] bg-c-surface border-t border-b border-c-border" />

        <LinkedSeriesSection goal={goal} onUpdateGoal={onUpdateGoal} />

        <div className="h-[6px] bg-c-surface border-t border-b border-c-border" />

        <ProgressLogSection goal={goal} catColor={catColor} onAddLog={onAddLog} />
      </div>

      {showDeleteConfirm && (
        <DeleteModal
          goalTitle={goal.title}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
};
