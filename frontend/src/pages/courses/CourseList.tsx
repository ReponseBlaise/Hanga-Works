import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { Button } from '../../components/ui/Button';
import { Card, CardEyebrow, CardMeta, CardTitle } from '../../components/ui/Card';
import { getCourses, type BackendCourse } from '../../services/courses.service';

export function CourseList() {
	const [search, setSearch] = useState('');
	const [courses, setCourses] = useState<BackendCourse[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let active = true;
		getCourses()
			.then((items) => {
				if (active) setCourses(items ?? []);
			})
			.catch((error) => {
				console.error('Failed to load courses', error);
				if (active) setCourses([]);
			})
			.finally(() => {
				if (active) setLoading(false);
			});

		return () => {
			active = false;
		};
	}, []);

	const filteredCourses = useMemo(() => {
		const query = search.trim().toLowerCase();
		return courses.filter((course) => {
			const matchesSearch =
				!query ||
				course.title.toLowerCase().includes(query) ||
				course.description.toLowerCase().includes(query) ||
				course.institution?.name?.toLowerCase().includes(query) ||
				(course.skills ?? []).some((skill) => skill.skill.name.toLowerCase().includes(query));
			return matchesSearch;
		});
	}, [courses, search]);

	const totalEnrollments = useMemo(
		() => courses.reduce((sum, course) => sum + (course._count?.enrollments ?? 0), 0),
		[courses],
	);

	return (
		<SiteLayout>
			<div className="courses-page">
				<section className="courses-hero card">
					<div>
						<p className="section-head__eyebrow">Learning</p>
						<h2 className="courses-hero__title">Browse courses</h2>
						<p className="card-meta">Search database-backed courses by title, description, institution, or skill.</p>
					</div>
					<div className="courses-hero__visual">
						<img
							src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80"
							alt="People collaborating on learning goals"
							className="courses-hero__image"
							loading="lazy"
						/>
						<div className="courses-hero__visual-caption">
							<strong>Live learning feed</strong>
							<span>Courses are loaded directly from the LMS database.</span>
						</div>
					</div>
					<div className="courses-hero__stats">
						<div className="hero-stat">
							<span>Published courses</span>
							<strong>{courses.length}</strong>
							<p>Loaded from the backend</p>
						</div>
						<div className="hero-stat">
							<span>Total enrollments</span>
							<strong>{totalEnrollments}</strong>
							<p>Counted from the LMS tables</p>
						</div>
						<div className="hero-stat">
							<span>Paid learning</span>
							<strong>Pricing</strong>
							<p>See plan details for premium courses and team access.</p>
						</div>
					</div>
				</section>

				<section className="courses-toolbar card">
					<label className="courses-search">
						<span className="courses-search__label">Search courses</span>
						<input
							type="search"
							placeholder="Search by title, description, institution, or skill..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</label>
				</section>

				<section className="courses-results">
					<p className="courses-results__count">
						{filteredCourses.length} course{filteredCourses.length === 1 ? '' : 's'} found
					</p>
					{loading ? <p>Loading courses…</p> : null}
					<div className="courses-results__actions">
						<Button to="/pricing" variant="secondary">
							View pricing
						</Button>
					</div>

					{filteredCourses.length === 0 ? (
						<Card className="courses-empty">
							<CardTitle>No courses match your filters</CardTitle>
							<CardMeta>Try a broader keyword or clear the search field.</CardMeta>
						</Card>
					) : (
						<div className="courses-grid">
							{filteredCourses.map((course) => {
								return (
									<Card key={course.id} className="course-list-card">
										<div className="course-list-card__top">
											<div>
												<CardEyebrow>{course.institution?.name ?? 'Hanga Works'}</CardEyebrow>
												<CardTitle>
													<Link to={`/courses/${course.id}`}>{course.title}</Link>
												</CardTitle>
											</div>
											<span className="course-list-card__provider">{course.published ? 'Published' : 'Draft'}</span>
										</div>
										<CardMeta>{course.description}</CardMeta>
										<div className="course-list-card__tags">
											{(course.skills ?? []).map((skill) => (
												<span key={skill.id}>{skill.skill.name}</span>
											))}
										</div>
										<p className="course-list-card__meta">
											{course._count?.modules ?? course.modules?.length ?? 0} modules · {course._count?.enrollments ?? 0} enrollments
										</p>
										<div className="course-list-card__actions">
											<Button to={`/courses/${course.id}`} variant="primary">
												View course
											</Button>
										</div>
									</Card>
								);
							})}
						</div>
					)}
				</section>
			</div>
		</SiteLayout>
	);
}
