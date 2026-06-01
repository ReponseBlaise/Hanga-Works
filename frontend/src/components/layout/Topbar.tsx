import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { publicNavItems } from '../../constants/routes';
import { useAuth } from '../../context/AuthContext';
import { NotificationBell } from '../shared/NotificationBell';
import { useNotificationsFeed } from '../../services/notifications.service';
import { Avatar } from '../shared/Avatar';

export default function Navbar() {
	const location = useLocation();
	const navigate = useNavigate();
	const { user, isAuthenticated, signOut } = useAuth();
	const [menuOpen, setMenuOpen] = useState(false);
	const { items: notificationItems } = useNotificationsFeed(user?.id);
	const visibleUnread = (notificationItems ?? []).filter((it) => it.source !== 'System' && !it.read).length;

	useEffect(() => {
		setMenuOpen(false);
	}, [location.pathname]);

	const userRole = (user?.role ?? 'LEARNER').toUpperCase();

	const navLinks = useMemo(() => {
		if (!isAuthenticated) {
			return publicNavItems;
		}

		if (userRole === 'EMPLOYER') {
			return [
				{ label: 'Employer Home', href: '/employer' },
				{ label: 'Post a Job', href: '/employer/post-job' },
				{ label: 'Applicants', href: '/employer/applicants' },
				{ label: 'Candidates', href: '/candidates' },
			];
		}
		if (userRole === 'ADMIN') {
			return [
				{ label: 'Admin Home', href: '/admin' },
				{ label: 'Exports', href: '/admin/export' },
				{ label: 'Moderation', href: '/admin/moderation' },
			];
		}
		return [
			{ label: 'Home', href: '/' },
			{ label: 'Dashboard', href: '/dashboard' },
			{ label: 'Jobs', href: '/jobs' },
			{ label: 'Courses', href: '/courses' },
		];
	}, [isAuthenticated, userRole]);
	const visibleLinks = navLinks.slice(0, 4);

	function isNavActive(href: string) {
		if (href === '/') return location.pathname === '/';
		return location.pathname === href || location.pathname.startsWith(`${href}/`);
	}

	return (
		<nav className="public-navbar" aria-label="Main navigation">
			<div className="public-navbar__inner">
				<Link to="/" className="public-navbar__brand">
					<img src="/hanga-works-logo.svg" alt="Hanga Works" />
				</Link>

				<button
					type="button"
					className="public-navbar__menu"
					aria-label={menuOpen ? 'Close menu' : 'Open menu'}
					aria-expanded={menuOpen}
					onClick={() => setMenuOpen((value) => !value)}
				>
					<svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
						<rect x="0" y="1" width="20" height="2" rx="1" fill="currentColor" />
						<rect x="0" y="6" width="20" height="2" rx="1" fill="currentColor" />
						<rect x="0" y="11" width="20" height="2" rx="1" fill="currentColor" />
					</svg>
				</button>

				<div className={`public-navbar__panel ${menuOpen ? 'is-open' : ''}`}>
					<div className="public-navbar__links">
						{visibleLinks.map((link) => {
							const active = isNavActive(link.href);
							return (
								<Link
									key={link.href}
									to={link.href}
									className={`public-navbar__link ${active ? 'is-active' : ''}`.trim()}
									aria-current={active ? 'page' : undefined}
									onClick={() => setMenuOpen(false)}
								>
									{link.label}
								</Link>
							);
						})}
					</div>

						<div className="public-navbar__auth" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
							{isAuthenticated ? (
								<>
									<div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
										<NotificationBell
											count={visibleUnread}
											onClick={() => navigate('/notifications')}
										/>
									</div>
									<Link to="/profile" className="public-navbar__avatar-link" onClick={() => setMenuOpen(false)}>
										<Avatar name={user?.name ?? 'User'} imageUrl={user?.avatarUrl ?? undefined} size="sm" />
									</Link>
									<button
										type="button"
										className="public-navbar__signin"
										onClick={() => {
											setMenuOpen(false);
											signOut();
											navigate('/login', { replace: true });
										}}
									>
										Sign Out
									</button>
								</>
							) : (
								<>
									<Link to="/register" className="public-navbar__register" onClick={() => setMenuOpen(false)}>
										Sign Up
									</Link>
									<Link to="/login" className="public-navbar__signin" onClick={() => setMenuOpen(false)}>
										Sign In
									</Link>
								</>
							)}
						</div>
				</div>
			</div>
		</nav>
	);
}
