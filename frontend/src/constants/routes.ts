/**
 * Navigation aligned with HANGA WORKS SRS v2.0 architectural layers:
 * - Learning Layer (LMS)
 * - Employment Layer (Job Marketplace, Applications)
 * - User Layer (Profile, Settings)
 * - Certification & Verification
 */

export type NavItem = {
	label: string;
	href: string;
};

/** Public marketing navbar (auth / landing pages) */
export const publicNavItems: NavItem[] = [
	{ label: 'Home', href: '/' },
	{ label: 'Find Job', href: '/jobs' },
	{ label: 'Recruiters', href: '/employer' },
	{ label: 'Candidates', href: '/candidates' },
	{ label: 'Pages', href: '/pricing' },
	{ label: 'Blog', href: '/blog' },
	{ label: 'Contact', href: '/contact' },
];
