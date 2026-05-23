import { useState, useEffect, useCallback } from 'react';
import { getLocalYMD } from '../utils/dateUtils';

export const useTasks = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3001/api/tasks');
      if (!response.ok) throw new Error('Failed to fetch from backend');
      const data = await response.json();

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
    await fetch(`http://localhost:3001/api/tasks/${id}`, { method: 'DELETE' });
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  return { tasks, loading, error, refetch: fetchTasks, deleteTask };
};
