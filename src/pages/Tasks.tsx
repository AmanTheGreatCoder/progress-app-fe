import React, { useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { DateStrip, STRIP_DAYS } from '../components/ui/DateStrip';
import { Icon } from '../components/ui/Icon';
import { ProgressBar } from '../components/ui/ProgressBar';
import { TaskRow } from '../components/ui/TaskRow';
import { useAppContext } from '../context/AppContext';
import type { Goal, Task } from '../types';



// (DateStrip removed in favor of reusable component)



const TasksList: React.FC<{ tasks: Task[], goals: Goal[], onToggleTask: (id: string) => void }> = ({ tasks, goals, onToggleTask }) => {
  const todayKey = STRIP_DAYS.find(d => d.offset === 0)?.key || '';
  const [selected, setSelected] = useState(todayKey);

  const taggedTasks = useMemo(() => tasks.map(t => ({ ...t, _key: t.due })), [tasks]);

  const dayTasks = taggedTasks.filter(t => t._key === selected);
  const done = dayTasks.filter(t => t.done).length;
  const total = dayTasks.length;

  const selectedMeta = STRIP_DAYS.find(d => d.key === selected)!;
  const fullDate = new Date(selected + 'T00:00:00');
  const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][fullDate.getMonth()];
  const heading = selectedMeta.offset === 0 ? 'Today'
    : selectedMeta.offset === 1 ? 'Tomorrow'
      : selectedMeta.offset === -1 ? 'Yesterday'
        : `${selectedMeta.dayName} ${selectedMeta.dayNum}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ flexShrink: 0, paddingTop: 8 }}>
        <div style={{
          padding: '0 20px 16px',
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
              <Icon name="filter" size={14} color="var(--text-primary)" />
              Sort
            </button>
          </div>
        </div>

        <DateStrip selected={selected} onSelect={setSelected} />

        <div style={{ padding: '14px 20px 18px' }}>
          <ProgressBar
            value={total === 0 ? 0 : (done / total) * 100}
            color={done === total && total > 0 ? 'var(--success)' : 'var(--primary)'}
            bg="var(--surface)"
            height={4}
          />
        </div>

        <div style={{
          padding: '4px 20px 10px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{
            color: 'var(--text-primary)', fontSize: 12.5, fontWeight: 700,
            letterSpacing: 0.5, textTransform: 'uppercase',
          }}>
            Pending <span style={{ color: 'var(--text-tertiary)', fontWeight: 600 }}>· {dayTasks.filter(t => !t.done).length}</span>
          </span>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 140px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {dayTasks.length > 0 ? (
          <Card pad={0}>
            {dayTasks.map((t, i) => (
              <div key={t.id} style={{ borderBottom: i === dayTasks.length - 1 ? 'none' : '1px solid var(--border)' }}>
                <TaskRow task={t} goal={goals.find(g => g.id === t.goalId)}
                  onToggle={() => onToggleTask(t.id)} />
              </div>
            ))}
          </Card>
        ) : (
          <Card pad={28} style={{ textAlign: 'center' }}>
            <Icon name="sparkle" size={26} color="var(--text-tertiary)" style={{ display: 'inline-block' }} />
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
  const { tasks, goals, toggleTask } = useAppContext();

  return <TasksList tasks={tasks} goals={goals} onToggleTask={toggleTask} />;
};

export default TasksPage;
