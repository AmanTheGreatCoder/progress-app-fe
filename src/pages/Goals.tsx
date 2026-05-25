import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Icon } from '../components/ui/Icon';
import { Pill } from '../components/ui/Pill';
import { GoalRow, goalPct, goalDaysLeft } from '../components/ui/GoalRow';
import { TaskRow } from '../components/ui/TaskRow';
import type { Goal, Task, ManualLog } from '../types';
import api from '../services/api';

const priorityMeta: Record<string, { color: string, label: string }> = {
  High: { color: '#FF6B7A', label: 'High' },
  Medium: { color: 'var(--warning)', label: 'Med' },
  Low: { color: 'var(--text-secondary)', label: 'Low' },
};


const GoalDetail: React.FC<{
  goal: Goal,
  tasks: Task[],
  onBack: () => void,
  onEdit: () => void,
  onToggleTask: (id: string) => void,
  onOpenTask: (id: string) => void,
  onAddLog: (goalId: string, log: ManualLog) => void,
  onUpdateGoal: (id: string, updates: any) => void,
  onDeleteGoal: (id: string) => void,
}> = ({ goal, tasks, onBack, onEdit, onToggleTask, onAddLog, onUpdateGoal, onDeleteGoal }) => {
  const pct = goalPct(goal);
  const catColor = `var(--c-${goal.category.toLowerCase()})`;
  const days = goalDaysLeft(goal);
  const linkedTasks = tasks.filter(t => goal.linkedRecurringNames?.includes(t.title));

  const [showOverflow, setShowOverflow] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);
  const [showLinkMenu, setShowLinkMenu] = useState(false);
  const [minutes, setMinutes] = useState('30');
  const [note, setNote] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [seriesNames, setSeriesNames] = useState<string[]>([]);
  const [ringPct, setRingPct] = useState(0);
  const overflowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setTimeout(() => setRingPct(pct), 120);
    return () => clearTimeout(id);
  }, [pct]);

  useEffect(() => {
    api.get('/tasks/series').then(res => setSeriesNames(res.data)).catch(() => { });
  }, []);

  // Close overflow menu on outside click
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

  const R = 56, C = 2 * Math.PI * R;

  const handleSubmitLog = () => {
    if (!minutes) return;
    onAddLog(goal.id, {
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      minutes: Number(minutes),
      note: note || '—',
    });
    setMinutes('30'); setNote(''); setShowLogForm(false);
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

  const prioColor = priorityMeta[goal.priority]?.color || 'var(--text-secondary)';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>

      {/* ── Android App Bar ───────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center',
        height: 58, padding: '0 4px',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
        position: 'relative',
      }}>
        <button onClick={onBack} style={{
          width: 48, height: 48, borderRadius: 24,
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'grid', placeItems: 'center', flexShrink: 0,
        }}>
          <Icon name="arrow-left" size={22} color="var(--text-primary)" />
        </button>
        <div style={{ flex: 1, overflow: 'hidden', padding: '0 4px' }}>
          <div style={{
            color: 'var(--text-primary)', fontSize: 17, fontWeight: 700,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{goal.title}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 1 }}>
            {goal.category} · {goal.archived ? 'Archived' : days > 0 ? `${days}d left` : 'Ended'}
          </div>
        </div>
        {/* 3-dot overflow */}
        <div ref={overflowRef} style={{ position: 'relative', flexShrink: 0 }}>
          <button onClick={() => setShowOverflow(s => !s)} style={{
            width: 48, height: 48, borderRadius: 24,
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'grid', placeItems: 'center',
          }}>
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
                { icon: 'edit', label: 'Edit goal', action: () => { setShowOverflow(false); onEdit(); } },
                { icon: goal.archived ? 'unarchive' : 'archive', label: goal.archived ? 'Unarchive' : 'Archive', action: handleArchive },
                { icon: 'trash', label: 'Delete goal', action: () => { setShowOverflow(false); setShowDeleteConfirm(true); }, danger: true },
              ].map((item, i, arr) => (
                <button key={item.label} onClick={item.action} style={{
                  width: '100%', padding: '13px 16px',
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: 'none', border: 'none', cursor: 'pointer',
                  borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
                  color: (item as any).danger ? '#FF6B7A' : 'var(--text-primary)',
                  fontSize: 14, fontWeight: 500, textAlign: 'left',
                }}>
                  <Icon name={item.icon} size={17} color={(item as any).danger ? '#FF6B7A' : 'var(--text-tertiary)'} />
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Scrollable body ───────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 108 }}>

        {/* Hero: icon + title chips (centered) */}
        <div style={{ padding: '24px 24px 0', textAlign: 'center' }}>
          <div style={{
            width: 68, height: 68, borderRadius: 22,
            background: `color-mix(in srgb, ${catColor} 18%, transparent)`,
            display: 'inline-grid', placeItems: 'center',
            fontSize: 30, marginBottom: 14,
          }}>{goal.icon}</div>
          <div style={{
            color: 'var(--text-primary)', fontSize: 22, fontWeight: 700,
            letterSpacing: -0.4, lineHeight: 1.25, marginBottom: 12,
          }}>{goal.title}</div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
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

        {/* Progress ring — centered, bigger */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '28px 24px 8px' }}>
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
              <div style={{ color: 'var(--text-primary)', fontSize: 34, fontWeight: 800, letterSpacing: -1, lineHeight: 1 }}>
                {pct}%
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 3 }}>
                {goal.taskDone} / {goal.taskTotal}
              </div>
            </div>
          </div>
        </div>

        {/* Stat cards row */}
        <div style={{ display: 'flex', gap: 10, padding: '16px 20px 24px' }}>
          {[
            { icon: 'clock', color: 'var(--warning)', value: `${days}`, label: 'days left' },
            { icon: 'flame', color: 'var(--secondary)', value: `${goal.streak}`, label: 'day streak' },
            { icon: 'check', color: 'var(--success)', value: `${goal.taskDone}`, label: `of ${goal.taskTotal}` },
          ].map(s => (
            <div key={s.label} style={{
              flex: 1,
              background: 'var(--surface)', border: '1px solid var(--border)',
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

        {/* ── Section divider ──────────────────────────────────────────── */}
        <div style={{ height: 6, background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }} />

        {/* ── Linked Tasks ─────────────────────────────────────────────── */}
        <div style={{ padding: '18px 20px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' }}>
              Linked Tasks
            </span>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 10,
              background: 'var(--surface2)', color: 'var(--text-tertiary)',
            }}>{linkedTasks.length}</span>
          </div>
          <button onClick={() => setShowLinkMenu(s => !s)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '6px 14px', borderRadius: 20,
            background: showLinkMenu
              ? `color-mix(in srgb, var(--primary) 15%, transparent)`
              : 'transparent',
            border: `1px solid ${showLinkMenu ? 'color-mix(in srgb, var(--primary) 35%, transparent)' : 'var(--border)'}`,
            color: 'var(--primary)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>
            <Icon name="link" size={13} color="var(--primary)" />
            Link series
          </button>
        </div>

        <div style={{ padding: '0 20px 20px' }}>
          {/* Link menu */}
          {showLinkMenu && (
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 16, padding: '14px 14px 6px', marginBottom: 12,
            }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: 11, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 10 }}>
                Select a recurring series
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'var(--bg)', border: '1px solid var(--border)',
                borderRadius: 10, padding: '9px 12px', marginBottom: 10,
              }}>
                <Icon name="search" size={15} color="var(--text-tertiary)" />
                <input
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search tasks..."
                  style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: 14 }}
                />
              </div>
              <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                {seriesNames.filter(t => t.toLowerCase().includes(searchQuery.toLowerCase())).map((title, idx, arr) => {
                  const isLinked = goal.linkedRecurringNames?.includes(title);
                  return (
                    <div key={title} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '11px 0', borderBottom: idx < arr.length - 1 ? '1px solid var(--border)' : 'none',
                    }}>
                      <span style={{ color: 'var(--text-primary)', fontSize: 14, flex: 1, marginRight: 8 }}>{title}</span>
                      <button onClick={() => {
                        const newLinked = isLinked
                          ? (goal.linkedRecurringNames || []).filter(n => n !== title)
                          : [...(goal.linkedRecurringNames || []), title];
                        onUpdateGoal(goal.id, { linkedRecurringNames: newLinked });
                      }} style={{
                        padding: '5px 14px', borderRadius: 20, flexShrink: 0,
                        background: isLinked ? 'var(--surface2)' : 'var(--primary)',
                        color: isLinked ? 'var(--text-secondary)' : '#fff',
                        border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                      }}>
                        {isLinked ? 'Unlink' : 'Link'}
                      </button>
                    </div>
                  );
                })}
                {seriesNames.filter(t => t.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                  <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
                    No tasks found
                  </div>
                )}
              </div>
            </div>
          )}

          {linkedTasks.length === 0 ? (
            <div style={{
              padding: '28px 16px', textAlign: 'center',
              background: 'var(--surface)', borderRadius: 16,
              border: '1.5px dashed var(--border)',
            }}>
              <Icon name="link" size={24} color="var(--text-tertiary)" style={{ display: 'inline-block' }} />
              <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 10 }}>
                No tasks linked to this goal yet.
              </div>
              <button onClick={() => setShowLinkMenu(true)} style={{
                marginTop: 12, padding: '7px 18px', borderRadius: 20,
                background: `color-mix(in srgb, var(--primary) 14%, transparent)`,
                border: `1px solid color-mix(in srgb, var(--primary) 28%, transparent)`,
                color: 'var(--primary)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              }}>Link a series</button>
            </div>
          ) : (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
              {linkedTasks.slice(0, 5).map((t, i, arr) => (
                <div key={t.id} style={{ borderBottom: i === arr.length - 1 ? 'none' : '1px solid var(--border)' }}>
                  <TaskRow task={t} goal={goal} onToggle={() => onToggleTask(t.id)} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Section divider ──────────────────────────────────────────── */}
        <div style={{ height: 6, background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }} />

        {/* ── Progress Log ─────────────────────────────────────────────── */}
        <div style={{ padding: '18px 20px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase' }}>
              Progress Log
            </span>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 10,
              background: 'var(--surface2)', color: 'var(--text-tertiary)',
            }}>{goal.manualLogs.length}</span>
          </div>
          <button onClick={() => setShowLogForm(s => !s)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '6px 14px', borderRadius: 20,
            background: showLogForm
              ? `color-mix(in srgb, var(--primary) 15%, transparent)`
              : 'transparent',
            border: `1px solid ${showLogForm ? 'color-mix(in srgb, var(--primary) 35%, transparent)' : 'var(--border)'}`,
            color: 'var(--primary)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>
            <Icon name="plus" size={13} color="var(--primary)" stroke={2.4} />
            Log entry
          </button>
        </div>

        <div style={{ padding: '0 20px 24px' }}>
          {/* Inline log form */}
          {showLogForm && (
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 16, padding: '16px', marginBottom: 12,
            }}>
              <div style={{ color: 'var(--text-secondary)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 7 }}>
                Minutes spent
              </div>
              <input type="number" value={minutes} onChange={e => setMinutes(e.target.value)} style={{
                width: '100%', padding: '11px 14px',
                background: 'var(--bg)', border: '1px solid var(--border)',
                borderRadius: 10, color: 'var(--text-primary)',
                fontSize: 16, fontWeight: 600, outline: 'none', boxSizing: 'border-box',
              }} />
              <div style={{ color: 'var(--text-secondary)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 14, marginBottom: 7 }}>
                Journal note
              </div>
              <textarea value={note} onChange={e => setNote(e.target.value)}
                placeholder="What did you work on?" rows={3}
                style={{
                  width: '100%', padding: '11px 14px',
                  background: 'var(--bg)', border: '1px solid var(--border)',
                  borderRadius: 10, color: 'var(--text-primary)',
                  fontSize: 14, lineHeight: 1.4, outline: 'none', resize: 'none',
                  fontFamily: 'inherit', boxSizing: 'border-box',
                }} />
              <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                <button onClick={() => setShowLogForm(false)} style={{
                  flex: 1, padding: '12px',
                  background: 'var(--bg)', border: '1px solid var(--border)',
                  borderRadius: 12, color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}>Cancel</button>
                <button onClick={handleSubmitLog} style={{
                  flex: 2, padding: '12px',
                  background: 'var(--primary)', border: 'none',
                  borderRadius: 12, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                }}>Save Entry</button>
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
            const l = typeof log === 'string'
              ? { date: 'Entry', minutes: 0, note: log }
              : log as any;
            const mins = l.minutes ?? l.effortMinutes ?? 0;
            return (
              <div key={i} style={{
                background: 'var(--surface)', borderRadius: 14,
                border: '1px solid var(--border)',
                borderLeft: `3px solid ${catColor}`,
                padding: '14px 16px', marginBottom: 8,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
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

      {/* ── FAB: Log entry ────────────────────────────────────────────── */}
      <button onClick={() => { setShowLogForm(true); setTimeout(() => document.querySelector<HTMLElement>('textarea')?.focus(), 80); }} style={{
        position: 'fixed', bottom: 90, right: 20,
        height: 52, paddingInline: 20,
        borderRadius: 16,
        background: 'var(--primary)', border: 'none', cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: 8,
        boxShadow: '0 8px 24px rgba(124,106,247,0.42)',
        zIndex: 50,
      }}>
        <Icon name="plus" size={20} color="#fff" stroke={2.5} />
        <span style={{ color: '#fff', fontSize: 14, fontWeight: 700 }}>Log entry</span>
      </button>

      {/* ── Delete confirmation modal ─────────────────────────────────── */}
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
            <div style={{ color: 'var(--text-primary)', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
              Delete Goal?
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.55, marginBottom: 28 }}>
              <strong style={{ color: 'var(--text-primary)' }}>{goal.title}</strong> and all its progress logs will be permanently removed.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowDeleteConfirm(false)} style={{
                flex: 1, padding: '13px',
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 12, color: 'var(--text-primary)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}>Cancel</button>
              <button onClick={handleDelete} style={{
                flex: 1, padding: '13px',
                background: '#FF6B7A', border: 'none',
                borderRadius: 12, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer',
              }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const GoalForm: React.FC<{ initialGoal?: Goal, onBack: () => void, onSave: (g: any) => void }> = ({ initialGoal, onBack, onSave }) => {
  const [draft, setDraft] = useState({
    title: initialGoal?.title || '',
    category: initialGoal?.category || 'Health',
    priority: initialGoal?.priority || 'Medium',
    startDate: initialGoal?.start || new Date().toISOString().slice(0, 10),
    deadline: initialGoal?.end || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    targetFrequency: 5,
  });

  return (
    <div className="slide-in-right" style={{ padding: '0 0 100px', position: 'fixed', inset: 0, zIndex: 100, background: 'var(--bg)', overflowY: 'auto' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 16px 12px',
      }}>
        <button onClick={onBack} style={{
          width: 40, height: 40, borderRadius: 12,
          background: 'transparent', border: 'none',
          display: 'grid', placeItems: 'center', cursor: 'pointer',
        }}>
          <Icon name="x" size={22} color="var(--text-primary)" />
        </button>
        <span style={{ color: 'var(--text-primary)', fontSize: 16, fontWeight: 600 }}>{initialGoal ? 'Edit Goal' : 'New Goal'}</span>
        <button onClick={() => {
          if (draft.title.trim()) onSave(draft);
        }} style={{
          padding: '8px 16px', borderRadius: 10,
          background: 'var(--primary)', border: 'none', color: '#fff',
          fontSize: 13, fontWeight: 600, cursor: 'pointer',
          opacity: draft.title.trim() ? 1 : 0.5,
        }}>{initialGoal ? 'Save' : 'Create'}</button>
      </div>

      <div style={{ padding: '20px' }}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 }}>Goal Title</label>
          <input value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} placeholder="E.g., Read 10 books" style={{
            width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border)',
            background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 16, outline: 'none',
            boxSizing: 'border-box'
          }} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 }}>Category</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Health', 'Career', 'Learning', 'Wellness', 'Finance'].map(c => (
              <button key={c} onClick={() => setDraft({ ...draft, category: c as any })} style={{
                padding: '10px 14px', borderRadius: 10, border: `1px solid ${draft.category === c ? 'var(--primary)' : 'var(--border)'}`,
                background: draft.category === c ? 'color-mix(in srgb, var(--primary) 15%, transparent)' : 'var(--surface)',
                color: draft.category === c ? 'var(--primary)' : 'var(--text-primary)', fontWeight: 600, cursor: 'pointer'
              }}>{c}</button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 }}>Priority</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {['High', 'Medium', 'Low'].map(p => (
              <button key={p} onClick={() => setDraft({ ...draft, priority: p as any })} style={{
                padding: '10px 14px', borderRadius: 10, border: `1px solid ${draft.priority === p ? 'var(--primary)' : 'var(--border)'}`,
                background: draft.priority === p ? 'color-mix(in srgb, var(--primary) 15%, transparent)' : 'var(--surface)',
                color: draft.priority === p ? 'var(--primary)' : 'var(--text-primary)', fontWeight: 600, cursor: 'pointer'
              }}>{p}</button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 20, display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 }}>Start Date</label>
            <input type="date" value={draft.startDate} onChange={e => setDraft({ ...draft, startDate: e.target.value })} style={{
              width: '100%', padding: '12px', borderRadius: 12, border: '1px solid var(--border)',
              background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 14, outline: 'none',
              boxSizing: 'border-box'
            }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 }}>Deadline</label>
            <input type="date" value={draft.deadline} onChange={e => setDraft({ ...draft, deadline: e.target.value })} style={{
              width: '100%', padding: '12px', borderRadius: 12, border: '1px solid var(--border)',
              background: 'var(--surface)', color: 'var(--text-primary)', fontSize: 14, outline: 'none',
              boxSizing: 'border-box'
            }} />
          </div>
        </div>
      </div>
    </div>
  );
};

const GoalsList: React.FC<{ goals: Goal[], onOpenGoal: (id: string) => void, onCreateGoal: () => void }> = ({ goals, onOpenGoal, onCreateGoal }) => {
  const [tab, setTab] = useState<'active' | 'archived'>('active');
  const filtered = goals.filter(g => tab === 'active' ? !g.archived : g.archived);

  return (
    <div style={{ padding: '0px 0 140px' }}>
      <div style={{
        padding: '8px 20px 20px',
        paddingTop: '0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ color: 'var(--text-primary)', fontSize: 28, fontWeight: 700, letterSpacing: -0.4 }}>
            Goals
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 2 }}>
            {goals.filter(g => !g.archived).length} active · {goals.filter(g => g.archived).length} archived
          </div>
        </div>
        <button onClick={onCreateGoal} style={{
          width: 44, height: 44, borderRadius: 14,
          background: 'var(--primary)', border: 'none',
          display: 'grid', placeItems: 'center', cursor: 'pointer',
          boxShadow: '0 8px 20px rgba(124,106,247,0.35)',
        }}>
          <Icon name="plus" size={22} color="#fff" stroke={2.4} />
        </button>
      </div>

      {/* Tabs */}
      <div style={{ padding: '0 20px 20px' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          background: 'var(--surface)', borderRadius: 12, padding: 4,
          border: '1px solid var(--border)',
        }}>
          {[
            { id: 'active' as const, label: 'Active', count: goals.filter(g => !g.archived).length },
            { id: 'archived' as const, label: 'Archived', count: goals.filter(g => g.archived).length },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '10px 12px', borderRadius: 9,
              background: tab === t.id ? 'var(--surface2)' : 'transparent',
              color: tab === t.id ? 'var(--text-primary)' : 'var(--text-secondary)',
              border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600,
              transition: 'all 200ms',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
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
          <div style={{
            padding: '60px 20px', textAlign: 'center',
            color: 'var(--text-secondary)', fontSize: 14,
          }}>
            No {tab} goals found.
          </div>
        )}
      </div>
    </div>
  );
};

const GoalsPage: React.FC = () => {
  const { goals, tasks, toggleTask, addLog, updateGoal, addGoal, deleteGoal } = useAppContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const goalId = searchParams.get('id');
  const editGoalId = searchParams.get('edit');
  const isCreating = searchParams.get('create');

  if (isCreating || editGoalId) {
    const initialGoal = editGoalId ? goals.find(g => g.id === editGoalId) : undefined;
    if (editGoalId && !initialGoal) return null; // wait for goals to load

    return (
      <GoalForm
        initialGoal={initialGoal}
        onBack={() => setSearchParams(goalId ? { id: goalId } : {})}
        onSave={(draft) => {
          if (editGoalId) {
            updateGoal(editGoalId, draft);
          } else {
            addGoal(draft);
          }
          setSearchParams(goalId ? { id: goalId } : {});
        }}
      />
    );
  }

  if (goalId) {
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      return (
        <GoalDetail
          goal={goal}
          tasks={tasks}
          onBack={() => setSearchParams({})}
          onEdit={() => setSearchParams({ edit: goalId, id: goalId })}
          onToggleTask={toggleTask}
          onOpenTask={(id) => navigate(`/tasks?id=${id}`)}
          onAddLog={addLog}
          onUpdateGoal={updateGoal}
          onDeleteGoal={(id) => { deleteGoal(id); setSearchParams({}); }}
        />
      );
    }
  }

  return <GoalsList goals={goals} onOpenGoal={(id) => setSearchParams({ id })} onCreateGoal={() => setSearchParams({ create: 'true' })} />;
};

export default GoalsPage;
