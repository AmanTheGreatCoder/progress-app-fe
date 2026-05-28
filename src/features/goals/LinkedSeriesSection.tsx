import React, { useState, useEffect } from 'react';
import { Icon } from '@shared/components/ui/Icon';
import type { Goal, TaskSeriesSummary } from '@shared/types';
import type { Goal as HookGoal } from '@shared/hooks/useGoals';
import { MONTH_NAMES } from '@shared/utils/dateUtils';
import api from '@shared/api';

interface LinkedSeriesSectionProps {
  goal: Goal;
  onUpdateGoal: (id: string, updates: Partial<HookGoal>) => void;
}

export const LinkedSeriesSection: React.FC<LinkedSeriesSectionProps> = ({ goal, onUpdateGoal }) => {
  const linkedSeries: TaskSeriesSummary[] = goal.linkedSeries || [];
  const [showLinkMenu, setShowLinkMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [seriesItems, setSeriesItems] = useState<TaskSeriesSummary[]>([]);
  const [expandedSeriesId, setExpandedSeriesId] = useState<string | null>(null);
  const [seriesInstances, setSeriesInstances] = useState<Record<string, Record<string, unknown>[]>>({});
  const [savingSeriesId, setSavingSeriesId] = useState<string | null>(null);

  useEffect(() => {
    api.get('/tasks/series').then(res => setSeriesItems(res.data)).catch(() => {});
  }, []);

  const handleExpandToggle = async (s: TaskSeriesSummary) => {
    const opening = expandedSeriesId !== s.id;
    setExpandedSeriesId(opening ? s.id : null);
    if (opening && !seriesInstances[s.id]) {
      try {
        const res = await api.get('/tasks', { params: { name: s.name, from: goal.start, to: goal.end } });
        setSeriesInstances(prev => ({ ...prev, [s.id]: res.data }));
      } catch {
        setSeriesInstances(prev => ({ ...prev, [s.id]: [] }));
      }
    }
  };

  return (
    <>
      {/* Section header */}
      <div className="flex items-center justify-between pt-4.5 px-5 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-2xs font-bold text-c-text2 uppercase tracking-badge">Linked Series</span>
          <span className="text-2xs font-bold px-[7px] py-[2px] rounded-[10px] bg-c-surface2 text-c-text3">
            {linkedSeries.length}
          </span>
        </div>
        <button
          onClick={() => setShowLinkMenu(s => !s)}
          className={[
            'inline-flex items-center gap-[5px] py-1.5 px-3.5 rounded-chip text-c-primary text-xs font-semibold cursor-pointer border',
            showLinkMenu ? 'bg-primary-soft border-primary-active' : 'bg-transparent border-c-border',
          ].join(' ')}
        >
          <Icon name="link" size={13} color="var(--primary)" />
          Link series
        </button>
      </div>

      <div className="px-5 pb-5">
        {/* Series picker */}
        {showLinkMenu && (
          <div className="bg-c-surface border border-c-border rounded-2xl p-3.5 pb-1.5 mb-3">
            <p className="text-2xs font-bold text-c-text2 uppercase tracking-label mb-2.5">
              Select a recurring series
            </p>
            <div className="flex items-center gap-2 bg-c-bg border border-c-border rounded-[10px] px-3 py-[9px] mb-2.5">
              <Icon name="search" size={15} color="var(--text-tertiary)" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="flex-1 bg-transparent border-none outline-none text-c-text1 text-base"
              />
            </div>
            <div className="max-h-[260px] overflow-y-auto">
              {(() => {
                const q = searchQuery.toLowerCase();
                const filtered = seriesItems.filter(s => s.name.toLowerCase().includes(q));
                if (filtered.length === 0) {
                  return (
                    <p className="py-5 text-center text-c-text2 text-sm">
                      {seriesItems.length === 0
                        ? 'No recurring tasks found. Sync your tasks first.'
                        : 'No tasks match your search.'}
                    </p>
                  );
                }
                return filtered.map((series, idx, arr) => {
                  const isLinked = (goal.linkedSeriesIds || []).includes(series.id);
                  return (
                    <div
                      key={series.id}
                      className={[
                        'flex items-center justify-between gap-2.5 py-3',
                        idx < arr.length - 1 ? 'border-b border-c-border' : '',
                      ].join(' ')}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-1.5">
                          <span className="text-base font-medium text-c-text1 truncate">{series.name}</span>
                          {series.taskCount > 1 && (
                            <span className="text-2xs font-bold px-[7px] py-px rounded-lg bg-warning-soft text-c-warning flex-shrink-0">
                              ×{series.taskCount}
                            </span>
                          )}
                        </div>
                        {series.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {series.tags.slice(0, 4).map(tag => (
                              <span key={tag} className="text-[10px] px-[7px] py-[2px] rounded-lg bg-c-surface2 text-c-text2 border border-c-border">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        disabled={savingSeriesId !== null}
                        onClick={async () => {
                          if (savingSeriesId !== null) return;
                          setSavingSeriesId(series.id);
                          try {
                            const newIds = isLinked
                              ? (goal.linkedSeriesIds || []).filter(id => id !== series.id)
                              : [...(goal.linkedSeriesIds || []), series.id];
                            await onUpdateGoal(goal.id, { linkedSeriesIds: newIds });
                          } finally {
                            setSavingSeriesId(null);
                          }
                        }}
                        className={[
                          'inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-chip flex-shrink-0 text-xs font-bold',
                          savingSeriesId === series.id ? 'opacity-60 cursor-default' : 'cursor-pointer',
                          isLinked
                            ? 'bg-success-muted text-c-success border border-success-glow'
                            : 'bg-c-primary text-white border-none',
                        ].join(' ')}
                      >
                        {savingSeriesId === series.id ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                            style={{ transformOrigin: 'center', animation: 'spin 0.75s linear infinite' }}>
                            <circle cx="12" cy="12" r="9" strokeDasharray="32 56" />
                          </svg>
                        ) : isLinked ? '✓ Linked' : 'Link'}
                      </button>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}

        {/* Linked series cards */}
        {linkedSeries.length === 0 ? (
          <div className="py-7 px-4 text-center bg-c-surface rounded-2xl border border-dashed border-c-border">
            <Icon name="link" size={24} color="var(--text-tertiary)" style={{ display: 'inline-block' }} />
            <p className="text-c-text2 text-sm mt-2.5">No series linked to this goal yet.</p>
            <button
              onClick={() => setShowLinkMenu(true)}
              className="mt-3 py-[7px] px-[18px] rounded-chip bg-primary-muted border border-primary-glow text-c-primary text-xs font-semibold cursor-pointer"
            >
              Link a series
            </button>
          </div>
        ) : (
          <div className="bg-c-surface border border-c-border rounded-2xl overflow-hidden">
            {linkedSeries.map((s, i, arr) => {
              const isExpanded = expandedSeriesId === s.id;
              const instances  = seriesInstances[s.id] || [];
              const doneCount  = instances.filter(t => t.completed || t.completedMin).length;

              return (
                <div key={s.id} className={i < arr.length - 1 ? 'border-b border-c-border' : ''}>
                  {/* Series header row */}
                  <div
                    onClick={() => handleExpandToggle(s)}
                    className={[
                      'flex items-center gap-3 p-4 cursor-pointer',
                      isExpanded ? 'bg-primary-subtle' : 'bg-transparent',
                    ].join(' ')}
                    style={{ transition: 'background 150ms' }}
                  >
                    <div className="w-9 h-9 rounded-[10px] flex-shrink-0 grid place-items-center bg-primary-muted">
                      <Icon name="repeat" size={17} color="var(--primary)" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-semibold text-c-text1">{s.name}</div>
                      <div className="text-xs text-c-text2 mt-0.5">
                        {isExpanded && instances.length > 0
                          ? `${doneCount} / ${instances.length} done in range`
                          : `${s.taskCount} instances · last ${s.lastSeen ? s.lastSeen.slice(5).replace('-', '/') : '—'}`}
                      </div>
                    </div>
                    {s.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[10px] px-[7px] py-[2px] rounded-lg bg-c-surface2 text-c-text2 border border-c-border flex-shrink-0">
                        {tag}
                      </span>
                    ))}
                    <div
                      className="flex-shrink-0 grid place-items-center"
                      style={{
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 200ms ease',
                      }}
                    >
                      <Icon name="chevron-down" size={16} color="var(--text-tertiary)" />
                    </div>
                  </div>

                  {/* Expanded instances */}
                  {isExpanded && (
                    <div className="border-t border-c-border bg-c-bg max-h-[300px] overflow-y-auto">
                      {instances.length === 0 ? (
                        <p className="py-5 px-4 text-center text-c-text2 text-sm">
                          No instances in this goal's date range.
                        </p>
                      ) : instances.map((t, idx) => {
                        const done    = t.completed as boolean;
                        const minOnly = !done && (t.completedMin as boolean);
                        const pending = !done && !minOnly;
                        const dotColor  = done ? 'var(--success)' : minOnly ? 'var(--warning)' : 'var(--border)';
                        const chipLabel = done ? 'Done'           : minOnly ? 'Min'            : '—';
                        const chipColor = done ? 'var(--success)' : minOnly ? 'var(--warning)'  : 'var(--text-tertiary)';
                        const [, mm, dd] = (t.date as string).split('-');
                        const dateLabel = `${MONTH_NAMES[parseInt(mm, 10) - 1]} ${parseInt(dd, 10)}`;

                        return (
                          <div
                            key={t.id as string}
                            className={[
                              'flex items-center gap-3 px-4 py-[9px]',
                              idx < instances.length - 1 ? 'border-b border-c-border/50' : '',
                              pending ? 'opacity-55' : '',
                            ].join(' ')}
                          >
                            <div
                              className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ background: dotColor, boxShadow: done ? `0 0 5px ${dotColor}` : 'none' }}
                            />
                            <span className="text-sm font-semibold text-c-text1 min-w-[50px] flex-shrink-0">
                              {dateLabel}
                            </span>
                            <div className="flex-1" />
                            <span
                              className="text-2xs font-bold px-2 py-[2px] rounded-lg"
                              style={{ color: chipColor, background: `color-mix(in srgb, ${chipColor} 13%, transparent)` }}
                            >
                              {chipLabel}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};
