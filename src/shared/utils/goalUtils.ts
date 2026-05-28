import type { Goal } from '@shared/types';
import { TODAY } from '@shared/utils/dateUtils';

export const MS_PER_DAY = 86_400_000;

export const daysBetween = (a: string, b: string): number =>
  Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / MS_PER_DAY));

export const goalPct = (g: Goal): number =>
  g.taskTotal === 0 ? 0 : Math.round((g.taskDone / g.taskTotal) * 100);

export const goalDaysLeft = (g: Goal): number => daysBetween(TODAY, g.end);
