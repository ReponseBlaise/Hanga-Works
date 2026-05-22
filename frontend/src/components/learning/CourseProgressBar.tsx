type CourseProgressBarProps = {
	value: number;
	completedLessons?: number;
	totalLessons?: number;
	label?: string;
	showPercent?: boolean;
	className?: string;
};

export function CourseProgressBar({
	value,
	completedLessons,
	totalLessons,
	label = 'Course progress',
	showPercent = true,
	className = '',
}: CourseProgressBarProps) {
	const progress = Math.max(0, Math.min(100, value));
	const lessonLabel =
		completedLessons !== undefined && totalLessons !== undefined
			? `${completedLessons} of ${totalLessons} lessons`
			: null;

	return (
		<div className={`course-progress ${className}`.trim()}>
			<div className="course-progress__header">
				<span className="course-progress__label">{label}</span>
				{showPercent ? <strong className="course-progress__percent">{progress}%</strong> : null}
			</div>
			<div
				className="course-progress__track"
				role="progressbar"
				aria-valuenow={progress}
				aria-valuemin={0}
				aria-valuemax={100}
				aria-label={label}
			>
				<span className="course-progress__fill" style={{ width: `${progress}%` }} />
			</div>
			{lessonLabel ? <p className="course-progress__meta">{lessonLabel}</p> : null}
		</div>
	);
}
