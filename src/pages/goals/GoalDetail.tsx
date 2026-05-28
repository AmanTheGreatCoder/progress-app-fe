import React, { useState, useEffect, useRef } from 'react';
import { Icon } from '../../components/ui/Icon';
import { Pill } from '../../components/ui/Pill';
import { goalPct, goalDaysLeft } from '../../components/ui/GoalRow';
import type { Goal, Task, ManualLog, TaskSeriesSummary } from '../../types';
import { PRIORITY_META } from '../../constants';
import type { Goal as HookGoal } from '../../hooks/useGoals';
import api from '../../services/api';

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

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export const GoalDetail: React.FC<GoalDetailProps> = ({
  goal, onBack, onEdit, onAddLog, onUpdateGoal, onDeleteGoal,
}) => {
  const pct        = goalPct(goal);
  const catColor   = `var(--c-${goal.category.toLowerCase()})`;  // runtime per goal — stays inline
  const days       = goalDaysLeft(goal);
  const linkedSeries: TaskSeriesSummary[] = goal.linkedSeries || [];

  const [showOverflow,     setShowOverflow]     = useState(false);
  const [showDeleteConfirm,setShowDeleteConfirm] = useState(false);
  const [showLogForm,      setShowLogForm]      = useState(false);
  const [showLinkMenu,     setShowLinkMenu]     = useState(false);
  const [minutes,          setMinutes]          = useState('30');
  const [note,             setNote]             = useState('');
  const [searchQuery,      setSearchQuery]      = useState('');
  const [seriesItems,      setSeriesItems]      = useState<TaskSeriesSummary[]>([]);
  const [ringPct,          setRingPct]          = useState(0);
  const [expandedSeriesId, setExpandedSeriesId] = useState<string | null>(null);
  const [seriesInstances,  setSeriesInstances]  = useState<Record<string, Record<string, unknown>[]>>({});
  const overflowRef = useRef<HTMLDivElement>(null);

  const R = 56;
  const C = 2 * Math.PI * R;

  useEffect(() => {
    const id = setTimeout(() => setRingPct(pct), 120);
    return () => clearTimeout(id);
  }, [pct]);

  useEffect(() => {
    api.get('/tasks/series').then(res => setSeriesItems(res.data)).catch(() => {});
  }, []);

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

  const handleSubmitLog = () => {
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

  const prioColor = PRIORITY_META[goal.priority as keyof typeof PRIORITY_META]?.color || 'var(--text-secondary)';

  return (
    <div className="fixed inset-0 z-[100] bg-c-bg flex flex-col">

      {/* ── App bar ──────────────────────────────────────────────── */}
      <div
        className="flex items-center flex-shrink-0 relative bg-c-surface border-b border-c-border"
        style={{ height: 58, padding: '0 4px' }}
      >
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

        {/* Hero: icon + chips */}
        <div className="pt-6 px-6 text-center">
          {/* catColor-dependent icon bg — stays inline */}
          <div
            className="inline-grid place-items-center text-[30px] rounded-[22px] mb-3.5 w-[68px] h-[68px]"
            style={{ background: `color-mix(in srgb, ${catColor} 18%, transparent)` }}
          >
            {goal.icon}
          </div>

          <h2
            className="text-2xl font-bold text-c-text1 mb-3"
            style={{ letterSpacing: -0.4, lineHeight: 1.25 }}
          >
            {goal.title}
          </h2>

          <div className="flex justify-center items-center flex-wrap gap-2">
            {/* catColor-dependent pill — stays inline */}
            <Pill color={catColor} bg={`color-mix(in srgb, ${catColor} 14%, transparent)`} dot>
              {goal.category}
            </Pill>

            {/* Priority chip — prioColor is from PRIORITY_META map, stays inline */}
            <span
              className="inline-flex items-center gap-1 text-xs font-semibold px-[9px] py-[3px] rounded-chip"
              style={{ background: `color-mix(in srgb, ${prioColor} 13%, transparent)`, color: prioColor }}
            >
              <span className="w-[5px] h-[5px] rounded-full flex-shrink-0" style={{ background: prioColor }} />
              {goal.priority}
            </span>

            <span className="text-xs text-c-text2 bg-c-surface border border-c-border px-[9px] py-[3px] rounded-chip">
              Ends {goal.end.slice(5).replace('-', '/')}
            </span>
          </div>
        </div>

        {/* Progress ring */}
        <div className="flex justify-center" style={{ padding: '28px 24px 8px' }}>
          <div className="relative w-[148px] h-[148px]">
            <svg width="148" height="148" viewBox="0 0 148 148" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="74" cy="74" r={R} stroke="var(--surface2)" strokeWidth="11" fill="none" />
              {/* SVG stroke uses catColor (runtime) — stays inline */}
              <circle
                cx="74" cy="74" r={R} fill="none"
                strokeWidth="11" strokeLinecap="round"
                stroke={catColor}
                strokeDasharray={C}
                strokeDashoffset={C - (C * ringPct / 100)}
                style={{ transition: 'stroke-dashoffset 1100ms cubic-bezier(.2,.8,.2,1)' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div
                className="text-c-text1 font-extrabold"
                style={{ fontSize: 34, letterSpacing: -1, lineHeight: 1 }}
              >
                {pct}%
              </div>
              <div className="text-xs text-c-text2 mt-1">{goal.taskDone} / {goal.taskTotal}</div>
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="flex gap-2.5 px-5 pb-6 pt-4">
          {[
            { icon: 'clock',  color: 'var(--warning)',   value: `${days}`,          label: 'days left'   },
            { icon: 'flame',  color: 'var(--secondary)', value: `${goal.streak}`,   label: 'day streak'  },
            { icon: 'check',  color: 'var(--success)',   value: `${goal.taskDone}`, label: `of ${goal.taskTotal}` },
          ].map(s => (
            <div
              key={s.label}
              className="flex-1 flex flex-col items-center gap-[7px] bg-c-surface border border-c-border rounded-2xl py-3.5 px-2"
            >
              {/* Icon bg uses inline because color is a runtime prop */}
              <div
                className="w-[34px] h-[34px] rounded-[11px] grid place-items-center"
                style={{ background: `color-mix(in srgb, ${s.color} 14%, transparent)` }}
              >
                <Icon name={s.icon} size={17} color={s.color} stroke={2} />
              </div>
              <div className="text-2xl font-extrabold text-c-text1 leading-none">{s.value}</div>
              <div className="text-2xs text-c-text2 text-center leading-snug">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="h-[6px] bg-c-surface border-t border-b border-c-border" />

        {/* ── Linked Series section ─────────────────────────────── */}
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
              showLinkMenu
                ? 'bg-primary-soft border-primary-active'
                : 'bg-transparent border-c-border',
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
                          onClick={() => {
                            const newIds = isLinked
                              ? (goal.linkedSeriesIds || []).filter(id => id !== series.id)
                              : [...(goal.linkedSeriesIds || []), series.id];
                            onUpdateGoal(goal.id, { linkedSeriesIds: newIds });
                          }}
                          className={[
                            'inline-flex items-center gap-1 py-1.5 px-3.5 rounded-chip flex-shrink-0 text-xs font-bold cursor-pointer',
                            isLinked
                              ? 'bg-success-muted text-c-success border border-success-glow'
                              : 'bg-c-primary text-white border-none',
                          ].join(' ')}
                        >
                          {isLinked ? '✓ Linked' : 'Link'}
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

                const handleToggle = async () => {
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
                  <div
                    key={s.id}
                    className={i < arr.length - 1 ? 'border-b border-c-border' : ''}
                  >
                    {/* Series header row */}
                    <div
                      onClick={handleToggle}
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
                          const chipLabel = done ? 'Done'            : minOnly ? 'Min'           : '—';
                          const chipColor = done ? 'var(--success)'  : minOnly ? 'var(--warning)' : 'var(--text-tertiary)';
                          const [, mm, dd] = (t.date as string).split('-');
                          const dateLabel = `${MONTHS[parseInt(mm, 10) - 1]} ${parseInt(dd, 10)}`;

                          return (
                            <div
                              key={t.id as string}
                              className={[
                                'flex items-center gap-3 px-4 py-[9px]',
                                idx < instances.length - 1 ? 'border-b border-c-border/50' : '',
                                pending ? 'opacity-55' : '',
                              ].join(' ')}
                            >
                              {/* Status dot — color is runtime */}
                              <div
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ background: dotColor, boxShadow: done ? `0 0 5px ${dotColor}` : 'none' }}
                              />
                              <span className="text-sm font-semibold text-c-text1 min-w-[50px] flex-shrink-0">
                                {dateLabel}
                              </span>
                              <div className="flex-1" />
                              {/* Chip color is runtime */}
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

        {/* Divider */}
        <div className="h-[6px] bg-c-surface border-t border-b border-c-border" />

        {/* ── Progress Log section ──────────────────────────────── */}
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
              showLogForm
                ? 'bg-primary-soft border-primary-active'
                : 'bg-transparent border-c-border',
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
                className="w-full px-3.5 py-[11px] bg-c-bg border border-c-border rounded-[10px] text-c-text1 text-base outline-none resize-none font-[inherit] box-border"
                style={{ lineHeight: 1.4 }}
              />
              <div className="flex gap-2.5 mt-3.5">
                <button
                  onClick={() => setShowLogForm(false)}
                  className="flex-1 py-3 bg-c-bg border border-c-border rounded-xl text-c-text2 text-sm font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitLog}
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

          {/* Log entries — catColor-dependent left border stays inline */}
          {goal.manualLogs.map((log, i) => {
            type LogCompat = ManualLog & { effortMinutes?: number; notes?: string };
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
      </div>

      {/* ── Delete confirmation modal ─────────────────────────────── */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-[400] bg-black/[0.62] flex items-center justify-center p-6"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-c-surface2 rounded-[22px] p-7 pb-6 w-full max-w-[320px] shadow-modal"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-[52px] h-[52px] rounded-2xl bg-danger-muted grid place-items-center mb-4">
              <Icon name="trash" size={24} color="#FF6B7A" stroke={1.8} />
            </div>
            <h3 className="text-xl font-bold text-c-text1 mb-2">Delete Goal?</h3>
            <p className="text-c-text2 text-base mb-7" style={{ lineHeight: 1.55 }}>
              <strong className="text-c-text1">{goal.title}</strong>{' '}
              and all its progress logs will be permanently removed.
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-[13px] bg-c-surface border border-c-border rounded-xl text-c-text1 text-base font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-[13px] bg-danger border-none rounded-xl text-white text-base font-bold cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
