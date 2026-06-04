import api from './api';

export type AnalyticsOverview = {
	dau: number;
	mau: number;
	totalUsers: number;
	totalEnrollments: number;
	completedEnrollments: number;
	completionRate: string;
	activeJobs: number;
	totalApplications: number;
	totalCertifications: number;
};

export async function getAnalyticsOverview() {
	const response = await api.get('/analytics/overview');
	return response.data as AnalyticsOverview;
}

export async function exportAnalyticsCsv() {
	const response = await api.get('/analytics/export', {
		params: { format: 'csv' },
		responseType: 'blob',
	});

	return response.data as Blob;
}
