import {
	Archive,
	ArrowLeft,
	BarChart,
	Check,
	ChevronDown,
	ChevronRight,
	Clock,
	Flame,
	Link2,
	Minus,
	Pencil,
	Plus,
	Search,
	Tag as TagIcon,
	Target,
	Trash2,
} from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import {
	daysUntil,
	useGoals,
	type Goal,
} from '../hooks/useGoals';
import { useTasks } from '../hooks/useTasks';
import './Goals.css';

type TaskList = ReturnType<typeof useTasks>['tasks'];

// ─── Goal Form Sheet ─────────────────────────────────────────────────────────
interface GoalFormSheetProps {
	initialGoal?: Goal;
	onClose: () => void;
	onSave: (data: any) => void;
}

const CATEGORIES = [
	'Health',
	'Career',
	'Learning',
	'Personal',
	'Financial',
	'Other',
];
const PRIORITIES = ['High', 'Medium', 'Low'];

const GoalFormSheet = ({
	initialGoal,
	onClose,
	onSave,
}: GoalFormSheetProps) => {
	const today = new Date().toISOString().split('T')[0];
	const [title, setTitle] = useState(initialGoal?.title || '');
	const [startDate, setStartDate] = useState(initialGoal?.startDate || today);
	const [deadline, setDeadline] = useState(initialGoal?.deadline || '');
	const [category, setCategory] = useState(initialGoal?.category || CATEGORIES[0]);
	const [priority, setPriority] = useState(initialGoal?.priority || 'Medium');

	const durationDays = useMemo(() => {
		if (!startDate || !deadline) return 0;
		const s = new Date(startDate + 'T00:00:00').getTime();
		const e = new Date(deadline + 'T00:00:00').getTime();
		return Math.max(Math.ceil((e - s) / 86400000) + 1, 0);
	}, [startDate, deadline]);

	const canSave = title.trim() && startDate && deadline;

	const handleSave = () => {
		if (!canSave) return;
		onSave({
			title: title.trim(),
			startDate,
			deadline,
			category,
			targetFrequency: 1,
			targetCount: 0,
			priority,
			linkedTaskIds: initialGoal?.linkedTaskIds || [],
			linkedTaskNames: initialGoal?.linkedTaskNames || [],
		});
		onClose();
	};

	return (
		<div className='sheet-backdrop' onClick={onClose}>
			<div className='sheet goal-form-sheet' onClick={(e) => e.stopPropagation()}>
				<div className='sheet-handle' />
				<div className='sheet-header'>
					<button className='sheet-cancel' onClick={onClose}>Cancel</button>
					<h2 className='sheet-title'>{initialGoal ? 'Edit Goal' : 'New Goal'}</h2>
					<button className={`sheet-next ${!canSave ? 'disabled' : ''}`} onClick={handleSave}>
						Save
					</button>
				</div>
				<div className='sheet-body form-body'>

					{/* Title */}
					<div className='field-group'>
						<label className='field-label'>Goal Title</label>
						<input
							className='field-input goal-title-input'
							type='text'
							placeholder='e.g. Practice Simon Sinek shadowing'
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							autoFocus
						/>
					</div>

					{/* Date Range */}
					<div className='field-group'>
						<label className='field-label'>Date Range</label>
						<div className='date-range-row'>
							<div className='date-range-box'>
								<span className='date-range-lbl'>From</span>
								<input
									className='date-range-input'
									type='date'
									value={startDate}
									onChange={(e) => setStartDate(e.target.value)}
								/>
							</div>
							<div className='date-range-box'>
								<span className='date-range-lbl'>To</span>
								<input
									className='date-range-input'
									type='date'
									value={deadline}
									min={startDate}
									onChange={(e) => setDeadline(e.target.value)}
								/>
							</div>
						</div>
						{durationDays > 0 && (
							<p className='form-hint'>{durationDays} day{durationDays !== 1 ? 's' : ''} total</p>
						)}
					</div>

					{/* Category + Priority */}
					<div className='field-row'>
						<div className='field-group flex-1'>
							<label className='field-label'>Category</label>
							<select className='field-input' value={category} onChange={(e) => setCategory(e.target.value)}>
								{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
							</select>
						</div>
						<div className='field-group flex-1'>
							<label className='field-label'>Priority</label>
							<select className='field-input' value={priority} onChange={(e) => setPriority(e.target.value)}>
								{PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
							</select>
						</div>
					</div>

					{/* Progress info */}
					{durationDays > 0 && (
						<div className='goal-duration-info'>
							<Target size={14} strokeWidth={2} />
							<span>
								Complete your linked task each day — goal is achieved when done across all <strong>{durationDays} days</strong>.
							</span>
						</div>
					)}

				</div>
			</div>
		</div>
	);
};

// ─── Log Progress Sheet ──────────────────────────────────────────────────────
const LogProgressSheet = ({
	onClose,
	onSave,
}: {
	onClose: () => void;
	onSave: (effort: number, notes: string) => void;
}) => {
	const [effort, setEffort] = useState('15');
	const [notes, setNotes] = useState('');

	const handleSave = () => {
		onSave(parseInt(effort) || 0, notes.trim());
		onClose();
	};

	return (
		<div className='sheet-backdrop' onClick={onClose}>
			<div className='sheet' onClick={(e) => e.stopPropagation()}>
				<div className='sheet-handle' />
				<div className='sheet-header'>
					<button className='sheet-cancel' onClick={onClose}>
						Cancel
					</button>
					<h2 className='sheet-title'>Log Progress</h2>
					<button className='sheet-next' onClick={handleSave}>
						Save
					</button>
				</div>
				<div className='sheet-body'>
					<div className='field-group'>
						<label className='field-label'>Effort (Minutes)</label>
						<input
							className='field-input'
							type='number'
							min='0'
							step='5'
							value={effort}
							onChange={(e) => setEffort(e.target.value)}
							autoFocus
						/>
					</div>
					<div className='field-group'>
						<label className='field-label'>Notes / Journal (Optional)</label>
						<textarea
							className='field-input text-area'
							placeholder='What did you do?'
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							rows={4}
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

// ─── Goal Card ────────────────────────────────────────────────────────────────
const GoalCard = ({
	goal,
	completedTaskIds,
	onClick,
}: {
	goal: Goal;
	completedTaskIds: Set<string>;
	onClick: () => void;
}) => {
	const done = goal.done || 0;
	const total = goal.total || 1;
	const pct = goal.pct || 0;
	const isDone = done >= total;
	const days = daysUntil(goal.deadline);
	const hasLinkedTasks = (goal.linkedTaskIds as string[]).length > 0;

	return (
		<div className='goal-card' onClick={onClick}>
			<div className='goal-card-main'>
				<div className={`goal-icon-wrap ${isDone ? 'done' : ''}`}>
					{isDone ? (
						<Check size={20} strokeWidth={3} />
					) : (
						<Target size={20} strokeWidth={2} />
					)}
				</div>
				<div className='goal-info'>
					<p className='goal-title'>{goal.title}</p>
					<div className='goal-badges'>
						<span className={`badge-priority p-${goal.priority?.toLowerCase()}`}>
							{goal.priority}
						</span>
						<span className='badge-category'>{goal.category}</span>
						<span className='badge-days' style={{ color: days < 0 ? 'var(--red)' : 'inherit' }}>
							<Clock size={12} strokeWidth={2.5} /> {days < 0 ? 'Overdue' : `${days}d left`}
						</span>
					</div>
				</div>
				<ChevronRight size={20} strokeWidth={2.5} className='goal-chevron' />
			</div>

			<div className='goal-card-footer'>
				<div className='goal-progress-info'>
					<span className='goal-progress-text'>
						{Math.round(pct)}% <span className='goal-progress-sub'>({done}/{total})</span>
					</span>
					{hasLinkedTasks && (
						<span className='goal-linked-indicator'>
							<Link2 size={12} strokeWidth={2.5} /> {(goal.linkedTaskIds as string[]).length}
						</span>
					)}
				</div>
				<div className='goal-card-progress-bg'>
					<div
						className='goal-card-progress-fill'
						style={{
							width: `${pct}%`,
							background: isDone ? 'var(--green)' : 'var(--accent)',
							boxShadow: isDone ? '0 0 8px var(--green-soft)' : '0 0 8px color-mix(in srgb, var(--accent) 50%, transparent)',
						}}
					/>
				</div>
			</div>
		</div>
	);
};

// ─── Edit Linked Tasks Sheet ──────────────────────────────────────────────────
const EditLinkedTasksSheet = ({
	tasks,
	initialLinkedIds,
	onSave,
	onClose,
	onDeleteTask,
}: {
	tasks: any[];
	initialLinkedIds: string[];
	onSave: (ids: string[]) => void;
	onClose: () => void;
	onDeleteTask: (id: string) => Promise<void>;
}) => {
	const [selected, setSelected] = useState<Set<string>>(() => new Set(initialLinkedIds));
	const [search, setSearch] = useState('');
	const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
	const [localDeletedIds, setLocalDeletedIds] = useState<Set<string>>(new Set());

	useEffect(() => {
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = '';
		};
	}, []);

	const toggleExpand = (fp: string) =>
		setExpandedGroups(prev => { const n = new Set(prev); n.has(fp) ? n.delete(fp) : n.add(fp); return n; });

	const handleDelete = async (taskId: string, e: React.MouseEvent) => {
		e.stopPropagation();
		setLocalDeletedIds(prev => new Set([...prev, taskId]));
		setSelected(prev => { const n = new Set(prev); n.delete(taskId); return n; });
		await onDeleteTask(taskId);
	};

	const fmt = (d: string) =>
		new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

	// Build grouped display list: one row per repeatable group, individual rows for unique tasks
	const displayList = useMemo(() => {
		const visible = tasks.filter((t: any) => !localDeletedIds.has(t.id));
		const fpsMap = new Map<string, any[]>();
		visible.forEach((t: any) => {
			const sortedTags = [...(t.tags || [])].sort().join(',');
			const fp = `${t.name.trim().toLowerCase()}|||${(t.description || '').trim().toLowerCase()}|||${sortedTags}`;
			const g = fpsMap.get(fp) || [];
			g.push(t);
			fpsMap.set(fp, g);
		});

		const items: any[] = [];
		fpsMap.forEach((groupTasks, fp) => {
			const sorted = [...groupTasks].sort((a, b) => b.date.localeCompare(a.date));
			if (sorted.length > 1) {
				items.push({
					type: 'group',
					fp,
					tasks: sorted,
					name: sorted[0].name,
					description: sorted[0].description || '',
					tags: sorted[0].tags || [],
					latestDate: sorted[0].date,
					earliestDate: sorted[sorted.length - 1].date,
				});
			} else {
				items.push({ type: 'single', task: sorted[0] });
			}
		});

		const q = search.trim().toLowerCase();
		const filtered = q
			? items.filter((item) =>
				item.type === 'group'
					? item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
					: item.task.name.toLowerCase().includes(q) || (item.task.description || '').toLowerCase().includes(q)
			)
			: items;

		return filtered.sort((a: any, b: any) => {
			const da = a.type === 'group' ? a.latestDate : a.task.date;
			const db = b.type === 'group' ? b.latestDate : b.task.date;
			return db.localeCompare(da);
		});
	}, [tasks, search, localDeletedIds]);

	const toggleGroup = (taskIds: string[], allSelected: boolean) =>
		setSelected(prev => {
			const n = new Set(prev);
			if (allSelected) taskIds.forEach(id => n.delete(id));
			else taskIds.forEach(id => n.add(id));
			return n;
		});

	const toggleSingle = (id: string) =>
		setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

	return (
		<div className='elt-backdrop' onClick={onClose}>
			<div className='elt-sheet' onClick={e => e.stopPropagation()}>
				<div className='sheet-handle' style={{ marginTop: '12px', marginBottom: '8px' }} />
				<div className='elt-modal-header'>
					<button className='elt-cancel-btn' onClick={onClose}>Cancel</button>
					<h2 className='elt-modal-title'>Link Tasks</h2>
					<button className='elt-save-btn' onClick={() => { onSave([...selected]); onClose(); }}>
						Save{selected.size > 0 ? ` (${selected.size})` : ''}
					</button>
				</div>

				<div className='elt-search-wrap'>
					<Search size={14} className='gd-link-search-icon' />
					<input
						className='elt-search-input'
						placeholder='Search by name or description...'
						value={search}
						onChange={e => setSearch(e.target.value)}
						autoFocus
					/>
				</div>

				<div className='elt-list'>
					{displayList.length === 0 && (
						<p className='gd-empty'>{search ? 'No matching tasks' : 'No tasks — sync first.'}</p>
					)}

					{displayList.map((item: any, idx: number) => {
						if (item.type === 'group') {
							const taskIds: string[] = item.tasks.map((t: any) => t.id);
							const allSel = taskIds.every(id => selected.has(id));
							const someSel = !allSel && taskIds.some(id => selected.has(id));
							const isExpanded = expandedGroups.has(item.fp);
							return (
								<div key={`grp-${idx}`} className='elt-group-wrapper'>
									<div
										className={`elt-row elt-group-row ${allSel ? 'selected' : someSel ? 'partial' : ''}`}
										onClick={() => toggleGroup(taskIds, allSel)}
									>
										<div className={`elt-checkbox ${allSel ? 'checked' : someSel ? 'partial' : ''}`}>
											{allSel  && <Check size={11} strokeWidth={3} />}
											{someSel && <Minus size={11} strokeWidth={3} />}
										</div>
										<div className='elt-info'>
											<div className='elt-name-row'>
												<span className='elt-name'>{item.name}</span>
												<span className='elt-group-count'>x{item.tasks.length}</span>
											</div>
											{item.description && <p className='elt-desc'>{item.description}</p>}
											<div className='elt-meta'>
												{item.tags.map((tag: string) => (
													<span key={tag} className='elt-tag'>{tag}</span>
												))}
												<span className='elt-date-range'>
													{fmt(item.earliestDate)} → {fmt(item.latestDate)}
												</span>
											</div>
										</div>
										<button
											className='elt-expand-btn'
											onClick={e => { e.stopPropagation(); toggleExpand(item.fp); }}
										>
											<ChevronDown
												size={14}
												style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
											/>
										</button>
									</div>
									{isExpanded && (
										<div className='elt-expanded-tasks'>
											{item.tasks.map((t: any) => (
												<div key={t.id} className='elt-expanded-task-row'>
													<span className='elt-exp-date'>{fmt(t.date)}</span>
													{t.completed
														? <Check size={11} strokeWidth={2.5} className='elt-exp-done' />
														: <span className='elt-exp-pending' />}
													<span className='elt-exp-spacer' />
													<button className='elt-exp-delete' onClick={e => handleDelete(t.id, e)}>
														<Trash2 size={13} />
													</button>
												</div>
											))}
										</div>
									)}
								</div>
							);
						}

						// Single (non-repeatable) task
						const task = item.task;
						const isSel = selected.has(task.id);
						return (
							<div
								key={task.id}
								className={`elt-row ${isSel ? 'selected' : ''}`}
								onClick={() => toggleSingle(task.id)}
							>
								<div className={`elt-checkbox ${isSel ? 'checked' : ''}`}>
									{isSel && <Check size={11} strokeWidth={3} />}
								</div>
								<div className='elt-info'>
									<div className='elt-name-row'>
										<span className='elt-name'>{task.name}</span>
										<span className='elt-date-text'>{fmt(task.date)}</span>
										{task.completed && <Check size={12} strokeWidth={2.5} className='elt-done-icon' />}
									</div>
									{task.description && <p className='elt-desc'>{task.description}</p>}
									<div className='elt-meta'>
										{(task.tags || []).map((tag: string) => (
											<span key={tag} className='elt-tag'>{tag}</span>
										))}
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
};

// ─── Goal Detail View ─────────────────────────────────────────────────────────
const GoalDetailView = ({
	goal,
	tasks,
	completedTaskIds,
	onBack,
	onEdit,
	onArchive,
	onDelete,
	onLogProgress,
	onUpdateLinkedTasks,
	onDeleteTask,
}: any) => {
	const done = goal.done || 0;
	const total = goal.total || 1;
	const pct = goal.pct || 0;
	const isDone = done >= total;
	const days = daysUntil(goal.deadline);

	// ID-based linked tasks — precise, each instance is a specific day
	const linkedTasks = tasks.filter((t: any) => (goal.linkedTaskIds as string[]).includes(t.id));

	// Edit sheet state
	const [showEditLinked, setShowEditLinked] = useState(false);

	// Helper: short date label
	const shortDate = (d: string) =>
		new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

	// Compute streak from manual logs
	let streak = 0;
	const logsSet = new Set(
		goal.manualLogs.map((l: any) => (typeof l === 'string' ? l : l.date)),
	);
	for (let i = 0; i < 365; i++) {
		const d = new Date();
		d.setDate(d.getDate() - i);
		const dStr = d.toISOString().split('T')[0];
		if (logsSet.has(dStr)) streak++;
		else if (i !== 0) break;
	}

	const hasLinkedTasks = (goal.linkedTaskIds as string[]).length > 0;

	return (
		<div className='goal-detail-view fade-up'>
			<header className='gd-header'>
				<button className='gd-back' onClick={onBack}>
					<ArrowLeft size={20} />
				</button>
				<div className='gd-actions'>
					<button onClick={onEdit}>
						<Pencil size={18} />
					</button>
					<button onClick={() => onArchive(goal.id, !goal.archived)}>
						<Archive
							size={18}
							color={goal.archived ? 'var(--accent)' : 'currentColor'}
						/>
					</button>
					<button onClick={() => onDelete(goal.id)} className='gd-delete'>
						<Trash2 size={18} />
					</button>
				</div>
			</header>

			{isDone && !goal.archived && (
				<div className='gd-celebration fade-up'>
					<div className='celeb-icon'>🎉</div>
					<h3>Goal Completed!</h3>
					<p>Amazing work! You can now archive this goal.</p>
					<button
						className='celeb-archive-btn'
						onClick={() => onArchive(goal.id, true)}
					>
						Archive Goal
					</button>
				</div>
			)}

			<div className='gd-main-info'>
				<div className={`gd-icon ${isDone ? 'done' : ''}`}>
					{isDone ? (
						<Check size={28} strokeWidth={3} />
					) : (
						<Target size={28} strokeWidth={1.8} />
					)}
				</div>
				<h1 className='gd-title'>{goal.title}</h1>
				<div className='gd-tags'>
					<span className='gd-tag'>
						<TagIcon size={12} /> {goal.category}
					</span>
					<span className={`gd-tag p-${goal.priority?.toLowerCase()}`}>
						Priority: {goal.priority}
					</span>
					<span className='gd-tag'>
						<BarChart size={12} /> {(goal.linkedTaskIds as string[]).length > 0 ? `${(goal.linkedTaskIds as string[]).length} linked` : `${goal.targetFrequency}×/wk`}
					</span>
				</div>
			</div>

			<div className='gd-stats-grid'>
				<div className='gd-stat-box'>
					<span className='gd-stat-val'>{Math.round(pct)}%</span>
					<span className='gd-stat-lbl'>Progress ({done}/{total})</span>
				</div>
				<div className='gd-stat-box'>
					<span
						className='gd-stat-val'
						style={{ color: days < 0 ? 'var(--red)' : 'inherit' }}
					>
						{days < 0 ? 'Overdue' : days + 'd'}
					</span>
					<span className='gd-stat-lbl'>Remaining</span>
				</div>
				<div className='gd-stat-box'>
					<span
						className='gd-stat-val'
						style={{ color: streak > 0 ? 'var(--orange)' : 'inherit' }}
					>
						<Flame size={16} /> {streak}
					</span>
					<span className='gd-stat-lbl'>Day Streak</span>
				</div>
			</div>

			<div className='gd-progress-bar-wrap'>
				<div className='gd-progress-bar'>
					<div
						className='gd-progress-fill'
						style={{
							width: `${pct}%`,
							background: isDone ? 'var(--green)' : 'var(--accent)',
						}}
					/>
				</div>
			</div>

			{/* ── Linked Tasks ─────────────────────────────────── */}
			<div className='gd-section'>
				<div className='gd-section-header'>
					<h3>
						<Link2 size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} />
						Linked Tasks
					</h3>
					<button className='gd-edit-linked-btn' onClick={() => setShowEditLinked(true)}>
						{hasLinkedTasks ? <><Pencil size={12} /> Edit</> : <><Plus size={12} /> Link</>}
					</button>
				</div>

				{!hasLinkedTasks ? (
					<button className='gd-link-empty-state' onClick={() => setShowEditLinked(true)}>
						<Link2 size={22} strokeWidth={1.5} />
						<span className='gd-link-empty-title'>No linked tasks yet</span>
						<span className='gd-link-empty-sub'>
							Tap "Link" to connect tasks — completing them each day counts as goal progress
						</span>
					</button>
				) : (
					<>
						<div className='gd-progress-note'>
							{linkedTasks.filter((t: any) => t.completed).length} of {linkedTasks.length} linked tasks completed
						</div>
						<div className='gd-task-list'>
							{[...linkedTasks]
								.sort((a: any, b: any) => a.date.localeCompare(b.date))
								.map((t: any) => (
									<div key={t.id} className='gd-task-row'>
										{t.completed
											? <Check size={14} className='gtask-done' strokeWidth={2.5} />
											: <div className='gtask-dot' />}
										<span className={`gd-task-name ${t.completed ? 'done' : ''}`}>{t.name}</span>
										<span className='gd-task-date'>{shortDate(t.date)}</span>
									</div>
								))}
						</div>
					</>
				)}

				{showEditLinked && (
					<EditLinkedTasksSheet
						tasks={tasks}
						initialLinkedIds={goal.linkedTaskIds as string[]}
						onSave={onUpdateLinkedTasks}
						onClose={() => setShowEditLinked(false)}
						onDeleteTask={onDeleteTask}
					/>
				)}
			</div>

			{/* ── Manual Logs ──────────────────────────────────── */}
			<div className='gd-section'>
				<div className='gd-section-header'>
					<h3>Journal / Logs</h3>
					<button className='gd-add-log-btn' onClick={onLogProgress}>
						<Plus size={14} /> Add Log
					</button>
				</div>
				{hasLinkedTasks && (
					<div className='gd-progress-note'>
						Logs are for notes and effort tracking — they don't affect progress when tasks are linked
					</div>
				)}
				{goal.manualLogs.length === 0 ? (
					<p className='gd-empty'>No logs yet. Add one to track effort and notes.</p>
				) : (
					<div className='gd-log-list'>
						{[...goal.manualLogs].reverse().map((log: any, i) => {
							const isStr = typeof log === 'string';
							const date = isStr ? log : log.date;
							const eff = isStr ? 0 : log.effortMinutes;
							const nts = isStr ? '' : log.notes;
							return (
								<div key={i} className='gd-log-item'>
									<div className='gd-log-head'>
										<span className='gd-log-date'>
											{new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
												month: 'short',
												day: 'numeric',
												year: 'numeric',
											})}
										</span>
										{eff > 0 && (
											<span className='gd-log-eff'>
												<Clock size={12} /> {eff}m
											</span>
										)}
									</div>
									{nts && <p className='gd-log-notes'>{nts}</p>}
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
};

// ─── Goals Page ───────────────────────────────────────────────────────────────
const Goals = () => {
	const { goals, addGoal, updateGoal, deleteGoal, logProgress } = useGoals();
	const { tasks, deleteTask } = useTasks();
	const [showCreate, setShowCreate] = useState(false);
	const [showLogSheetFor, setShowLogSheetFor] = useState<string | null>(null);
	const [editGoalId, setEditGoalId] = useState<string | null>(null);
	const [activeGoalId, setActiveGoalId] = useState<string | null>(null);
	const [showArchived, setShowArchived] = useState(false);

	const completedTaskIds = useMemo(
		() => new Set(tasks.filter((t) => t.completed).map((t) => t.id)),
		[tasks],
	);

	const activeGoal = activeGoalId
		? goals.find((g) => g.id === activeGoalId)
		: null;
	const editGoal = editGoalId ? goals.find((g) => g.id === editGoalId) : null;

	const displayGoals = goals.filter((g) =>
		showArchived ? g.archived : !g.archived,
	);

	if (activeGoal) {
		return (
			<div className='goals-page'>
				<GoalDetailView
					goal={activeGoal}
					tasks={tasks}
					completedTaskIds={completedTaskIds}
					onBack={() => setActiveGoalId(null)}
					onEdit={() => setEditGoalId(activeGoal.id)}
					onArchive={(id: string, arch: boolean) =>
						updateGoal(id, { archived: arch })
					}
					onDelete={(id: string) => {
						deleteGoal(id);
						setActiveGoalId(null);
					}}
					onLogProgress={() => setShowLogSheetFor(activeGoal.id)}
					onUpdateLinkedTasks={(ids: string[]) =>
						updateGoal(activeGoal.id, { linkedTaskIds: ids })
					}
					onDeleteTask={deleteTask}
				/>
				{editGoal && (
					<GoalFormSheet
						initialGoal={editGoal}
						onClose={() => setEditGoalId(null)}
						onSave={(patch) => updateGoal(editGoal.id, patch)}
					/>
				)}
				{showLogSheetFor && (
					<LogProgressSheet
						onClose={() => setShowLogSheetFor(null)}
						onSave={(effort, notes) =>
							logProgress(showLogSheetFor, effort, notes)
						}
					/>
				)}
			</div>
		);
	}

	return (
		<div className='goals-page'>
			<header className='goals-header fade-up'>
				<h1 className='goals-title'>Goals</h1>
				<button className='add-goal-btn' onClick={() => setShowCreate(true)}>
					<Plus size={18} strokeWidth={2.5} />
				</button>
			</header>

			<div className='goals-tabs fade-up'>
				<button
					className={`g-tab ${!showArchived ? 'active' : ''}`}
					onClick={() => setShowArchived(false)}
				>
					Active
				</button>
				<button
					className={`g-tab ${showArchived ? 'active' : ''}`}
					onClick={() => setShowArchived(true)}
				>
					Archived
				</button>
			</div>

			{displayGoals.length === 0 && (
				<div className='goals-empty fade-up fade-up-1'>
					<div className='goals-empty-icon'>
						<Target size={34} strokeWidth={1.5} />
					</div>
					<p>{showArchived ? 'No archived goals' : 'No active goals'}</p>
					{!showArchived && (
						<button
							className='create-first-btn'
							onClick={() => setShowCreate(true)}
						>
							<Plus size={16} strokeWidth={2.5} />
							Create a Goal
						</button>
					)}
				</div>
			)}

			{displayGoals.length > 0 && (
				<div className='goals-list fade-up fade-up-1'>
					{displayGoals.map((goal, i) => (
						<div
							key={goal.id}
							className='fade-up'
							style={{ animationDelay: `${0.06 + i * 0.05}s` }}
						>
							<GoalCard
								goal={goal}
								completedTaskIds={completedTaskIds}
								onClick={() => setActiveGoalId(goal.id)}
							/>
						</div>
					))}
				</div>
			)}

			{showCreate && (
				<GoalFormSheet
					onClose={() => setShowCreate(false)}
					onSave={(data) => addGoal(data)}
				/>
			)}
		</div>
	);
};

export default Goals;
