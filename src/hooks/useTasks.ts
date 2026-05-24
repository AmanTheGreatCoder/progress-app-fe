import { useState, useEffect, useCallback } from 'react';
import { getLocalYMD } from '../utils/dateUtils';
import api from '../services/api';

export const useTasks = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/tasks');
      const data = response.data;

      // Data from DB already has tags as array (backend parses it)
      // Fall back to Notion raw shape if still hitting old endpoint
      const mappedTasks: any[] = data.map((item: any) => {
        if (Array.isArray(item.tags)) {
          // DB shape (new)
          return {
            id: item.id,
            name: item.name,
            description: item.description || '',
            priority: item.priority,
            tags: item.tags,
            date: item.date,
            completed: item.completed,
            points: item.points ?? 0,
            isRecurring: item.isRecurring || false,
            repeatFlag: item.repeatFlag || '',
            ticktickProjectId: item.ticktickProjectId || '',
          };
        }
        // Notion raw shape (fallback)
        const p = item.properties;
        return {
          id: item.id,
          name: p['Task Name']?.title[0]?.plain_text || 'Untitled',
          priority: p['Priority Level']?.select?.name || 'None',
          tags: p['Tag']?.multi_select?.map((s: any) => s.name) || [],
          date: p.Date?.date?.start?.split('T')[0] || getLocalYMD(),
          completed: p.Done?.checkbox === true,
          points: 0,
          isRecurring: false,
          repeatFlag: '',
          ticktickProjectId: '',
        };
      });

      setTasks(mappedTasks);
    } catch (err: any) {
      console.error('Failed to fetch tasks:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const deleteTask = useCallback(async (id: string) => {
    await api.delete(`/tasks/${id}`);
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  return { tasks, loading, error, refetch: fetchTasks, deleteTask };
};
