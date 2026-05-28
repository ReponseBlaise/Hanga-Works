import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
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
    <DashboardLayout>
      <div className="page-shell">
        <header className="page-head">
          <h1>Mentors</h1>
          <p className="muted">Discover industry mentors available for session bookings.</p>
        </header>

        {loading ? <p>Loading mentors…</p> : null}

        <div className="mentor-grid">
          {mentors.map((m) => (
            <Card key={m.id} className="mentor-card">
              <div className="mentor-card__top">
                <div>
                  <CardEyebrow>{m.title ?? 'Mentor'}</CardEyebrow>
                  <CardTitle>{m.name}</CardTitle>
                </div>
                <div className="mentor-skills">{(m.skills ?? []).slice(0,3).map(s => <span key={s}>{s}</span>)}</div>
              </div>
              <CardMeta>{m.bio ?? 'Industry practitioner available for mentoring sessions.'}</CardMeta>
              <div className="mentor-card__actions">
                <Button to={`/mentors/${m.id}`} variant="secondary">View profile</Button>
                <Button to={`/mentors/${m.id}/book`} variant="primary">Book session</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
