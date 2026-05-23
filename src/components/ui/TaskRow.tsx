import React from 'react';
import { Icon } from './Icon';
import type { Task, Goal } from '../../types';

interface TaskRowProps {
  task: Task;
  goal?: Goal;
  onToggle: () => void;
  onEdit: () => void;
}

export const TaskRow: React.FC<TaskRowProps> = ({ task, goal, onToggle, onEdit }) => {
  const catColor = goal ? `var(--c-${goal.category.toLowerCase()})` : 'var(--text-secondary)';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 16px',
      borderBottom: '1px solid var(--border)',
    }}>
      <button onClick={onToggle} style={{
        width: 24, height: 24, borderRadius: 8,
        background: task.done ? 'var(--success)' : 'transparent',
        border: `1.7px solid ${task.done ? 'var(--success)' : 'var(--border)'}`,
        display: 'grid', placeItems: 'center', cursor: 'pointer',
        flexShrink: 0, transition: 'all 180ms',
        padding: 0,
      }}>
        {task.done && <Icon name="check" size={14} color="var(--bg)" stroke={2.8}/>}
      </button>
      <div onClick={onEdit} style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}>
        <div style={{
          color: task.done ? 'var(--text-secondary)' : 'var(--text-primary)',
          fontSize: 14.5, fontWeight: 500,
          textDecoration: task.done ? 'line-through' : 'none',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{task.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            color: catColor, fontSize: 11.5, fontWeight: 600,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: 3, background: catColor }}/>
            {goal?.title}
          </span>
          <span style={{ color: 'var(--text-tertiary)', fontSize: 11.5 }}>·</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: 11.5 }}>{task.due}</span>
          {task.tags.map(tg => (
            <span key={tg} style={{
              fontSize: 10.5, color: 'var(--text-secondary)', fontWeight: 600,
              padding: '2px 6px', borderRadius: 4,
              background: 'var(--surface2)', textTransform: 'lowercase',
            }}>#{tg}</span>
          ))}
        </div>
      </div>
      <Icon name="chevron-right" size={18} color="var(--text-tertiary)"/>
    </div>
  );
};
