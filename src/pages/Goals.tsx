import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Icon } from '../components/ui/Icon';
import { Pill } from '../components/ui/Pill';
import { GoalRow, goalPct, goalDaysLeft } from '../components/ui/GoalRow';
import { TaskRow } from '../components/ui/TaskRow';
import type { Goal, Task, ManualLog } from '../types';

const priorityMeta: Record<string, { color: string, label: string }> = {
  High: { color: '#FF6B7A', label: 'High' },
  Medium: { color: 'var(--warning)', label: 'Med' },
  Low: { color: 'var(--text-secondary)', label: 'Low' },
};

const Stat: React.FC<{ icon: string, color: string, value: string, unit: string }> = ({ icon, color, value, unit }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <div style={{
      width: 30, height: 30, borderRadius: 9,
      background: `color-mix(in srgb, ${color} 12%, transparent)`,
      display: 'grid', placeItems: 'center', flexShrink: 0,
    }}>
      <Icon name={icon} size={15} color={color} stroke={2} />
    </div>
    <div>
      <span style={{ color: 'var(--text-primary)', fontSize: 17, fontWeight: 700 }}>{value}</span>
      <span style={{ color: 'var(--text-secondary)', fontSize: 12, marginLeft: 6 }}>{unit}</span>
    </div>
  </div>
);

