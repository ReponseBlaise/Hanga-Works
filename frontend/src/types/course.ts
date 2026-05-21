export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type CourseCategory = 'development' | 'career' | 'analytics' | 'design';

export type QuizQuestion = {
	id: string;
	question: string;
	options: string[];
	correctIndex: number;
};

export type CourseModule = {
	id: string;
	title: string;
	duration: string;
	completed: boolean;
};

export type CourseQuiz = {
	title: string;
	passingScore: number;
	questions: QuizQuestion[];
};

export type Course = {
	id: string;
	slug: string;
	title: string;
	description: string;
	summary: string;
	provider: string;
	category: CourseCategory;
	level: CourseLevel;
	duration: string;
	lessons: number;
	progress: number;
	enrolled: boolean;
	skills: string[];
	modules: CourseModule[];
	quiz: CourseQuiz;
};
