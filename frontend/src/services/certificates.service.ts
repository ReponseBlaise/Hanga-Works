import api from './api';

export type LearnerCertificate = {
	id: string;
	courseId: string;
	courseTitle: string;
	issuedAt: string;
	pdfUrl?: string | null;
	verifyToken: string;
	verifyUrl: string;
};

export async function getMyCertificates() {
	const res = await api.get('/certificates');
	return res.data as LearnerCertificate[];
}

export async function verifyCertificate(token: string) {
	const res = await api.get(`/certificates/verify/${token}`);
	return res.data as LearnerCertificate;
}
