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

export async function getCourses() {
	const res = await api.get('/courses');
	return res.data as BackendCourse[];
}

export async function getCourseById(id: string) {
	const res = await api.get(`/courses/${id}`);
	return res.data as BackendCourse;
}

export async function enrollInCourse(courseId: string) {
	const res = await api.post('/enrollments', { courseId });
	return res.data;
}

export async function updateLessonProgress(enrollmentId: string, progress?: number, completed?: boolean) {
	const res = await api.patch(`/progress/${enrollmentId}`, { progress, completed });
	return res.data;
}
