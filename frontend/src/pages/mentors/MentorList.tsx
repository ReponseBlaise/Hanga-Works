import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { Card, CardEyebrow, CardTitle, CardMeta } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { getMentors, MentorSummary } from '../../services/mentors.service';

export default function MentorList() {
  const [mentors, setMentors] = useState<MentorSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getMentors()
      .then((data) => { if (active) setMentors(data ?? []); })
      .catch(() => { if (active) setMentors([]); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <SiteLayout>
      <div className="page-shell">
        <header className="page-head">
          <h1>Mentors</h1>
          <p className="muted">Discover industry mentors available for session bookings.</p>
        </header>

        {loading ? <p>Loading mentors…</p> : null}

        {!loading && mentors.length === 0 ? (
          <Card className="courses-empty">
            <CardTitle>No mentors available yet</CardTitle>
            <CardMeta>Backend mentor discovery is still pending, so the screen falls back to local mentor examples when needed.</CardMeta>
          </Card>
        ) : null}

        <div className="mentor-grid">
          {mentors.map((m) => (
            <Card key={m.id} className="mentor-card">
              <div className="mentor-card__top">
                <div>
                  <CardEyebrow>{m.title ?? 'Mentor'}</CardEyebrow>
                  <CardTitle>{m.name}</CardTitle>
                </div>
                <div className="mentor-skills">{(m.skills ?? []).slice(0,3).map((s) => <span key={s}>{s}</span>)}</div>
              </div>
              <CardMeta>{m.bio ?? 'Industry practitioner available for mentoring sessions.'}</CardMeta>
              {m.availability?.length ? <CardMeta>{m.availability.join(' · ')}</CardMeta> : null}
              <div className="mentor-card__actions">
                <Button to={`/mentors/${m.id}`} variant="secondary">View profile</Button>
                <Button to={`/mentors/${m.id}/book`} variant="primary">Book session</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}
