import { Avatar } from '../shared/Avatar';
import { NotificationBell } from '../shared/NotificationBell';

type TopbarProps = {
	userName: string;
	role: string;
	unreadCount: number;
	onMenuToggle: () => void;
};

export function Topbar({ userName, role, unreadCount, onMenuToggle }: TopbarProps) {
	return (
		<header className="topbar topbar--dashboard">
			<button className="topbar__menu" type="button" onClick={onMenuToggle} aria-label="Open navigation">
				<span />
				<span />
				<span />
			</button>

			<div className="topbar__copy">
				<p className="topbar__eyebrow">Dashboard</p>
				<h1>Good morning, {userName}</h1>
				<p>{role}</p>
			</div>

			<div className="topbar__actions">
				<NotificationBell count={unreadCount} />
				<div className="topbar__user">
					<Avatar name={userName} size="md" />
					<div>
						<strong>{userName}</strong>
						<span>{role}</span>
					</div>
				</div>
			</div>
		</header>
	);
}
