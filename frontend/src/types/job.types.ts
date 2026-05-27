export type JobType = 'FULL_TIME' | 'PART_TIME' | 'REMOTE' | 'HYBRID' | 'INTERNSHIP' | 'FREELANCE';

export type JobEmployer = {
	id: string;
	name: string;
	website?: string | null;
	branding?: string | null;
};

export type JobSummary = {
	id: string;
	title: string;
	slug: string;
	description: string;
	location?: string | null;
	jobType: JobType;
	salaryMin?: number | null;
	salaryMax?: number | null;
	isActive?: boolean;
	employer: JobEmployer;
	postedAt?: string;
	updatedAt?: string;
	expiresAt?: string | null;
	_count?: { applications: number };
	matchScore?: number;
	remoteOnly?: boolean;
	featured?: boolean;
};

export type JobApplicationStage = 'APPLIED' | 'REVIEWING' | 'SHORTLISTED' | 'HIRED' | 'REJECTED';

export type JobApplication = {
	id: string;
	status: JobApplicationStage;
	appliedAt: string;
	updatedAt: string;
	job: Pick<JobSummary, 'id' | 'title' | 'slug' | 'location' | 'employer'>;
	user?: {
		id: string;
		name: string;
		email: string;
	};
};

export type JobFilterState = {
	search: string;
	location: string;
	jobType: 'ALL' | JobType;
	remoteOnly: boolean;
};

