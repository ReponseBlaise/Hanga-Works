import type { ReactNode } from 'react';
import { dashboardNavItems } from '../../constants/routes';

type SidebarProps = {
	isOpen: boolean;
	onClose: () => void;
	brand?: ReactNode;
};

export function Sidebar({ isOpen, onClose, brand }: SidebarProps) {
	return (
		<aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`.trim()} aria-label="Sidebar navigation">
			<div className="sidebar__header">
				{brand}
				<button className="sidebar__close" type="button" onClick={onClose} aria-label="Close navigation">
					<span />
				</button>
			</div>

			<nav className="sidebar__nav">
				{dashboardNavItems.map((item) => (
					<a key={item.href} href={item.href} onClick={onClose}>
						{item.label}
					</a>
				))}
			</nav>

			<div className="sidebar__panel" id="profile">
				<p className="sidebar__label">Profile status</p>
				<strong>82% complete</strong>
				<span>Finish your skills profile to unlock better matches.</span>
			</div>
		</aside>
	);
}
