import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardEyebrow, CardTitle, CardMeta } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { getMentorById, MentorSummary } from '../../services/mentors.service';

export default function MentorProfile() {
  const { id } = useParams<{ id: string }>();
  const [mentor, setMentor] = useState<MentorSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let active = true;
    getMentorById(id)
      .then((m) => { if (active) setMentor(m); })
      .catch(() => { if (active) setMentor(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  return (
    <DashboardLayout>
      <div className="page-shell">
        <Link to="/mentors" className="link">← Back to mentors</Link>
        {loading ? <p>Loading mentor…</p> : null}
        {mentor ? (
          <Card>
            <CardEyebrow>{mentor.title ?? 'Mentor'}</CardEyebrow>
            <CardTitle>{mentor.name}</CardTitle>
            <CardMeta>{mentor.bio}</CardMeta>
            <div className="mentor-actions">
              <Button to={`/mentors/${mentor.id}/book`} variant="primary">Book session</Button>
            </div>
          </Card>
        ) : (
          <Card className="courses-empty"><CardTitle>Mentor not found</CardTitle><CardMeta>Try another mentor or return to the list.</CardMeta></Card>
        )}
      </div>
    </DashboardLayout>
  );
}
