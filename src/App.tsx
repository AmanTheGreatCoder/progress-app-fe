import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@shared/components/layout/Layout';
import { Dashboard } from '@features/dashboard';
import { TasksPage } from '@features/tasks';
import { GoalsPage } from '@features/goals';
import { Analytics } from '@features/analytics';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="goals" element={<GoalsPage />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
