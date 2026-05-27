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
import type { Goal } from '../types';

// ── TasksList ─────────────────────────────────────────────────────────────────
// Receives already-filtered tasks for the selected day. Date state lives in
// TasksPage so changes trigger a fresh fetch from the backend.

interface TasksListProps {
  tasks: any[];
  goals: Goal[];
  loading: boolean;
  selected: string;
  onSelect: (key: string) => void;
  onToggleTask: (id: string) => void;
}

const TasksList: React.FC<TasksListProps> = ({ tasks, goals, loading, selected, onSelect, onToggleTask }) => {
  const done = tasks.filter(t => t.done || t.completed).length;
  const total = tasks.length;

  const selectedMeta = STRIP_DAYS.find(d => d.key === selected)!;
  const fullDate = new Date(selected + 'T00:00:00');
  const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][fullDate.getMonth()];
  const heading = !selectedMeta ? selected
    : selectedMeta.offset === 0 ? 'Today'
      : selectedMeta.offset === 1 ? 'Tomorrow'
        : selectedMeta.offset === -1 ? 'Yesterday'
          : `${selectedMeta.dayName} ${selectedMeta.dayNum}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div style={{ flexShrink: 0 }}>
        <div style={{
          padding: '0 20px 0px',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
        }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: 'var(--text-primary)', fontSize: 28, fontWeight: 700, letterSpacing: -0.4 }}>
              {heading}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
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

        {/* Date strip — tapping a day triggers onSelect → parent refetches */}
        <DateStrip selected={selected} onSelect={onSelect} />

        <div style={{ padding: '0px 20px 18px' }}>
          <ProgressBar
            value={loading || total === 0 ? 0 : (done / total) * 100}
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
            Pending{' '}
            <span style={{ color: 'var(--text-tertiary)', fontWeight: 600 }}>
              · {loading ? '—' : tasks.filter(t => !(t.done || t.completed)).length}
            </span>
          </span>
        </div>
      </div>

      {/* ── Task list ─────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 140px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {loading ? (
          /* Skeleton rows */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                height: 64, borderRadius: i === 1 ? '12px 12px 0 0' : i === 3 ? '0 0 12px 12px' : 0,
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
                  task={{ ...t, title: t.name || t.title, due: t.date || t.due, done: t.completed ?? t.done, tags: t.tags || [] }}
                  goal={goals.find(g => g.id === t.goalId)}
                  onToggle={() => onToggleTask(t.id)}
                />
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

// ── TasksPage ─────────────────────────────────────────────────────────────────
// Owns the selected-date state. When the date changes, useTasks re-fetches
// only that day's tasks from the backend — no full-table scan.

const TasksPage: React.FC = () => {
  const { goals, refetchGoals } = useAppContext();
  const todayKey = STRIP_DAYS.find(d => d.offset === 0)?.key || getLocalYMD();
  const [selectedDate, setSelectedDate] = useState(todayKey);

  // Each unique selectedDate gets its own date-scoped fetch
  const { tasks, loading, refetch: refetchLocalTasks } = useTasks(selectedDate);

  // Toggle task: patch via API, then refresh only local (date-filtered) list
  // and goal progress. We do NOT go through AppContext.toggleTask because that
  // looks up the task in AppContext's own today-only list — which may not
  // contain tasks from other dates the user is viewing.
  const handleToggle = useCallback(async (id: string) => {
    const task = tasks.find((t: any) => t.id === id);
    if (!task) return;
    try {
      await api.patch(`/tasks/${id}`, { completed: !task.completed });
      refetchLocalTasks();  // update this page's list
      refetchGoals();       // update goal progress badges
    } catch (e) {
      console.error(e);
    }
  }, [tasks, refetchLocalTasks, refetchGoals]);

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
