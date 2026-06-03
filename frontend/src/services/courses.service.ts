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
	startedAt: string;
	completedAt?: string | null;
	course: {
		id: string;
		title: string;
		slug: string;
	};
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

export async function uploadModuleMedia(file: File, purpose: 'course-video' | 'course-document' | 'course-thumbnail', courseId?: string, moduleId?: string): Promise<{ publicUrl: string; provider: string; format: string; resourceType: string }> {
	const formData = new FormData();
	formData.append('file', file);
	formData.append('purpose', purpose);
	if (courseId) formData.append('courseId', courseId);
	if (moduleId) formData.append('moduleId', moduleId);

	const res = await api.post('/media/upload', formData, {
		headers: {
			'Content-Type': 'multipart/form-data',
		},
	});
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

export async function updateLessonProgress(enrollmentId: string, progress?: number) {
	const res = await api.patch(`/progress/${enrollmentId}`, { progress });
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
