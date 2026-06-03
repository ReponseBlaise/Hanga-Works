import { useState, FormEvent, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { Card, CardTitle, CardMeta, CardEyebrow } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { createInstitutionMentor, getMentors, MentorProfile } from '../../services/mentorship.service';

export default function InstitutionMentors() {
  const [form, setForm] = useState({ name: '', email: '', expertise: '', hourlyRate: 0 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    let active = true;
    getMentors().then(data => {
      if (active) setMentors(data);
    }).catch(console.error);
    return () => { active = false; };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await createInstitutionMentor(form);
      setSuccess('Mentor created successfully!');
      setForm({ name: '', email: '', expertise: '', hourlyRate: 0 });
      setIsAdding(false);
      
      const updated = await getMentors();
      setMentors(updated);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to create mentor.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SiteLayout>
      <div className="app-shell-layout">
        <aside className="app-shell-sidebar">
          <div className="app-shell-brand">
            <strong>Hanga Works</strong>
            <span>Institution Menu</span>
          </div>
          <nav className="app-shell-nav">
            <Link to="/institution/dashboard" className="app-shell-nav__item">Dashboard</Link>
            <Link to="/courses/new" className="app-shell-nav__item">Create Course</Link>
            <Link to="/institution/mentors" className="app-shell-nav__item is-active">Mentors</Link>
            <Link to="/institution/certifications" className="app-shell-nav__item">Certifications</Link>
            <Link to="/profile" className="app-shell-nav__item">Institution Profile</Link>
          </nav>
        </aside>

        <div className="studio-dashboard dashboard-redesign">
          <header className="dashboard-redesign__hero">
            <div>
              <p className="eyebrow">Expertise Management</p>
              <h1 className="display">Institution Mentors</h1>
              <p className="lead">Create and manage expert mentors who will guide your learners.</p>
            </div>
            <div className="studio-action-row">
              <Button variant="primary" type="button" onClick={() => setIsAdding(!isAdding)}>
                {isAdding ? 'Cancel' : 'Add New Mentor'}
              </Button>
            </div>
          </header>

          <section className="dashboard-redesign__layout mt-lg">
            <main className="dashboard-main-column">
              {isAdding && (
                <Card className="studio-block mb-md">
                  <CardEyebrow>New Mentor</CardEyebrow>
                  <CardTitle>Create Mentor Account</CardTitle>
                  <CardMeta>They will receive an email to set their password later.</CardMeta>
                  
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                    <input type="text" required placeholder="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--border)' }} />
                    <input type="email" required placeholder="Email Address" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--border)' }} />
                    <input type="text" required placeholder="Expertise (e.g., UI/UX, Data Science)" value={form.expertise} onChange={e => setForm(f => ({ ...f, expertise: e.target.value }))} style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--border)' }} />
                    <label style={{ fontSize: '0.85rem' }}>Hourly Rate ($) (Optional)</label>
                    <input type="number" min="0" placeholder="0" value={form.hourlyRate} onChange={e => setForm(f => ({ ...f, hourlyRate: Number(e.target.value) }))} style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--border)' }} />
                    
                    <div className="studio-action-row">
                      <Button variant="primary" type="submit" disabled={saving}>
                        {saving ? 'Creating...' : 'Create Mentor'}
                      </Button>
                    </div>
                    {error && <p className="text-danger">{error}</p>}
                    {success && <p className="text-success" style={{ color: 'green' }}>{success}</p>}
                  </form>
                </Card>
              )}

              <Card className="studio-block">
                <div className="studio-section__head">
                  <div>
                    <p className="eyebrow">Your Team</p>
                    <h2>Active Mentors</h2>
                  </div>
                </div>

                <div className="studio-stack mt-md">
                  {mentors.length === 0 ? (
                    <CardMeta>No mentors registered under your institution yet.</CardMeta>
                  ) : (
                    mentors.map((mentor) => (
                      <div key={mentor.id} className="studio-inline-item">
                        <div>
                          <strong>{mentor.user?.name}</strong>
                          <p>{mentor.expertise} • ${mentor.hourlyRate}/hr</p>
                        </div>
                        <Button to={`/mentors/${mentor.userId}`} variant="secondary">View Profile</Button>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </main>
          </section>
        </div>
      </div>
    </SiteLayout>
  );
}
