import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardTitle, CardMeta } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { getMentorById, bookSession } from '../../services/mentors.service';

export default function MentorBooking() {
  const { id } = useParams<{ id: string }>();
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [mentorName, setMentorName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    let active = true;
    getMentorById(id).then((m) => { if (active && m) setMentorName(m.name); });
    return () => { active = false; };
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !date) return;
    setLoading(true);
    try {
      await bookSession(id, { date, notes });
      navigate('/mentors');
    } catch (err) {
      console.error(err);
      alert('Booking failed — try again later.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout>
      <div className="page-shell">
        <Card>
          <CardTitle>Book a session with {mentorName || 'mentor'}</CardTitle>
          <CardMeta>Choose a date and add notes for the session.</CardMeta>
          <form onSubmit={handleSubmit} className="form-stack">
            <label>
              Date & time
              <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required />
            </label>
            <label>
              Notes (optional)
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
            </label>
            <div className="form-actions">
              <Button type="submit" variant="primary" disabled={loading}>Confirm booking</Button>
              <Button to="/mentors" variant="ghost">Cancel</Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
