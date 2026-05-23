import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Card } from '../components/ui/Card';
import { Icon } from '../components/ui/Icon';
import { ProgressBar } from '../components/ui/ProgressBar';
import { TaskRow } from '../components/ui/TaskRow';
import { TODAY } from '../components/ui/GoalRow';
import { goalPct } from '../components/ui/GoalRow';
import type { Task, Goal } from '../types';

// Helper to calculate days for the strip
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const STRIP_DAYS = (() => {
  const days = [];
  const today = new Date(TODAY + 'T00:00:00');
  for (let i = -3; i <= 3; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      key: d.toISOString().slice(0, 10),
      dayName: DAY_NAMES[d.getDay()],
      dayNum: d.getDate(),
      isToday: i === 0,
      offset: i,
    });
  }
  return days;
})();

const dueToKey = (due: string) => {
  const today = new Date(TODAY + 'T00:00:00');
  if (due === 'Today')    { return STRIP_DAYS.find(d => d.offset === 0)?.key; }
  if (due === 'Tomorrow') { return STRIP_DAYS.find(d => d.offset === 1)?.key; }
  const idx = DAY_NAMES.findIndex(n => n === due);
  if (idx < 0) return null;
  for (let i = 1; i <= 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    if (d.getDay() === idx) return d.toISOString().slice(0, 10);
  }
  return null;
};

const DateStrip: React.FC<{ selected: string, onSelect: (k: string) => void }> = ({ selected, onSelect }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: `repeat(${STRIP_DAYS.length}, 1fr)`,
    gap: 8,
    padding: '0 20px 4px',
  }}>
    {STRIP_DAYS.map(d => {
      const active = d.key === selected;
      return (
        <button key={d.key} onClick={() => onSelect(d.key)} style={{
          padding: '10px 0 12px',
          borderRadius: 14,
          background: active ? 'var(--primary)' : 'var(--surface)',
          border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
          color: active ? '#fff' : 'var(--text-primary)',
          cursor: 'pointer',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
          boxShadow: active ? '0 10px 24px rgba(124,106,247,0.45)' : 'none',
          transform: active ? 'translateY(-2px)' : 'none',
          transition: 'transform 240ms cubic-bezier(.2,.8,.2,1), background 200ms, box-shadow 240ms',
        }}>
          <span style={{
            fontSize: 10.5, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase',
            color: active ? 'rgba(255,255,255,0.85)' : 'var(--text-secondary)',
          }}>{d.dayName}</span>
          <span style={{
            fontSize: 18, fontWeight: 700, letterSpacing: -0.3,
            color: active ? '#fff' : 'var(--text-primary)',
            lineHeight: 1,
          }}>{d.dayNum}</span>
        </button>
      );
    })}
  </div>
);

const Field: React.FC<{ label: string, hint?: string, children: React.ReactNode }> = ({ label, hint, children }) => (
  <div style={{ padding: '4px 20px 18px' }}>
    <div style={{
      color: 'var(--text-secondary)', fontSize: 11, fontWeight: 700,
      letterSpacing: 0.5, textTransform: 'uppercase',
      marginBottom: 10,
    }}>{label}</div>
    {children}
    {hint && (
      <div style={{ color: 'var(--text-tertiary)', fontSize: 11.5, marginTop: 8, lineHeight: 1.4 }}>
        {hint}
      </div>
    )}
  </div>
);

