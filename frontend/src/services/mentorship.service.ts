import { api } from './api';
import type { UserProfile as User } from '../types/user.types';

export interface MentorProfile {
  id: string;
  userId: string;
  expertise: string;
  bio?: string;
  hourlyRate?: number;
  availability?: string;
  createdAt: string;
  updatedAt: string;
  user?: Partial<User>;
}

export interface MentorSession {
  id: string;
  mentorId: string;
  menteeId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
  scheduledAt: string;
  durationMinutes: number;
  meetingLink?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  mentor?: { user: Partial<User> };
  mentee?: Partial<User>;
}

export interface CreateMentorDto {
  expertise: string;
  bio?: string;
  hourlyRate?: number;
  availability?: string;
}

export interface BookSessionDto {
  mentorId: string;
  scheduledAt: string;
  durationMinutes?: number;
}

export async function createProfile(data: CreateMentorDto): Promise<MentorProfile> {
  const response = await api.post('/mentorship/profile', data);
  return response.data?.data ?? response.data;
}

export async function getMentors(): Promise<MentorProfile[]> {
  const response = await api.get('/mentorship/mentors');
  return response.data?.data ?? response.data;
}

export async function bookSession(data: BookSessionDto): Promise<MentorSession> {
  const response = await api.post('/mentorship/sessions/book', data);
  return response.data?.data ?? response.data;
}

export async function getMySessions(): Promise<MentorSession[]> {
  const response = await api.get('/mentorship/sessions');
  return response.data?.data ?? response.data;
}

export async function createInstitutionMentor(data: { name: string, email: string, expertise: string, hourlyRate?: number }) {
  const response = await api.post('/mentorship/create', data);
  return response.data?.data ?? response.data;
}
