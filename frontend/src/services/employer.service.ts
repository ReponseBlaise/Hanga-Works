import api from './api';
import type { CreateJobPayload, JobSummary } from './jobs.service';

export type EmployerStats = {
	totalJobs: number;
	totalApplicants: number;
	breakdown: Partial<Record<'APPLIED' | 'REVIEWING' | 'SHORTLISTED' | 'HIRED' | 'REJECTED', number>>;
};

export type EmployerApplicant = {
	id: string;
	status: 'APPLIED' | 'REVIEWING' | 'SHORTLISTED' | 'HIRED' | 'REJECTED';
	appliedAt: string;
	updatedAt: string;
	user: {
		id: string;
		name: string;
		email: string;
		phone?: string | null;
	};
	job?: {
		id: string;
		title: string;
	};
};

export type EmployerJob = JobSummary;

export async function getEmployerAnalytics() {
	const res = await api.get('/employer/analytics');
	return (res.data?.data?.stats ?? res.data?.stats ?? res.data) as EmployerStats;
}

export async function getEmployerJobs() {
	const res = await api.get('/employer/jobs');
	if (Array.isArray(res.data)) {
		return res.data as EmployerJob[];
	}

	return (res.data?.data?.jobs ?? res.data?.jobs ?? []) as EmployerJob[];
}

export async function getApplicantsForJob(jobId: string) {
	const res = await api.get(`/employer/jobs/${jobId}/applicants`);
	if (Array.isArray(res.data)) {
		return res.data as EmployerApplicant[];
	}

	return (res.data?.data?.applications ?? res.data?.applications ?? []) as EmployerApplicant[];
}

export async function createEmployerJob(payload: CreateJobPayload) {
	const res = await api.post('/employer/jobs', {
		...payload,
		salaryMin: payload.salaryMin === '' ? undefined : payload.salaryMin == null ? undefined : Number(payload.salaryMin),
		salaryMax: payload.salaryMax === '' ? undefined : payload.salaryMax == null ? undefined : Number(payload.salaryMax),
	});
	return (res.data?.data?.job ?? res.data?.job ?? res.data) as EmployerJob;
}

export async function updateApplicationStage(applicationId: string, stage: EmployerApplicant['status']) {
	const res = await api.patch(`/employer/applications/${applicationId}/stage`, { status: stage });
	return (res.data?.data?.application ?? res.data?.application ?? res.data) as EmployerApplicant;
}
