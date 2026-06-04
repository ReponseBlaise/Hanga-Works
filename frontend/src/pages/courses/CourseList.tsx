import { useEffect, useMemo, useState } from 'react';
import { BsFillGrid3X3GapFill, BsListUl } from 'react-icons/bs';
import { MdSchool, MdGroups, MdCheckCircle, MdMenuBook } from 'react-icons/md';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { Button } from '../../components/ui/Button';
import { Card, CardEyebrow, CardMeta, CardTitle } from '../../components/ui/Card';
import { getCourses, getManageableCourses, getMyProgress, type BackendCourse } from '../../services/courses.service';
import { useAuth } from '../../context/AuthContext';

export function CourseList() {
	const { isAuthenticated, user } = useAuth();
	const [search, setSearch] = useState('');
	const [courses, setCourses] = useState<BackendCourse[]>([]);
	const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(new Set());
	const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
	const [publishFilter, setPublishFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
	const [loading, setLoading] = useState(true);
	const canCreateCourse = ['ADMIN', 'INSTITUTION'].includes((user?.role ?? '').toUpperCase());

	useEffect(() => {
		let active = true;
		const fetcher = (user?.role === 'INSTITUTION') ? getManageableCourses : getCourses;
		
		fetcher()
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
	}, [user?.role]);

	useEffect(() => {
		if (!isAuthenticated) {
			if (enrolledCourseIds.size > 0) setEnrolledCourseIds(new Set());
			return;
		}

		let active = true;
		getMyProgress()
			.then((items) => {
				if (!active) return;
				setEnrolledCourseIds(new Set((items ?? []).map((item) => item.course.id)));
			})
			.catch((error) => {
				console.error('Failed to load learner enrollments for course badges', error);
				if (active) setEnrolledCourseIds(new Set());
			});

		return () => {
			active = false;
		};
	}, [isAuthenticated]);

	const filteredCourses = useMemo(() => {
		const query = search.trim().toLowerCase();
		return courses.filter((course) => {
			const matchesSearch =
				!query ||
				course.title.toLowerCase().includes(query) ||
				course.description.toLowerCase().includes(query) ||
				course.institution?.name?.toLowerCase().includes(query) ||
				(course.skills ?? []).some((skill) => skill.skill.name.toLowerCase().includes(query));
			const matchesPublish =
				publishFilter === 'ALL' ||
				(publishFilter === 'PUBLISHED' && course.published) ||
				(publishFilter === 'DRAFT' && !course.published);

			return matchesSearch && matchesPublish;
		});
	}, [courses, publishFilter, search]);

	const totalEnrollments = useMemo(
		() => courses.reduce((sum, course) => sum + (course._count?.enrollments ?? 0), 0),
		[courses],
	);

	const topSkills = useMemo(() => {
		const counts = new Map<string, number>();
		courses.forEach((course) => {
			(course.skills ?? []).forEach((skill) => {
				counts.set(skill.skill.name, (counts.get(skill.skill.name) ?? 0) + 1);
			});
		});
		return Array.from(counts.entries()).sort((left, right) => right[1] - left[1]).slice(0, 4).map(([name, count]) => ({ name, count }));
	}, [courses]);

	const enrolledCount = useMemo(
		() => courses.filter((course) => enrolledCourseIds.has(course.id)).length,
		[courses, enrolledCourseIds],
	);

	return (
		<SiteLayout>
			<section className="studio-catalog">
				<section className="studio-catalog__hero" style={{ 
					backgroundImage: "linear-gradient(to right, rgba(0, 10, 40, 0.82) 0%, rgba(0, 10, 40, 0.5) 100%), url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80')",
					backgroundSize: 'cover',
					backgroundPosition: 'center top',
					color: 'white',
				}}>
					<div className="studio-catalog__headline">
						<p className="eyebrow" style={{ color: 'rgba(255,255,255,0.8)' }}>Course catalog</p>
						<h1 className="display" style={{ color: 'white' }}>A redesigned learning marketplace with faster discovery.</h1>
						<p className="lead" style={{ color: 'rgba(255,255,255,0.9)' }}>Switch between card and row formats, combine keyword and publication filters, and jump into enrolled courses directly.</p>
						<div className="studio-action-row">
							<Button to="/jobs" variant="secondary">View jobs</Button>
							{canCreateCourse ? <Button to="/courses/new" variant="primary">Create course</Button> : null}
						</div>
					</div>
					<div className="studio-catalog__stats">
						<div><span><span className="ui-icon" aria-hidden="true"><MdSchool /></span>Total courses</span><strong style={{ color: 'white' }}>{courses.length}</strong></div>
						<div><span><span className="ui-icon" aria-hidden="true"><MdGroups /></span>Total enrollments</span><strong style={{ color: 'white' }}>{totalEnrollments}</strong></div>
						<div><span><span className="ui-icon" aria-hidden="true"><MdCheckCircle /></span>Enrolled by you</span><strong style={{ color: 'white' }}>{enrolledCount}</strong></div>
					</div>
				</section>

				<section className="studio-catalog__layout">
					<aside className="studio-catalog__filters">
							<Card className="studio-block">
								<CardEyebrow>Search and filter</CardEyebrow>
								<div className="form-stack">
									<label>
										Keyword
										<input
											type="search"
											placeholder="Title, institution, skill"
											value={search}
											onChange={(event) => setSearch(event.target.value)}
										/>
									</label>
									<label>
										Publication status
										<select value={publishFilter} onChange={(event) => setPublishFilter(event.target.value as typeof publishFilter)}>
											<option value="ALL">All</option>
											<option value="PUBLISHED">Published</option>
											<option value="DRAFT">Draft</option>
										</select>
									</label>
								</div>
								<div className="studio-action-row">
									<Button type="button" variant="ghost" onClick={() => setSearch('')}>Clear search</Button>
									<Button to="/jobs" variant="secondary">View jobs</Button>
								</div>
							</Card>

							<Card className="studio-block">
								<CardEyebrow>Skill heatmap</CardEyebrow>
								<div className="studio-chip-row">
									{topSkills.map((item) => (
										<span key={item.name} className="dashboard-chip">{item.name} · {item.count}</span>
									))}
								</div>
							</Card>
					</aside>

					<main className="studio-catalog__results">
						<div className="studio-catalog__toolbar">
							<div>
								<p className="eyebrow">Results</p>
								<h2>{filteredCourses.length} course matches</h2>
							</div>
							<div className="studio-toggle-group" role="tablist" aria-label="Catalog view mode">
								<button
									type="button"
									className={`studio-toggle ${viewMode === 'grid' ? 'is-active' : ''}`.trim()}
									onClick={() => setViewMode('grid')}
								>
									<span className="ui-icon" aria-hidden="true"><BsFillGrid3X3GapFill /></span> Grid
								</button>
								<button
									type="button"
									className={`studio-toggle ${viewMode === 'list' ? 'is-active' : ''}`.trim()}
									onClick={() => setViewMode('list')}
								>
									<span className="ui-icon" aria-hidden="true"><BsListUl /></span> List
								</button>
							</div>
						</div>

						{loading ? <Card className="studio-block"><CardMeta>Loading courses...</CardMeta></Card> : null}

						{!loading && filteredCourses.length === 0 ? (
							<Card className="studio-block">
								<CardTitle>No courses match this view</CardTitle>
								<CardMeta>Try a broader search keyword or reset publication status.</CardMeta>
							</Card>
						) : null}

						<div className={viewMode === 'grid' ? 'studio-catalog-grid' : 'studio-catalog-list'}>
							{filteredCourses.map((course) => {
								const isEnrolled = enrolledCourseIds.has(course.id);
								return (
									<Card key={course.id} className="studio-catalog-card">
										<div className="studio-catalog-card__head">
											<div>
												<CardEyebrow>{course.institution?.name ?? 'Hanga Works'}</CardEyebrow>
												<CardTitle>{course.title}</CardTitle>
											</div>
											<div className="studio-chip-row">
												<span className="dashboard-chip">{course.published ? 'Published' : 'Draft'}</span>
												{isEnrolled ? <span className="dashboard-chip">Enrolled</span> : null}
											</div>
										</div>
										<CardMeta>{course.description}</CardMeta>
										<p className="muted"><span className="ui-icon" aria-hidden="true"><MdMenuBook /></span>{course._count?.modules ?? course.modules?.length ?? 0} modules · <span className="ui-icon" aria-hidden="true"><MdGroups /></span>{course._count?.enrollments ?? 0} enrollments</p>
										<div className="studio-chip-row">
											{(course.skills ?? []).slice(0, 5).map((skill) => (
												<span key={skill.id} className="dashboard-chip">{skill.skill.name}</span>
											))}
										</div>
										<div className="studio-action-row">
											<Button to={`/courses/${course.id}`} variant="secondary">Preview</Button>
											<Button to={`/courses/${course.id}`} variant="primary">{isEnrolled ? 'Resume' : 'Enroll now'}</Button>
										</div>
									</Card>
								);
							})}
						</div>
					</main>
				</section>
			</section>
		</SiteLayout>
	);
}
