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
	{ label: 'Home', href: '/dashboard' },
	{ label: 'Courses', href: '/courses' },
	{ label: 'Jobs', href: '/jobs' },
	{ label: 'For Employers', href: '/employer' },
	{ label: 'Contact', href: '/contact' },
];

/** Learner dashboard sidebar — SRS §3.2 LMS, §3.3 Job Marketplace, §3.5 Certifications */
export const dashboardNavItems: NavItem[] = [
	{ label: 'Dashboard', href: '/dashboard' },
	{ label: 'Courses', href: '/courses' },
	{ label: 'Job Marketplace', href: '/jobs' },
	{ label: 'My Applications', href: '/applications' },
	{ label: 'Skill Profile', href: '/profile' },
	{ label: 'Certifications', href: '/certifications' },
	{ label: 'Messages', href: '/dashboard#messages' },
	{ label: 'Notifications', href: '/dashboard#notifications' },
	{ label: 'Settings', href: '/dashboard#settings' },
];

/** Dashboard section anchors (in-page on /dashboard) */
export const dashboardSectionAnchors = {
	progress: '/dashboard#progress-overview',
	recommendedJobs: '/dashboard#recommended-jobs',
	recentCourses: '/dashboard#recent-courses',
	applications: '/dashboard#applications',
	messages: '/dashboard#messages',
	notifications: '/dashboard#notifications',
	profile: '/dashboard#profile',
	settings: '/dashboard#settings',
} as const;