const GoalDetail: React.FC<{
  goal: Goal,
  tasks: Task[],
  onBack: () => void,
  onToggleTask: (id: string) => void,
  onOpenTask: (id: string) => void,
  onAddLog: (goalId: string, log: ManualLog) => void,
  onUpdateGoal: (id: string, updates: any) => void
}> = ({ goal, tasks, onBack, onToggleTask, onOpenTask, onAddLog, onUpdateGoal }) => {
  const pct = goalPct(goal);
  const catColor = `var(--c-${goal.category.toLowerCase()})`;
  const days = goalDaysLeft(goal);
  const linkedTasks = tasks.filter(t =>
    goal.linkedRecurringNames?.includes(t.title) && t.isRecurring
  );
  const [showLogForm, setShowLogForm] = useState(false);
  const [showLinkMenu, setShowLinkMenu] = useState(false);
  const [minutes, setMinutes] = useState('30');
  const [note, setNote] = useState('');

  const submit = () => {
    if (!minutes) return;
    onAddLog(goal.id, { date: 'Today', minutes: Number(minutes), note: note || '—' });
    setMinutes('30'); setNote(''); setShowLogForm(false);
  };

  const R = 52, C = 2 * Math.PI * R;
  const [ringPct, setRingPct] = useState(0);
  useEffect(() => {
    const id = setTimeout(() => setRingPct(pct), 100);
    return () => clearTimeout(id);
  }, [pct]);

  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="slide-up-modal" style={{ padding: '0 0 140px', position: 'fixed', inset: 0, zIndex: 100, background: 'var(--bg)', overflowY: 'auto' }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 16px 4px',
      }}>
        <button onClick={onBack} style={{
          width: 40, height: 40, borderRadius: 12,
          background: 'transparent', border: 'none',
          display: 'grid', placeItems: 'center', cursor: 'pointer',
        }}>
          <Icon name="arrow-left" size={22} color="var(--text-primary)" />
        </button>
        <button onClick={() => window.location.href = `?edit=${goal.id}`} style={{
          width: 40, height: 40, borderRadius: 12,
          background: 'transparent', border: 'none',
          display: 'grid', placeItems: 'center', cursor: 'pointer',
        }}>
          <Icon name="edit" size={20} color="var(--text-primary)" />
        </button>
      </div>

      {/* Hero */}
      <div style={{ padding: '8px 20px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: `color-mix(in srgb, ${catColor} 22%, transparent)`, color: catColor,
            display: 'grid', placeItems: 'center',
            fontSize: 26, flexShrink: 0,
          }}>{goal.icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Pill color={catColor} bg={`color-mix(in srgb, ${catColor} 12%, transparent)`} dot>{goal.category}</Pill>
            <div style={{
              color: 'var(--text-primary)', fontSize: 22, fontWeight: 700, marginTop: 8,
              lineHeight: 1.2, letterSpacing: -0.3,
            }}>{goal.title}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
              <span style={{
                color: priorityMeta[goal.priority].color, fontSize: 12, fontWeight: 600,
                display: 'inline-flex', alignItems: 'center', gap: 5,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: 3, background: priorityMeta[goal.priority].color }} />
                {goal.priority} priority
              </span>
              <span style={{ color: 'var(--text-tertiary)' }}>·</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
                Ends {goal.end.slice(5).replace('-', '/')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress ring card */}
      <div style={{ padding: '0 20px 16px' }}>
        <Card pad={20}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ position: 'relative', width: 124, height: 124, flexShrink: 0 }}>
              <svg width="124" height="124" viewBox="0 0 124 124" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="62" cy="62" r={R} stroke="var(--bg)" strokeWidth="9" fill="none" />
                <circle cx="62" cy="62" r={R} stroke={catColor} strokeWidth="9" fill="none"
                  strokeLinecap="round"
                  strokeDasharray={C}
                  strokeDashoffset={C - (C * ringPct / 100)}
                  style={{ transition: 'stroke-dashoffset 1100ms cubic-bezier(.2,.8,.2,1)' }} />
              </svg>
              <div style={{
                position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
                flexDirection: 'column',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: 'var(--text-primary)', fontSize: 30, fontWeight: 700, letterSpacing: -0.8 }}>{pct}%</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 11, marginTop: -2 }}>
                    {goal.taskDone}/{goal.taskTotal}
                  </div>
                </div>
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Stat icon="clock" color="var(--warning)" value={`${days}`} unit="days left" />
              <Stat icon="flame" color="var(--secondary)" value={`${goal.streak}`} unit="day streak" />
              <Stat icon="check" color="var(--success)" value={`${goal.taskDone}`} unit={`of ${goal.taskTotal} tasks`} />
            </div>
          </div>
        </Card>
      </div>

      {/* Linked tasks */}
      <div style={{
        padding: '12px 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h3 style={{ color: 'var(--text-primary)', fontSize: 15, fontWeight: 700, margin: 0 }}>
            Linked tasks
          </h3>
          <span style={{ color: 'var(--text-tertiary)', fontSize: 12 }}>{linkedTasks.length} total</span>
        </div>
        <button onClick={() => setShowLinkMenu(!showLinkMenu)} style={{
          background: 'none', border: 'none', color: 'var(--primary)',
          fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0,
          display: 'inline-flex', alignItems: 'center', gap: 4,
        }}>
          <Icon name="plus" size={14} color="var(--primary)" stroke={2.4} />
          Link series
        </button>
      </div>
      <div style={{ padding: '0 20px 20px' }}>
        {showLinkMenu && (
          <Card pad={16} style={{ marginBottom: 16 }}>
            <div style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Select a recurring series</div>
            <input
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', marginBottom: 12, outline: 'none' }}
            />
            <div style={{ maxHeight: 200, overflowY: 'auto' }}>
              {Array.from(new Set(tasks.filter(t => t.isRecurring && !t.done).map(t => t.title)))
                .filter(title => title.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(title => {
                  const isLinked = goal.linkedRecurringNames?.includes(title);
                  return (
                    <div key={title} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ color: 'var(--text-primary)', fontSize: 14 }}>{title}</span>
                      <button onClick={() => {
                        const newLinked = isLinked
                          ? (goal.linkedRecurringNames || []).filter(n => n !== title)
                          : [...(goal.linkedRecurringNames || []), title];
                        onUpdateGoal(goal.id, { linkedRecurringNames: newLinked });
                      }} style={{
                        padding: '4px 10px', borderRadius: 6,
                        background: isLinked ? 'var(--bg)' : 'var(--primary)',
                        color: isLinked ? 'var(--text-secondary)' : '#fff',
                        border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600
                      }}>
                        {isLinked ? 'Unlink' : 'Link'}
                      </button>
                    </div>
                  );
                })}
            </div>
          </Card>
        )}
        <Card pad={0}>
          {linkedTasks.slice(0, 4).map((t, i, arr) => (
            <div key={t.id} style={{ borderBottom: i === arr.length - 1 ? 'none' : '1px solid var(--border)' }}>
              <TaskRow task={t} goal={goal} onToggle={() => onToggleTask(t.id)} />
            </div>
          ))}
          {linkedTasks.length === 0 && (
            <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
              No tasks linked to this goal.
            </div>
          )}
        </Card>
      </div>

      {/* Manual progress log */}
      <div style={{
        padding: '4px 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <h3 style={{ color: 'var(--text-primary)', fontSize: 15, fontWeight: 700, margin: 0 }}>
          Progress log
        </h3>
        <button onClick={() => setShowLogForm(s => !s)} style={{
          background: 'none', border: 'none', color: 'var(--primary)',
          fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0,
          display: 'inline-flex', alignItems: 'center', gap: 4,
        }}>
          <Icon name="plus" size={14} color="var(--primary)" stroke={2.4} />
          Log entry
        </button>
      </div>

      <div style={{ padding: '0 20px' }}>
        {showLogForm && (
          <Card pad={16} style={{ marginBottom: 12, borderColor: 'color-mix(in srgb, var(--primary) 35%, transparent)' }}>
            <div style={{ color: 'var(--text-secondary)', fontSize: 11, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}>
              Minutes spent
            </div>
            <input type="number" value={minutes} onChange={e => setMinutes(e.target.value)} style={{
              width: '100%', marginTop: 6,
              padding: '10px 12px',
              background: 'var(--bg)', border: '1px solid var(--border)',
              borderRadius: 10, color: 'var(--text-primary)',
              fontSize: 16, fontWeight: 600,
              outline: 'none',
            }} />
            <div style={{ color: 'var(--text-secondary)', fontSize: 11, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase', marginTop: 12 }}>
              Journal note
            </div>
            <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="What did you work on?" rows={3} style={{
              width: '100%', marginTop: 6,
              padding: '10px 12px',
              background: 'var(--bg)', border: '1px solid var(--border)',
              borderRadius: 10, color: 'var(--text-primary)',
              fontSize: 14, lineHeight: 1.4,
              outline: 'none', resize: 'none',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }} />
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <button onClick={() => setShowLogForm(false)} style={{
                flex: 1, padding: '11px',
                background: 'transparent', border: '1px solid var(--border)',
                borderRadius: 10, color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600,
                cursor: 'pointer',
              }}>Cancel</button>
              <button onClick={submit} style={{
                flex: 1, padding: '11px',
                background: 'var(--primary)', border: 'none',
                borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 600,
                cursor: 'pointer',
              }}>Save entry</button>
            </div>
          </Card>
        )}

        {goal.manualLogs.length === 0 && !showLogForm && (
          <Card pad={20} style={{ textAlign: 'center' }}>
            <Icon name="note" size={24} color="var(--text-tertiary)" style={{ display: 'inline-block' }} />
            <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 8 }}>
              No entries yet. Log your first session.
            </div>
          </Card>
        )}

        {goal.manualLogs.map((log, i) => (
          <Card key={i} pad={16} style={{ marginBottom: 10 }} accent={catColor}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 6 }}>
              <span style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 600 }}>{log.date}</span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                color: 'var(--warning)', fontSize: 12, fontWeight: 700,
              }}>
                <Icon name="clock" size={13} color="var(--warning)" stroke={2} />
                {log.minutes} min
              </span>
            </div>
            <div style={{
              color: 'var(--text-secondary)', fontSize: 13.5, lineHeight: 1.5, marginTop: 6, paddingLeft: 6,
            }}>
              {log.note}
            </div>
          </Card>
        ))}
      </div>
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
    <div className="slide-up-modal" style={{ padding: '0 0 100px', position: 'fixed', inset: 0, zIndex: 100, background: 'var(--bg)', overflowY: 'auto' }}>
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
    <div style={{ padding: '8px 0 140px' }}>
      <div style={{
        padding: '8px 20px 20px',
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
  const { goals, tasks, toggleTask, addLog, updateGoal, addGoal } = useAppContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const goalId = searchParams.get('id');
  const editGoalId = searchParams.get('edit');
  const isCreating = searchParams.get('create');

  if (isCreating || editGoalId) {
    const initialGoal = editGoalId ? goals.find(g => g.id === editGoalId) : undefined;
    return (
      <GoalForm
        initialGoal={initialGoal}
        onBack={() => setSearchParams({})}
        onSave={(draft) => {
          if (editGoalId) {
            updateGoal(editGoalId, draft);
          } else {
            addGoal(draft);
          }
          setSearchParams({});
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
          onToggleTask={toggleTask}
          onOpenTask={(id) => navigate(`/tasks?id=${id}`)}
          onAddLog={addLog}
          onUpdateGoal={updateGoal}
        />
      );
    }
  }

  return <GoalsList goals={goals} onOpenGoal={(id) => setSearchParams({ id })} onCreateGoal={() => setSearchParams({ create: 'true' })} />;
};

export default GoalsPage;
