import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { dashboardNavItems } from '../../constants/routes';

type SidebarProps = {
	isOpen: boolean;
	onClose: () => void;
	brand?: ReactNode;
};

export function Sidebar({ isOpen, onClose, brand }: SidebarProps) {
	const location = useLocation();

	return (
		<aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`.trim()} aria-label="Sidebar navigation">
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
				<p className="sidebar__label">Profile status</p>
				<strong>82% complete</strong>
				<span>Finish your skills profile to unlock better matches.</span>
			</div>
		</aside>
	);
}
