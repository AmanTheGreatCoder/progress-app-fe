import { useState, useEffect, useCallback } from 'react';
import { getLocalYMD } from '@shared/utils/dateUtils';
import api from '@shared/api';

// Raw shape returned from /api/tasks — before mapping to the UI Task interface
interface RawTask {
  id: string;
  name: string;
  description?: string;
  priority: string;
  tags: string[];
  date: string;
  completed: boolean;
  points?: number;
  isRecurring?: boolean;
  repeatFlag?: string;
  ticktickProjectId?: string;
  minVersion?: string;
  completedMin?: boolean;
}

export const useTasks = (date?: string) => {
  const [tasks, setTasks] = useState<RawTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const targetDate = date || getLocalYMD();
      const response = await api.get(`/tasks?date=${targetDate}`);
      const data: unknown[] = response.data;

      const mappedTasks: RawTask[] = data.map((item) => {
        const raw = item as Record<string, unknown>;
        if (Array.isArray(raw.tags)) {
          // DB shape
          return {
            id: raw.id as string,
            name: raw.name as string,
            description: (raw.description as string) || '',
            priority: (raw.priority as string) || 'None',
            tags: raw.tags as string[],
            date: raw.date as string,
            completed: (raw.completed as boolean) || false,
            points: (raw.points as number) ?? 0,
            isRecurring: (raw.isRecurring as boolean) || false,
            repeatFlag: (raw.repeatFlag as string) || '',
            ticktickProjectId: (raw.ticktickProjectId as string) || '',
            minVersion: (raw.minVersion as string) || '',
            completedMin: (raw.completedMin as boolean) || false,
          };
        }
        // Notion raw shape (fallback)
        const p = raw.properties as Record<string, unknown>;
        const titleArr = (p['Task Name'] as { title: { plain_text: string }[] })?.title;
        return {
          id: raw.id as string,
          name: titleArr?.[0]?.plain_text || 'Untitled',
          priority: (p['Priority Level'] as { select?: { name: string } })?.select?.name || 'None',
          tags: ((p['Tag'] as { multi_select?: { name: string }[] })?.multi_select || []).map((s) => s.name),
          date: ((p.Date as { date?: { start: string } })?.date?.start?.split('T')[0]) || getLocalYMD(),
          completed: (p.Done as { checkbox?: boolean })?.checkbox === true,
          points: 0,
          isRecurring: false,
          repeatFlag: '',
          ticktickProjectId: '',
          minVersion: '',
          completedMin: false,
        };
      });

      setTasks(mappedTasks);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load tasks.';
      console.error('Failed to fetch tasks:', err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const deleteTask = useCallback(async (id: string) => {
    await api.delete(`/tasks/${id}`);
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  return { tasks, loading, error, refetch: fetchTasks, deleteTask };
};
