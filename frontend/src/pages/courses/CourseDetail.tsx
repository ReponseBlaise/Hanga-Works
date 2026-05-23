import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { CourseProgressBar } from '../../components/learning/CourseProgressBar';
import { Quiz } from '../../components/learning/Quiz';
import { Button } from '../../components/ui/Button';
import { Card, CardEyebrow, CardMeta, CardTitle } from '../../components/ui/Card';
import { categoryLabels, getCourseById, levelLabels } from '../../data/courses';

export function CourseDetail() {
	const { id } = useParams<{ id: string }>();
	const course = id ? getCourseById(id) : undefined;
	const [progress, setProgress] = useState(course?.progress ?? 0);
	const [quizScore, setQuizScore] = useState<number | null>(null);

	const completedLessons = useMemo(
		() => course?.modules.filter((module) => module.completed).length ?? 0,
		[course],
	);

	if (!course) {
		return (
			<DashboardLayout>
				<Card className="courses-empty">
					<CardTitle>Course not found</CardTitle>
					<CardMeta>The course you are looking for does not exist or was removed.</CardMeta>
					<Button to="/courses" variant="primary">
						Back to courses
					</Button>
				</Card>
			</DashboardLayout>
		);
	}

	const activeCourse = course;

	function markModuleComplete(moduleId: string) {
		const moduleIndex = activeCourse.modules.findIndex((m) => m.id === moduleId);
		if (moduleIndex < 0) return;
		const increment = Math.round(100 / activeCourse.modules.length);
		setProgress((prev) => Math.min(100, prev + (prev < 100 ? increment : 0)));
	}

	return (
		<DashboardLayout>
			<div className="course-detail">
				<Link to="/courses" className="course-detail__back">
					← Back to courses
				</Link>

				<section className="course-detail__hero card">
					<div className="course-detail__hero-copy">
						<CardEyebrow>
							{categoryLabels[activeCourse.category]} · {levelLabels[activeCourse.level]} · {activeCourse.provider}
						</CardEyebrow>
						<h2 className="course-detail__title">{activeCourse.title}</h2>
						<p className="card-meta">{activeCourse.description}</p>
						<div className="course-detail__tags">
							{activeCourse.skills.map((skill) => (
								<span key={skill}>{skill}</span>
							))}
						</div>
						<p className="course-detail__meta">
							{activeCourse.duration} · {activeCourse.lessons} lessons · {activeCourse.modules.length} modules
						</p>
					</div>
					<div className="course-detail__hero-panel">
						<CourseProgressBar
							value={progress}
							completedLessons={completedLessons}
							totalLessons={activeCourse.modules.length}
						/>
						{quizScore !== null ? (
							<p className="course-detail__quiz-note">Latest quiz score: {quizScore}%</p>
						) : null}
						<Button type="button" variant="primary" onClick={() => setProgress((p) => Math.min(100, p + 10))}>
							{progress >= 100 ? 'Completed' : 'Mark progress +10%'}
						</Button>
					</div>
				</section>

				<section className="dashboard-section">
					<div className="section-head">
						<div>
							<p className="section-head__eyebrow">Curriculum</p>
							<h2>Course modules</h2>
						</div>
					</div>
					<div className="course-module-list">
						{activeCourse.modules.map((module, index) => (
							<Card key={module.id} className="course-module-card">
								<div className="course-module-card__top">
									<div>
										<CardEyebrow>Module {index + 1}</CardEyebrow>
										<CardTitle>{module.title}</CardTitle>
									</div>
									<span className={`course-module-card__status ${module.completed ? 'is-done' : ''}`.trim()}>
										{module.completed ? 'Completed' : 'Up next'}
									</span>
								</div>
								<CardMeta>{module.duration}</CardMeta>
								<div className="course-module-card__actions">
									<Button type="button" variant="secondary" onClick={() => markModuleComplete(module.id)}>
										{module.completed ? 'Review lesson' : 'Start lesson'}
									</Button>
								</div>
							</Card>
						))}
					</div>
				</section>

				<section className="dashboard-section">
					<Card className="course-quiz-card">
						<Quiz
							quiz={activeCourse.quiz}
							onSubmit={(score) => setQuizScore(score)}
						/>
					</Card>
				</section>
			</div>
		</DashboardLayout>
	);
}
