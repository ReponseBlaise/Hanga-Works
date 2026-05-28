import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { dashboardNavItems } from '../../constants/routes';

type SidebarProps = {
	isOpen: boolean;
	onClose: () => void;
	brand?: ReactNode;
	userName?: string;
	userRole?: string;
	userEmail?: string;
};

export function Sidebar({ isOpen, onClose, brand, userName, userRole, userEmail }: SidebarProps) {
	const location = useLocation();
	const initials = (userName ?? 'User')
		.split(' ')
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? '')
		.join('');

	return (
		<aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`.trim()} aria-label="Dashboard sidebar navigation">
			<div className="sidebar__header">
				{brand}
				<button className="sidebar__close" type="button" onClick={onClose} aria-label="Close navigation">
					<span />
				</button>
			</div>

			<nav className="sidebar__nav">
				{dashboardNavItems.map((item) => {
					const [path, hash] = item.href.split('#');
					const isActive = hash
						? location.pathname === path && location.hash === `#${hash}`
						: location.pathname === path ||
							(path !== '/dashboard' && path.length > 1 && location.pathname.startsWith(path));
					return (
						<Link
							key={item.href}
							to={item.href}
							className={isActive ? 'is-active' : ''}
							onClick={onClose}
						>
							{item.label}
						</Link>
					);
				})}
			</nav>

			<div className="sidebar__panel" id="profile">
				<p className="sidebar__label">Signed in as</p>
				<div className="sidebar__user">
					<div className="avatar avatar-sm" aria-hidden="true">{initials || 'U'}</div>
					<div>
						<strong>{userName ?? 'Guest user'}</strong>
						<span>{userRole ?? 'Learner'}</span>
					</div>
				</div>
				<span>{userEmail ?? 'Signed in session active'}</span>
			</div>
		</aside>
	);
}
