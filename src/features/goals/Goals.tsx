import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppContext } from '@shared/context/AppContext';
import type { Goal as HookGoal } from '@shared/hooks/useGoals';
import { GoalDetail } from './GoalDetail';
import { GoalForm } from './GoalForm';
import { GoalsList } from './GoalsList';

const GoalsPage: React.FC = () => {
  const { goals, tasks, toggleTask, addLog, updateGoal, addGoal, deleteGoal } = useAppContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const goalId = searchParams.get('id');
  const editGoalId = searchParams.get('edit');
  const isCreating = searchParams.get('create');

  if (isCreating || editGoalId) {
    const initialGoal = editGoalId ? goals.find(g => g.id === editGoalId) : undefined;
    if (editGoalId && !initialGoal) return null;

    return (
      <GoalForm
        initialGoal={initialGoal}
        onBack={() => setSearchParams(goalId ? { id: goalId } : {})}
        onSave={async draft => {
          if (editGoalId) {
            await updateGoal(editGoalId, draft as unknown as Partial<HookGoal>);
          } else {
            await addGoal(draft as unknown as Parameters<typeof addGoal>[0]);
          }
          setSearchParams(goalId ? { id: goalId } : {});
        }}
      />
    );
  }

  if (goalId) {
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      return (
        <GoalDetail
          goal={goal}
          tasks={tasks}
          onBack={() => setSearchParams({})}
          onEdit={() => setSearchParams({ edit: goalId, id: goalId })}
          onToggleTask={toggleTask}
          onOpenTask={id => navigate(`/tasks?id=${id}`)}
          onAddLog={addLog}
          onUpdateGoal={updateGoal}
          onDeleteGoal={id => { deleteGoal(id); setSearchParams({}); }}
        />
      );
    }
  }

  return (
    <GoalsList
      goals={goals}
      onOpenGoal={id => setSearchParams({ id })}
      onCreateGoal={() => setSearchParams({ create: 'true' })}
    />
  );
};

export default GoalsPage;
