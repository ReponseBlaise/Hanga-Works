import api from './api';

export type BackendCourseSkill = {
	id: string;
	skill: {
		id: string;
		name: string;
		tag?: string | null;
	};
};

export type BackendCourseModule = {
	id: string;
	title: string;
	content?: string | null;
	videoUrl?: string | null;
	order: number;
};

export type BackendCourse = {
	id: string;
	title: string;
	slug: string;
	description: string;
	thumbnailUrl?: string | null;
	published: boolean;
	isPremium: boolean;
	price?: number | null;
	currency?: string | null;
	createdAt: string;
	updatedAt: string;
	institution?: {
		id: string;
		name: string;
		website?: string | null;
	} | null;
	skills?: BackendCourseSkill[];
	modules?: BackendCourseModule[];
	_count?: {
		enrollments?: number;
		modules?: number;
	};
};

export type CreateCoursePayload = {
	title: string;
	slug: string;
	description: string;
	published?: boolean;
	thumbnailUrl?: string;
	institutionId?: string;
	isPremium?: boolean;
	price?: number;
	currency?: string;
};

export type PaymentRecord = {
	id: string;
	txRef: string;
	transactionId?: string | null;
	amount: number;
	currency: string;
	status: 'PENDING' | 'COMPLETED' | 'FAILED';
	provider: string;
	createdAt: string;
	course: {
		id: string;
		title: string;
		slug: string;
		thumbnailUrl?: string | null;
	};
};

export type CreateModulePayload = {
	title: string;
	content?: string;
	videoUrl?: string;
	order?: number;
};

export type UpdateModulePayload = Partial<CreateModulePayload>;

export type CourseEnrollment = {
	id: string;
	progress: number;
	status: 'ENROLLED' | 'IN_PROGRESS' | 'COMPLETED' | 'DROPPED';
	lastModuleId?: string | null;
	startedAt: string;
	completedAt?: string | null;
	updatedAt?: string;
	course: {
		id: string;
		title: string;
		slug: string;
		thumbnailUrl?: string | null;
	};
	lastModule?: {
		id: string;
		title: string;
		order: number;
	} | null;
};

export async function getCourses() {
	const res = await api.get('/courses');
	return res.data as BackendCourse[];
}

export async function getManageableCourses() {
	const res = await api.get('/courses/manage');
	return res.data as BackendCourse[];
}

export async function getCourseById(id: string) {
	const res = await api.get(`/courses/${id}`);
	const payload = res.data?.data ?? res.data;
	return (payload?.course ?? payload) as BackendCourse;
}

export async function createCourse(payload: CreateCoursePayload) {
	const res = await api.post('/courses', payload);
	const data = res.data?.data ?? res.data;
	return (data?.course ?? data) as BackendCourse;
}

export async function createCourseModule(courseId: string, payload: CreateModulePayload) {
	const res = await api.post(`/courses/${courseId}/modules`, payload);
	const data = res.data?.data ?? res.data;
	return data as BackendCourseModule;
}

export async function updateCourseModule(courseId: string, moduleId: string, payload: UpdateModulePayload) {
	const res = await api.patch(`/courses/${courseId}/modules/${moduleId}`, payload);
	const data = res.data?.data ?? res.data;
	return data as BackendCourseModule;
}

export async function deleteCourseModule(courseId: string, moduleId: string) {
	const res = await api.delete(`/courses/${courseId}/modules/${moduleId}`);
	const data = res.data?.data ?? res.data;
	return data;
}

export async function uploadModuleMedia(
	file: File, 
	purpose: 'course-video' | 'course-document' | 'course-thumbnail', 
	courseId?: string, 
	moduleId?: string
): Promise<{ publicUrl: string; provider: string; format: string; resourceType: string }> {
	const formData = new FormData();
	formData.append('file', file);

	let url = `/media/upload?purpose=${purpose}`;
	if (courseId) url += `&courseId=${courseId}`;
	if (moduleId) url += `&moduleId=${moduleId}`;

	const res = await api.post(url, formData, {
		headers: {
			'Content-Type': 'multipart/form-data',
		},
	});
	return res.data?.data ?? res.data;
}

export async function uploadIntelligenceMedia(file: File, purpose: 'course-video' | 'course-document', courseId: string) {
	const formData = new FormData();
	formData.append('file', file);
	formData.append('purpose', purpose);
	formData.append('courseId', courseId);
	const res = await api.post('/api/v1/intelligence/upload', formData, {
		headers: { 'Content-Type': 'multipart/form-data' }
	});
	return res.data?.data ?? res.data;
}

export async function createCourseTest(courseId: string, testData: any) {
	const res = await api.post(`/api/v1/courses/${courseId}/test`, testData);
	return res.data?.data ?? res.data;
}

export async function getCourseTest(courseId: string) {
	const res = await api.get(`/api/v1/courses/${courseId}/test`);
	return res.data?.data ?? res.data;
}

export async function submitTestAttempt(courseId: string, answers: Record<string, string>) {
	const res = await api.post(`/api/v1/courses/${courseId}/test/attempt`, { answers });
	return res.data?.data ?? res.data;
}

export async function enrollInCourse(courseId: string) {
	const res = await api.post('/enrollments', { courseId });
	return (res.data?.data?.enrollment ?? res.data?.enrollment ?? res.data) as CourseEnrollment;
}

function normalizeEnrollment(payload: unknown): CourseEnrollment {
	const raw = (payload as { enrollment?: CourseEnrollment })?.enrollment ?? payload;
	return raw as CourseEnrollment;
}

export async function updateLessonProgress(
	enrollmentId: string,
	payload: { progress?: number; lastModuleId?: string },
) {
	const res = await api.patch(`/progress/${enrollmentId}`, payload);
	const data = res.data?.data ?? res.data;
	return normalizeEnrollment(data?.enrollment ?? data);
}

export async function getMyProgress() {
	const res = await api.get('/progress');
	const data = res.data?.data ?? res.data;
	if (Array.isArray(data)) {
		return data as CourseEnrollment[];
	}
	if (Array.isArray(data?.progress)) {
		return data.progress as CourseEnrollment[];
	}
	return (data?.enrollments ?? []) as CourseEnrollment[];
}

export async function verifyPayment(payload: {
	txRef: string;
	transactionId: string;
	courseId: string;
}): Promise<{ success: boolean; payment: PaymentRecord; enrollment: CourseEnrollment; message: string }> {
	const res = await api.post('/payments/verify', payload);
	return res.data?.data ?? res.data;
}

export async function getMyPayments(): Promise<PaymentRecord[]> {
	const res = await api.get('/payments');
	const data = res.data?.data ?? res.data;
	return Array.isArray(data) ? data : [];
}

export async function submitQuiz(
	moduleId: string,
	payload: { enrollmentId: string; score: number },
) {
	const res = await api.post(`/quiz/${moduleId}/submit`, payload);
	const data = res.data?.data ?? res.data;
	return {
		...data,
		enrollment: data?.enrollment ? normalizeEnrollment(data.enrollment) : undefined,
	} as {
		passed: boolean;
		score: number;
		required: number;
		message: string;
		enrollment?: CourseEnrollment;
	};
}
