import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { Button } from '../../components/ui/Button';
import { Card, CardEyebrow, CardMeta, CardTitle } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import authService, { updateProfile, type AuthUser as RemoteAuthUser } from '../../services/auth.service';
import { getMyCertificates, type LearnerCertificate } from '../../services/certificates.service';
import type { ProfileExperience, ProfileSkill, Proficiency } from '../../types/user.types';

const proficiencyLabels: Record<Proficiency, string> = {
	BEGINNER: 'Beginner',
	INTERMEDIATE: 'Intermediate',
	ADVANCED: 'Expert',
};

export default function Profile() {
	const { user: authUser, isAuthenticated, signIn } = useAuth();
	const params = useParams<{ username?: string }>();
	const [loadingProfile, setLoadingProfile] = useState(true);
	const [savingProfile, setSavingProfile] = useState(false);
	const [profileMessage, setProfileMessage] = useState('');
	const [skills, setSkills] = useState<ProfileSkill[]>([
		{ id: 's1', name: 'React', proficiency: 'ADVANCED' },
		{ id: 's2', name: 'TypeScript', proficiency: 'INTERMEDIATE' },
		{ id: 's3', name: 'Career coaching', proficiency: 'BEGINNER' },
	]);
	const [experience, setExperience] = useState<ProfileExperience[]>([
		{ id: 'e1', title: 'Frontend Intern', company: 'Hanga Works', startDate: '2024-01-01', endDate: '2024-06-01', description: 'Built learner-facing screens and content workflows.' },
	]);
	const [certificates, setCertificates] = useState<LearnerCertificate[]>([]);
	const [loadingCertificates, setLoadingCertificates] = useState(true);
	const [newSkill, setNewSkill] = useState('');
	const [newProficiency, setNewProficiency] = useState<Proficiency>('BEGINNER');
	const [skillSearch, setSkillSearch] = useState('');
	const [previewUrl, setPreviewUrl] = useState('');
	const [name, setName] = useState(authUser?.name ?? 'Frontend learner');
	const [location, setLocation] = useState('Kigali, Rwanda');
	const [avatarUrl, setAvatarUrl] = useState('');
	const [headline, setHeadline] = useState('Frontend learner and product-minded builder');
	const [bio, setBio] = useState('Focused on matching real skills with real opportunities through UX, data, and thoughtful product flow.');
	const [onboardingStep, setOnboardingStep] = useState(1);

	useEffect(() => {
		if (!isAuthenticated) {
			setLoadingProfile(false);
			setLoadingCertificates(false);
			return;
		}

		let active = true;
		authService.profile()
			.then((profile) => {
				if (!active) return;
				const remoteProfile = profile as RemoteAuthUser;
				if (remoteProfile.name) setName(remoteProfile.name);
				if (remoteProfile.location) setLocation(remoteProfile.location);
				if (remoteProfile.avatarUrl) setAvatarUrl(remoteProfile.avatarUrl);
				if (remoteProfile.bio) setBio(remoteProfile.bio);
				if (remoteProfile.skills?.length) {
					setSkills(
						remoteProfile.skills.map((skill, index) => ({
							id: skill.id ?? `skill-${index}`,
							name: skill.skill.name,
							proficiency: (skill.level as Proficiency) ?? 'BEGINNER',
						})),
					);
				}
			})
			.catch((error) => {
				console.error('Failed to load profile', error);
			})
			.finally(() => {
				if (active) setLoadingProfile(false);
			});

		getMyCertificates()
			.then((items: LearnerCertificate[]) => {
				if (active) setCertificates(items ?? []);
			})
			.catch((error: unknown) => {
				console.error('Failed to load certificates', error);
				if (active) setCertificates([]);
			})
			.finally(() => {
				if (active) setLoadingCertificates(false);
			});

		return () => {
			active = false;
		};
	}, [isAuthenticated]);

	const userName = params.username ?? authUser?.username ?? authUser?.name ?? 'learner';
	const publicProfileLink = useMemo(() => `/profile/${userName.toLowerCase().replace(/\s+/g, '-')}`, [userName]);
	const filteredSkills = useMemo(() => skills.filter((skill) => skill.name.toLowerCase().includes(skillSearch.toLowerCase())), [skillSearch, skills]);

	function addSkill() {
		const trimmed = newSkill.trim();
		if (!trimmed) return;
		setSkills((prev) => [...prev, { id: `${Date.now()}`, name: trimmed, proficiency: newProficiency }]);
		setNewSkill('');
	}

	function addExperience() {
		setExperience((prev) => [
			...prev,
			{
				id: `${Date.now()}`,
				title: 'Community mentor',
				company: 'Open Learning Circle',
				startDate: '2025-01-01',
				endDate: null,
				description: 'Mentoring learners on careers, interview prep, and portfolio polish.',
			},
		]);
	}

	async function handleSaveProfile() {
		setSavingProfile(true);
		setProfileMessage('Saving your profile so employers can see the latest version of your details.');
		try {
			const updated = await updateProfile({
				name,
				bio,
				avatarUrl: avatarUrl || undefined,
				location,
				skills: skills.map((skill) => ({ skillName: skill.name, level: skill.proficiency })),
			});
			signIn({ ...(authUser ?? {}), ...updated });
			setProfileMessage('Profile saved successfully. The page now reflects your updated public information.');
			if (updated?.name) {
				// keep the page stable even before a full auth refresh
				setName(updated.name);
			}
		} catch (saveError) {
			console.error('Failed to save profile', saveError);
			setProfileMessage('Profile could not be saved right now. Check your connection and try again.');
		} finally {
			setSavingProfile(false);
		}
	}

	return (
		<SiteLayout>
			<section className="profile-page">
				<header className="profile-hero card">
					<div className="profile-hero__main">
						<p className="section-head__eyebrow">Profile</p>
						<h2>{name} · {userName}</h2>
						<p className="card-meta">Manage skills, experiences, certificates, and your public share link.</p>
						<div className="profile-hero__actions">
							<Button to={publicProfileLink} variant="primary">Open public view</Button>
							<Button to="/courses" variant="secondary">Continue learning</Button>
						</div>
						<div className="profile-hero__actions">
							<Button type="button" variant="primary" onClick={handleSaveProfile} disabled={savingProfile || loadingProfile}>
								{savingProfile ? 'Saving profile…' : 'Save profile'}
							</Button>
							{profileMessage ? <CardMeta>{profileMessage}</CardMeta> : null}
						</div>
					</div>
					<div className="profile-hero__side">
						<Card className="profile-hero__card">
							<CardEyebrow>Profile health</CardEyebrow>
							<CardTitle>At a glance</CardTitle>
							<div className="dashboard-trend-list">
								<div className="dashboard-trend-row"><span>Certificates</span><strong>{certificates.length}</strong></div>
								<div className="dashboard-trend-row"><span>Skills</span><strong>{skills.length}</strong></div>
								<div className="dashboard-trend-row"><span>Experiences</span><strong>{experience.length}</strong></div>
							</div>
						</Card>
					</div>
				</header>

				<div className="profile-grid">
					<Card>
						<CardEyebrow>Public profile</CardEyebrow>
						<CardTitle>Shareable link</CardTitle>
						<CardMeta>{publicProfileLink}</CardMeta>
						<p className="card-meta">This route is ready for public profile rendering and social sharing previews.</p>
						<Button to={publicProfileLink} variant="secondary">Open public view</Button>
					</Card>

					<Card>
						<CardEyebrow>Photo upload</CardEyebrow>
						<CardTitle>Profile photo</CardTitle>
						<CardMeta>Local preview is enabled now; backend presigned uploads can be wired in next.</CardMeta>
						{previewUrl ? <img src={previewUrl} alt="Profile preview" className="profile-avatar-preview" /> : <div className="profile-avatar-fallback">{(authUser?.name ?? 'HW').slice(0, 2).toUpperCase()}</div>}
						<label>
							Avatar URL
							<input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://example.com/avatar.jpg" />
						</label>
						<input type="file" accept="image/*" onChange={(e) => {
							const file = e.target.files?.[0];
							if (!file) return;
							setPreviewUrl(URL.createObjectURL(file));
						}} />
					</Card>
				</div>

				<section className="dashboard-section">
					<div className="section-head">
						<div>
							<p className="section-head__eyebrow">Onboarding</p>
							<h2>Three-step setup wizard</h2>
						</div>
					</div>
					<div className="onboarding-wizard card">
						<div className="onboarding-wizard__steps">
							{['Profile', 'Skills', 'Interests'].map((step, index) => (
								<button key={step} type="button" className={index + 1 === onboardingStep ? 'onboarding-step is-active' : 'onboarding-step'} onClick={() => setOnboardingStep(index + 1)}>
									<span>{index + 1}</span>
									{step}
								</button>
							))}
						</div>
						<div className="onboarding-wizard__content">
							{onboardingStep === 1 ? <p>Confirm your identity and headline so employers see a clear first impression.</p> : null}
							{onboardingStep === 2 ? <p>Add the skills you want matched against jobs and certificates.</p> : null}
							{onboardingStep === 3 ? <p>Choose the roles and industries you want recommended in the dashboard.</p> : null}
						</div>
					</div>
				</section>

				<section className="dashboard-section">
					<div className="section-head">
						<div>
							<p className="section-head__eyebrow">Skills</p>
							<h2>Tags and proficiency</h2>
						</div>
					</div>
					<Card>
						<div className="profile-form-grid">
							<label>
								Search skills
								<input value={skillSearch} onChange={(e) => setSkillSearch(e.target.value)} placeholder="Search your skills" />
							</label>
							<label>
								Add skill
								<input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="React, design systems, mentoring..." />
							</label>
							<label>
								Proficiency
								<select value={newProficiency} onChange={(e) => setNewProficiency(e.target.value as Proficiency)}>
									<option value="BEGINNER">Beginner</option>
									<option value="INTERMEDIATE">Intermediate</option>
									<option value="ADVANCED">Expert</option>
								</select>
							</label>
						</div>
						<div className="job-card__actions">
							<Button type="button" onClick={addSkill}>Add skill</Button>
							<Button type="button" variant="secondary" onClick={() => setSkills([])}>Clear skills</Button>
						</div>
						<div className="job-card__tags profile-tags">
							{filteredSkills.map((skill) => <span key={skill.id}>{skill.name} · {proficiencyLabels[skill.proficiency]}</span>)}
						</div>
					</Card>
				</section>

				<section className="dashboard-section">
					<div className="section-head">
						<div>
							<p className="section-head__eyebrow">Experience</p>
							<h2>Career timeline</h2>
						</div>
					</div>
					<div className="profile-timeline">
						{experience.map((item) => (
							<Card key={item.id}>
								<CardTitle>{item.title}</CardTitle>
								<CardMeta>{item.company}</CardMeta>
								<p className="card-meta">{item.description}</p>
							</Card>
						))}
					</div>
					<div className="job-card__actions">
						<Button type="button" onClick={addExperience}>Add timeline entry</Button>
					</div>
				</section>

				<section className="dashboard-section">
					<div className="section-head">
						<div>
							<p className="section-head__eyebrow">Certificates</p>
							<h2>Issued badges</h2>
						</div>
					</div>
					{loadingCertificates ? <p>Loading certificates…</p> : null}
					<div className="job-grid">
						{certificates.map((certificate) => (
							<Card key={certificate.id} className="job-card">
								<CardEyebrow>{new Date(certificate.issuedAt).toLocaleDateString()}</CardEyebrow>
								<CardTitle>{certificate.courseTitle}</CardTitle>
								<CardMeta>{certificate.verifyUrl}</CardMeta>
								<div className="job-card__actions">
									<Button href={certificate.pdfUrl ?? '#'} variant="secondary">Open PDF</Button>
									<Button href={certificate.verifyUrl} variant="primary">Verify</Button>
								</div>
							</Card>
						))}
					</div>
				</section>

				<section className="dashboard-section">
					<Card>
						<CardEyebrow>About</CardEyebrow>
						<CardTitle>Headline and summary</CardTitle>
						<div className="profile-form-grid">
							<label>
								Name
								<input value={name} onChange={(e) => setName(e.target.value)} />
							</label>
							<label>
								Location
								<input value={location} onChange={(e) => setLocation(e.target.value)} />
							</label>
							<label>
								Headline
								<textarea value={headline} onChange={(e) => setHeadline(e.target.value)} rows={2} />
							</label>
							<label>
								Bio
								<textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} />
							</label>
						</div>
						<div className="job-card__actions">
							<Button type="button" variant="primary" onClick={handleSaveProfile} disabled={savingProfile || loadingProfile}>
								Save changes
							</Button>
						</div>
						<p className="card-meta">{headline}</p>
						<p className="card-meta">{bio}</p>
					</Card>
				</section>
			</section>
		</SiteLayout>
	);
}
