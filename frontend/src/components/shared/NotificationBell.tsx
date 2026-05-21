type NotificationBellProps = {
	count?: number;
	className?: string;
	onClick?: () => void;
};

export function NotificationBell({ count = 0, className = '', onClick }: NotificationBellProps) {
	return (
		<button className={`notification-bell ${className}`.trim()} type="button" onClick={onClick} aria-label={`Notifications${count ? `, ${count} unread` : ''}`}>
			<svg viewBox="0 0 24 24" aria-hidden="true">
				<path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 1 0-14 0v5L3 18v1h18v-1l-2-2Z" />
			</svg>
			{count > 0 ? <span className="notification-bell__badge">{count > 9 ? '9+' : count}</span> : null}
		</button>
	);
}
