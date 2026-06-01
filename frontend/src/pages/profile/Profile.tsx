import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { Button } from '../../components/ui/Button';
import { Card, CardEyebrow, CardMeta, CardTitle } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import authService, { updateProfile, type AuthUser as RemoteAuthUser } from '../../services/auth.service';
import { getMyCertificates, type LearnerCertificate } from '../../services/certificates.service';
import type { ProfileSkill, Proficiency } from '../../types/user.types';

const proficiencyLabels: Record<Proficiency, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Expert',
};

export default function Profile() {
  const { user: authUser, isAuthenticated, signIn } = useAuth();
  const params = useParams<{ id?: string; username?: string }>();
  const isPublicView = Boolean(params.id && params.id !== authUser?.id);

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
  const [onboardingStep, setOnboardingStep] = useState(1);

  useEffect(() => {
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
              proficiency: (skill.level as Proficiency) ?? 'BEGINNER',
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
  }, [isAuthenticated, isPublicView, params.id]);

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
      const updated = await updateProfile({
        name,
        bio,
        avatarUrl: avatarUrl || undefined,
        location,
        skills: skills.map((skill) => ({ skillName: skill.name, level: skill.proficiency })),
      });

      signIn({ ...(authUser ?? {}), ...updated });
      if (updated?.name) setName(updated.name);
      setProfileMessage('Profile saved successfully. The page now reflects your updated public information.');
    } catch (error) {
      console.error('Failed to save profile', error);
      setProfileMessage('Profile could not be saved right now. Check your connection and try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <SiteLayout>
      <section className={`studio-profile ${recruiterMode ? 'studio-profile--recruiter' : 'studio-profile--learner'}`.trim()}>
        <header className="studio-profile__hero">
          <div>
            <p className="eyebrow">{recruiterMode ? 'Recruiter profile' : 'Learner profile'}</p>
            <h1 className="display">{name}</h1>
            <p className="lead">{headline}</p>
            <div className="studio-action-row">
              <Button to={publicProfileLink} variant="secondary">Public profile</Button>
              {!isPublicView ? (
                <Button type="button" variant="primary" className="button--pill" onClick={handleSaveProfile} disabled={savingProfile || loadingProfile}>
                  {savingProfile ? 'Saving profile...' : 'Save profile'}
                </Button>
              ) : null}
            </div>
            {profileMessage ? <CardMeta>{profileMessage}</CardMeta> : null}
          </div>

          <Card className="studio-block">
            <CardEyebrow>Identity</CardEyebrow>
            {previewUrl ? (
              <img src={previewUrl} alt="Profile preview" className="profile-avatar-preview" />
            ) : (
              <div className="profile-avatar-fallback">{(authUser?.name ?? 'HW').slice(0, 2).toUpperCase()}</div>
            )}
            <label className="form-stack">
              Avatar URL
              <input value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} placeholder="https://example.com/avatar.jpg" />
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                setPreviewUrl(URL.createObjectURL(file));
              }}
            />
          </Card>
        </header>

        <section className="studio-profile__base">
          <Card className="studio-block">
            <CardEyebrow>About</CardEyebrow>
            <div className="profile-form-grid">
              <label>Name<input value={name} onChange={(event) => setName(event.target.value)} /></label>
              <label>Location<input value={location} onChange={(event) => setLocation(event.target.value)} /></label>
              <label>Headline<textarea value={headline} onChange={(event) => setHeadline(event.target.value)} rows={2} /></label>
              <label>Bio<textarea value={bio} onChange={(event) => setBio(event.target.value)} rows={4} /></label>
            </div>
          </Card>

          <Card className="studio-block">
            <CardEyebrow>Onboarding</CardEyebrow>
            <div className="dashboard-summary__grid">
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
            <div className="onboarding-wizard__content">
              {onboardingStep === 1 ? <p>Complete key profile identity fields so your account appears trustworthy.</p> : null}
              {onboardingStep === 2 ? <p>List strengths that guide matching across roles and platform opportunities.</p> : null}
              {onboardingStep === 3 ? <p>{recruiterMode ? 'Set hiring intent and candidate priorities for better discovery.' : 'Set job interests to improve recommendation quality.'}</p> : null}
            </div>
          </Card>
        </section>

        <section className="dashboard-section">
          <div className="section-head">
            <div>
              <p className="section-head__eyebrow">Skills</p>
              <h2>Tags and proficiency</h2>
            </div>
          </div>

          <Card>
            {!isPublicView ? (
              <>
                <div className="profile-form-grid">
                  <label>
                    Search skills
                    <input value={skillSearch} onChange={(event) => setSkillSearch(event.target.value)} placeholder="Search your skills" />
                  </label>
                  <label>
                    New skill
                    <input value={newSkill} onChange={(event) => setNewSkill(event.target.value)} placeholder="e.g. GraphQL" />
                  </label>
                  <label>
                    Proficiency
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
              </>
            ) : null}

            <div style={{ marginTop: 16 }}>
              {filteredSkills.map((skill) => (
                <div key={skill.id} className="dashboard-list__item">
                  <div>
                    <strong>{skill.name}</strong>
                    <div className="dashboard-list__meta">{skill.proficiency}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="dashboard-section">
          <div className="section-head">
            <div>
              <p className="section-head__eyebrow">Certificates</p>
              <h2>Verified learning</h2>
            </div>
          </div>
          <Card>
            {loadingCertificates ? <CardMeta>Loading certificates...</CardMeta> : null}
            {certificates.length === 0 ? <CardMeta>No certificates found yet.</CardMeta> : null}
            {certificates.map((certificate) => (
              <div key={certificate.id} className="dashboard-list__item">
                <div>
                  <strong>{certificate.courseTitle}</strong>
                  <div className="dashboard-list__meta">Issued {new Date(certificate.issuedAt).toLocaleDateString()}</div>
                  <div className="dashboard-list__meta">
                    {certificate.pdfUrl ? <a href={certificate.pdfUrl} target="_blank" rel="noreferrer">View PDF</a> : <a href={certificate.verifyUrl} target="_blank" rel="noreferrer">Verify certificate</a>}
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </section>
      </section>
    </SiteLayout>
  );
}