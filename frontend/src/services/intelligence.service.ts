import api from './api';

export type SkillGapAnalysis = {
	targetJob: string;
	matchScore: number;
	matchingSkills: string[];
	missingSkills: string[];
};

export type CareerPathwayCourse = {
	id: string;
	title: string;
	description: string;
	institution?: { id: string; name: string } | null;
	_count?: { enrollments?: number; modules?: number };
	modules?: Array<{ id: string; title: string; order: number }>;
};

export type CareerPathway = {
	currentLevel: string;
	nextMilestone: string;
	recommendedCourses: CareerPathwayCourse[];
	trendingSkillsToLearn: Array<{ skillId: string; skillName?: string; _count?: { skillId?: number } }>;
};

function unwrap<T>(payload: unknown): T {
	if (payload && typeof payload === 'object' && 'data' in payload) {
		const data = (payload as { data?: unknown }).data;
		if (data && typeof data === 'object' && 'data' in (data as Record<string, unknown>)) {
			return (data as { data: T }).data;
		}
		return data as T;
	}

	return payload as T;
}

export async function getSkillGapAnalysis(jobId: string) {
	const response = await api.get('/intelligence/gap-analysis', { params: { jobId } });
	return unwrap<SkillGapAnalysis>(response.data);
}

export async function getCareerPathway() {
	const response = await api.get('/intelligence/pathway');
	return unwrap<CareerPathway>(response.data);
}

export type SalaryBenchmark = {
	role: string;
	minSalary: number;
	maxSalary: number;
	jobCount: number;
};

export async function getSalaryBenchmark(role?: string) {
	const response = await api.get('/intelligence/salary-benchmark', { params: { role } });
	return unwrap<SalaryBenchmark[]>(response.data);
}

export type IndustryTrend = {
	skillId: string;
	skillName: string;
	jobCount: number;
	growthRate?: number;
	relatedCourses: Array<{ id: string; title: string; slug: string }>;
	relatedJobs: Array<{ id: string; title: string; slug: string; employer: { name: string } }>;
};

export async function getIndustryTrends() {
	const response = await api.get('/intelligence/industry-trends');
	return unwrap<IndustryTrend[]>(response.data);
}

export type CareerModel = {
	viabilityScore: number;
	jobsMatchingAny: number;
	totalActiveJobs: number;
	deprecatedSkills: Array<{ skillId: string; name: string; jobCount: number }>;
	pivotPathways: Array<{ id: string; title: string; employer: string; matchPct: number; missingSkills: string[] }>;
	upgradeCourses: Array<{ id: string; title: string; slug: string; institution: { name: string } | null }>;
};

export async function getCareerModel() {
	const response = await api.get('/intelligence/career-model');
	return unwrap<CareerModel>(response.data);
}
