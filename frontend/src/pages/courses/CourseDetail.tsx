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
						{currentEnrollment ? (
							<CardMeta>Progress: {currentEnrollment.progress}% · {currentEnrollment.status.toLowerCase()}</CardMeta>
						) : (
							<CardMeta>Enroll to track progress, quizzes, and certificate issuance.</CardMeta>
						)}
						<Button variant="primary" to="/courses">Back to courses</Button>
						<Button variant="secondary" type="button" onClick={handleEnroll}>{currentEnrollment ? 'Already enrolled' : 'Start learning'}</Button>
						{currentCertificate ? (
							<Button variant="ghost" to="/certifications">View certificate</Button>
						) : null}
					</div>
				</section>

				<section className="dashboard-section">
					<div className="section-head">
						<div>
							<p className="section-head__eyebrow">Study progress</p>
							<h2>Track your progress and unlock a certificate</h2>
						</div>
					</div>
					<Card className="course-progress-card">
						<CardMeta>
							{currentEnrollment
								? `Current progress: ${currentEnrollment.progress}%`
								: 'Enroll first so the platform can track your learning progress.'}
						</CardMeta>
						<ProgressBar value={currentEnrollment?.progress ?? 0} label="Course progress" />
						<div className="course-progress-card__controls">
							<input
								type="range"
								min={0}
								max={100}
								step={10}
								value={progressValue}
								disabled={!currentEnrollment}
								onChange={(e) => setProgressValue(Number(e.target.value))}
							/>
							<div className="course-progress-card__buttons">
								<Button type="button" variant="primary" disabled={!currentEnrollment || savingProgress} onClick={() => handleSaveProgress(false)}>
									Save progress
								</Button>
								<Button type="button" variant="secondary" disabled={!currentEnrollment || savingProgress} onClick={() => handleSaveProgress(true)}>
									Mark complete
								</Button>
							</div>
							{trackingMessage ? <p className="course-detail__quiz-note">{trackingMessage}</p> : null}
							{currentCertificate ? (
								<CardMeta>
									Certificate issued on {new Date(currentCertificate.issuedAt).toLocaleDateString()} · {' '}
									<Button href={currentCertificate.verifyUrl} variant="ghost">Verify certificate</Button>
								</CardMeta>
							) : null}
						</div>
					</Card>
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
