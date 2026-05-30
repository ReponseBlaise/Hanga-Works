import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { publicNavItems } from '../../constants/routes';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
	const location = useLocation();
	const { user, isAuthenticated, signOut } = useAuth();
	const [hovered, setHovered] = useState<string | null>(null);
	const [menuOpen, setMenuOpen] = useState(false);

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
				{ label: 'Home', href: '/' },
				{ label: 'Employer Home', href: '/employer' },
				{ label: 'Post a Job', href: '/employer/post-job' },
				{ label: 'Applicants', href: '/employer/applicants' },
				{ label: 'Candidates', href: '/candidates' },
			];
		}
		if (userRole === 'ADMIN') {
			return [
				{ label: 'Home', href: '/' },
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
			{ label: 'Mentors', href: '/mentors' },
			{ label: 'Applications', href: '/applications' },
			{ label: 'Profile', href: '/profile' },
			{ label: 'Certifications', href: '/certifications' },
		];
	}, [isAuthenticated, userRole]);

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
						{navLinks.map((link) => {
							const active = isNavActive(link.href);
							return (
								<Link
									key={link.href}
									to={link.href}
									className={`public-navbar__link ${active ? 'is-active' : ''}`.trim()}
									aria-current={active ? 'page' : undefined}
									onMouseEnter={() => setHovered(link.label)}
									onMouseLeave={() => setHovered(null)}
									onClick={() => setMenuOpen(false)}
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
						{isAuthenticated ? (
							<>
								<button
									type="button"
									className="public-navbar__signin"
									onClick={() => {
										setMenuOpen(false);
										signOut();
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
