// Task type — matches the shape returned by the backend /api/tasks endpoint
export interface Task {
  id: string;
  name: string;
  priority: string;
  tags: string[];
  date: string;
  completed: boolean;
  points: number;
}

/**
 * Returns the pre-computed score stored in task.points.
 * All scoring logic now lives in backend/utils.ts and is applied during sync.
 * This shim exists so Tasks.tsx can display per-task point values without change.
 */
export function calculateTaskScore(task: Task): number {
  return task.points ?? 0;
}
