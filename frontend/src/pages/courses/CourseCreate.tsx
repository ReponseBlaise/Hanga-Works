import { useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { Button } from '../../components/ui/Button';
import { Card, CardEyebrow, CardMeta, CardTitle } from '../../components/ui/Card';
import { useAuth } from '../../hooks/useAuth';
import { createCourse, uploadModuleMedia } from '../../services/courses.service';

type CourseFormState = {
	title: string;
	slug: string;
	description: string;
	thumbnailUrl: string;
	institutionId: string;
	published: boolean;
	isPremium: boolean;
	price: string;
	currency: string;
};

function slugify(value: string) {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

export default function CourseCreate() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const role = (user?.role ?? '').toUpperCase();
	const canCreate = role === 'ADMIN' || role === 'INSTITUTION' || role === 'MENTOR';
	const [form, setForm] = useState<CourseFormState>({
		title: '',
		slug: '',
		description: '',
		thumbnailUrl: '',
		institutionId: '',
		published: true,
		isPremium: false,
		price: '',
		currency: 'RWF',
	});
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState('');
	const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

	if (!canCreate) {
		return <Navigate to="/courses" replace />;
	}

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setSaving(true);
		setError('');

		try {
			let uploadedUrl = form.thumbnailUrl.trim();
			if (thumbnailFile) {
				try {
					const uploadRes = await uploadModuleMedia(thumbnailFile, 'course-thumbnail');
					if (uploadRes?.publicUrl) uploadedUrl = uploadRes.publicUrl;
				} catch (uploadError) {
					console.warn('Thumbnail upload failed, proceeding without it', uploadError);
				}
			}

		const payload: Parameters<typeof createCourse>[0] = {
				title: form.title.trim(),
				slug: form.slug.trim() || slugify(form.title),
				description: form.description.trim(),
				published: form.published,
				isPremium: form.isPremium,
				price: form.isPremium && form.price ? Number(form.price) : 0,
				currency: form.currency || 'RWF',
			};
			if (uploadedUrl) payload.thumbnailUrl = uploadedUrl;
			if (form.institutionId.trim()) payload.institutionId = form.institutionId.trim();
			const course = await createCourse(payload);
			navigate(`/courses/${course.id}`);
		} catch (creationError) {
			console.error('Failed to create course', creationError);
			setError('Course could not be created right now. Check the fields and try again.');
		} finally {
			setSaving(false);
		}
	}

	return (
		<SiteLayout>
			<div className="page-shell studio-course-create">
				<header className="page-head">
					<div>
						<p className="section-head__eyebrow">Course creation</p>
						<h1>Create a new course from the frontend.</h1>
						<p className="muted">This screen maps directly to the NestJS POST /courses endpoint for institution and admin users.</p>
					</div>
					<div className="studio-action-row">
						<Button to="/courses" variant="secondary">Back to catalog</Button>
					</div>
				</header>

				<section className="dashboard-section dashboard-section--split">
					<Card className="studio-block">
						<CardEyebrow>Course details</CardEyebrow>
						<form className="form-stack" onSubmit={handleSubmit}>
							<label>
								Title
								<input
									type="text"
									required
									value={form.title}
									onChange={(event) =>
										setForm((previous) => ({
											...previous,
											title: event.target.value,
											slug: previous.slug || slugify(event.target.value),
										}))
									}
									placeholder="Advanced Product Design"
								/>
							</label>
							<label>
								Slug
								<input
									type="text"
									required
									value={form.slug}
									onChange={(event) => setForm((previous) => ({ ...previous, slug: event.target.value }))}
									placeholder="advanced-product-design"
								/>
							</label>
							<label>
								Description
								<textarea
									required
									rows={5}
									value={form.description}
									onChange={(event) => setForm((previous) => ({ ...previous, description: event.target.value }))}
									placeholder="Explain who the course is for, what learners will achieve, and the core outcome."
								/>
							</label>
							<label>
								Course Avatar (Thumbnail)
								<input
									type="file"
									accept=".jpg,.jpeg,.png,.webp"
									onChange={(event) => {
										const file = event.target.files?.[0];
										if (file) setThumbnailFile(file);
									}}
								/>
							</label>
							<label>
								Institution ID
								<input
									type="text"
									value={form.institutionId}
									onChange={(event) => setForm((previous) => ({ ...previous, institutionId: event.target.value }))}
									placeholder="Optional for admin-created content"
								/>
							</label>
						<div className="auth-note">
								<input
									type="checkbox"
									checked={form.published}
									onChange={(event) => setForm((previous) => ({ ...previous, published: event.target.checked }))}
								/>
								<div>
									<strong>Publish immediately</strong>
									<p className="muted">Uncheck to save the course as a draft.</p>
								</div>
							</div>

							<div className="auth-note">
								<input
									type="checkbox"
									checked={form.isPremium}
									onChange={(event) => setForm((previous) => ({ ...previous, isPremium: event.target.checked }))}
								/>
								<div>
									<strong>Premium course (paid)</strong>
									<p className="muted">Learners must pay before enrolling. Set a price below.</p>
								</div>
							</div>

							{form.isPremium && (
								<div className="employer-form__grid">
									<label>
										Price
										<input
											type="number"
											min={0}
											required={form.isPremium}
											value={form.price}
											onChange={(event) => setForm((previous) => ({ ...previous, price: event.target.value }))}
											placeholder="e.g. 5000"
										/>
									</label>
									<label>
										Currency
										<select
											value={form.currency}
											onChange={(event) => setForm((previous) => ({ ...previous, currency: event.target.value }))}
										>
											<option value="RWF">RWF</option>
											<option value="USD">USD</option>
											<option value="NGN">NGN</option>
											<option value="KES">KES</option>
											<option value="UGX">UGX</option>
										</select>
									</label>
								</div>
							)}

							<div className="studio-action-row">
								<Button to="/courses" variant="secondary">Cancel</Button>
								<Button type="submit" variant="primary" disabled={saving}>
									{saving ? 'Creating…' : 'Create course'}
								</Button>
							</div>

							{error ? <p className="text-danger">{error}</p> : null}
						</form>
					</Card>

					<Card className="studio-block">
						<CardEyebrow>Backend mapping</CardEyebrow>
						<CardTitle>What this form sends</CardTitle>
						<CardMeta>title, slug, description, published, thumbnailUrl, institutionId</CardMeta>
						<div className="studio-stack">
							<div className="studio-inline-item">
								<div>
									<strong>Title and slug</strong>
									<p>Required by the backend DTO.</p>
								</div>
							</div>
							<div className="studio-inline-item">
								<div>
									<strong>Description</strong>
									<p>Must be at least 10 characters long.</p>
								</div>
							</div>
							<div className="studio-inline-item">
								<div>
									<strong>Optional metadata</strong>
									<p>Thumbnail and institution are optional and can be added later.</p>
								</div>
							</div>
						</div>
					</Card>
				</section>
			</div>
		</SiteLayout>
	);
}