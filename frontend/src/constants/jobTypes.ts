export const JOB_TYPE_OPTIONS = [
  { value: 'FULL_TIME', label: 'Full time' },
  { value: 'PART_TIME', label: 'Part time' },
  { value: 'REMOTE', label: 'Remote' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'FREELANCE', label: 'Freelance' },
] as const;

export type JobTypeValue = (typeof JOB_TYPE_OPTIONS)[number]['value'];

export function formatJobType(value: string) {
  return JOB_TYPE_OPTIONS.find((item) => item.value === value)?.label ?? value.replace(/_/g, ' ').toLowerCase();
}
