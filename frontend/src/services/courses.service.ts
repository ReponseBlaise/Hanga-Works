import api from './api';

export type BackendCourse = {
	id: string;
	title: string;
	slug: string;
	description: string;
	thumbnailUrl?: string | null;
	published: boolean;
	createdAt: string;
	updatedAt: string;
};

export async function getCourses() {
	const res = await api.get('/courses');
	return res.data?.data?.courses as BackendCourse[];
}

export async function getCourseById(id: string) {
	const res = await api.get(`/courses/${id}`);
	return res.data?.data?.course as BackendCourse;
}

export async function enrollInCourse(courseId: string) {
	const res = await api.post('/courses/enroll', { courseId });
	return res.data?.data?.enrollment;
}

export async function updateLessonProgress(enrollmentId: string, progress?: number, completed?: boolean) {
	const res = await api.post('/courses/progress', { enrollmentId, progress, completed });
	return res.data?.data;
}
