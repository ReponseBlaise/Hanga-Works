import api from './api';
import type { CreateJobPayload, JobSummary, JobType } from './jobs.service';

export type EmployerStats = {
	totalJobs: number;
	totalApplications: number;
	pendingReview: number;
	shortlisted: number;
	hired: number;
};

export type EmployerApplicant = {
	id: string;
	status: 'APPLIED' | 'REVIEWING' | 'SHORTLISTED' | 'HIRED' | 'REJECTED';
	appliedAt: string;
	updatedAt: string;
	job: {
		id: string;
		title: string;
		location?: string | null;
	};
	user: {
		id: string;
		name: string;
		email: string;
	};
};

export type EmployerJob = JobSummary;

export async function getEmployerAnalytics() {
	const res = await api.get('/employer/analytics');
	return res.data?.data?.stats as EmployerStats;
}

export async function getEmployerJobs() {
	const res = await api.get('/jobs');
	return res.data?.data?.jobs as EmployerJob[];
}

export async function getApplicantsForJob(jobId: string) {
	const res = await api.get(`/employer/jobs/${jobId}/applicants`);
	return res.data?.data?.applications as EmployerApplicant[];
}

export async function createEmployerJob(payload: CreateJobPayload) {
	const res = await api.post('/employer/jobs', payload);
	return res.data?.data?.job as EmployerJob;
}

export async function updateApplicationStage(applicationId: string, stage: EmployerApplicant['status']) {
	const res = await api.patch(`/employer/applications/${applicationId}/stage`, { stage });
	return res.data?.data?.application as EmployerApplicant;
}
