import { useEffect, useState } from 'react';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { Card, CardEyebrow, CardTitle, CardMeta } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { getMentors, MentorSummary } from '../../services/mentors.service';
import { useAuth } from '../../hooks/useAuth';

export default function MentorList() {
  const { user } = useAuth();
  const [mentors, setMentors] = useState<MentorSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let active = true;
    getMentors()
      .then((data) => { if (active) setMentors(data ?? []); })
      .catch(() => { if (active) setMentors([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filtered = mentors.filter((m) =>
    !search.trim() ||
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    (m.bio ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (m.skills ?? []).some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <SiteLayout>
      <section className="studio-catalog">
        <section className="studio-catalog__hero" style={{
          backgroundImage: "linear-gradient(to right, rgba(0,10,40,0.85) 0%, rgba(0,10,40,0.45) 100%), url('https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1600&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
        }}>
          <div className="studio-catalog__headline">
            <p className="eyebrow" style={{ color: 'rgba(255,255,255,0.8)' }}>Mentorship</p>
            <h1 className="display" style={{ color: 'white' }}>Connect with industry mentors</h1>
            <p className="lead" style={{ color: 'rgba(255,255,255,0.9)' }}>Book one-on-one sessions with experienced practitioners who can guide your career and learning journey.</p>
            <div className="studio-action-row">
              <Button to="/courses" variant="secondary">Browse courses</Button>
              {user?.role === 'MENTOR' && <Button to="/mentors/dashboard" variant="primary">My dashboard</Button>}
            </div>
          </div>
          <div className="studio-catalog__stats">
            <div><span>Available mentors</span><strong style={{ color: 'white' }}>{mentors.length}</strong></div>
            <div><span>Specialisations</span><strong style={{ color: 'white' }}>{new Set(mentors.flatMap((m) => m.skills ?? [])).size}</strong></div>
          </div>
        </section>

        <section className="studio-catalog__layout">
          <aside className="studio-catalog__filters">
            <Card className="studio-block">
              <CardEyebrow>Search mentors</CardEyebrow>
              <div className="form-stack">
                <label>
                  Keyword
                  <input
                    type="search"
                    placeholder="Name, skill, expertise"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>
              </div>
              <div className="studio-action-row">
                <Button type="button" variant="ghost" onClick={() => setSearch('')}>Clear</Button>
              </div>
            </Card>
          </aside>

          <main className="studio-catalog__results">
            <div className="studio-catalog__toolbar">
              <div>
                <p className="eyebrow">Results</p>
                <h2>{filtered.length} mentor{filtered.length !== 1 ? 's' : ''} found</h2>
              </div>
            </div>

            {loading ? (
              <Card className="studio-block"><CardMeta>Loading mentors…</CardMeta></Card>
            ) : filtered.length === 0 ? (
              <Card className="studio-block">
                <CardTitle>No mentors found</CardTitle>
                <CardMeta>Try a broader search or check back later.</CardMeta>
              </Card>
            ) : (
              <div className="studio-catalog-grid">
                {filtered.map((m) => (
                  <Card key={m.id} className="studio-catalog-card">
                    <div className="studio-catalog-card__head">
                      <div>
                        <CardEyebrow>{m.title ?? 'Mentor'}</CardEyebrow>
                        <CardTitle>{m.name}</CardTitle>
                      </div>
                    </div>
                    <CardMeta>{m.bio ?? 'Industry practitioner available for mentoring sessions.'}</CardMeta>
                    {m.availability && <CardMeta>{Array.isArray(m.availability) ? m.availability.join(' · ') : m.availability}</CardMeta>}
                    <div className="studio-chip-row">
                      {(m.skills ?? []).slice(0, 4).map((s) => <span key={s} className="dashboard-chip">{s}</span>)}
                    </div>
                    <div className="studio-action-row">
                      <Button to={`/mentors/${m.id}`} variant="secondary">View profile</Button>
                      {user?.role === 'LEARNER' && <Button to={`/mentors/${m.id}/book`} variant="primary" className="button--pill">Book session</Button>}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </main>
        </section>
      </section>
    </SiteLayout>
  );
}
