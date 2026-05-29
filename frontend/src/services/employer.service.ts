import api from './api';
import type { CreateJobPayload, JobSummary } from './jobs.service';
import { getApplications, getJobs } from './jobs.service';

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
	const [jobsResult, applications] = await Promise.all([
		getJobs({ page: 1, perPage: 200 }),
		getApplications(),
	]);

	const breakdown = applications.reduce((acc, item) => {
		acc[item.status] = (acc[item.status] ?? 0) + 1;
		return acc;
	}, {} as EmployerStats['breakdown']);

	return {
		totalJobs: jobsResult.jobs.length,
		totalApplicants: applications.length,
		breakdown,
	} satisfies EmployerStats;
}

export async function getEmployerJobs() {
	const res = await getJobs({ page: 1, perPage: 200 });
	return res.jobs as EmployerJob[];
}

export async function getApplicantsForJob(jobId: string) {
	const applications = await getApplications();
	return applications.filter((application) => application.job?.id === jobId) as EmployerApplicant[];
}

export async function createEmployerJob(payload: CreateJobPayload) {
	const res = await api.post('/jobs', {
		...payload,
		salaryMin: payload.salaryMin === '' ? undefined : payload.salaryMin == null ? undefined : Number(payload.salaryMin),
		salaryMax: payload.salaryMax === '' ? undefined : payload.salaryMax == null ? undefined : Number(payload.salaryMax),
	});
	return (res.data?.data?.job ?? res.data?.job ?? res.data) as EmployerJob;
}

export async function updateApplicationStage(applicationId: string, stage: EmployerApplicant['status']) {
	const res = await api.patch(`/applications/${applicationId}/status`, { status: stage });
	return (res.data?.data?.application ?? res.data?.application ?? res.data) as EmployerApplicant;
}
