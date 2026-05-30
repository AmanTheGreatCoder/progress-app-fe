
import { Routes, Route, Navigate } from 'react-router-dom';
import TodayScreen from '@/TodayScreen';
import GoalsScreen from '@/GoalsScreen';
import GoalDetailScreen from '@/GoalDetailScreen';
import TasksScreen from '@/TasksScreen';
import AnalyticsScreen from '@/AnalyticsScreen';
import SettingsScreen from '@/SettingsScreen';
import { Toaster } from 'sonner';

function App() {
  return (
    <>
      <Toaster position="top-center" richColors />
      <Routes>
        <Route path="/" element={<Navigate to="/today" replace />} />
        <Route path="/today" element={<TodayScreen />} />
        <Route path="/goals" element={<GoalsScreen />} />
        <Route path="/goals/:goalId" element={<GoalDetailScreen />} />
        <Route path="/tasks" element={<TasksScreen />} />
        <Route path="/analytics" element={<AnalyticsScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
      </Routes>
    </>
  );
}

export default App;
