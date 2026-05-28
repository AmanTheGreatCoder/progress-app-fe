import React, { useState, useCallback } from 'react';
import { Card } from '../components/ui/Card';
import { DateStrip, STRIP_DAYS } from '../components/ui/DateStrip';
import { Icon } from '../components/ui/Icon';
import { ProgressBar } from '../components/ui/ProgressBar';
import { TaskRow } from '../components/ui/TaskRow';
import { useAppContext } from '../context/AppContext';
import { useTasks } from '../hooks/useTasks';
import { getLocalYMD } from '../utils/dateUtils';
import api from '../services/api';
import type { Goal, Task } from '../types';

// ── TasksList ─────────────────────────────────────────────────────────────────

interface TasksListProps {
  tasks: Task[];
  goals: Goal[];
  loading: boolean;
  selected: string;
  onSelect: (key: string) => void;
  onToggleTask: (id: string) => void;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const TasksList: React.FC<TasksListProps> = ({ tasks, goals, loading, selected, onSelect, onToggleTask }) => {
  const done = tasks.filter(t => t.done).length;
  const total = tasks.length;
  const pending = tasks.filter(t => !t.done);

  const selectedMeta = STRIP_DAYS.find(d => d.key === selected)!;
  const fullDate = new Date(selected + 'T00:00:00');
  const monthName = MONTH_NAMES[fullDate.getMonth()];
  const heading = !selectedMeta ? selected
    : selectedMeta.offset === 0 ? 'Today'
      : selectedMeta.offset === 1 ? 'Tomorrow'
        : selectedMeta.offset === -1 ? 'Yesterday'
          : `${selectedMeta.dayName} ${selectedMeta.dayNum}`;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0">
        <div className="flex items-start justify-between gap-3" style={{ padding: '0 20px 0px' }}>
          <div className="min-w-0">
            <div style={{ color: 'var(--text-primary)', fontSize: 28, fontWeight: 700, letterSpacing: -0.4 }}>
              {heading}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {loading ? (
                <span style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>Loading…</span>
              ) : (
                <>
                  <span style={{
                    color: total > 0 && done === total ? 'var(--success)' : 'var(--primary)',
                    fontSize: 13, fontWeight: 700,
                  }}>{done}/{total}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>completed</span>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>·</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                    {monthName} {selectedMeta?.dayNum}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
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

        <DateStrip selected={selected} onSelect={onSelect} />

        <div style={{ padding: '0px 20px 18px' }}>
          <ProgressBar
            value={loading || total === 0 ? 0 : (done / total) * 100}
            color={done === total && total > 0 ? 'var(--success)' : 'var(--primary)'}
            bg="var(--surface)"
            height={4}
          />
        </div>

        <div className="flex items-center justify-between" style={{ padding: '4px 20px 10px' }}>
          <span style={{ color: 'var(--text-primary)', fontSize: 12.5, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>
            Pending{' '}
            <span style={{ color: 'var(--text-tertiary)', fontWeight: 600 }}>
              · {loading ? '—' : pending.length}
            </span>
          </span>
        </div>
      </div>

      {/* Task list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 140px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {loading ? (
          <div className="flex flex-col gap-px">
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                height: 64,
                borderRadius: i === 1 ? '12px 12px 0 0' : i === 3 ? '0 0 12px 12px' : 0,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderBottom: i < 3 ? 'none' : '1px solid var(--border)',
                opacity: 1 - (i - 1) * 0.2,
                animation: 'fadeIn 400ms ease both',
                animationDelay: `${(i - 1) * 60}ms`,
              }} />
            ))}
          </div>
        ) : tasks.length > 0 ? (
          <Card pad={0}>
            {tasks.map((t, i) => (
              <div key={t.id} style={{ borderBottom: i === tasks.length - 1 ? 'none' : '1px solid var(--border)' }}>
                <TaskRow
                  task={t}
                  goal={goals.find(g => g.id === t.goalId)}
                  onToggle={() => onToggleTask(t.id)}
                />
              </div>
            ))}
          </Card>
        ) : (
          <Card pad={28} style={{ textAlign: 'center' }}>
            <Icon name="sparkle" size={26} color="var(--text-tertiary)" style={{ display: 'inline-block' }} />
            <div style={{ color: 'var(--text-primary)', fontSize: 14, fontWeight: 600, marginTop: 10 }}>Nothing scheduled</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginTop: 4 }}>
              Tasks for this day will appear here when synced.
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

// ── TasksPage ─────────────────────────────────────────────────────────────────

const TasksPage: React.FC = () => {
  const { goals, refetchGoals } = useAppContext();
  const todayKey = STRIP_DAYS.find(d => d.offset === 0)?.key || getLocalYMD();
  const [selectedDate, setSelectedDate] = useState(todayKey);

  const { tasks: rawTasks, loading, refetch: refetchLocalTasks } = useTasks(selectedDate);

  // Map raw task shape from useTasks to the UI Task interface
  const tasks: Task[] = rawTasks.map(t => ({
    id: t.id,
    title: t.name,
    goalId: '',
    due: t.date,
    tags: t.tags,
    done: t.completed,
    source: 'TickTick',
    isRecurring: t.isRecurring || false,
    repeatFlag: t.repeatFlag || '',
    points: t.points || 0,
    minVersion: t.minVersion || '',
    completedMin: t.completedMin || false,
  }));

  const handleToggle = useCallback(async (id: string) => {
    const task = rawTasks.find(t => t.id === id);
    if (!task) return;
    try {
      await api.patch(`/tasks/${id}`, { completed: !task.completed });
      refetchLocalTasks();
      refetchGoals();
    } catch (e) {
      console.error(e);
    }
  }, [rawTasks, refetchLocalTasks, refetchGoals]);

  return (
    <TasksList
      tasks={tasks}
      goals={goals}
      loading={loading}
      selected={selectedDate}
      onSelect={setSelectedDate}
      onToggleTask={handleToggle}
    />
  );
};

export default TasksPage;
