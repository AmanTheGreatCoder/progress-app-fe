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

export const GoalDetail: React.FC<GoalDetailProps> = ({
  goal, onBack, onEdit, onAddLog, onUpdateGoal, onDeleteGoal,
}) => {
  const pct = goalPct(goal);
  const catColor = `var(--c-${goal.category.toLowerCase()})`;
  const days = goalDaysLeft(goal);
  const linkedSeries: TaskSeriesSummary[] = goal.linkedSeries || [];

  const [showOverflow, setShowOverflow] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);
  const [showLinkMenu, setShowLinkMenu] = useState(false);
  const [minutes, setMinutes] = useState('30');
  const [note, setNote] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [seriesItems, setSeriesItems] = useState<TaskSeriesSummary[]>([]);
  const [ringPct, setRingPct] = useState(0);
  const [expandedSeriesId, setExpandedSeriesId] = useState<string | null>(null);
  const [seriesInstances, setSeriesInstances] = useState<Record<string, Record<string, unknown>[]>>({});
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
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>

      {/* App Bar */}
      <div className="flex items-center" style={{
        height: 58, padding: '0 4px',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0, position: 'relative',
      }}>
        <button
          onClick={onBack}
          aria-label="Go back"
          style={{
            width: 48, height: 48, borderRadius: 24,
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'grid', placeItems: 'center', flexShrink: 0,
          }}
        >
          <Icon name="arrow-left" size={22} color="var(--text-primary)" />
        </button>
        <div className="flex-1 overflow-hidden" style={{ padding: '0 4px' }}>
          <div style={{
            color: 'var(--text-primary)', fontSize: 17, fontWeight: 700,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{goal.title}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 1 }}>
            {goal.category} · {goal.archived ? 'Archived' : days > 0 ? `${days}d left` : 'Ended'}
          </div>
        </div>
        <div ref={overflowRef} style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={() => setShowOverflow(s => !s)}
            aria-label="More options"
            style={{
              width: 48, height: 48, borderRadius: 24,
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'grid', placeItems: 'center',
            }}
          >
            <Icon name="more-vertical" size={22} color="var(--text-primary)" />
          </button>
          {showOverflow && (
            <div style={{
              position: 'absolute', right: 8, top: 52, zIndex: 300,
              background: 'var(--surface2)', borderRadius: 14,
              boxShadow: '0 8px 32px rgba(0,0,0,0.36)',
              border: '1px solid var(--border)',
              minWidth: 170, overflow: 'hidden',
            }}>
              {[
                { icon: 'edit', label: 'Edit goal', action: () => { setShowOverflow(false); onEdit(); }, danger: false },
                { icon: goal.archived ? 'unarchive' : 'archive', label: goal.archived ? 'Unarchive' : 'Archive', action: handleArchive, danger: false },
                { icon: 'trash', label: 'Delete goal', action: () => { setShowOverflow(false); setShowDeleteConfirm(true); }, danger: true },
              ].map((item, i, arr) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  style={{
                    width: '100%', padding: '13px 16px',
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: 'none', border: 'none', cursor: 'pointer',
                    borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
                    color: item.danger ? '#FF6B7A' : 'var(--text-primary)',
                    fontSize: 14, fontWeight: 500, textAlign: 'left',
                  }}
                >
                  <Icon name={item.icon} size={17} color={item.danger ? '#FF6B7A' : 'var(--text-tertiary)'} />
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 108 }}>

        {/* Hero */}
        <div style={{ padding: '24px 24px 0', textAlign: 'center' }}>
          <div style={{
            width: 68, height: 68, borderRadius: 22,
            background: `color-mix(in srgb, ${catColor} 18%, transparent)`,
            display: 'inline-grid', placeItems: 'center',
            fontSize: 30, marginBottom: 14,
          }}>{goal.icon}</div>
          <div style={{ color: 'var(--text-primary)', fontSize: 22, fontWeight: 700, letterSpacing: -0.4, lineHeight: 1.25, marginBottom: 12 }}>
            {goal.title}
          </div>
          <div className="flex justify-center items-center flex-wrap gap-2">
            <Pill color={catColor} bg={`color-mix(in srgb, ${catColor} 14%, transparent)`} dot>
              {goal.category}
            </Pill>
            <span style={{
              fontSize: 12, fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: `color-mix(in srgb, ${prioColor} 13%, transparent)`,
              color: prioColor, padding: '3px 9px', borderRadius: 20,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: prioColor, flexShrink: 0 }} />
              {goal.priority}
            </span>
            <span style={{
              fontSize: 12, color: 'var(--text-secondary)',
              background: 'var(--surface)', border: '1px solid var(--border)',
              padding: '3px 9px', borderRadius: 20,
            }}>
              Ends {goal.end.slice(5).replace('-', '/')}
            </span>
          </div>
        </div>

        {/* Progress ring */}
        <div className="flex justify-center" style={{ padding: '28px 24px 8px' }}>
          <div style={{ position: 'relative', width: 148, height: 148 }}>
            <svg width="148" height="148" viewBox="0 0 148 148" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="74" cy="74" r={R} stroke="var(--surface2)" strokeWidth="11" fill="none" />
              <circle cx="74" cy="74" r={R} stroke={catColor} strokeWidth="11" fill="none"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={C - (C * ringPct / 100)}
                style={{ transition: 'stroke-dashoffset 1100ms cubic-bezier(.2,.8,.2,1)' }} />
            </svg>
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ color: 'var(--text-primary)', fontSize: 34, fontWeight: 800, letterSpacing: -1, lineHeight: 1 }}>{pct}%</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 3 }}>{goal.taskDone} / {goal.taskTotal}</div>
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="flex gap-2.5" style={{ padding: '16px 20px 24px' }}>
          {[
            { icon: 'clock', color: 'var(--warning)', value: `${days}`, label: 'days left' },
            { icon: 'flame', color: 'var(--secondary)', value: `${goal.streak}`, label: 'day streak' },
            { icon: 'check', color: 'var(--success)', value: `${goal.taskDone}`, label: `of ${goal.taskTotal}` },
          ].map(s => (
            <div key={s.label} style={{
              flex: 1, background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 16, padding: '14px 8px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 11,
                background: `color-mix(in srgb, ${s.color} 14%, transparent)`,
                display: 'grid', placeItems: 'center',
              }}>
                <Icon name={s.icon} size={17} color={s.color} stroke={2} />
              </div>
              <div style={{ color: 'var(--text-primary)', fontSize: 22, fontWeight: 800, lineHeight: 1 }}>{s.value}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 11, textAlign: 'center', lineHeight: 1.3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ height: 6, background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }} />

        {/* Linked Series */}
        <div className="flex items-center justify-between" style={{ padding: '18px 20px 10px' }}>
          <div className="flex items-center gap-2">
            <span style={{ color: 'var(--text-secondary)', fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' }}>
              Linked Series
            </span>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 10,
              background: 'var(--surface2)', color: 'var(--text-tertiary)',
            }}>{linkedSeries.length}</span>
          </div>
          <button
            onClick={() => setShowLinkMenu(s => !s)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '6px 14px', borderRadius: 20,
              background: showLinkMenu ? 'color-mix(in srgb, var(--primary) 15%, transparent)' : 'transparent',
              border: `1px solid ${showLinkMenu ? 'color-mix(in srgb, var(--primary) 35%, transparent)' : 'var(--border)'}`,
              color: 'var(--primary)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}
          >
            <Icon name="link" size={13} color="var(--primary)" />
            Link series
          </button>
        </div>

        <div style={{ padding: '0 20px 20px' }}>
          {showLinkMenu && (
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 16, padding: '14px 14px 6px', marginBottom: 12,
            }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 10 }}>
                Select a recurring series
              </div>
              <div className="flex items-center gap-2" style={{
                background: 'var(--bg)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '9px 12px', marginBottom: 10,
              }}>
                <Icon name="search" size={15} color="var(--text-tertiary)" />
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search tasks..."
                  style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: 14 }}
                />
              </div>
              <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                {(() => {
                  const q = searchQuery.toLowerCase();
                  const filtered = seriesItems.filter(s => s.name.toLowerCase().includes(q));
                  if (filtered.length === 0) {
                    return (
                      <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
                        {seriesItems.length === 0 ? 'No recurring tasks found. Sync your tasks first.' : 'No tasks match your search.'}
                      </div>
                    );
                  }
                  return filtered.map((series, idx, arr) => {
                    const isLinked = (goal.linkedSeriesIds || []).includes(series.id);
                    return (
                      <div key={series.id} className="flex items-center justify-between gap-2.5" style={{
                        padding: '12px 0',
                        borderBottom: idx < arr.length - 1 ? '1px solid var(--border)' : 'none',
                      }}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center flex-wrap gap-1.5">
                            <span style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {series.name}
                            </span>
                            {series.taskCount > 1 && (
                              <span style={{
                                fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 8,
                                background: 'color-mix(in srgb, var(--warning) 14%, transparent)',
                                color: 'var(--warning)', flexShrink: 0,
                              }}>×{series.taskCount}</span>
                            )}
                          </div>
                          {series.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {series.tags.slice(0, 4).map(tag => (
                                <span key={tag} style={{
                                  fontSize: 10, padding: '2px 7px', borderRadius: 6,
                                  background: 'var(--surface2)', color: 'var(--text-secondary)',
                                  border: '1px solid var(--border)',
                                }}>{tag}</span>
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
                          style={{
                            padding: '6px 14px', borderRadius: 20, flexShrink: 0,
                            background: isLinked ? 'color-mix(in srgb, var(--success) 14%, transparent)' : 'var(--primary)',
                            color: isLinked ? 'var(--success)' : '#fff',
                            border: isLinked ? '1px solid color-mix(in srgb, var(--success) 30%, transparent)' : 'none',
                            cursor: 'pointer', fontSize: 12, fontWeight: 700,
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                          }}
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

          {linkedSeries.length === 0 ? (
            <div style={{
              padding: '28px 16px', textAlign: 'center',
              background: 'var(--surface)', borderRadius: 16,
              border: '1.5px dashed var(--border)',
            }}>
              <Icon name="link" size={24} color="var(--text-tertiary)" style={{ display: 'inline-block' }} />
              <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 10 }}>
                No series linked to this goal yet.
              </div>
              <button onClick={() => setShowLinkMenu(true)} style={{
                marginTop: 12, padding: '7px 18px', borderRadius: 20,
                background: 'color-mix(in srgb, var(--primary) 14%, transparent)',
                border: '1px solid color-mix(in srgb, var(--primary) 28%, transparent)',
                color: 'var(--primary)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}>Link a series</button>
            </div>
          ) : (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
              {linkedSeries.map((s, i, arr) => {
                const isExpanded = expandedSeriesId === s.id;
                const instances = seriesInstances[s.id] || [];
                const doneCount = instances.filter(t => t.completed || t.completedMin).length;

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
                  <div key={s.id} style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div onClick={handleToggle} style={{
                      padding: '14px 16px',
                      display: 'flex', alignItems: 'center', gap: 12,
                      cursor: 'pointer',
                      background: isExpanded ? 'color-mix(in srgb, var(--primary) 6%, transparent)' : 'transparent',
                      transition: 'background 150ms',
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                        background: 'color-mix(in srgb, var(--primary) 14%, transparent)',
                        display: 'grid', placeItems: 'center',
                      }}>
                        <Icon name="repeat" size={17} color="var(--primary)" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 600 }}>{s.name}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 2 }}>
                          {isExpanded && instances.length > 0
                            ? `${doneCount} / ${instances.length} done in range`
                            : `${s.taskCount} instances · last ${s.lastSeen ? s.lastSeen.slice(5).replace('-', '/') : '—'}`}
                        </div>
                      </div>
                      {s.tags.slice(0, 2).map(tag => (
                        <span key={tag} style={{
                          fontSize: 10, padding: '2px 7px', borderRadius: 6, flexShrink: 0,
                          background: 'var(--surface2)', color: 'var(--text-secondary)',
                          border: '1px solid var(--border)',
                        }}>{tag}</span>
                      ))}
                      <div style={{
                        flexShrink: 0,
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 200ms ease',
                        display: 'grid', placeItems: 'center',
                      }}>
                        <Icon name="chevron-down" size={16} color="var(--text-tertiary)" />
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={{ borderTop: '1px solid var(--border)', background: 'var(--bg)', maxHeight: 300, overflowY: 'auto' }}>
                        {instances.length === 0 ? (
                          <div style={{ padding: '20px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
                            No instances in this goal's date range.
                          </div>
                        ) : instances.map((t, idx) => {
                          const done = t.completed as boolean;
                          const minOnly = !done && (t.completedMin as boolean);
                          const pending = !done && !minOnly;
                          const dotColor = done ? 'var(--success)' : minOnly ? 'var(--warning)' : 'var(--border)';
                          const chipLabel = done ? 'Done' : minOnly ? 'Min' : '—';
                          const chipColor = done ? 'var(--success)' : minOnly ? 'var(--warning)' : 'var(--text-tertiary)';
                          const [, mm, dd] = (t.date as string).split('-');
                          const dateLabel = `${MONTHS[parseInt(mm, 10) - 1]} ${parseInt(dd, 10)}`;

                          return (
                            <div key={t.id as string} className="flex items-center gap-3" style={{
                              padding: '9px 16px',
                              borderBottom: idx < instances.length - 1 ? '1px solid color-mix(in srgb, var(--border) 50%, transparent)' : 'none',
                              opacity: pending ? 0.55 : 1,
                            }}>
                              <div style={{
                                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                                background: dotColor,
                                boxShadow: done ? `0 0 5px ${dotColor}` : 'none',
                              }} />
                              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', minWidth: 50, flexShrink: 0 }}>{dateLabel}</span>
                              <div className="flex-1" />
                              <span style={{
                                fontSize: 11, fontWeight: 700, color: chipColor,
                                padding: '2px 8px', borderRadius: 8,
                                background: `color-mix(in srgb, ${chipColor} 13%, transparent)`,
                              }}>{chipLabel}</span>
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

        <div style={{ height: 6, background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }} />

        {/* Progress Log */}
        <div className="flex items-center justify-between" style={{ padding: '18px 20px 10px' }}>
          <div className="flex items-center gap-2">
            <span style={{ color: 'var(--text-secondary)', fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' }}>
              Progress Log
            </span>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 10,
              background: 'var(--surface2)', color: 'var(--text-tertiary)',
            }}>{goal.manualLogs.length}</span>
          </div>
          <button
            onClick={() => setShowLogForm(s => !s)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '6px 14px', borderRadius: 20,
              background: showLogForm ? 'color-mix(in srgb, var(--primary) 15%, transparent)' : 'transparent',
              border: `1px solid ${showLogForm ? 'color-mix(in srgb, var(--primary) 35%, transparent)' : 'var(--border)'}`,
              color: 'var(--primary)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}
          >
            <Icon name="plus" size={13} color="var(--primary)" stroke={2.4} />
            Log entry
          </button>
        </div>

        <div style={{ padding: '0 20px 24px' }}>
          {showLogForm && (
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 16, padding: 16, marginBottom: 12,
            }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 7 }}>
                Minutes spent
              </div>
              <input
                type="number"
                value={minutes}
                onChange={e => setMinutes(e.target.value)}
                style={{
                  width: '100%', padding: '11px 14px',
                  background: 'var(--bg)', border: '1px solid var(--border)',
                  borderRadius: 10, color: 'var(--text-primary)',
                  fontSize: 16, fontWeight: 600, outline: 'none', boxSizing: 'border-box',
                }}
              />
              <div style={{ color: 'var(--text-secondary)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 14, marginBottom: 7 }}>
                Journal note
              </div>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="What did you work on?"
                rows={3}
                style={{
                  width: '100%', padding: '11px 14px',
                  background: 'var(--bg)', border: '1px solid var(--border)',
                  borderRadius: 10, color: 'var(--text-primary)',
                  fontSize: 14, lineHeight: 1.4, outline: 'none', resize: 'none',
                  fontFamily: 'inherit', boxSizing: 'border-box',
                }}
              />
              <div className="flex gap-2.5 mt-3.5">
                <button
                  onClick={() => setShowLogForm(false)}
                  style={{
                    flex: 1, padding: 12,
                    background: 'var(--bg)', border: '1px solid var(--border)',
                    borderRadius: 12, color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}
                >Cancel</button>
                <button
                  onClick={handleSubmitLog}
                  style={{
                    flex: 2, padding: 12,
                    background: 'var(--primary)', border: 'none',
                    borderRadius: 12, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  }}
                >Save Entry</button>
              </div>
            </div>
          )}

          {goal.manualLogs.length === 0 && !showLogForm && (
            <div style={{
              padding: '28px 16px', textAlign: 'center',
              background: 'var(--surface)', borderRadius: 16,
              border: '1.5px dashed var(--border)',
            }}>
              <Icon name="note" size={24} color="var(--text-tertiary)" style={{ display: 'inline-block' }} />
              <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 10 }}>
                No entries yet. Log your first session.
              </div>
            </div>
          )}

          {goal.manualLogs.map((log, i) => {
            // Handle legacy string logs and new ManualLog objects
            type LogCompat = ManualLog & { effortMinutes?: number; notes?: string };
            const l: LogCompat = typeof log === 'string'
              ? { date: 'Entry', minutes: 0, note: log }
              : log as LogCompat;
            const mins = l.minutes ?? l.effortMinutes ?? 0;
            return (
              <div key={i} style={{
                background: 'var(--surface)', borderRadius: 14,
                border: '1px solid var(--border)',
                borderLeft: `3px solid ${catColor}`,
                padding: '14px 16px', marginBottom: 8,
              }}>
                <div className="flex items-center justify-between mb-1">
                  <span style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 600 }}>{l.date}</span>
                  <span style={{
                    color: 'var(--warning)', fontSize: 12, fontWeight: 700,
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    background: 'color-mix(in srgb, var(--warning) 12%, transparent)',
                    padding: '2px 8px', borderRadius: 10,
                  }}>
                    <Icon name="clock" size={12} color="var(--warning)" stroke={2} />
                    {mins} min
                  </span>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 13.5, lineHeight: 1.55 }}>
                  {l.note ?? l.notes}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 400,
            background: 'rgba(0,0,0,0.62)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
          }}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            style={{
              background: 'var(--surface2)', borderRadius: 22,
              padding: '28px 24px 24px', width: '100%', maxWidth: 320,
              boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: 'color-mix(in srgb, #FF6B7A 14%, transparent)',
              display: 'grid', placeItems: 'center', marginBottom: 16,
            }}>
              <Icon name="trash" size={24} color="#FF6B7A" stroke={1.8} />
            </div>
            <div style={{ color: 'var(--text-primary)', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Delete Goal?</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.55, marginBottom: 28 }}>
              <strong style={{ color: 'var(--text-primary)' }}>{goal.title}</strong> and all its progress logs will be permanently removed.
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  flex: 1, padding: 13,
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 12, color: 'var(--text-primary)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}
              >Cancel</button>
              <button
                onClick={handleDelete}
                style={{
                  flex: 1, padding: 13,
                  background: '#FF6B7A', border: 'none',
                  borderRadius: 12, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                }}
              >Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
