import React, { useState } from 'react';
import { Icon } from '@shared/components/ui/Icon';
import type { Goal, ManualLog } from '@shared/types';

interface ProgressLogSectionProps {
  goal: Goal;
  catColor: string;
  onAddLog: (goalId: string, log: ManualLog) => void;
}

type LogCompat = ManualLog & { effortMinutes?: number; notes?: string };

export const ProgressLogSection: React.FC<ProgressLogSectionProps> = ({ goal, catColor, onAddLog }) => {
  const [showLogForm, setShowLogForm] = useState(false);
  const [minutes, setMinutes] = useState('30');
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    if (!minutes) return;
    onAddLog(goal.id, {
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      minutes: Number(minutes),
      note: note || '—',
    });
    setMinutes('30');
    setNote('');
    setShowLogForm(false);
  };

  return (
    <>
      {/* Section header */}
      <div className="flex items-center justify-between pt-4.5 px-5 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-2xs font-bold text-c-text2 uppercase tracking-badge">Progress Log</span>
          <span className="text-2xs font-bold px-[7px] py-[2px] rounded-[10px] bg-c-surface2 text-c-text3">
            {goal.manualLogs.length}
          </span>
        </div>
        <button
          onClick={() => setShowLogForm(s => !s)}
          className={[
            'inline-flex items-center gap-[5px] py-1.5 px-3.5 rounded-chip text-c-primary text-xs font-semibold cursor-pointer border',
            showLogForm ? 'bg-primary-soft border-primary-active' : 'bg-transparent border-c-border',
          ].join(' ')}
        >
          <Icon name="plus" size={13} color="var(--primary)" stroke={2.4} />
          Log entry
        </button>
      </div>

      <div className="px-5 pb-6">
        {/* Log form */}
        {showLogForm && (
          <div className="bg-c-surface border border-c-border rounded-2xl p-4 mb-3">
            <p className="text-2xs font-bold text-c-text2 uppercase tracking-label mb-[7px]">Minutes spent</p>
            <input
              type="number"
              value={minutes}
              onChange={e => setMinutes(e.target.value)}
              className="w-full px-3.5 py-[11px] bg-c-bg border border-c-border rounded-[10px] text-c-text1 text-lg font-semibold outline-none box-border"
            />
            <p className="text-2xs font-bold text-c-text2 uppercase tracking-label mt-3.5 mb-[7px]">Journal note</p>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="What did you work on?"
              rows={3}
              className="w-full px-3.5 py-[11px] bg-c-bg border border-c-border rounded-[10px] text-c-text1 text-base outline-none resize-none font-[inherit] box-border leading-[1.4]"
            />
            <div className="flex gap-2.5 mt-3.5">
              <button
                onClick={() => setShowLogForm(false)}
                className="flex-1 py-3 bg-c-bg border border-c-border rounded-xl text-c-text2 text-sm font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-[2] py-3 bg-c-primary border-none rounded-xl text-white text-sm font-bold cursor-pointer"
              >
                Save Entry
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {goal.manualLogs.length === 0 && !showLogForm && (
          <div className="py-7 px-4 text-center bg-c-surface rounded-2xl border border-dashed border-c-border">
            <Icon name="note" size={24} color="var(--text-tertiary)" style={{ display: 'inline-block' }} />
            <p className="text-c-text2 text-sm mt-2.5">No entries yet. Log your first session.</p>
          </div>
        )}

        {/* Log entries */}
        {goal.manualLogs.map((log, i) => {
          const l: LogCompat = typeof log === 'string'
            ? { date: 'Entry', minutes: 0, note: log }
            : log as LogCompat;
          const mins = l.minutes ?? l.effortMinutes ?? 0;

          return (
            <div
              key={i}
              className="bg-c-surface rounded-card border border-c-border mb-2 px-4 py-3.5"
              style={{ borderLeft: `3px solid ${catColor}` }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-c-text1">{l.date}</span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-c-warning bg-warning-muted px-2 py-[2px] rounded-[10px]">
                  <Icon name="clock" size={12} color="var(--warning)" stroke={2} />
                  {mins} min
                </span>
              </div>
              <p className="text-c-text2 text-sm leading-[1.55]">{l.note ?? l.notes}</p>
            </div>
          );
        })}
      </div>
    </>
  );
};
