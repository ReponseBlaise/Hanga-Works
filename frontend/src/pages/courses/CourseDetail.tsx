import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { Button } from '../../components/ui/Button';
import { Card, CardEyebrow, CardMeta, CardTitle } from '../../components/ui/Card';
import { getCourseById, getMyProgress, enrollInCourse, updateLessonProgress, createCourseModule, updateCourseModule, deleteCourseModule, uploadModuleMedia, verifyPayment, type BackendCourse, type CourseEnrollment } from '../../services/courses.service';
import { FlutterwavePayButton } from '../../components/payments/FlutterwavePayButton';
import { getMyCertificates, type LearnerCertificate } from '../../services/certificates.service';
import { getJobs, type JobSummary } from '../../services/jobs.service';

function getEmbedUrl(url: string) {
	if (!url) return url;
	try {
		const parsed = new URL(url);
		if (parsed.hostname.includes('youtube.com')) {
			const videoId = parsed.searchParams.get('v');
			if (videoId) return `https://www.youtube.com/embed/${videoId}`;
		}
		if (parsed.hostname.includes('youtu.be')) {
			const videoId = parsed.pathname.slice(1);
			if (videoId) return `https://www.youtube.com/embed/${videoId}`;
		}
	} catch {
		// Ignore invalid URLs
	}
	return url;
}

