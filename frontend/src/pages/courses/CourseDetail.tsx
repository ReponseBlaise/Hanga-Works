import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { Button } from '../../components/ui/Button';
import { Card, CardEyebrow, CardMeta, CardTitle } from '../../components/ui/Card';
import { ProgressBar } from '../../components/shared/ProgressBar';
import { getCourseById, getMyProgress, enrollInCourse, updateLessonProgress, type BackendCourse, type CourseEnrollment } from '../../services/courses.service';
import { getMyCertificates, type LearnerCertificate } from '../../services/certificates.service';
import { getJobs, type JobSummary } from '../../services/jobs.service';

export function CourseDetail() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { isAuthenticated } = useAuth();
	const [course, setCourse] = useState<BackendCourse | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
	const [certificates, setCertificates] = useState<LearnerCertificate[]>([]);
	const [progressValue, setProgressValue] = useState(0);
	const [trackingMessage, setTrackingMessage] = useState('');
	const [savingProgress, setSavingProgress] = useState(false);
	const [activeModuleId, setActiveModuleId] = useState('');
	const [relatedJobs, setRelatedJobs] = useState<JobSummary[]>([]);

	useEffect(() => {
		if (!id) return;
		let active = true;
		setLoading(true);
		setError('');

		Promise.all([getCourseById(id), getJobs({ perPage: 40, page: 1 })])
			.then(([item, jobsResponse]) => {
				if (active) setCourse(item ?? null);
				if (active) setRelatedJobs(jobsResponse.jobs ?? []);
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

	useEffect(() => {
		if (!isAuthenticated) {
			setEnrollments([]);
			setCertificates([]);
			setProgressValue(0);
			return;
		}

		let active = true;
		Promise.all([getMyProgress(), getMyCertificates()])
			.then(([progressItems, certificateItems]) => {
				if (!active) return;
				setEnrollments(progressItems ?? []);
				setCertificates(certificateItems ?? []);
			})
			.catch((fetchError) => {
				console.error('Failed to load study progress', fetchError);
			})
			.finally(() => {
				if (!active) return;
			});

		return () => {
			active = false;
		};
	}, [isAuthenticated]);

	const currentEnrollment = useMemo(() => enrollments.find((item) => item.course.id === id) ?? null, [enrollments, id]);
	const currentCertificate = useMemo(() => certificates.find((item) => item.courseId === id) ?? null, [certificates, id]);

	useEffect(() => {
		setProgressValue(currentEnrollment?.progress ?? 0);
	}, [currentEnrollment]);

	useEffect(() => {
		if (!course?.modules?.length) {
			setActiveModuleId('');
			return;
		}
		setActiveModuleId((previous) => {
			if (previous && course.modules?.some((module) => module.id === previous)) {
				return previous;
			}
			return course.modules?.[0]?.id ?? '';
		});
	}, [course]);

	async function handleEnroll() {
		if (!course) return;
		if (!isAuthenticated) {
			navigate('/login', { state: { from: `/courses/${course.id}` } });
			return;
		}

		if (currentEnrollment) {
			setTrackingMessage('You are already enrolled. Use the progress controls below to continue studying.');
			return;
		}

		setTrackingMessage('Creating your enrollment so the platform can track progress and issue a certificate when you complete the course.');
		try {
			const enrollment = await enrollInCourse(course.id);
			setEnrollments((prev) => [enrollment, ...prev]);
			setProgressValue(enrollment.progress ?? 0);
			setTrackingMessage('Enrollment created. You can now track progress from this page.');
		} catch (enrollError) {
			console.error(enrollError);
			if (axios.isAxiosError(enrollError) && enrollError.response?.status === 409) {
				setTrackingMessage('You are already enrolled in this course, so progress tracking stays attached to the existing record.');
			} else {
				setTrackingMessage('Enrollment could not be created right now. Try again later or check your connection.');
			}
		}
	}

	async function handleSaveProgress(forceComplete = false) {
		if (!currentEnrollment) {
			setTrackingMessage('Enroll first so the platform has an enrollment record to update.');
			return;
		}

		const nextProgress = forceComplete ? 100 : progressValue;
		setSavingProgress(true);
		setTrackingMessage(forceComplete ? 'Marking the course complete so the certificate can be issued.' : 'Saving your study progress.');
		try {
			const updated = await updateLessonProgress(currentEnrollment.id, nextProgress);
			setEnrollments((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
			setProgressValue(updated.progress ?? nextProgress);
			if ((updated.progress ?? nextProgress) >= 100) {
				const refreshedCertificates = await getMyCertificates();
				setCertificates(refreshedCertificates ?? []);
				setTrackingMessage('Course completed. Your certificate is now available under Certificates.');
			} else {
				setTrackingMessage(`Progress saved at ${updated.progress ?? nextProgress}%. Keep going to unlock the completion certificate.`);
			}
		} catch (saveError) {
			console.error(saveError);
			setTrackingMessage('Progress could not be saved right now. Try again later or check your connection.');
		} finally {
			setSavingProgress(false);
		}
	}

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

	const activeModule = (course.modules ?? []).find((module) => module.id === activeModuleId) ?? course.modules?.[0] ?? null;
	const relatedFromSkills = relatedJobs
		.filter((job) => job.id !== id)
		.sort((left, right) => {
			const leftScore = (left.skills ?? []).filter((skill) => (course.skills ?? []).some((courseSkill) => courseSkill.skill.id === skill.skill.id)).length;
			const rightScore = (right.skills ?? []).filter((skill) => (course.skills ?? []).some((courseSkill) => courseSkill.skill.id === skill.skill.id)).length;
			return rightScore - leftScore;
		})
		.slice(0, 4);

	return (
		<SiteLayout>
			<div className="studio-course-detail">
				<section className="studio-course-head">
					<Link to="/courses" className="studio-inline-link">Back to catalog</Link>
					<p className="eyebrow">{course.institution?.name ?? 'Hanga Works'} · {course.published ? 'Published' : 'Draft'}</p>
					<h1 className="display">{course.title}</h1>
					<p className="lead">{course.description}</p>
					<div className="studio-chip-row">
						{(course.skills ?? []).map((skill) => (
							<span key={skill.id} className="dashboard-chip">{skill.skill.name}</span>
						))}
					</div>
				</section>

				<section className="studio-course-stage">
					<div className="studio-course-stage__video">
						<Card className="studio-block">
							<CardEyebrow>Lesson stage</CardEyebrow>
							<div className="studio-video-frame">
								{activeModule?.videoUrl ? (
									<iframe
										title={activeModule.title}
										src={activeModule.videoUrl}
										allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
										allowFullScreen
									/>
								) : (
									<div className="studio-video-fallback">
										<strong>{activeModule?.title ?? 'No module selected'}</strong>
										<p>Video content is not available for this module yet.</p>
									</div>
								)}
							</div>
							<div className="studio-action-row">
								<Button variant="secondary" type="button" onClick={handleEnroll}>
									{currentEnrollment ? 'Already enrolled' : 'Enroll in course'}
								</Button>
								<Button
									type="button"
									variant="primary"
									disabled={!currentEnrollment || savingProgress}
									onClick={() => handleSaveProgress(false)}
								>
									Save progress
								</Button>
								<Button
									type="button"
									variant="ghost"
									disabled={!currentEnrollment || savingProgress}
									onClick={() => handleSaveProgress(true)}
								>
									Mark complete
								</Button>
							</div>
							<div className="studio-progress-stack">
								<CardMeta>
									{currentEnrollment
										? `Enrollment status: ${currentEnrollment.status.toLowerCase()} · ${currentEnrollment.progress}% complete`
										: 'Enroll to start tracking your progress and unlock a certificate.'}
								</CardMeta>
								<ProgressBar value={currentEnrollment?.progress ?? 0} label="Course completion" />
								<input
									type="range"
									min={0}
									max={100}
									step={10}
									value={progressValue}
									disabled={!currentEnrollment}
									onChange={(event) => setProgressValue(Number(event.target.value))}
								/>
								{trackingMessage ? <p className="muted">{trackingMessage}</p> : null}
								{currentCertificate ? (
									<div className="studio-action-row">
										<CardMeta>Certificate issued {new Date(currentCertificate.issuedAt).toLocaleDateString()}</CardMeta>
										<Button href={currentCertificate.verifyUrl} variant="ghost">Verify</Button>
									</div>
								) : null}
							</div>
						</Card>
					</div>

					<aside className="studio-course-stage__sidebar">
						<Card className="studio-block">
							<CardEyebrow>Curriculum</CardEyebrow>
							<div className="studio-module-list">
								{(course.modules ?? []).map((module) => (
									<button
										key={module.id}
										type="button"
										className={`studio-module-item ${activeModuleId === module.id ? 'is-active' : ''}`.trim()}
										onClick={() => setActiveModuleId(module.id)}
									>
										<span>Module {module.order}</span>
										<strong>{module.title}</strong>
									</button>
								))}
							</div>
						</Card>

						<Card className="studio-block">
							<CardEyebrow>Instructor</CardEyebrow>
							<CardTitle>{course.institution?.name ?? 'Hanga Works Academy Team'}</CardTitle>
							<CardMeta>{course.institution?.website ?? 'Instructor profile and external links are available in the course metadata.'}</CardMeta>
							<CardMeta>{course._count?.modules ?? course.modules?.length ?? 0} modules · {course._count?.enrollments ?? 0} learners enrolled</CardMeta>
						</Card>
					</aside>
				</section>

				<section className="studio-section">
					<div className="studio-section__head">
						<div>
							<p className="eyebrow">Career bridge</p>
							<h2>Related jobs based on course skills</h2>
						</div>
						<Button to="/jobs" variant="secondary">See all jobs</Button>
					</div>
					<div className="studio-job-grid">
						{relatedFromSkills.map((job) => (
							<Card key={job.id} className="studio-job-card">
								<CardEyebrow>{job.employer.name}</CardEyebrow>
								<CardTitle>{job.title}</CardTitle>
								<CardMeta>{job.location ?? 'Remote'} · {job.jobType.replace('_', ' ')}</CardMeta>
								<div className="studio-action-row">
									<Button to={`/jobs/${job.id}`} variant="secondary">Details</Button>
									<Button to={`/jobs/${job.id}`} variant="primary">Apply</Button>
								</div>
							</Card>
						))}
					</div>
				</section>
			</div>
		</SiteLayout>
	);
}
