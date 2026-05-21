type ProgressBarProps = {
	value: number;
	label?: string;
	className?: string;
};

export function ProgressBar({ value, label, className = '' }: ProgressBarProps) {
	const progressValue = Math.max(0, Math.min(100, value));

	return (
		<div className={`progress ${className}`.trim()}>
			{label ? <div className="progress__label">{label}</div> : null}
			<div className="progress__track" role="progressbar" aria-valuenow={progressValue} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
				<span className="progress__fill" style={{ width: `${progressValue}%` }} />
			</div>
		</div>
	);
}
