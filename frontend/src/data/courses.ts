import type { Course } from '../types/course';

export const courses: Course[] = [
	{
		id: '1',
		slug: 'advanced-react-patterns',
		title: 'Advanced React Patterns',
		description:
			'Master compound components, render props, and state colocation patterns used in production React applications.',
		summary: 'Level up your React architecture with patterns used by top product teams.',
		provider: 'Coursera',
		category: 'development',
		level: 'advanced',
		duration: '6 weeks',
		lessons: 24,
		progress: 78,
		enrolled: true,
		skills: ['React', 'TypeScript', 'Component design'],
		modules: [
			{ id: 'm1', title: 'Compound components', duration: '45 min', completed: true },
			{ id: 'm2', title: 'Controlled vs uncontrolled inputs', duration: '38 min', completed: true },
			{ id: 'm3', title: 'State colocation', duration: '52 min', completed: true },
			{ id: 'm4', title: 'Performance patterns', duration: '41 min', completed: false },
		],
		quiz: {
			title: 'React patterns checkpoint',
			passingScore: 70,
			questions: [
				{
					id: 'q1',
					question: 'Which pattern lets multiple child components share implicit state?',
					options: ['HOC only', 'Compound components', 'CSS modules', 'Static imports'],
					correctIndex: 1,
				},
				{
					id: 'q2',
					question: 'Where should state live when only one subtree needs it?',
					options: ['Global Redux store', 'Colocated in the subtree', 'URL query params', 'localStorage always'],
					correctIndex: 1,
				},
				{
					id: 'q3',
					question: 'What is the main benefit of lifting state only when necessary?',
					options: ['Fewer re-renders in unrelated UI', 'Faster builds', 'Smaller bundle by default', 'No need for hooks'],
					correctIndex: 0,
				},
			],
		},
	},
	{
		id: '2',
		slug: 'data-driven-career-planning',
		title: 'Data-Driven Career Planning',
		description:
			'Use labour market signals and personal skills data to plan your next career move with confidence.',
		summary: 'Translate workforce analytics into a practical career roadmap.',
		provider: 'LinkedIn Learning',
		category: 'career',
		level: 'intermediate',
		duration: '4 weeks',
		lessons: 18,
		progress: 52,
		enrolled: true,
		skills: ['Career planning', 'Analytics', 'Interview prep'],
		modules: [
			{ id: 'm1', title: 'Skills gap analysis', duration: '32 min', completed: true },
			{ id: 'm2', title: 'Labour market signals', duration: '28 min', completed: true },
			{ id: 'm3', title: 'Interview funnels', duration: '35 min', completed: false },
			{ id: 'm4', title: 'Offer negotiation', duration: '40 min', completed: false },
		],
		quiz: {
			title: 'Career planning quiz',
			passingScore: 65,
			questions: [
				{
					id: 'q1',
					question: 'What is a skills gap analysis used for?',
					options: ['Tracking payroll', 'Identifying learning priorities', 'Writing job ads', 'Scheduling meetings'],
					correctIndex: 1,
				},
				{
					id: 'q2',
					question: 'Which metric best tracks interview pipeline health?',
					options: ['Page views', 'Conversion rate by stage', 'Office temperature', 'Email length'],
					correctIndex: 1,
				},
			],
		},
	},
	{
		id: '3',
		slug: 'job-market-analytics',
		title: 'Job Market Analytics',
		description:
			'Build dashboards that forecast hiring demand and visualize skill trends across regions and industries.',
		summary: 'Learn to read and present workforce intelligence data.',
		provider: 'Pluralsight',
		category: 'analytics',
		level: 'intermediate',
		duration: '5 weeks',
		lessons: 20,
		progress: 31,
		enrolled: true,
		skills: ['SQL', 'Dashboards', 'Forecasting'],
		modules: [
			{ id: 'm1', title: 'Labour datasets', duration: '30 min', completed: true },
			{ id: 'm2', title: 'Dashboard design', duration: '44 min', completed: false },
			{ id: 'm3', title: 'Forecasting basics', duration: '36 min', completed: false },
		],
		quiz: {
			title: 'Analytics fundamentals',
			passingScore: 70,
			questions: [
				{
					id: 'q1',
					question: 'Which chart is best for comparing categories?',
					options: ['Pie for 20 slices', 'Bar chart', 'Scatter for time series only', '3D surface'],
					correctIndex: 1,
				},
				{
					id: 'q2',
					question: 'Forecasting hiring demand typically uses:',
					options: ['Historical trends + seasonality', 'Random guesses', 'Font size', 'Logo colour'],
					correctIndex: 0,
				},
			],
		},
	},
	{
		id: '4',
		slug: 'ux-for-learning-products',
		title: 'UX for Learning Products',
		description:
			'Design accessible learning experiences with clear progress cues, assessments, and motivation loops.',
		summary: 'Create learner-centred flows that improve completion rates.',
		provider: 'SkillBridge Africa',
		category: 'design',
		level: 'beginner',
		duration: '3 weeks',
		lessons: 12,
		progress: 0,
		enrolled: false,
		skills: ['UX', 'Accessibility', 'Curriculum design'],
		modules: [
			{ id: 'm1', title: 'Learner journey mapping', duration: '25 min', completed: false },
			{ id: 'm2', title: 'Progress and feedback UI', duration: '30 min', completed: false },
		],
		quiz: {
			title: 'Learning UX quiz',
			passingScore: 60,
			questions: [
				{
					id: 'q1',
					question: 'Progress bars help learners by:',
					options: ['Showing completion status', 'Replacing all text', 'Hiding navigation', 'Removing quizzes'],
					correctIndex: 0,
				},
			],
		},
	},
	{
		id: '5',
		slug: 'typescript-essentials',
		title: 'TypeScript Essentials',
		description:
			'From basic types to generics and utility types — build safer front-end codebases step by step.',
		summary: 'A practical TypeScript foundation for modern web development.',
		provider: 'Coursera',
		category: 'development',
		level: 'beginner',
		duration: '4 weeks',
		lessons: 16,
		progress: 0,
		enrolled: false,
		skills: ['TypeScript', 'JavaScript', 'Type safety'],
		modules: [
			{ id: 'm1', title: 'Primitives and unions', duration: '22 min', completed: false },
			{ id: 'm2', title: 'Interfaces vs types', duration: '28 min', completed: false },
		],
		quiz: {
			title: 'TypeScript basics',
			passingScore: 70,
			questions: [
				{
					id: 'q1',
					question: 'TypeScript primarily adds:',
					options: ['Static types at compile time', 'A new browser', 'CSS preprocessing', 'Database ORM'],
					correctIndex: 0,
				},
			],
		},
	},
	{
		id: '6',
		slug: 'workplace-communication',
		title: 'Workplace Communication',
		description:
			'Write clearer updates, run better meetings, and collaborate across distributed teams.',
		summary: 'Strengthen professional communication for hybrid workplaces.',
		provider: 'LinkedIn Learning',
		category: 'career',
		level: 'beginner',
		duration: '2 weeks',
		lessons: 10,
		progress: 100,
		enrolled: true,
		skills: ['Communication', 'Collaboration', 'Leadership'],
		modules: [
			{ id: 'm1', title: 'Async updates', duration: '20 min', completed: true },
			{ id: 'm2', title: 'Meeting facilitation', duration: '24 min', completed: true },
		],
		quiz: {
			title: 'Communication check-in',
			passingScore: 60,
			questions: [
				{
					id: 'q1',
					question: 'Effective async updates should be:',
					options: ['Long and unstructured', 'Concise with clear asks', 'Only emojis', 'Sent once a year'],
					correctIndex: 1,
				},
			],
		},
	},
];

export function getCourseById(id: string): Course | undefined {
	return courses.find((course) => course.id === id);
}

export const categoryLabels: Record<Course['category'], string> = {
	development: 'Development',
	career: 'Career',
	analytics: 'Analytics',
	design: 'Design',
};

export const levelLabels: Record<Course['level'], string> = {
	beginner: 'Beginner',
	intermediate: 'Intermediate',
	advanced: 'Advanced',
};
