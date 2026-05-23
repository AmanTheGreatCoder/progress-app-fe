import type { Goal, Task } from './types';

export const initialGoals: Goal[] = [
  {
    id: 'g1', title: 'Run a Half Marathon', category: 'Health', priority: 'High',
    start: '2026-04-01', end: '2026-07-15', icon: '🏃',
    streak: 12, archived: false,
    taskTotal: 48, taskDone: 31,
    manualLogs: [
      { date: 'Today',    minutes: 45, note: 'Easy 5k around the park. Legs felt light.' },
      { date: 'Yesterday',minutes: 60, note: 'Tempo intervals — hit target pace on all 4.' },
      { date: 'Mon',      minutes: 30, note: 'Rest day mobility + foam roll.' },
    ],
  },
  {
    id: 'g2', title: 'Ship Q3 Design System', category: 'Career', priority: 'High',
    start: '2026-05-01', end: '2026-08-30', icon: '◆',
    streak: 6, archived: false,
    taskTotal: 22, taskDone: 9,
    manualLogs: [
      { date: 'Today', minutes: 90, note: 'Locked color tokens with eng. Ready for review.' },
    ],
  },
  {
    id: 'g3', title: 'Save $8,000 Emergency Fund', category: 'Finance', priority: 'Medium',
    start: '2026-01-01', end: '2026-12-31', icon: '◈',
    streak: 28, archived: false,
    taskTotal: 12, taskDone: 7,
    manualLogs: [],
  },
  {
    id: 'g4', title: 'Read 24 Books This Year', category: 'Learning', priority: 'Low',
    start: '2026-01-01', end: '2026-12-31', icon: '✦',
    streak: 4, archived: false,
    taskTotal: 24, taskDone: 11,
    manualLogs: [],
  },
  {
    id: 'g5', title: 'Learn Conversational Spanish', category: 'Learning', priority: 'Medium',
    start: '2025-09-01', end: '2026-03-01', icon: '✦',
    streak: 0, archived: true,
    taskTotal: 60, taskDone: 60,
    manualLogs: [],
  },
  {
    id: 'g6', title: 'Daily Meditation Habit', category: 'Wellness', priority: 'Low',
    start: '2025-06-01', end: '2025-12-31', icon: '◉',
    streak: 0, archived: true,
    taskTotal: 30, taskDone: 18,
    manualLogs: [],
  },
];

export const initialTasks: Task[] = [
  { id: 't1', title: '5km easy run',                 goalId: 'g1', due: 'Today',    tags:['cardio'],     done: false, source:'Strava'    },
  { id: 't2', title: 'Strength: legs + core',        goalId: 'g1', due: 'Today',    tags:['gym'],        done: true,  source:'Strava'    },
  { id: 't3', title: 'Review color token PR',        goalId: 'g2', due: 'Today',    tags:['review'],     done: false, source:'Linear'    },
  { id: 't4', title: 'Transfer $250 to savings',     goalId: 'g3', due: 'Today',    tags:['auto'],       done: false, source:'Mercury'   },
  { id: 't5', title: 'Read 30 pages — Annie Dillard',goalId: 'g4', due: 'Today',    tags:['nonfiction'], done: false, source:'Readwise'  },
  { id: 't6', title: 'Long run — 14k',               goalId: 'g1', due: 'Tomorrow', tags:['cardio'],     done: false, source:'Strava'    },
  { id: 't7', title: 'Spec component variants',      goalId: 'g2', due: 'Tomorrow', tags:['design'],     done: false, source:'Linear'    },
  { id: 't8', title: 'Yoga — 20 min',                goalId: 'g1', due: 'Wed',      tags:['mobility'],   done: false, source:'Strava'    },
  { id: 't9', title: 'Read 30 pages',                goalId: 'g4', due: 'Wed',      tags:['nonfiction'], done: false, source:'Readwise'  },
  { id: 't10',title: 'Sprint planning notes',        goalId: 'g2', due: 'Thu',      tags:['planning'],   done: false, source:'Linear'    },
  { id: 't11',title: 'Refill HSA contribution',      goalId: 'g3', due: 'Fri',      tags:['monthly'],    done: false, source:'Mercury'   },
  { id: 't12',title: 'Tempo run — 8x400m',           goalId: 'g1', due: 'Fri',      tags:['cardio'],     done: false, source:'Strava'    },
];
