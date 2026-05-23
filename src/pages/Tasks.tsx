import { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import { calculateTaskScore } from '../utils/scoring';
import {
	CheckCircle2,
	Circle,
	Calendar,
	ChevronLeft,
	ChevronRight,
	ArrowUpDown,
	Zap,
} from 'lucide-react';
import './Tasks.css';

const TAG_COLORS: Record<string, string> = {
	Health: 'var(--c-health)',
	Work: 'var(--c-work)',
	Personal: 'var(--c-personal)',
	Routine: 'var(--c-routine)',
	'Mental Health': 'var(--c-mental)',
};

const TAG_BGS: Record<string, string> = {
	Health: 'rgba(48, 209, 88, 0.2)',
	Work: 'rgba(10, 132, 255, 0.2)',
	Personal: 'rgba(191, 90, 242, 0.2)',
	Routine: 'rgba(255, 159, 10, 0.2)',
	'Mental Health': 'rgba(255, 107, 129, 0.2)',
};

const EFFORT_COLORS: Record<string, string> = {
	e1: 'var(--text-3)',
	e2: 'var(--green)',
	e3: 'var(--accent)',
	e5: 'var(--orange)',
	e10: 'var(--red)',
};

const EFFORT_BGS: Record<string, string> = {
	e1: 'rgba(235, 235, 245, 0.08)',
	e2: 'rgba(48, 209, 88, 0.2)',
	e3: 'rgba(10, 132, 255, 0.2)',
	e5: 'rgba(255, 159, 10, 0.2)',
	e10: 'rgba(255, 69, 58, 0.2)',
};

const EFFORT_LABELS: Record<string, string> = {
	e1: 'Passive',
	e2: 'Light',
	e3: 'Moderate',
	e5: 'Hard',
	e10: 'Breakthrough',
};

const PRIORITY_ORDER: Record<string, number> = {
	High: 0,
	Medium: 1,
	Low: 2,
	None: 3,
};

type SortMode = 'default' | 'points' | 'priority';

function formatDateNav(dateStr: string): string {
	const today = new Date().toISOString().split('T')[0];
	const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
	const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
	if (dateStr === today) return 'Today';
	if (dateStr === yesterday) return 'Yesterday';
	if (dateStr === tomorrow) return 'Tomorrow';
	return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
	});
}

interface TaskCardProps {
	task: ReturnType<typeof useTasks>['tasks'][number];
	score: number;
	isLast: boolean;
}

const TaskCard = ({ task, score, isLast }: TaskCardProps) => {
	const effortTag = task.tags.find((t) => /^e\d+$/.test(t));
	const categoryTags = task.tags.filter((t) => !/^e\d+$/.test(t));

	return (
		<div
			className={`task-card ${task.completed ? 'done' : ''} ${isLast ? 'last' : ''}`}
		>
			<div className='task-check'>
				{task.completed ? (
					<CheckCircle2 size={22} strokeWidth={2} className='icon-done' />
				) : (
					<Circle size={22} strokeWidth={1.5} className='icon-pending' />
				)}
			</div>
			<div className='task-body'>
				<p className='task-name'>{task.name}</p>
				<div className='task-chips'>
					<span className={`chip priority-chip ${task.priority.toLowerCase()}`}>
						{task.priority}
					</span>
					{categoryTags.map((tag) => (
						<span
							key={tag}
							className='chip tag-chip'
							style={
								{
									'--tag-color': TAG_COLORS[tag] || 'var(--text-3)',
									'--tag-bg': TAG_BGS[tag] || 'rgba(255,255,255,0.1)',
								} as any
							}
						>
							{tag}
						</span>
					))}
					{effortTag && (
						<span
							className='chip effort-chip'
							style={
								{
									'--effort-color': EFFORT_COLORS[effortTag] || 'var(--text-3)',
									'--effort-bg':
										EFFORT_BGS[effortTag] || 'rgba(255,255,255,0.07)',
								} as any
							}
							title={EFFORT_LABELS[effortTag] || ''}
						>
							<Zap size={9} strokeWidth={2.5} />
							{effortTag}
						</span>
					)}
				</div>
			</div>
			<div className='task-pts'>
				<span
					className={`pts-badge ${task.completed ? 'pts-done' : 'pts-pending'}`}
				>
					{task.completed ? '+' : ''}
					{score}
				</span>
				<span className='pts-label'>pts</span>
			</div>
		</div>
	);
};

