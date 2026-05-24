import React from 'react';
import { Icon } from './Icon';
import type { Task, Goal } from '../../types';

interface TaskRowProps {
  task: Task;
  goal?: Goal;
  onToggle?: () => void;
}

export const TaskRow: React.FC<TaskRowProps> = ({ task }) => {
  const isDone = task.done;
  const isMin = task.completedMin && !isDone;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 16px',
      borderBottom: '1px solid var(--border)',
      opacity: isDone ? 0.7 : 1,
    }}>
      <div style={{
        width: 24, height: 24, borderRadius: 8,
        background: isDone ? 'var(--success)' : isMin ? 'color-mix(in srgb, var(--warning) 20%, transparent)' : 'transparent',
        border: `1.7px solid ${isDone ? 'var(--success)' : isMin ? 'var(--warning)' : 'var(--border)'}`,
        display: 'grid', placeItems: 'center',
        flexShrink: 0,
      }}>
        {isDone && <Icon name="check" size={14} color="var(--bg)" stroke={2.8} />}
        {isMin && <Icon name="arrow-down" size={14} color="var(--warning)" stroke={2.8} />}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          color: isDone ? 'var(--text-secondary)' : isMin ? 'var(--warning)' : 'var(--text-primary)',
          fontSize: 14.5, fontWeight: 500,
          textDecoration: (isDone || isMin) ? 'line-through' : 'none',
          opacity: isMin ? 0.8 : 1,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{task.title}</div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1, marginTop: 4 }}>
          {isMin ? (
            <span style={{
              fontSize: 11, color: 'var(--warning)', fontWeight: 600,
              padding: '2px 6px', borderRadius: 4, background: 'color-mix(in srgb, var(--warning) 15%, transparent)',
            }}>showed up ↓</span>
          ) : (
            <span style={{ color: 'var(--text-secondary)', fontSize: 11.5 }}>{task.due}</span>
          )}
          <div style={{ marginTop: 2, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {task.tags.map(tg => (
              <span key={tg} style={{
                fontSize: 10.5, color: 'var(--text-secondary)', fontWeight: 600,
                padding: '2px 6px', borderRadius: 4,
                background: 'var(--surface2)', textTransform: 'lowercase',
              }}>#{tg}</span>
            ))}
          </div>
          {task.minVersion && !isDone && !isMin && (
            <div style={{ color: 'var(--warning)', fontSize: 11.5, fontWeight: 500, marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon name="arrow-down" size={12} color="var(--warning)" stroke={2.5}/>
              {task.minVersion}
            </div>
          )}
        </div>
      </div>
      {task.points > 0 && (() => {
        const effectivePts = task.completedMin ? Math.round(task.points / 2) : task.points;
        const ptColor = isMin ? 'var(--warning)' : 'var(--primary)';
        return (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            color: ptColor, fontSize: 13, fontWeight: 700,
            padding: '6px 10px', borderRadius: 8,
            background: `color-mix(in srgb, ${ptColor} 15%, transparent)`,
            flexShrink: 0,
          }}>
            <Icon name="star" size={12} color={ptColor} stroke={2.5} />
            {isMin && (
              <span style={{ textDecoration: 'line-through', opacity: 0.4, fontSize: 11, fontWeight: 600 }}>
                {task.points}
              </span>
            )}
            {effectivePts}
          </span>
        );
      })()}
    </div>
  );
};
