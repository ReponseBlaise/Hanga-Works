import api from './api';

export type ProfileSetupStatus = {
  complete: boolean;
  completedSteps: number;
  totalSteps: number;
  percentComplete: number;
  missing: string[];
};

export async function getProfileSetupStatus() {
  const res = await api.get('/users/me/setup');
  const data = res.data?.data ?? res.data;
  return data as ProfileSetupStatus;
}
