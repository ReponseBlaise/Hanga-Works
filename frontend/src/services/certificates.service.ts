import api from './api';

export type LearnerCertificate = {
	id: string;
	courseId: string;
	courseTitle: string;
	issuedAt: string;
	pdfUrl?: string | null;
	code: string;
	verifyUrl: string;
};

export async function getMyCertificates() {
	const res = await api.get('/certificates');
	if (Array.isArray(res.data)) {
		return res.data as LearnerCertificate[];
	}

	return (res.data?.data?.certificates ?? res.data?.certificates ?? []) as LearnerCertificate[];
}

export async function getManageableCertificates() {
	const res = await api.get('/certificates/manage');
	if (Array.isArray(res.data)) {
		return res.data;
	}
	return res.data?.data ?? [];
}

export async function verifyCertificate(token: string) {
	const res = await api.get(`/certificates/verify/${token}`);
	return (res.data?.data?.certificate ?? res.data?.certificate ?? res.data) as LearnerCertificate;
}

export async function validateCertificate(token: string) {
	const res = await api.post('/certificates/validate', { token });
	return res.data?.data ?? res.data;
}
