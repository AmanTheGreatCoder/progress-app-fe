import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Card } from '@shared/components/ui/Card';
import { DateStrip, STRIP_DAYS } from '@shared/components/ui/DateStrip';
import { Icon } from '@shared/components/ui/Icon';
import { ProgressBar } from '@shared/components/ui/ProgressBar';
import { TaskRow } from '@shared/components/ui/TaskRow';
import { useAppContext } from '@shared/context/AppContext';
import { useTasks } from '@shared/hooks/useTasks';
import { getLocalYMD, MONTH_NAMES } from '@shared/utils/dateUtils';
import api from '@shared/api';
import type { Task } from '@shared/types';

// ── TasksList ─────────────────────────────────────────────────────────────────

interface TasksListProps {
  tasks: Task[];
  loading: boolean;
  selected: string;
  onSelect: (key: string) => void;
  onToggleTask: (id: string) => void;
}

const TasksList: React.FC<TasksListProps> = ({ tasks, loading, selected, onSelect, onToggleTask }) => {
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
        <div className="flex items-start justify-between gap-3 px-5">
          <div className="min-w-0">
            <div className="text-c-text1 text-3xl font-bold tracking-tight">
              {heading}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {loading ? (
                <span className="text-c-text3 text-sm">Loading…</span>
              ) : (
                <>
                  <span className={`text-sm font-bold ${total > 0 && done === total ? 'text-c-success' : 'text-c-primary'}`}>
                    {done}/{total}
                  </span>
                  <span className="text-c-text2 text-sm">completed</span>
                  <span className="text-c-text3 text-sm">·</span>
                  <span className="text-c-text2 text-sm">
                    {monthName} {selectedMeta?.dayNum}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button className="inline-flex items-center gap-1.5 py-2 px-3 rounded-pill bg-c-surface border border-c-border text-c-text1 text-xs font-semibold cursor-pointer">
              <Icon name="filter" size={14} color="var(--text-primary)" />
              Sort
            </button>
          </div>
        </div>

        <DateStrip selected={selected} onSelect={onSelect} />

        <div className="px-5 pb-4.5">
          <ProgressBar
            value={loading || total === 0 ? 0 : (done / total) * 100}
            color={done === total && total > 0 ? 'var(--success)' : 'var(--primary)'}
            bg="var(--surface)"
            height={4}
          />
        </div>

        <div className="flex items-center justify-between pt-1 px-5 pb-2.5">
          <span className="text-c-text1 text-xs font-bold tracking-label uppercase">
            Pending{' '}
            <span className="text-c-text3 font-semibold">
              · {loading ? '—' : pending.length}
            </span>
          </span>
        </div>
      </div>

      {/* Task list */}
      <div
        className="flex-1 overflow-y-auto px-5 pb-[140px]"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
      >
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
                <TaskRow task={t} onToggle={() => onToggleTask(t.id)} />
              </div>
            ))}
          </Card>
        ) : (
          <Card pad={28} className="text-center">
            <Icon name="sparkle" size={26} color="var(--text-tertiary)" style={{ display: 'inline-block' }} />
            <div className="text-c-text1 text-base font-semibold mt-[10px]">Nothing scheduled</div>
            <div className="text-c-text2 text-xs mt-1">
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
  const { refetchGoals, refreshKey } = useAppContext();
  const todayKey = STRIP_DAYS.find(d => d.offset === 0)?.key || getLocalYMD();
  const [selectedDate, setSelectedDate] = useState(todayKey);

  const { tasks: rawTasks, loading, refetch: refetchLocalTasks } = useTasks(selectedDate);

  // Re-fetch when pull-to-refresh fires (skip the very first render)
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    refetchLocalTasks();
  }, [refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

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
      loading={loading}
      selected={selectedDate}
      onSelect={setSelectedDate}
      onToggleTask={handleToggle}
    />
  );
};

export default TasksPage;