const TaskEdit: React.FC<{ task: Task, goals: Goal[], onBack: () => void, onSave: (d: Task) => void }> = ({ task, goals, onBack, onSave }) => {
  const [draft, setDraft] = useState<Task>({ ...task });
  
  const update = (k: keyof Task, v: any) => setDraft(d => ({ ...d, [k]: v }));
  const toggleTag = (tg: string) => {
    update('tags', draft.tags.includes(tg) ? draft.tags.filter(x=>x!==tg) : [...draft.tags, tg]);
  };
  const tagOptions = ['cardio','gym','mobility','review','design','planning','nonfiction','auto','monthly','focus','quick'];

  return (
    <div style={{ padding: '0 0 100px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 16px 12px',
      }}>
        <button onClick={onBack} style={{
          width: 40, height: 40, borderRadius: 12,
          background: 'transparent', border: 'none',
          display: 'grid', placeItems: 'center', cursor: 'pointer',
        }}>
          <Icon name="x" size={22} color="var(--text-primary)"/>
        </button>
        <span style={{ color: 'var(--text-primary)', fontSize: 16, fontWeight: 600 }}>Edit task</span>
        <button onClick={() => onSave(draft)} style={{
          padding: '8px 16px', borderRadius: 10,
          background: 'var(--primary)', border: 'none', color: '#fff',
          fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>Save</button>
      </div>

      <div style={{ padding: '0 20px 16px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px', background: 'var(--surface2)',
          border: '1px solid var(--border)', borderRadius: 10,
        }}>
          <Icon name="link" size={14} color="var(--text-secondary)"/>
          <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
            Synced from <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{task.source}</span> · creation read-only
          </span>
        </div>
      </div>

      <Field label="Task title">
        <input value={draft.title} onChange={e => update('title', e.target.value)} style={{
          width: '100%', padding: '14px 16px',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 12, color: 'var(--text-primary)',
          fontSize: 16, fontWeight: 500,
          outline: 'none', boxSizing: 'border-box',
        }}/>
      </Field>

      <Field label="Due date">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['Today','Tomorrow','Wed','Thu','Fri','Next wk'].map(d => (
            <button key={d} onClick={() => update('due', d)} style={{
              padding: '10px 14px', borderRadius: 10,
              background: draft.due === d ? 'color-mix(in srgb, var(--primary) 22%, transparent)' : 'var(--surface)',
              border: `1px solid ${draft.due === d ? 'var(--primary)' : 'var(--border)'}`,
              color: draft.due === d ? 'var(--primary)' : 'var(--text-primary)',
              fontSize: 13, fontWeight: 600,
              cursor: 'pointer',
            }}>{d}</button>
          ))}
        </div>
      </Field>

      <Field label="Linked goal" hint="One goal per task. Completion auto-increments goal progress.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {goals.filter(g=>!g.archived).map(g => {
            const c = `var(--c-${g.category.toLowerCase()})`;
            const selected = draft.goalId === g.id;
            return (
              <button key={g.id} onClick={() => update('goalId', g.id)} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px', borderRadius: 12,
                background: selected ? `color-mix(in srgb, ${c} 14%, transparent)` : 'var(--surface)',
                border: `1px solid ${selected ? c : 'var(--border)'}`,
                cursor: 'pointer', textAlign: 'left',
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 9,
                  background: `color-mix(in srgb, ${c} 22%, transparent)`, color: c,
                  display: 'grid', placeItems: 'center', fontSize: 16,
                }}>{g.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    color: 'var(--text-primary)', fontSize: 14, fontWeight: 600,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{g.title}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 11.5, marginTop: 1 }}>
                    {g.category} · {goalPct(g)}% complete
                  </div>
                </div>
                <div style={{
                  width: 20, height: 20, borderRadius: 10,
                  background: selected ? c : 'transparent',
                  border: `1.5px solid ${selected ? c : 'var(--border)'}`,
                  display: 'grid', placeItems: 'center',
                }}>
                  {selected && <Icon name="check" size={12} color="var(--bg)" stroke={3}/>}
                </div>
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="Tags">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {tagOptions.map(tg => {
            const on = draft.tags.includes(tg);
            return (
              <button key={tg} onClick={() => toggleTag(tg)} style={{
                padding: '7px 12px', borderRadius: 999,
                background: on ? 'color-mix(in srgb, var(--secondary) 19%, transparent)' : 'var(--surface)',
                border: `1px solid ${on ? 'var(--secondary)' : 'var(--border)'}`,
                color: on ? 'var(--secondary)' : 'var(--text-secondary)',
                fontSize: 12, fontWeight: 600,
                cursor: 'pointer',
              }}>#{tg}</button>
            );
          })}
        </div>
      </Field>
    </div>
  );
};

