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

export async function getCourseById(id: string) {
	const res = await api.get(`/courses/${id}`);
	const payload = res.data?.data ?? res.data;
	return (payload?.course ?? payload) as BackendCourse;
}

export async function enrollInCourse(courseId: string) {
	const res = await api.post('/enrollments', { courseId });
	return (res.data?.data?.enrollment ?? res.data?.enrollment ?? res.data) as CourseEnrollment;
}

export async function updateLessonProgress(enrollmentId: string, progress?: number) {
	const res = await api.patch(`/progress/${enrollmentId}`, { progress });
	return (res.data?.data ?? res.data) as CourseEnrollment;
}

export async function getMyProgress() {
	const res = await api.get('/progress');
	if (Array.isArray(res.data)) {
		return res.data as CourseEnrollment[];
	}

	return (res.data?.data?.progress ?? res.data?.progress ?? []) as CourseEnrollment[];
}

export async function submitQuiz(moduleId: string, payload: { answers: Array<{ questionId: string; answerIndex: number }> }) {
	const res = await api.post(`/quiz/${moduleId}/submit`, payload);
	return res.data?.data ?? res.data;
}
