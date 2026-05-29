import React, { useState } from 'react';
import TodayScreen from './TodayScreen';
import GoalsScreen from './GoalsScreen';
import GoalDetailScreen from './GoalDetailScreen';
import TasksScreen from './TasksScreen';
import AnalyticsScreen from './AnalyticsScreen';

function App() {
  const [activeTab, setActiveTab] = useState('Today');

  const handleNavigate = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <>
      {activeTab === 'Today' && <TodayScreen onNavigate={handleNavigate} />}
      {activeTab === 'Goals' && <GoalsScreen onNavigate={handleNavigate} onGoalClick={() => setActiveTab('GoalDetail')} />}
      {activeTab === 'GoalDetail' && <GoalDetailScreen onBack={() => setActiveTab('Goals')} />}
      {activeTab === 'Tasks' && <TasksScreen onNavigate={handleNavigate} />}
      {activeTab === 'Analytics' && <AnalyticsScreen onNavigate={handleNavigate} />}
      {activeTab === 'Profile' && (
        <div className="app-container bg-background text-foreground h-full flex flex-col items-center justify-center">
          <h1 className="text-[24px] font-[700] mb-4">Profile</h1>
          <p className="text-muted-foreground">Screen coming soon</p>
          <button className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-full font-[500]" onClick={() => setActiveTab('Today')}>
            Go to Today
          </button>
        </div>
      )}
    </>
  );
}

export default App;
