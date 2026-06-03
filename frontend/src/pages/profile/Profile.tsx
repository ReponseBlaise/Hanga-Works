import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { Button } from '../../components/ui/Button';
import { Card, CardEyebrow, CardMeta, CardTitle } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import authService, { updateProfile, uploadProfilePicture, type AuthUser as RemoteAuthUser } from '../../services/auth.service';
import { getMyCertificates, type LearnerCertificate } from '../../services/certificates.service';
import type { ProfileSkill, Proficiency } from '../../types/user.types';

const proficiencyLabels: Record<Proficiency, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Expert',
};

export default function Profile() {
  const { user: authUser, isAuthenticated, signIn } = useAuth();
  const params = useParams<{ username?: string; id?: string }>();
  
  const isPublicView = !!(params.username || params.id) && (params.username !== authUser?.username && params.id !== authUser?.id);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [loadingCertificates, setLoadingCertificates] = useState(true);
  const [certificates, setCertificates] = useState<LearnerCertificate[]>([]);

  const [name, setName] = useState(authUser?.name ?? 'Frontend learner');
  const [location, setLocation] = useState('Kigali, Rwanda');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [headline, setHeadline] = useState('Frontend learner and product-minded builder');
  const [bio, setBio] = useState('Focused on matching real skills with real opportunities through UX, data, and thoughtful product flow.');
  const [skills, setSkills] = useState<ProfileSkill[]>([
    { id: 's1', name: 'React', proficiency: 'ADVANCED' },
    { id: 's2', name: 'TypeScript', proficiency: 'INTERMEDIATE' },
    { id: 's3', name: 'Career coaching', proficiency: 'BEGINNER' },
  ]);
  const [newSkill, setNewSkill] = useState('');
  const [newProficiency, setNewProficiency] = useState<Proficiency>('BEGINNER');
  const [skillSearch, setSkillSearch] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [onboardingStep, setOnboardingStep] = useState(1);

  useEffect(() => {
    if (!isAuthenticated && !isPublicView) {
      setLoadingProfile(false);
      setLoadingCertificates(false);
      return;
    }

    let active = true;

    const load = async () => {
      try {
        const profile = isPublicView && params.id ? await api.get(`/users/${params.id}`).then((res) => res.data) : isAuthenticated ? await authService.profile() : null;
        if (!active || !profile) return;

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
              proficiency: (skill.level === 'EXPERT' ? 'ADVANCED' : skill.level as Proficiency) ?? 'BEGINNER',
            })),
          );
        }
      } catch (error) {
        console.error('Failed to load profile', error);
      } finally {
        if (active) setLoadingProfile(false);
      }
    };

    load();

    if (!isPublicView && isAuthenticated) {
      getMyCertificates()
        .then((items) => {
          if (active) setCertificates(items ?? []);
        })
        .catch((error) => {
          console.error('Failed to load certificates', error);
          if (active) setCertificates([]);
        })
        .finally(() => {
          if (active) setLoadingCertificates(false);
        });
    } else {
      setLoadingCertificates(false);
    }

    return () => {
      active = false;
    };
  }, [isAuthenticated, isPublicView]);

  const userName = params.username ?? authUser?.username ?? authUser?.name ?? 'learner';
  const publicProfileLink = useMemo(() => `/profile/${userName.toLowerCase().replace(/\s+/g, '-')}`, [userName]);
  const filteredSkills = useMemo(
    () => skills.filter((skill) => skill.name.toLowerCase().includes(skillSearch.toLowerCase())),
    [skillSearch, skills],
  );

  const role = (authUser?.role ?? 'LEARNER').toUpperCase();
  const recruiterMode = role === 'EMPLOYER';

  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (!trimmed) return;
    setSkills((prev) => [...prev, { id: `${Date.now()}`, name: trimmed, proficiency: newProficiency }]);
    setNewSkill('');
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileMessage('Saving your profile so employers can see the latest version of your details.');

    try {
      let finalAvatarUrl = avatarUrl;
      if (selectedFile) {
        const uploadRes = await uploadProfilePicture(selectedFile);
        finalAvatarUrl = uploadRes.publicUrl;
      }

      const toApiLevel = (p: string) => (p === 'ADVANCED' ? 'EXPERT' : p);
      const updated = await updateProfile({
        name,
        bio,
        avatarUrl: finalAvatarUrl || undefined,
        location,
        skills: skills.map((skill) => ({ skillName: skill.name, level: toApiLevel(skill.proficiency) })),
      });

      signIn({ ...(authUser ?? {}), ...updated });
      if (updated?.name) setName(updated.name);
      if (finalAvatarUrl) setAvatarUrl(finalAvatarUrl);
      setSelectedFile(null); // Clear selected file after successful upload
      setProfileMessage('Profile saved successfully. The page now reflects your updated public information.');
    } catch (error) {
      console.error('Failed to save profile', error);
      setProfileMessage('Profile could not be saved right now. Check your connection and try again.');
    } finally {
      setSavingProfile(false);
    }
  }

  return (
    <SiteLayout>
      <section className={`studio-profile ${recruiterMode ? 'studio-profile--recruiter' : 'studio-profile--learner'}`.trim()}>
        <header className="studio-profile__hero">
          <div>
            <p className="eyebrow">{recruiterMode ? 'Recruiter profile' : 'Learner profile'}</p>
            <h1 className="display">{name}</h1>
            <p className="lead">{headline}</p>
            <div className="studio-action-row" style={{ marginTop: '24px' }}>
              <Button to={publicProfileLink} variant="secondary">Public profile</Button>
              {!isPublicView ? (
                <Button type="button" variant="primary" onClick={handleSaveProfile} disabled={savingProfile || loadingProfile}>
                  {savingProfile ? 'Saving profile...' : 'Save profile'}
                </Button>
              ) : null}
            </div>
            {profileMessage ? <div style={{ marginTop: '16px', color: 'var(--accent)' }}><strong>{profileMessage}</strong></div> : null}
          </div>
        </header>

        <section className="learning-redesign__layout" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px', marginTop: '32px' }}>
          <aside className="learning-redesign__sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Card className="studio-block">
              <CardEyebrow>Profile Picture</CardEyebrow>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginTop: '16px' }}>
                <div style={{ width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', background: 'var(--surface-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                  {previewUrl || avatarUrl ? (
                    <img src={previewUrl || avatarUrl} alt="Profile preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--text-soft)' }}>{(authUser?.name ?? 'HW').slice(0, 2).toUpperCase()}</span>
                  )}
                </div>
                {!isPublicView && (
                  <div style={{ width: '100%' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-soft)', display: 'block', marginBottom: '8px' }}>Upload new picture</label>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ width: '100%', padding: '8px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        setSelectedFile(file);
                        setPreviewUrl(URL.createObjectURL(file));
                      }}
                    />
                  </div>
                )}
              </div>
            </Card>

            <Card className="studio-block">
              <CardEyebrow>Onboarding Status</CardEyebrow>
              <div className="dashboard-summary__grid" style={{ marginTop: '16px' }}>
                {['Identity', 'Skills', recruiterMode ? 'Hiring preferences' : 'Interests'].map((step, index) => (
                  <button
                    key={step}
                    type="button"
                    className={`onboarding-step ${index + 1 === onboardingStep ? 'is-active' : ''}`.trim()}
                    onClick={() => setOnboardingStep(index + 1)}
                  >
                    <span>{index + 1}</span>
                    {step}
                  </button>
                ))}
              </div>
            </Card>
          </aside>

          <div className="learning-redesign__content" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <Card className="studio-block">
              <CardEyebrow>Basic Information</CardEyebrow>
              <div className="profile-form-grid" style={{ marginTop: '16px', display: 'grid', gap: '16px' }}>
                <label className="form-stack">
                  <span style={{ fontWeight: 600 }}>Full Name</span>
                  <input value={name} onChange={(event) => setName(event.target.value)} disabled={isPublicView} />
                </label>
                <label className="form-stack">
                  <span style={{ fontWeight: 600 }}>Location</span>
                  <input value={location} onChange={(event) => setLocation(event.target.value)} disabled={isPublicView} />
                </label>
                <label className="form-stack">
                  <span style={{ fontWeight: 600 }}>Professional Headline</span>
                  <input value={headline} onChange={(event) => setHeadline(event.target.value)} disabled={isPublicView} placeholder="e.g. Senior Frontend Engineer" />
                </label>
                <label className="form-stack">
                  <span style={{ fontWeight: 600 }}>About Me (Bio)</span>
                  <textarea value={bio} onChange={(event) => setBio(event.target.value)} rows={5} disabled={isPublicView} placeholder="Write a brief introduction..." />
                </label>
              </div>
            </Card>

        {recruiterMode ? (
          <section className="studio-profile__recruiter">
            <Card className="studio-block">
              <CardEyebrow>Recruiter summary</CardEyebrow>
              <CardTitle>Hiring profile</CardTitle>
              <CardMeta>Public link: {publicProfileLink}</CardMeta>
              <p className="muted">Use this space for employer branding, candidate communication style, and hiring focus areas.</p>
              <div className="studio-chip-row">
                <span className="dashboard-chip">Candidate quality</span>
                <span className="dashboard-chip">Pipeline speed</span>
                <span className="dashboard-chip">Interview rigor</span>
              </div>
            </Card>

            <Card className="studio-block">
              <CardEyebrow>Team notes</CardEyebrow>
              <label className="form-stack">
                Recruiter statement
                <textarea
                  rows={5}
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  placeholder="Describe your recruiting philosophy and candidate experience goals"
                />
              </label>
              <Button type="button" variant="secondary" onClick={handleSaveProfile} disabled={savingProfile || loadingProfile}>
                Save recruiter profile
              </Button>
            </Card>
          </section>
        ) : (
          <>
            <section className="studio-profile__skills">
              <Card className="studio-block">
                <CardEyebrow>Skills and proficiency</CardEyebrow>
                <div className="profile-form-grid">
                  <label>Search<input value={skillSearch} onChange={(event) => setSkillSearch(event.target.value)} placeholder="Search your skills" /></label>
                  <label>Add skill<input value={newSkill} onChange={(event) => setNewSkill(event.target.value)} placeholder="React, analytics, mentoring" /></label>
                  <label>
                    Level
                    <select value={newProficiency} onChange={(event) => setNewProficiency(event.target.value as Proficiency)}>
                      {Object.entries(proficiencyLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <Button type="button" variant="primary" onClick={addSkill}>Add skill</Button>
                  <Button type="button" variant="ghost" onClick={() => setProfileMessage('Experience editing is available in the full profile workspace.')}>Add experience</Button>
                </div>
                <div className="studio-chip-row">
                  {filteredSkills.map((skill) => (
                    <span key={skill.id} className="dashboard-chip">{skill.name} · {proficiencyLabels[skill.proficiency]}</span>
                  ))}
                </div>
              </Card>
            </section>

            <section className="studio-profile__timeline">
              <Card className="studio-block">
                <div className="studio-section__head">
                  <div>
                    <p className="eyebrow">Skill timeline</p>
                    <h2>Current strengths</h2>
                  </div>
                </div>
                <div className="dashboard-list">
                  {filteredSkills.length === 0 ? (
                    <div className="dashboard-list__item">
                      <div>
                        <strong>No skills match this search.</strong>
                        <div className="dashboard-list__meta">Try another keyword or add a new skill.</div>
                      </div>
                    </div>
                  ) : (
                    filteredSkills.map((skill) => (
                      <div key={skill.id} className="dashboard-list__item">
                        <div>
                          <strong>{skill.name}</strong>
                          <div className="dashboard-list__meta">{proficiencyLabels[skill.proficiency]}</div>
                        </div>
                        <span className="dashboard-chip">{skill.proficiency}</span>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </section>

            <section className="studio-profile__certs">
              <Card className="studio-block">
                <div className="studio-section__head">
                  <div>
                    <p className="eyebrow">Certificates</p>
                    <h2>Issued credentials</h2>
                  </div>
                </div>
                {loadingCertificates ? (
                  <CardMeta>Loading certificates...</CardMeta>
                ) : certificates.length === 0 ? (
                  <CardMeta>No certificates issued yet. Complete a course to unlock credentials.</CardMeta>
                ) : (
                  <div className="dashboard-list">
                    {certificates.map((certificate) => (
                      <div key={certificate.id} className="dashboard-list__item">
                        <div>
                          <strong>{certificate.courseTitle}</strong>
                          <div className="dashboard-list__meta">
                            Issued {new Date(certificate.issuedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <Button href={certificate.verifyUrl} variant="ghost">Verify</Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </section>
          </>
        )}
          </div>
        </section>
      </section>
    </SiteLayout>
  );
}