const Tasks = () => {
	const { tasks, loading, error } = useTasks();
	const today = new Date().toISOString().split('T')[0];
	const [selectedDate, setSelectedDate] = useState(today);
	const [sortMode, setSortMode] = useState<SortMode>('default');
	const [showPicker, setShowPicker] = useState(false);

	const navigate = (offset: number) => {
		const d = new Date(selectedDate + 'T12:00:00');
		d.setDate(d.getDate() + offset);
		setSelectedDate(d.toISOString().split('T')[0]);
	};

	const cycleSortMode = () => {
		setSortMode((m) =>
			m === 'default' ? 'points' : m === 'points' ? 'priority' : 'default',
		);
	};

	const sortLabel =
		sortMode === 'points'
			? 'By Points'
			: sortMode === 'priority'
				? 'By Priority'
				: 'Sort';

	if (loading)
		return (
			<div className='tasks-page'>
				<div className='skeleton' style={{ height: 52, marginBottom: 4 }} />
				<div className='skeleton' style={{ height: 44 }} />
				<div className='skeleton' style={{ height: 3, marginTop: 4 }} />
				<div className='skeleton' style={{ height: 340, marginTop: 16 }} />
			</div>
		);

	if (error)
		return (
			<div className='tasks-page'>
				<div className='error-msg'>{error}</div>
			</div>
		);

	const filtered = tasks.filter((t) => t.date === selectedDate);
	const withScores = filtered.map((t) => ({
		task: t,
		score: calculateTaskScore(t),
	}));

	const sorted =
		sortMode === 'points'
			? [...withScores].sort((a, b) => b.score - a.score)
			: sortMode === 'priority'
				? [...withScores].sort(
						(a, b) =>
							(PRIORITY_ORDER[a.task.priority] ?? 3) -
							(PRIORITY_ORDER[b.task.priority] ?? 3),
					)
				: withScores;

	const pending = sorted.filter(({ task }) => !task.completed);
	const completed = sorted.filter(({ task }) => task.completed);
	const doneCount = completed.length;
	const totalCount = filtered.length;

	return (
		<div className='tasks-page'>
			{/* Header */}
			<header className='tasks-header fade-up'>
				<div className='tasks-header-top'>
					<h1 className='tasks-title'>Tasks</h1>
					<button
						className={`sort-btn ${sortMode !== 'default' ? 'active' : ''}`}
						onClick={cycleSortMode}
						title='Cycle sort mode'
					>
						<ArrowUpDown size={16} strokeWidth={2} />
						{sortLabel}
					</button>
				</div>
				{totalCount > 0 && (
					<p className='tasks-meta'>
						<span className='tasks-count'>
							{doneCount}/{totalCount}
						</span>{' '}
						completed
					</p>
				)}
			</header>

			{/* Date navigation */}
			<div className='date-nav fade-up fade-up-1'>
				<button className='date-nav-btn' onClick={() => navigate(-1)}>
					<ChevronLeft size={18} strokeWidth={2} />
				</button>
				<button
					className={`date-nav-label ${selectedDate === today ? 'is-today' : ''}`}
					onClick={() => setShowPicker((p) => !p)}
					title='Pick a date'
				>
					{formatDateNav(selectedDate)}
				</button>
				<button className='date-nav-btn' onClick={() => navigate(1)}>
					<ChevronRight size={18} strokeWidth={2} />
				</button>
			</div>

			{/* Date picker */}
			{showPicker && (
				<div className='date-picker-wrap fade-up'>
					<input
						type='date'
						className='date-picker-input'
						value={selectedDate}
						onChange={(e) => {
							if (e.target.value) {
								setSelectedDate(e.target.value);
								setShowPicker(false);
							}
						}}
					/>
				</div>
			)}

			{/* Progress bar */}
			{totalCount > 0 && (
				<div className='tasks-progress fade-up fade-up-1'>
					<div
						className='tasks-progress-fill'
						style={{ width: `${(doneCount / totalCount) * 100}%` }}
					/>
				</div>
			)}

			{/* Empty state */}
			{totalCount === 0 && (
				<div className='empty-state fade-up fade-up-2'>
					<Calendar size={32} strokeWidth={1.5} />
					<p>No tasks for this day</p>
					<span>Navigate to another date or sync from Notion</span>
				</div>
			)}

			{/* Pending section */}
			{pending.length > 0 && (
				<div className='task-section fade-up fade-up-2'>
					<p className='task-section-label'>Pending · {pending.length}</p>
					<div className='task-group'>
						{pending.map(({ task, score }, i) => (
							<TaskCard
								key={task.id}
								task={task}
								score={score}
								isLast={i === pending.length - 1}
							/>
						))}
					</div>
				</div>
			)}

			{/* Completed section */}
			{completed.length > 0 && (
				<div className='task-section fade-up fade-up-3'>
					<p className='task-section-label'>Completed · {completed.length}</p>
					<div className='task-group'>
						{completed.map(({ task, score }, i) => (
							<TaskCard
								key={task.id}
								task={task}
								score={score}
								isLast={i === completed.length - 1}
							/>
						))}
					</div>
				</div>
			)}
		</div>
	);
};

export default Tasks;
