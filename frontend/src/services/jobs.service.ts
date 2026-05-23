import api from './api';

export type JobType = 'FULL_TIME' | 'PART_TIME' | 'REMOTE' | 'HYBRID' | 'INTERNSHIP' | 'FREELANCE';

export type JobEmployer = {
	id: string;
	name: string;
	website?: string | null;
};

export type JobSummary = {
	id: string;
	title: string;
	slug: string;
	description: string;
	location?: string | null;
	jobType: JobType;
	salaryMin?: number | null;
	salaryMax?: number | null;
	isActive: boolean;
	employer: JobEmployer;
	postedAt: string;
	updatedAt: string;
	expiresAt?: string | null;
	_count?: { applications: number };
};

export type CreateJobPayload = {
	title: string;
	description: string;
	location?: string;
	jobType?: JobType;
	salaryMin?: number | string;
	salaryMax?: number | string;
};

export async function getJobs(params?: { search?: string; location?: string }) {
	const res = await api.get('/jobs', { params });
	return res.data?.data?.jobs as JobSummary[];
}

export async function getJobById(id: string) {
	const res = await api.get(`/jobs/${id}`);
	return res.data?.data?.job as JobSummary;
}

export async function applyForJob(jobId: string) {
	const res = await api.post('/applications/apply', { jobId });
	return res.data?.data?.application;
}