export function CourseDetail() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { isAuthenticated, user } = useAuth();
	const [course, setCourse] = useState<BackendCourse | null>(null);
	const [courseLoading, setCourseLoading] = useState(true);
	const [courseError, setCourseError] = useState('');
	const [rawEnrollments, setRawEnrollments] = useState<CourseEnrollment[]>([]);
	const [rawCertificates, setRawCertificates] = useState<LearnerCertificate[]>([]);
	const [trackingMessage, setTrackingMessage] = useState('');
	const [paymentVerifying, setPaymentVerifying] = useState(false);
	const [savingProgress, setSavingProgress] = useState(false);
	const [relatedJobs, setRelatedJobs] = useState<JobSummary[]>([]);
	const isManager = user?.role === 'INSTITUTION' || user?.role === 'ADMIN' || user?.role === 'MENTOR';
	const [isAddingModule, setIsAddingModule] = useState(false);
	const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
	const [moduleForm, setModuleForm] = useState<{ title: string; content: string; videoUrl: string; order: number; file: File | null }>({ title: '', content: '', videoUrl: '', order: 1, file: null });
	const [savingModule, setSavingModule] = useState(false);
	const [activeModuleId, setActiveModuleId] = useState('');
	const prevIdRef = useRef<string | undefined>(undefined);

	// Derive enrollments/certificates — empty when not authenticated
	const enrollments = useMemo(() => isAuthenticated ? rawEnrollments : [], [isAuthenticated, rawEnrollments]);
	const certificates = useMemo(() => isAuthenticated ? rawCertificates : [], [isAuthenticated, rawCertificates]);

	useEffect(() => {
		if (!id) return;
		let active = true;
		// Only reset loading/error when id changes
		if (prevIdRef.current !== id) {
			prevIdRef.current = id;
			setCourseLoading(true);
			setCourseError('');
		}

		Promise.all([getCourseById(id), getJobs({ perPage: 40, page: 1 })])
			.then(([item, jobsResponse]) => {
				if (!active) return;
				setCourse(item ?? null);
				setRelatedJobs(jobsResponse.jobs ?? []);
				setActiveModuleId(item?.modules?.[0]?.id ?? '');
				setCourseLoading(false);
			})
			.catch((fetchError) => {
				console.error(fetchError);
				if (active) {
					setCourseError('This course could not be loaded.');
					setCourseLoading(false);
				}
			});

		return () => {
			active = false;
		};
	}, [id]);

	useEffect(() => {
		if (!isAuthenticated) return;

		let active = true;
		Promise.all([getMyProgress(), getMyCertificates()])
			.then(([progressItems, certificateItems]) => {
				if (!active) return;
				setRawEnrollments(progressItems ?? []);
				setRawCertificates(certificateItems ?? []);
			})
			.catch((fetchError) => {
				console.error('Failed to load study progress', fetchError);
			});

		return () => {
			active = false;
		};
	}, [isAuthenticated]);

	const currentEnrollment = useMemo(() => enrollments.find((item) => item.course.id === id) ?? null, [enrollments, id]);
	const currentCertificate = useMemo(() => certificates.find((item) => item.courseId === id) ?? null, [certificates, id]);
	const progressValue = currentEnrollment?.progress ?? 0;

	const resolvedActiveModule = useMemo(() => {
		const modules = course?.modules ?? [];
		return modules.find((m) => m.id === activeModuleId) ?? modules[0] ?? null;
	}, [course, activeModuleId]);

	async function handlePaymentSuccess(data: { txRef: string; transactionId: string }) {
		if (!course) return;
		setPaymentVerifying(true);
		setTrackingMessage('Verifying payment with server…');
		try {
			const result = await verifyPayment({ txRef: data.txRef, transactionId: data.transactionId, courseId: course.id });
			setRawEnrollments((prev) => {
				const exists = prev.find((e) => e.course.id === course.id);
				return exists ? prev : [result.enrollment, ...prev];
			});
			setTrackingMessage('Payment verified! You are now enrolled. Start learning below.');
		} catch (err) {
			console.error('Payment verification failed', err);
			setTrackingMessage('Payment was received but verification failed. Contact support with your transaction reference: ' + data.txRef);
		} finally {
			setPaymentVerifying(false);
		}
	}

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
			setRawEnrollments((prev) => [enrollment, ...prev]);
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

	async function handleSaveProgress() {
		if (!currentEnrollment) {
			setTrackingMessage('Enroll first so the platform has an enrollment record to update.');
			return;
		}

		setSavingProgress(true);
		setTrackingMessage('Saving your study progress.');
		try {
			const updated = await updateLessonProgress(currentEnrollment.id, progressValue);
			setRawEnrollments((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
			setTrackingMessage(`Progress saved at ${updated.progress ?? progressValue}%. Take the final test to complete the course.`);
		} catch (saveError) {
			console.error(saveError);
			setTrackingMessage('Progress could not be saved right now. Try again later or check your connection.');
		} finally {
			setSavingProgress(false);
		}
	}

	async function handleSaveModule(e: React.FormEvent) {
		e.preventDefault();
		if (!course) return;
		setSavingModule(true);
		try {
			let finalVideoUrl = moduleForm.videoUrl;
			if (moduleForm.file) {
				const purpose = moduleForm.file.type.startsWith('video/') ? 'course-video' : 'course-document';
				const uploadRes = await uploadModuleMedia(moduleForm.file, purpose, course.id);
				finalVideoUrl = uploadRes.publicUrl;
			}

			const payload = {
				title: moduleForm.title,
				content: moduleForm.content || undefined,
				videoUrl: finalVideoUrl || undefined,
				order: Number(moduleForm.order)
			};

			if (editingModuleId) {
				const updatedModule = await updateCourseModule(course.id, editingModuleId, payload);
				setCourse(prev => prev ? { ...prev, modules: prev.modules?.map(m => m.id === editingModuleId ? updatedModule : m) } : null);
				setEditingModuleId(null);
			} else {
				const newModule = await createCourseModule(course.id, payload);
				setCourse(prev => prev ? { ...prev, modules: [...(prev.modules || []), newModule] } : null);
				setIsAddingModule(false);
			}
			setModuleForm({ title: '', content: '', videoUrl: '', order: (course.modules?.length ?? 0) + (editingModuleId ? 1 : 2), file: null });
		} catch (err) {
			console.error(err);
			alert('Failed to save module. Check inputs and Cloudinary configuration.');
		} finally {
			setSavingModule(false);
		}
	}

	async function handleDeleteModule(moduleId: string) {
		if (!course || !confirm('Are you sure you want to delete this module?')) return;
		try {
			await deleteCourseModule(course.id, moduleId);
			setCourse(prev => prev ? { ...prev, modules: prev.modules?.filter(m => m.id !== moduleId) } : null);
			if (activeModuleId === moduleId) setActiveModuleId('');
		} catch (err) {
			console.error(err);
			alert('Failed to delete module.');
		}
	}

	if (courseLoading) {
		return (
			<SiteLayout>
				<Card className="courses-empty">
					<CardTitle>Loading course…</CardTitle>
					<CardMeta>Fetching the live record from the backend.</CardMeta>
				</Card>
			</SiteLayout>
		);
	}

	if (courseError) {
		return (
			<SiteLayout>
				<Card className="courses-empty">
					<CardTitle>{courseError}</CardTitle>
					<CardMeta>The course may have been unpublished or the identifier is invalid.</CardMeta>
					<Button to="/courses" variant="primary">Back to courses</Button>
				</Card>
			</SiteLayout>
		);
	}

	if (!course) {
		return null;
	}

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
			<div className="studio-course-detail learning-redesign">
				<section className="studio-course-head">
					<Link to="/courses" className="studio-inline-link">Back to catalog</Link>
					<div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
						<p className="eyebrow" style={{ margin: 0 }}>{course.institution?.name ?? 'Hanga Works'} · {course.published ? 'Published' : 'Draft'}</p>
						{course.isPremium && (
							<span className="dashboard-chip" style={{ background: 'rgba(244,123,32,0.12)', color: 'var(--brand-orange)', borderColor: 'rgba(244,123,32,0.28)' }}>
								Premium · {course.currency ?? 'RWF'} {(course.price ?? 0).toLocaleString()}
							</span>
						)}
						{!course.isPremium && (
							<span className="dashboard-chip" style={{ background: 'rgba(22,163,74,0.1)', color: '#16a34a', borderColor: 'rgba(22,163,74,0.22)' }}>Free</span>
						)}
					</div>
					<h1 className="display">{course.title}</h1>
					<p className="lead">{course.description}</p>
					<div className="studio-chip-row">
						{(course.skills ?? []).map((skill) => (
							<span key={skill.id} className="dashboard-chip">{skill.skill.name}</span>
						))}
					</div>
				</section>

				<section className="learning-redesign__summary">
					<div>
						<span>Progress</span>
						<strong>{progressValue}%</strong>
					</div>
					<div>
						<span>Modules</span>
						<strong>{course.modules?.length ?? 0}</strong>
					</div>
					<div>
						<span>Enrollment</span>
						<strong>{currentEnrollment ? currentEnrollment.status.toLowerCase() : 'not enrolled'}</strong>
					</div>
					<div>
						<span>Certificate</span>
						<strong>{currentCertificate ? 'Available' : 'Pending'}</strong>
					</div>
				</section>

				<section className="learning-redesign__layout">
					<aside className="learning-redesign__sidebar">
						<Card className="studio-block">
							<div className="studio-section__head" style={{ marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
								<CardEyebrow>Curriculum</CardEyebrow>
								{isManager && (
									<div style={{ display: 'flex', gap: '8px' }}>
										<Button variant="ghost" type="button" onClick={() => {
											setIsAddingModule(!isAddingModule);
											setEditingModuleId(null);
											setModuleForm({ title: '', content: '', videoUrl: '', order: (course.modules?.length ?? 0) + 1, file: null });
										}}>
											{isAddingModule && !editingModuleId ? 'Cancel' : '+ Add Lesson'}
										</Button>
										<Button to={`/courses/${course.id}/test/edit`} variant="secondary">
											Manage Test
										</Button>
									</div>
								)}
							</div>

							{(isAddingModule || editingModuleId) && (
								<form onSubmit={handleSaveModule} className="module-editor-form">
									<input type="text" required placeholder="Lesson Title" value={moduleForm.title} onChange={e => setModuleForm(f => ({ ...f, title: e.target.value }))} />
									<input type="url" placeholder="Or Paste Video URL (Youtube etc)" value={moduleForm.videoUrl} onChange={e => setModuleForm(f => ({ ...f, videoUrl: e.target.value }))} />
									<label style={{ fontSize: '12px', color: 'var(--text-soft)' }}>Upload File (Video or PDF. Overrides URL)</label>
									<input type="file" accept="video/*,application/pdf" onChange={e => setModuleForm(f => ({ ...f, file: e.target.files?.[0] || null }))} />
									<textarea placeholder="Lesson Content (optional)" value={moduleForm.content} onChange={e => setModuleForm(f => ({ ...f, content: e.target.value }))} />
									<input type="number" required placeholder="Order (e.g. 1)" value={moduleForm.order} onChange={e => setModuleForm(f => ({ ...f, order: Number(e.target.value) }))} />
									<div className="studio-action-row">
										<Button variant="primary" type="submit" disabled={savingModule}>{savingModule ? 'Saving...' : 'Save Lesson'}</Button>
										{editingModuleId && <Button variant="ghost" type="button" onClick={() => setEditingModuleId(null)}>Cancel</Button>}
									</div>
								</form>
							)}

							<div className="studio-module-list">
								{(course.modules ?? []).map((module) => (
									<div key={module.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
										<button
											type="button"
											style={{ flex: 1, textAlign: 'left' }}
											className={`studio-module-item ${activeModuleId === module.id ? 'is-active' : ''}`.trim()}
											onClick={() => setActiveModuleId(module.id)}
										>
											<span>Module {module.order}</span>
											<strong>{module.title}</strong>
										</button>
										{isManager && (
											<div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
												<button type="button" onClick={() => {
													setEditingModuleId(module.id);
													setIsAddingModule(false);
													setModuleForm({ title: module.title, content: module.content || '', videoUrl: module.videoUrl || '', order: module.order, file: null });
												}}>✏️</button>
												<button type="button" onClick={() => handleDeleteModule(module.id)}>🗑️</button>
											</div>
										)}
									</div>
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

					<div className="learning-redesign__content">
						<Card className="studio-block">
							<CardEyebrow>Lesson stage</CardEyebrow>
							<div className="studio-video-frame">
								{resolvedActiveModule?.videoUrl ? (
									resolvedActiveModule.videoUrl.endsWith('.pdf') ? (
										<iframe
											title={resolvedActiveModule.title}
											src={resolvedActiveModule.videoUrl}
											width="100%"
											style={{ height: 'clamp(240px, 50vw, 500px)', border: 0 }}
										/>
									) : (
										<iframe
											title={resolvedActiveModule.title}
											src={getEmbedUrl(resolvedActiveModule.videoUrl)}
											allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
											allowFullScreen
											style={{ width: '100%', height: 'clamp(240px, 50vw, 480px)', border: 0 }}
										/>
									)
								) : (
									<div className="studio-video-fallback">
										<strong>{resolvedActiveModule?.title ?? 'No module selected'}</strong>
										<p>Video/Document content is not available for this module yet.</p>
										{resolvedActiveModule?.content && <p style={{ marginTop: '16px', color: 'var(--text)' }}>{resolvedActiveModule.content}</p>}
									</div>
								)}
							</div>
							{!isManager && (
								<>
									{/* Premium course: show price banner + pay button when not enrolled */}
									{course.isPremium && !currentEnrollment && (
										<div className="studio-progress-stack mt-md" style={{ padding: '16px', background: 'rgba(244,123,32,0.07)', border: '1px solid rgba(244,123,32,0.24)', borderRadius: 'var(--radius-md)' }}>
											<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
												<div>
													<p className="eyebrow" style={{ color: 'var(--brand-orange)' }}>Premium course</p>
													<strong style={{ fontSize: '1.5rem', letterSpacing: '-0.03em' }}>
														{course.currency ?? 'RWF'} {(course.price ?? 0).toLocaleString()}
													</strong>
												</div>
												{isAuthenticated && user ? (
													<FlutterwavePayButton
														courseId={course.id}
														courseTitle={course.title}
														amount={course.price ?? 0}
														currency={course.currency ?? 'RWF'}
														user={{ email: user.email, name: user.name, phone: user.phone }}
														onSuccess={handlePaymentSuccess}
														onClose={() => setTrackingMessage('Payment cancelled. You can try again anytime.')}
														disabled={paymentVerifying}
														label={paymentVerifying ? 'Verifying…' : `Pay ${course.currency ?? 'RWF'} ${(course.price ?? 0).toLocaleString()} & Enroll`}
													/>
												) : (
													<Button variant="primary" onClick={() => navigate('/login', { state: { from: `/courses/${course.id}` } })}>
														Sign in to purchase
													</Button>
												)}
											</div>
											{trackingMessage ? <p className="muted" style={{ marginTop: '8px' }}>{trackingMessage}</p> : null}
										</div>
									)}

									{/* Free course OR already enrolled in premium: show normal controls */}
									{(!course.isPremium || currentEnrollment) && (
										<div className="studio-action-row mt-md">
											<Button variant="secondary" type="button" onClick={handleEnroll}>
												{currentEnrollment ? 'Already enrolled' : 'Enroll in course'}
											</Button>
											<Button
												type="button"
												variant="primary"
												disabled={!currentEnrollment || savingProgress}
												onClick={() => handleSaveProgress()}
											>
												Save progress
											</Button>
											{currentEnrollment ? (
												<Button to={`/courses/${course.id}/test`} variant="primary">
													Take Final Test
												</Button>
											) : (
												<Button variant="primary" disabled>
													Take Final Test
												</Button>
											)}
										</div>
									)}

									<div className="studio-progress-stack">
										<CardMeta>
											{currentEnrollment
												? `Enrollment status: ${currentEnrollment.status.toLowerCase()}`
												: course.isPremium
												? 'Purchase this course to start tracking your progress and unlock a certificate.'
												: 'Enroll to start tracking your progress and unlock a certificate.'}
										</CardMeta>
										{trackingMessage && course.isPremium && !currentEnrollment ? null : trackingMessage ? <p className="muted">{trackingMessage}</p> : null}
										{currentCertificate ? (
											<div className="studio-action-row">
												<CardMeta>Certificate issued {new Date(currentCertificate.issuedAt).toLocaleDateString()}</CardMeta>
												<Button href={currentCertificate.verifyUrl} variant="ghost">Verify</Button>
											</div>
										) : null}
									</div>
								</>
							)}
						</Card>

						<Card className="studio-block">
							<div className="studio-section__head">
								<div>
									<p className="eyebrow">Learning outcomes</p>
									<h2>What you will master</h2>
								</div>
							</div>
							<div className="learning-redesign__outcomes">
								{(course.skills ?? []).map((skill) => (
									<div key={skill.id} className="studio-inline-item">
										<div>
											<strong>{skill.skill.name}</strong>
											<p>Applied in modules and assessments.</p>
										</div>
									</div>
								))}
							</div>
						</Card>
					</div>
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
