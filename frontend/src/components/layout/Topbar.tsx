import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { publicNavItems } from '../../constants/routes';

export function Topbar({ userName, role, unreadCount, onMenuToggle }: { userName?: string; role?: string; unreadCount?: number; onMenuToggle?: () => void }) {
	const initials = (userName ?? 'User')
		.split(' ')
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? '')
		.join('');

	return (
		<header className="topbar--dashboard">
			<button
				type="button"
				className="topbar__menu"
				onClick={onMenuToggle}
				aria-label="Open navigation"
			>
				<span />
				<span />
				<span />
			</button>

			<div className="topbar__copy">
				<p className="topbar__eyebrow">Dashboard overview</p>
				<h1>Welcome back, {userName ?? 'Guest'}</h1>
				<p>{role ?? 'Monitor your progress, applications, and learning in one place.'}</p>
			</div>

			<div className="topbar__actions">
				<div className="topbar__badge" aria-label={`${unreadCount ?? 0} unread notifications`}>
					<span className="topbar__badge-count">{unreadCount ?? 0}</span>
					<span className="topbar__badge-label">Alerts</span>
				</div>

				<div className="topbar__user">
					<div className="avatar avatar-md" aria-hidden="true">{initials || 'U'}</div>
					<div>
						<strong>{userName ?? 'User'}</strong>
						<span>{role ?? 'Learner'}</span>
					</div>
				</div>
			</div>
		</header>
	);
}

export default function Navbar() {
	const location = useLocation();
	const [hovered, setHovered] = useState<string | null>(null);

	function isNavActive(href: string) {
		if (href === '/') return location.pathname === '/';
		return location.pathname === href || location.pathname.startsWith(`${href}/`);
	}

	return (
		<nav
			className="public-navbar"
			aria-label="Main navigation"
		>
			<div className="public-navbar__inner">
				<Link to="/dashboard" className="public-navbar__brand">
					<img src="/hanga-works-logo.svg" alt="Hanga Works" />
				</Link>

				<div className="public-navbar__links">
					{publicNavItems.map((link) => {
						const active = isNavActive(link.href);
						return (
							<Link
								key={link.label}
								to={link.href}
								className={`public-navbar__link ${active ? 'is-active' : ''}`.trim()}
								aria-current={active ? 'page' : undefined}
								onMouseEnter={() => setHovered(link.label)}
								onMouseLeave={() => setHovered(null)}
								style={{
									color: active || hovered === link.label ? 'var(--accent)' : 'var(--text-soft)',
								}}
							>
								{link.label}
							</Link>
						);
					})}
				</div>

				<div className="public-navbar__auth">
					<Link to="/register" className="public-navbar__register">
						Register
					</Link>
					<Link to="/login" className="public-navbar__signin">
						Sign In
					</Link>
					<Link to="/dashboard" className="public-navbar__dashboard">
						Dashboard
					</Link>
				</div>
			</div>
		</nav>
	);
}
