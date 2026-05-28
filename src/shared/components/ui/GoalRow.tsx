import React from 'react';
import { Card } from './Card';
import { StreakChip } from './StreakChip';
import { Pill } from './Pill';
import { ProgressBar } from './ProgressBar';
import type { Goal } from '@shared/types';
import { TODAY } from '@shared/utils/dateUtils';
import { goalPct, goalDaysLeft, daysBetween } from '@shared/utils/goalUtils';

interface GoalRowProps {
  goal: Goal;
  onClick: () => void;
}

export { goalPct, goalDaysLeft, daysBetween, TODAY };

export const GoalRow: React.FC<GoalRowProps> = ({ goal, onClick }) => {
  const pct        = goalPct(goal);
  const catColor   = `var(--c-${goal.category.toLowerCase()})`;
  const days       = goalDaysLeft(goal);
  const daysTotal  = Math.max(1, daysBetween(goal.start, goal.end) + 1);
  const daysPassed = Math.max(0, daysBetween(goal.start, TODAY));
  const deadlinePct = Math.min(100, Math.max(0, (daysPassed / daysTotal) * 100));

  return (
    <Card onClick={onClick} pad={16} className="mb-3">
      <div className="flex items-start gap-3">
        {/* Category icon — catColor is runtime, stays inline */}
        <div
          className="grid place-items-center text-xl flex-shrink-0 rounded-xl w-[42px] h-[42px]"
          style={{ background: `color-mix(in srgb, ${catColor} 22%, transparent)`, color: catColor }}
        >
          {goal.icon}
        </div>

        <div className="flex-1 min-w-0">
          {/* Title + streak */}
          <div className="flex items-center justify-between gap-2">
            <div className="text-md font-semibold text-c-text1 truncate">
              {goal.title}
            </div>
            <StreakChip days={goal.streak} />
          </div>

          {/* Category pill + task count */}
          <div className="flex items-center gap-2 mt-1">
            <Pill
              color={catColor}
              bg={`color-mix(in srgb, ${catColor} 12%, transparent)`}
              dot
            >
              {goal.category}
            </Pill>
            <span className="text-xs text-c-text2">
              {goal.taskDone}/{goal.taskTotal} tasks
            </span>
          </div>

          {/* Progress bars */}
          <div className="flex flex-col gap-2 mt-3">
            {/* Task progress */}
            <div className="flex items-center gap-2.5">
              <div className="flex-1">
                <ProgressBar value={pct} color={catColor} />
              </div>
              <span className="text-sm font-bold text-c-text1 min-w-[36px] text-right">
                {pct}%
              </span>
            </div>

            {/* Deadline progress */}
            <div className="flex items-center gap-2.5">
              <div className="flex-1">
                <ProgressBar value={deadlinePct} color="var(--warning)" bg="var(--surface2)" />
              </div>
              <span className="text-xs font-semibold text-c-text2 min-w-[36px] text-right">
                {days}d left
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