const TasksList: React.FC<{ tasks: Task[], goals: Goal[], onOpenTask: (id: string) => void, onToggleTask: (id: string) => void }> = ({ tasks, goals, onOpenTask, onToggleTask }) => {
  const todayKey = STRIP_DAYS.find(d => d.offset === 0)?.key || '';
  const [selected, setSelected] = useState(todayKey);

  const taggedTasks = useMemo(() => tasks.map(t => ({ ...t, _key: dueToKey(t.due) })), [tasks]);

  const dayTasks = taggedTasks.filter(t => t._key === selected);
  const done = dayTasks.filter(t => t.done).length;
  const total = dayTasks.length;

  const selectedMeta = STRIP_DAYS.find(d => d.key === selected)!;
  const fullDate = new Date(selected + 'T00:00:00');
  const monthName = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][fullDate.getMonth()];
  const heading = selectedMeta.offset === 0 ? 'Today'
    : selectedMeta.offset === 1 ? 'Tomorrow'
    : selectedMeta.offset === -1 ? 'Yesterday'
    : `${selectedMeta.dayName} ${selectedMeta.dayNum}`;

  return (
    <div style={{ padding: '8px 0 96px' }}>
      <div style={{
        padding: '8px 20px 16px',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: 'var(--text-primary)', fontSize: 28, fontWeight: 700, letterSpacing: -0.4 }}>
            {heading}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <span style={{
              color: total > 0 && done === total ? 'var(--success)' : 'var(--primary)',
              fontSize: 13, fontWeight: 700,
            }}>{done}/{total}</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>completed</span>
            <span style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>·</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{monthName} {selectedMeta.dayNum}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 12px', borderRadius: 999,
            background: 'var(--surface)', border: '1px solid var(--border)',
            color: 'var(--text-primary)', fontSize: 12.5, fontWeight: 600,
            cursor: 'pointer',
          }}>
            <Icon name="filter" size={14} color="var(--text-primary)"/>
            Sort
          </button>
          <button style={{
            width: 36, height: 36, borderRadius: 999,
            background: 'var(--surface)', border: '1px solid var(--border)',
            display: 'grid', placeItems: 'center', cursor: 'pointer',
          }}>
            <Icon name="edit" size={15} color="var(--text-primary)"/>
          </button>
        </div>
      </div>

      <DateStrip selected={selected} onSelect={setSelected}/>

      <div style={{ padding: '14px 20px 18px' }}>
        <ProgressBar
          value={total === 0 ? 0 : (done / total) * 100}
          color={done === total && total > 0 ? 'var(--success)' : 'var(--primary)'}
          bg="var(--surface)"
          height={4}
        />
      </div>

      <div style={{ padding: '0 20px 16px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 14px', background: 'var(--surface)',
          borderRadius: 12, border: '1px solid var(--border)',
        }}>
          <Icon name="link" size={14} color="var(--primary)"/>
          <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Synced 3 min ago</span> · Strava · Linear · Mercury · Readwise
          </span>
        </div>
      </div>

      <div style={{
        padding: '4px 20px 10px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{
          color: 'var(--text-primary)', fontSize: 12.5, fontWeight: 700,
          letterSpacing: 0.5, textTransform: 'uppercase',
        }}>
          Pending <span style={{ color: 'var(--text-tertiary)', fontWeight: 600 }}>· {dayTasks.filter(t=>!t.done).length}</span>
        </span>
        <span style={{
          color: 'var(--text-tertiary)', fontSize: 11.5, fontWeight: 600,
        }}>
          From {new Set(dayTasks.map(t=>t.source)).size || 0} sources
        </span>
      </div>

      <div style={{ padding: '0 20px' }}>
        {dayTasks.length > 0 ? (
          <Card pad={0}>
            {dayTasks.map((t, i) => (
              <div key={t.id} style={{ borderBottom: i === dayTasks.length-1 ? 'none' : '1px solid var(--border)' }}>
                <TaskRow task={t} goal={goals.find(g=>g.id===t.goalId)}
                  onToggle={() => onToggleTask(t.id)} onEdit={() => onOpenTask(t.id)}/>
              </div>
            ))}
          </Card>
        ) : (
          <Card pad={28} style={{ textAlign: 'center' }}>
            <Icon name="sparkle" size={26} color="var(--text-tertiary)" style={{ display: 'inline-block' }}/>
            <div style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 600, marginTop: 10 }}>
              Nothing scheduled
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 4 }}>
              Tasks for this day will appear here when synced.
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

const TasksPage: React.FC = () => {
  const { tasks, goals, toggleTask, saveTask } = useAppContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const taskId = searchParams.get('id');

  if (taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      return (
        <TaskEdit
          task={task}
          goals={goals}
          onBack={() => setSearchParams({})}
          onSave={(t) => {
            saveTask(t);
            setSearchParams({});
          }}
        />
      );
    }
  }

  return <TasksList tasks={tasks} goals={goals} onToggleTask={toggleTask} onOpenTask={(id) => setSearchParams({ id })} />;
};

export default TasksPage;
