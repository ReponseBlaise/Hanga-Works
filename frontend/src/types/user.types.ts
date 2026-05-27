export type Proficiency = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export type ProfileSkill = {
	id: string;
	name: string;
	proficiency: Proficiency;
};

export type ProfileExperience = {
	id: string;
	title: string;
	company: string;
	startDate: string;
	endDate?: string | null;
	description: string;
};

export type ProfileCertificate = {
	id: string;
	courseTitle: string;
	issuedAt: string;
	pdfUrl?: string | null;
	verifyToken: string;
	verifyUrl: string;
};

export type UserProfile = {
	id: string;
	name: string;
	email: string;
	username: string;
	role?: string;
	headline: string;
	bio: string;
	location: string;
	avatarUrl?: string | null;
	skills: ProfileSkill[];
	experience: ProfileExperience[];
	certificates: ProfileCertificate[];
};

