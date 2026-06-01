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
	trendingSkillsToLearn: Array<{ skillId: string; _count?: { skillId?: number } }>;
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
