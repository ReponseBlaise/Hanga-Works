import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { Quiz } from '../../components/learning/Quiz';
import { Button } from '../../components/ui/Button';
import { Card, CardEyebrow, CardMeta, CardTitle } from '../../components/ui/Card';
import { getCourseById, type BackendCourse } from '../../services/courses.service';

export function CourseDetail() {
	const { id } = useParams<{ id: string }>();
	const [course, setCourse] = useState<BackendCourse | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		if (!id) return;
		let active = true;
		setLoading(true);
		setError('');

		getCourseById(id)
			.then((item) => {
				if (active) setCourse(item ?? null);
			})
			.catch((fetchError) => {
				console.error(fetchError);
				if (active) setError('This course could not be loaded.');
			})
			.finally(() => {
				if (active) setLoading(false);
			});

		return () => {
			active = false;
		};
	}, [id]);

	if (loading) {
		return (
			<SiteLayout>
				<Card className="courses-empty">
					<CardTitle>Loading course…</CardTitle>
					<CardMeta>Fetching the live record from the backend.</CardMeta>
				</Card>
			</SiteLayout>
		);
	}

	if (error) {
		return (
			<SiteLayout>
				<Card className="courses-empty">
					<CardTitle>{error}</CardTitle>
					<CardMeta>The course may have been unpublished or the identifier is invalid.</CardMeta>
					<Button to="/courses" variant="primary">Back to courses</Button>
				</Card>
			</SiteLayout>
		);
	}

	if (!course) {
		return null;
	}

	return (
		<SiteLayout>
			<div className="course-detail">
				<Link to="/courses" className="course-detail__back">
					← Back to courses
				</Link>

				<section className="course-detail__hero card">
					<div className="course-detail__hero-copy">
						<CardEyebrow>{course.institution?.name ?? 'Hanga Works'} · {course.published ? 'Published' : 'Draft'}</CardEyebrow>
						<h2 className="course-detail__title">{course.title}</h2>
						<p className="card-meta">{course.description}</p>
						<div className="course-detail__tags">
							{(course.skills ?? []).map((skill) => (
								<span key={skill.id}>{skill.skill.name}</span>
							))}
						</div>
						<p className="course-detail__meta">
							{course._count?.modules ?? course.modules?.length ?? 0} modules · {course._count?.enrollments ?? 0} enrollments
						</p>
					</div>
					<div className="course-detail__hero-panel">
						{course.thumbnailUrl ? <img src={course.thumbnailUrl} alt={course.title} className="course-detail__thumbnail" /> : null}
						<CardMeta>{course.institution?.website ?? 'No public institution website provided'}</CardMeta>
						<Button variant="primary" to="/courses">Back to courses</Button>
					</div>
				</section>

				<section className="dashboard-section">
					<div className="section-head">
						<div>
							<p className="section-head__eyebrow">Curriculum</p>
							<h2>Course modules from the database</h2>
						</div>
					</div>
					<div className="course-module-list">
						{(course.modules ?? []).map((module) => (
							<Card key={module.id} className="course-module-card">
								<div className="course-module-card__top">
									<div>
										<CardEyebrow>Module {module.order}</CardEyebrow>
										<CardTitle>{module.title}</CardTitle>
									</div>
								</div>
								<CardMeta>{module.content ?? 'Module content stored in the backend.'}</CardMeta>
								{module.videoUrl ? <CardMeta>{module.videoUrl}</CardMeta> : null}
							</Card>
						))}
					</div>
				</section>
			</div>
		</SiteLayout>
	);
}
