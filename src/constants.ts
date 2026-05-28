import type { Category, Priority } from './types';

export const GOAL_ICON_MAP: Record<string, string> = {
  Health:   '👟',
  Career:   '🚀',
  Finance:  '💵',
  Learning: '📚',
  Wellness: '🧘',
};

export const DEFAULT_GOAL_ICON = '🎯';

export const CATEGORY_COLORS: Record<string, string> = {
  Health:   '#44D9A2',
  Career:   '#7C6AF7',
  Finance:  '#FFB347',
  Learning: '#4ECDC4',
  Wellness: '#F472B6',
  Routine:  '#a78bfa',
  Work:     '#fb923c',
  Personal: '#fb7185',
  Other:    '#9ca3af',
};

export const PRIORITY_META: Record<Priority, { color: string; label: string }> = {
  High:   { color: '#FF6B7A', label: 'High' },
  Medium: { color: 'var(--warning)', label: 'Med' },
  Low:    { color: 'var(--text-secondary)', label: 'Low' },
};

export const CATEGORIES: Category[] = ['Health', 'Career', 'Learning', 'Wellness', 'Finance'];
export const PRIORITIES: Priority[] = ['High', 'Medium', 'Low'];
