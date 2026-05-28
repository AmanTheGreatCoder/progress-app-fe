import React from 'react';
import { Icon } from '@shared/components/ui/Icon';
import { Pill } from '@shared/components/ui/Pill';
import type { Goal } from '@shared/types';

interface GoalHeroProps {
  goal: Goal;
  pct: number;
  ringPct: number;
  catColor: string;
  prioColor: string;
  days: number;
}

const R = 56;
const C = 2 * Math.PI * R;

export const GoalHero: React.FC<GoalHeroProps> = ({ goal, pct, ringPct, catColor, prioColor, days }) => (
  <>
    {/* Icon + title + chips */}
    <div className="pt-6 px-6 text-center">
      <div
        className="inline-grid place-items-center text-[30px] rounded-[22px] mb-3.5 w-[68px] h-[68px]"
        style={{ background: `color-mix(in srgb, ${catColor} 18%, transparent)` }}
      >
        {goal.icon}
      </div>

      <h2 className="text-2xl font-bold text-c-text1 mb-3 tracking-tight leading-tight">
        {goal.title}
      </h2>

      <div className="flex justify-center items-center flex-wrap gap-2">
        <Pill color={catColor} bg={`color-mix(in srgb, ${catColor} 14%, transparent)`} dot>
          {goal.category}
        </Pill>

        <span
          className="inline-flex items-center gap-1 text-xs font-semibold px-[9px] py-[3px] rounded-chip"
          style={{ background: `color-mix(in srgb, ${prioColor} 13%, transparent)`, color: prioColor }}
        >
          <span className="w-[5px] h-[5px] rounded-full flex-shrink-0" style={{ background: prioColor }} />
          {goal.priority}
        </span>

        <span className="text-xs text-c-text2 bg-c-surface border border-c-border px-[9px] py-[3px] rounded-chip">
          Ends {goal.end.slice(5).replace('-', '/')}
        </span>
      </div>
    </div>

    {/* Progress ring */}
    <div className="flex justify-center pt-7 px-6 pb-2">
      <div className="relative w-[148px] h-[148px]">
        <svg width="148" height="148" viewBox="0 0 148 148" className="-rotate-90">
          <circle cx="74" cy="74" r={R} stroke="var(--surface2)" strokeWidth="11" fill="none" />
          <circle
            cx="74" cy="74" r={R} fill="none"
            strokeWidth="11" strokeLinecap="round"
            stroke={catColor}
            strokeDasharray={C}
            strokeDashoffset={C - (C * ringPct / 100)}
            style={{ transition: 'stroke-dashoffset 1100ms cubic-bezier(.2,.8,.2,1)' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-c-text1 font-extrabold text-[34px] tracking-tighter leading-none">
            {pct}%
          </div>
          <div className="text-xs text-c-text2 mt-1">{goal.taskDone} / {goal.taskTotal}</div>
        </div>
      </div>
    </div>

    {/* Stat cards */}
    <div className="flex gap-2.5 px-5 pb-6 pt-4">
      {[
        { icon: 'clock',  color: 'var(--warning)',   value: `${days}`,          label: 'days left'   },
        { icon: 'flame',  color: 'var(--secondary)', value: `${goal.streak}`,   label: 'day streak'  },
        { icon: 'check',  color: 'var(--success)',   value: `${goal.taskDone}`, label: `of ${goal.taskTotal}` },
      ].map(s => (
        <div
          key={s.label}
          className="flex-1 flex flex-col items-center gap-[7px] bg-c-surface border border-c-border rounded-2xl py-3.5 px-2"
        >
          <div
            className="w-[34px] h-[34px] rounded-[11px] grid place-items-center"
            style={{ background: `color-mix(in srgb, ${s.color} 14%, transparent)` }}
          >
            <Icon name={s.icon} size={17} color={s.color} stroke={2} />
          </div>
          <div className="text-2xl font-extrabold text-c-text1 leading-none">{s.value}</div>
          <div className="text-2xs text-c-text2 text-center leading-snug">{s.label}</div>
        </div>
      ))}
    </div>
  </>
);
