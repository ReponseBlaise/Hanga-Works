export type PublicRegisterRole = 'LEARNER' | 'EMPLOYER' | 'INSTITUTION' | 'MENTOR';

export const REGISTER_ROLES: Array<{ value: PublicRegisterRole; label: string; description: string }> = [
  { value: 'LEARNER', label: 'Job seeker', description: 'Find jobs and grow your skills' },
  { value: 'EMPLOYER', label: 'Employer', description: 'Post jobs and hire talent' },
  { value: 'INSTITUTION', label: 'Training provider', description: 'Publish courses and track learners' },
  { value: 'MENTOR', label: 'Mentor', description: 'Guide learners and offer sessions' },
];
