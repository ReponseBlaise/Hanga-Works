import api from './api';

export async function getAdminUsers() {
  const response = await api.get('/admin/moderation/users');
  return response.data?.data ?? response.data;
}

export async function getAdminUserDetail(id: string) {
  const response = await api.get(`/admin/moderation/users/${id}`);
  return response.data?.data ?? response.data;
}

export async function updateAdminUserStatus(id: string, status: string) {
  const response = await api.patch(`/admin/moderation/users/${id}/status`, { status });
  return response.data?.data ?? response.data;
}

export async function getAdminJobs() {
  const response = await api.get('/admin/moderation/jobs');
  return response.data?.data ?? response.data;
}

export async function updateAdminJobStatus(id: string, isActive: boolean) {
  const response = await api.patch(`/admin/moderation/jobs/${id}/status`, { isActive });
  return response.data?.data ?? response.data;
}

export async function getAdminCourses() {
  const response = await api.get('/admin/moderation/courses');
  return response.data?.data ?? response.data;
}

export async function updateAdminCourseStatus(id: string, published: boolean) {
  const response = await api.patch(`/admin/moderation/courses/${id}/status`, { published });
  return response.data?.data ?? response.data;
}
