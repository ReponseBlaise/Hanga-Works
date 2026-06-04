import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { Button } from '../../components/ui/Button';
import { Card, CardEyebrow, CardMeta } from '../../components/ui/Card';
import { useAuth } from '../../hooks/useAuth';
import { getMySessions, createProfile, type MentorSession } from '../../services/mentorship.service';

export default function MentorDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [sessions, setSessions] = useState<MentorSession[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    expertise: '',
    bio: '',
    hourlyRate: 0,
    availability: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    getMySessions()
      .then((data) => {
        if (!active) return;
        setSessions(data ?? []);
      })
      .catch((error) => console.error('Failed to load sessions', error))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  const upcomingSessions = useMemo(() => {
    return sessions.filter(s => s.status === 'PENDING' || s.status === 'ACCEPTED').slice(0, 3);
  }, [sessions]);

  const recentSessions = useMemo(() => {
    return sessions.filter(s => s.status === 'COMPLETED').slice(0, 3);
  }, [sessions]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createProfile({
        expertise: form.expertise,
        bio: form.bio,
        hourlyRate: Number(form.hourlyRate),
        availability: form.availability,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <SiteLayout>
      <div className="app-shell-layout">
        <aside className="app-shell-sidebar">
          <div className="app-shell-brand">
            <strong>Hanga Works</strong>
            <span>Mentor Menu</span>
          </div>
          <nav className="app-shell-nav">
            <Link to="/mentors/dashboard" className="app-shell-nav__item is-active">Dashboard</Link>
            <Link to="/notifications" className="app-shell-nav__item">Messages</Link>
            <Link to="/profile" className="app-shell-nav__item">Account Settings</Link>
          </nav>
        </aside>

        <div className="studio-dashboard studio-dashboard--employer dashboard-redesign">
          <section className="dashboard-redesign__hero">
            <div>
              <p className="eyebrow">Mentor dashboard</p>
              <h1 className="display">Welcome back, {user?.name}</h1>
              <p className="lead">
                Manage your mentorship profile, review upcoming sessions, and guide the next generation of talent.
              </p>
            </div>
            <div className="dashboard-redesign__headline-stats">
              <div>
                <span>Total Sessions</span>
                <strong style={{ color: 'var(--text)' }}>{loading ? '...' : sessions.length}</strong>
              </div>
              <div>
                <span>Upcoming</span>
                <strong style={{ color: 'var(--text)' }}>{loading ? '...' : upcomingSessions.length}</strong>
              </div>
            </div>
          </section>

          <section className="dashboard-redesign__layout">
            <main className="dashboard-main-column">
              <Card className="studio-block">
                <div className="studio-section__head">
                  <div>
                    <p className="eyebrow">Session Management</p>
                    <h2>Upcoming Sessions</h2>
                  </div>
                </div>
                <div className="studio-stack">
                  {upcomingSessions.length === 0 ? (
                    <div className="studio-inline-item">
                      <div>
                        <strong>No upcoming sessions</strong>
                        <p>When learners book you, they will appear here.</p>
                      </div>
                    </div>
                  ) : (
                    upcomingSessions.map((session) => (
                      <div key={session.id} className="studio-inline-item">
                        <div>
                          <strong>{session.mentee?.name || 'Learner'}</strong>
                          <p>{new Date(session.scheduledAt).toLocaleString()} ({session.durationMinutes} mins)</p>
                        </div>
                        <span className="dashboard-chip">{session.status}</span>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              <Card className="studio-block">
                <div className="studio-section__head">
                  <div>
                    <p className="eyebrow">Public Profile</p>
                    <h2>Setup your Mentorship Profile</h2>
                  </div>
                </div>
                <form onSubmit={handleProfileSave} className="form-stack">
                  <label>Expertise<input type="text" placeholder="e.g. Frontend, System Design, Career Advice" required value={form.expertise} onChange={e => setForm({...form, expertise: e.target.value})} /></label>
                  <label>Bio<textarea placeholder="Tell learners about your experience..." rows={3} value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} /></label>
                  <div className="profile-form-grid">
                    <label>Hourly Rate (RWF)<input type="number" min="0" value={form.hourlyRate} onChange={e => setForm({...form, hourlyRate: Number(e.target.value)})} /></label>
                    <label>Availability<input type="text" placeholder="e.g. Weekends, Evenings" value={form.availability} onChange={e => setForm({...form, availability: e.target.value})} /></label>
                  </div>
                  <div className="studio-action-row">
                    <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Saving...' : 'Update Mentor Profile'}</Button>
                    {saved && <span style={{ color: 'var(--accent)' }}>Profile updated!</span>}
                  </div>
                </form>
              </Card>
            </main>

            <aside className="dashboard-rail">
              <Card className="studio-block">
                <CardEyebrow>Recent History</CardEyebrow>
                <div className="studio-stack">
                  {recentSessions.length === 0 ? (
                    <CardMeta>No completed sessions yet.</CardMeta>
                  ) : (
                    recentSessions.map((task) => (
                      <div key={task.id} className="studio-inline-item">
                        <div>
                          <strong>{task.mentee?.name}</strong>
                          <p>{new Date(task.scheduledAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </aside>
          </section>
        </div>
      </div>
    </SiteLayout>
  );
}
