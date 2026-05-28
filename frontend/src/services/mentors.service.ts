import api from './api';

export type MentorSummary = {
  id: string;
  name: string;
  title?: string;
  bio?: string;
  skills?: string[];
  availability?: string[];
};

export async function getMentors() {
  // Attempt backend call; fall back to empty array on error
  try {
    const res = await api.get('/mentors');
    return res.data?.data?.mentors as MentorSummary[];
  } catch (e) {
    return [] as MentorSummary[];
  }
}

export async function getMentorById(id: string) {
  try {
    const res = await api.get(`/mentors/${id}`);
    return res.data?.data?.mentor as MentorSummary | null;
  } catch (e) {
    return null;
  }
}

export async function bookSession(mentorId: string, payload: { date: string; notes?: string }) {
  const res = await api.post(`/mentors/${mentorId}/book`, payload);
  return res.data;
}
