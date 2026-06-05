import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { Button } from '../../components/ui/Button';
import { Card, CardEyebrow, CardMeta, CardTitle } from '../../components/ui/Card';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';
import authService, { updateProfile, uploadProfilePicture } from '../../services/auth.service';
import { getMyCertificates, type LearnerCertificate } from '../../services/certificates.service';
import type { ProfileSkill, Proficiency } from '../../types/user.types';
import type { AuthUser as RemoteAuthUser } from '../../types/auth.types';

const proficiencyLabels: Record<Proficiency, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Expert',
};

export default function Profile() {
  const { user: authUser, isAuthenticated, signIn } = useAuth();
  const params = useParams<{ username?: string; id?: string }>();

  const isPublicView =
    !!(params.username || params.id) &&
    params.username !== authUser?.username &&
    params.id !== authUser?.id;

  const role = (authUser?.role ?? 'LEARNER').toUpperCase();
  const isAdmin = role === 'ADMIN';
  const isLearner = role === 'LEARNER';
  const isEmployer = role === 'EMPLOYER';
  const isMentor = role === 'MENTOR';
  const isInstitution = role === 'INSTITUTION';

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [loadingCertificates, setLoadingCertificates] = useState(true);
  const [certificates, setCertificates] = useState<LearnerCertificate[]>([]);

  const [name, setName] = useState(authUser?.name ?? '');
  const [location, setLocation] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [headline, setHeadline] = useState('');
  const [skills, setSkills] = useState<ProfileSkill[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [newProficiency, setNewProficiency] = useState<Proficiency>('BEGINNER');
  const [skillSearch, setSkillSearch] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [onboardingStep, setOnboardingStep] = useState(1);

  // Mentor-specific fields
  const [expertise, setExpertise] = useState('');
  const [hourlyRate, setHourlyRate] = useState<number | ''>('');
  const [availability, setAvailability] = useState('');

  // Employer / Institution fields
  const [orgName, setOrgName] = useState('');
  const [orgWebsite, setOrgWebsite] = useState('');

  useEffect(() => {
    if (!isAuthenticated && !isPublicView) {
      setLoadingProfile(false);
      setLoadingCertificates(false);
      return;
    }

    let active = true;

    const load = async () => {
      try {
        const profile =
          isPublicView && params.id
            ? await api.get(`/users/${params.id}`).then((res) => res.data)
            : isAuthenticated
            ? await authService.profile()
            : null;

        if (!active || !profile) return;

        const p = profile as RemoteAuthUser & {
          mentorProfile?: { expertise?: string; bio?: string; hourlyRate?: number; availability?: string };
          organization?: { name?: string; website?: string };
        };

        if (p.name) setName(p.name);
        if (p.location) setLocation(p.location);
        if (p.avatarUrl) setAvatarUrl(p.avatarUrl);
        if (p.bio) setBio(p.bio);
        if (p.headline) setHeadline(p.headline);
        if (p.skills?.length) {
          setSkills(
            p.skills.map((s: any, i: number) => ({
              id: s.id ?? `skill-${i}`,
              name: s.skill?.name ?? s.skillName ?? s.name,
              proficiency: (s.level === 'EXPERT' ? 'ADVANCED' : s.level) as Proficiency ?? 'BEGINNER',
            })),
          );
        }
        if (p.mentorProfile) {
          if (p.mentorProfile.expertise) setExpertise(p.mentorProfile.expertise);
          if (p.mentorProfile.hourlyRate != null) setHourlyRate(p.mentorProfile.hourlyRate);
          if (p.mentorProfile.availability) setAvailability(p.mentorProfile.availability);
        }
        if (p.organization) {
          if (p.organization.name) setOrgName(p.organization.name);
          if (p.organization.website) setOrgWebsite(p.organization.website);
        }
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        if (active) setLoadingProfile(false);
      }
    };

    load();

    if (!isPublicView && isAuthenticated && isLearner) {
      getMyCertificates()
        .then((items) => { if (active) setCertificates(items ?? []); })
        .catch(() => { if (active) setCertificates([]); })
        .finally(() => { if (active) setLoadingCertificates(false); });
    } else {
      setLoadingCertificates(false);
    }

    return () => { active = false; };
  }, [isAuthenticated, isPublicView, params.id]);

  const userName = params.username ?? authUser?.username ?? authUser?.name ?? 'user';
  const publicProfileLink = useMemo(
    () => `/profile/${userName.toLowerCase().replace(/\s+/g, '-')}`,
    [userName],
  );
  const filteredSkills = useMemo(
    () => skills.filter((s) => s.name.toLowerCase().includes(skillSearch.toLowerCase())),
    [skillSearch, skills],
  );

  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    setSkills((prev) => [...prev, { id: `${Date.now()}`, name: trimmed, proficiency: newProficiency }]);
    setNewSkill('');
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileMessage('');
    try {
      let finalAvatarUrl = avatarUrl;
      if (selectedFile) {
        const res = await uploadProfilePicture(selectedFile);
        finalAvatarUrl = res.publicUrl;
      }
      const toApiLevel = (p: string) => (p === 'ADVANCED' ? 'EXPERT' : p);
      const updated = await updateProfile({
        name,
        bio,
        headline,
        avatarUrl: finalAvatarUrl || undefined,
        location,
        skills: skills.map((s) => ({ skillName: s.name, level: toApiLevel(s.proficiency) })),
      });
      signIn({ ...(authUser ?? {}), ...updated });
      if (updated?.name) setName(updated.name);
      if (finalAvatarUrl) setAvatarUrl(finalAvatarUrl);
      setSelectedFile(null);
      setProfileMessage(`Profile updated — changes are now visible on ${name}'s public page.`);
    } catch (err) {
      console.error('Failed to save profile', err);
      setProfileMessage(`Could not save ${name}'s profile. Check your connection and try again.`);
    } finally {
      setSavingProfile(false);
    }
  };

  const roleLabel = isEmployer
    ? 'Employer profile'
    : isMentor
    ? 'Mentor profile'
    : isInstitution
    ? 'Institution profile'
    : 'Learner profile';

  const onboardingSteps = isEmployer
    ? ['Identity', 'Company', 'Hiring preferences']
    : isMentor
    ? ['Identity', 'Expertise', 'Availability']
    : isInstitution
    ? ['Identity', 'Organisation', 'Programmes']
    : ['Identity', 'Skills', 'Interests'];

  const profileContent = (
    <section className={`studio-profile studio-profile--${role.toLowerCase()}`}>
        <header className="studio-profile__hero">
          <div>
            <p className="eyebrow">{roleLabel}</p>
            <h1 className="display">{name || authUser?.name}</h1>
            {headline && <p className="lead">{headline}</p>}
            <div className="studio-action-row" style={{ marginTop: '24px' }}>
              <Button to={publicProfileLink} variant="secondary">Public profile</Button>
              {!isPublicView && (
                <Button type="button" variant="primary" onClick={handleSaveProfile} disabled={savingProfile || loadingProfile}>
                  {savingProfile ? 'Saving...' : 'Save profile'}
                </Button>
              )}
            </div>
            {profileMessage && (
              <div style={{ marginTop: '16px', color: 'var(--accent)' }}>
                <strong>{profileMessage}</strong>
              </div>
            )}
          </div>
        </header>

        <section className="learning-redesign__layout">
          <aside className="learning-redesign__sidebar">
            <Card className="studio-block">
              <CardEyebrow>Profile picture</CardEyebrow>
              <div className="profile-avatar-block">
                <div className="profile-avatar-circle">
                  {previewUrl || avatarUrl ? (
                    <img src={previewUrl || avatarUrl} alt={`${name}'s avatar`} />
                  ) : (
                    <span className="profile-avatar-initials">
                      {(name || authUser?.name || 'HW').slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                {!isPublicView && (
                  <label className="profile-upload-label">
                    Upload new picture
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setSelectedFile(file);
                        setPreviewUrl(URL.createObjectURL(file));
                      }}
                    />
                  </label>
                )}
              </div>
            </Card>

            {!isPublicView && (
              <Card className="studio-block">
                <CardEyebrow>Profile setup</CardEyebrow>
                <div className="dashboard-summary__grid" style={{ marginTop: '16px' }}>
                  {onboardingSteps.map((step, i) => (
                    <button
                      key={step}
                      type="button"
                      className={`onboarding-step ${i + 1 === onboardingStep ? 'is-active' : ''}`.trim()}
                      onClick={() => setOnboardingStep(i + 1)}
                    >
                      <span>{i + 1}</span>
                      {step}
                    </button>
                  ))}
                </div>
              </Card>
            )}
          </aside>

          <div className="learning-redesign__content">
            {/* ── Basic info (all roles) ── */}
            <Card className="studio-block">
              <CardEyebrow>Basic information</CardEyebrow>
              <div className="form-stack mt-md">
                <label>Full name<input value={name} onChange={(e) => setName(e.target.value)} disabled={isPublicView} /></label>
                <label>Location<input value={location} onChange={(e) => setLocation(e.target.value)} disabled={isPublicView} /></label>
                {(isLearner || isMentor) && (
                  <label>
                    Headline
                    <input value={headline} onChange={(e) => setHeadline(e.target.value)} disabled={isPublicView} placeholder="e.g. Full-Stack Engineer" />
                  </label>
                )}
                <label>
                  {isEmployer ? 'Company description' : isMentor ? 'Mentor bio' : isInstitution ? 'Institution overview' : 'About me'}
                  <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} disabled={isPublicView} placeholder={`Tell others about ${isPublicView ? name : 'yourself'}…`} />
                </label>
              </div>
            </Card>

            {/* ── LEARNER: skills + certificates ── */}
            {isLearner && (
              <>
                <Card className="studio-block">
                  <CardEyebrow>Skills and proficiency</CardEyebrow>
                  <div className="profile-form-grid">
                    <label>Search<input value={skillSearch} onChange={(e) => setSkillSearch(e.target.value)} placeholder="Filter skills" /></label>
                    {!isPublicView && (
                      <>
                        <label>Add skill<input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="React, analytics…" /></label>
                        <label>
                          Level
                          <select value={newProficiency} onChange={(e) => setNewProficiency(e.target.value as Proficiency)}>
                            {Object.entries(proficiencyLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                          </select>
                        </label>
                      </>
                    )}
                  </div>
                  {!isPublicView && <Button type="button" variant="primary" onClick={addSkill}>Add skill</Button>}
                  <div className="studio-chip-row" style={{ marginTop: '12px' }}>
                    {filteredSkills.map((s) => (
                      <span key={s.id} className="dashboard-chip">{s.name} · {proficiencyLabels[s.proficiency]}</span>
                    ))}
                    {filteredSkills.length === 0 && <span className="muted">No skills yet — add your first skill above.</span>}
                  </div>
                </Card>

                <Card className="studio-block">
                  <CardEyebrow>Certificates</CardEyebrow>
                  <h2>Issued credentials</h2>
                  {loadingCertificates ? (
                    <CardMeta>Loading {name}'s certificates…</CardMeta>
                  ) : certificates.length === 0 ? (
                    <CardMeta>{isPublicView ? `${name} has no certificates yet.` : 'Complete a course to unlock your first credential.'}</CardMeta>
                  ) : (
                    <div className="dashboard-list">
                      {certificates.map((cert) => (
                        <div key={cert.id} className="dashboard-list__item">
                          <div>
                            <strong>{cert.courseTitle}</strong>
                            <div className="dashboard-list__meta">Issued {new Date(cert.issuedAt).toLocaleDateString()}</div>
                          </div>
                          <Button href={cert.verifyUrl} variant="ghost">Verify</Button>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </>
            )}

            {/* ── MENTOR: expertise + availability ── */}
            {isMentor && (
              <Card className="studio-block">
                <CardEyebrow>Mentoring details</CardEyebrow>
                <div className="form-stack mt-md">
                  <label>
                    Expertise / specialisation
                    <input value={expertise} onChange={(e) => setExpertise(e.target.value)} disabled={isPublicView} placeholder="e.g. Web development, career coaching" />
                  </label>
                  <label>
                    Hourly rate (USD)
                    <input type="number" min={0} value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value === '' ? '' : Number(e.target.value))} disabled={isPublicView} placeholder="0" />
                  </label>
                  <label>
                    Availability
                    <input value={availability} onChange={(e) => setAvailability(e.target.value)} disabled={isPublicView} placeholder="e.g. Weekdays 18:00–20:00 CAT" />
                  </label>
                </div>
                {!isPublicView && (
                  <p className="muted" style={{ marginTop: '8px' }}>
                    Learners searching for mentors will see {name}'s expertise and rate.
                  </p>
                )}
              </Card>
            )}

            {/* ── EMPLOYER: hiring profile ── */}
            {isEmployer && (
              <Card className="studio-block">
                <CardEyebrow>Employer profile</CardEyebrow>
                <CardTitle>Hiring identity</CardTitle>
                <div className="form-stack mt-md">
                  <label>Company name<input value={orgName} onChange={(e) => setOrgName(e.target.value)} disabled={isPublicView} /></label>
                  <label>Company website<input value={orgWebsite} onChange={(e) => setOrgWebsite(e.target.value)} disabled={isPublicView} placeholder="https://" /></label>
                  <label>
                    Recruiter statement
                    <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} disabled={isPublicView} placeholder="Describe your recruiting philosophy and candidate experience goals" />
                  </label>
                </div>
                <div className="studio-chip-row" style={{ marginTop: '12px' }}>
                  <span className="dashboard-chip">Candidate quality</span>
                  <span className="dashboard-chip">Pipeline speed</span>
                  <span className="dashboard-chip">Interview rigor</span>
                </div>
                {!isPublicView && (
                  <p className="muted" style={{ marginTop: '8px' }}>
                    This profile is shown to candidates viewing {name}'s job postings.
                  </p>
                )}
              </Card>
            )}

            {/* ── INSTITUTION: org info ── */}
            {isInstitution && (
              <Card className="studio-block">
                <CardEyebrow>Institution details</CardEyebrow>
                <div className="form-stack mt-md">
                  <label>Institution name<input value={orgName} onChange={(e) => setOrgName(e.target.value)} disabled={isPublicView} /></label>
                  <label>Website<input value={orgWebsite} onChange={(e) => setOrgWebsite(e.target.value)} disabled={isPublicView} placeholder="https://" /></label>
                </div>
                {!isPublicView && (
                  <p className="muted" style={{ marginTop: '8px' }}>
                    Learners and mentors will see {name}'s institution details on course and certification pages.
                  </p>
                )}
              </Card>
            )}
          </div>
        </section>
      </section>
  );

  return (
    <SiteLayout>
      {isAdmin ? (
        <div className="app-shell-layout">
          <AdminSidebar />
          <div className="studio-dashboard dashboard-redesign">{profileContent}</div>
        </div>
      ) : (
        profileContent
      )}
    </SiteLayout>
  );
}
