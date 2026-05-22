import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { CourseProgressBar } from '../../components/learning/CourseProgressBar';
import { Button } from '../../components/ui/Button';
import { Card, CardEyebrow, CardMeta, CardTitle } from '../../components/ui/Card';
import { categoryLabels, courses, levelLabels } from '../../data/courses';
import type { Course, CourseCategory, CourseLevel } from '../../types/course';

type ProgressFilter = 'all' | 'not-started' | 'in-progress' | 'completed';

const categories: Array<CourseCategory | 'all'> = ['all', 'development', 'career', 'analytics', 'design'];
const levels: Array<CourseLevel | 'all'> = ['all', 'beginner', 'intermediate', 'advanced'];
const progressFilters: { value: ProgressFilter; label: string }[] = [
	{ value: 'all', label: 'All progress' },
	{ value: 'not-started', label: 'Not started' },
	{ value: 'in-progress', label: 'In progress' },
	{ value: 'completed', label: 'Completed' },
];

function matchesProgress(course: Course, filter: ProgressFilter) {
	if (filter === 'all') return true;
	if (filter === 'not-started') return course.progress === 0;
	if (filter === 'completed') return course.progress === 100;
	return course.progress > 0 && course.progress < 100;
}

export function CourseList() {
	const [search, setSearch] = useState('');
	const [category, setCategory] = useState<CourseCategory | 'all'>('all');
	const [level, setLevel] = useState<CourseLevel | 'all'>('all');
	const [progressFilter, setProgressFilter] = useState<ProgressFilter>('all');

	const filteredCourses = useMemo(() => {
		const query = search.trim().toLowerCase();
		return courses.filter((course) => {
			const matchesSearch =
				!query ||
				course.title.toLowerCase().includes(query) ||
				course.description.toLowerCase().includes(query) ||
				course.provider.toLowerCase().includes(query) ||
				course.skills.some((skill) => skill.toLowerCase().includes(query));
			const matchesCategory = category === 'all' || course.category === category;
			const matchesLevel = level === 'all' || course.level === level;
			return matchesSearch && matchesCategory && matchesLevel && matchesProgress(course, progressFilter);
		});
	}, [search, category, level, progressFilter]);

	return (
		<DashboardLayout>
			<div className="courses-page">
				<section className="courses-hero card">
					<div>
						<p className="section-head__eyebrow">Learning</p>
						<h2 className="courses-hero__title">Browse courses</h2>
						<p className="card-meta">
							Search and filter courses by skill area, level, and your progress. Pick up where you left off or start something new.
						</p>
					</div>
					<div className="courses-hero__stats">
						<div className="hero-stat">
							<span>Enrolled</span>
							<strong>{courses.filter((c) => c.enrolled).length}</strong>
							<p>Active learning paths</p>
						</div>
						<div className="hero-stat">
							<span>In progress</span>
							<strong>{courses.filter((c) => c.progress > 0 && c.progress < 100).length}</strong>
							<p>Courses underway</p>
						</div>
					</div>
				</section>

				<section className="courses-toolbar card">
					<label className="courses-search">
						<span className="courses-search__label">Search courses</span>
						<input
							type="search"
							placeholder="Search by title, skill, or provider..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</label>

					<div className="courses-filters">
						<FilterSelect
							label="Category"
							value={category}
							options={categories.map((value) => ({
								value,
								label: value === 'all' ? 'All categories' : categoryLabels[value],
							}))}
							onChange={(value) => setCategory(value as CourseCategory | 'all')}
						/>
						<FilterSelect
							label="Level"
							value={level}
							options={levels.map((value) => ({
								value,
								label: value === 'all' ? 'All levels' : levelLabels[value],
							}))}
							onChange={(value) => setLevel(value as CourseLevel | 'all')}
						/>
						<FilterSelect
							label="Progress"
							value={progressFilter}
							options={progressFilters.map(({ value, label }) => ({ value, label }))}
							onChange={(value) => setProgressFilter(value as ProgressFilter)}
						/>
					</div>
				</section>

				<section className="courses-results">
					<p className="courses-results__count">
						{filteredCourses.length} course{filteredCourses.length === 1 ? '' : 's'} found
					</p>

					{filteredCourses.length === 0 ? (
						<Card className="courses-empty">
							<CardTitle>No courses match your filters</CardTitle>
							<CardMeta>Try clearing search or choosing a broader category.</CardMeta>
							<Button
								type="button"
								variant="ghost"
								onClick={() => {
									setSearch('');
									setCategory('all');
									setLevel('all');
									setProgressFilter('all');
								}}
							>
								Reset filters
							</Button>
						</Card>
					) : (
						<div className="courses-grid">
							{filteredCourses.map((course) => {
								const completedLessons = course.modules.filter((m) => m.completed).length;
								return (
									<Card key={course.id} className="course-list-card">
										<div className="course-list-card__top">
											<div>
												<CardEyebrow>
													{categoryLabels[course.category]} · {levelLabels[course.level]}
												</CardEyebrow>
												<CardTitle>
													<Link to={`/courses/${course.id}`}>{course.title}</Link>
												</CardTitle>
											</div>
											<span className="course-list-card__provider">{course.provider}</span>
										</div>
										<CardMeta>{course.summary}</CardMeta>
										<div className="course-list-card__tags">
											{course.skills.map((skill) => (
												<span key={skill}>{skill}</span>
											))}
										</div>
										<p className="course-list-card__meta">
											{course.duration} · {course.lessons} lessons
										</p>
										{course.enrolled ? (
											<CourseProgressBar
												value={course.progress}
												completedLessons={completedLessons}
												totalLessons={course.modules.length}
											/>
										) : (
											<p className="course-list-card__status">Not enrolled yet</p>
										)}
										<div className="course-list-card__actions">
											<Button to={`/courses/${course.id}`} variant="primary">
												{course.enrolled ? 'Continue' : 'View course'}
											</Button>
										</div>
									</Card>
								);
							})}
						</div>
					)}
				</section>
			</div>
		</DashboardLayout>
	);
}

function FilterSelect({
	label,
	value,
	options,
	onChange,
}: {
	label: string;
	value: string;
	options: { value: string; label: string }[];
	onChange: (value: string) => void;
}) {
	return (
		<label className="courses-filter">
			<span>{label}</span>
			<select value={value} onChange={(e) => onChange(e.target.value)}>
				{options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
		</label>
	);
}
