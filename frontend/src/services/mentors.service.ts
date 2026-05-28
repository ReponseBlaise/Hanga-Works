import api from './api';

export type MentorSummary = {
  id: string;
  name: string;
  title?: string;
  bio?: string;
  skills?: string[];
  availability?: string[];
};

const fallbackMentors: MentorSummary[] = [
  {
    id: 'mentor-1',
    name: 'Amina Niyonzima',
    title: 'Career strategist',
    bio: 'Helps learners translate skills into interview-ready portfolios and job applications.',
    skills: ['Career coaching', 'Portfolio review', 'Interview prep'],
    availability: ['Mon 09:00', 'Wed 14:00', 'Fri 11:30'],
  },
  {
    id: 'mentor-2',
    name: 'Eric Uwimana',
    title: 'Senior frontend engineer',
    bio: 'Guides React, TypeScript, and product-minded frontend growth for early-career builders.',
    skills: ['React', 'TypeScript', 'Design systems'],
    availability: ['Tue 13:00', 'Thu 10:00'],
  },
  {
    id: 'mentor-3',
    name: 'Diane Mukamana',
    title: 'Learning & talent partner',
    bio: 'Supports course selection, upskilling plans, and role alignment for learners and employers.',
    skills: ['Learning plans', 'Upskilling', 'Talent matching'],
    availability: ['Mon 15:00', 'Thu 16:30'],
  },
];

const BOOKING_STORAGE_KEY = 'hanga-works-mentor-bookings';

function saveBooking(mentorId: string, payload: { date: string; notes?: string }) {
  if (typeof window === 'undefined') return;

  try {
    const rawBookings = window.localStorage.getItem(BOOKING_STORAGE_KEY);
    const bookings = rawBookings ? (JSON.parse(rawBookings) as Array<{ mentorId: string; date: string; notes?: string }>) : [];
    bookings.unshift({ mentorId, date: payload.date, notes: payload.notes });
    window.localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(bookings.slice(0, 20)));
  } catch {
    window.localStorage.removeItem(BOOKING_STORAGE_KEY);
  }
}

export async function getMentors() {
  try {
    const res = await api.get('/mentorship/mentors');
    return res.data as MentorSummary[];
  } catch (e) {
    return fallbackMentors;
  }
}

export async function getMentorById(id: string) {
  try {
    const mentors = await getMentors();
    return mentors.find((mentor) => mentor.id === id) ?? null;
  } catch (e) {
    return fallbackMentors.find((mentor) => mentor.id === id) ?? null;
  }
}

export async function bookSession(mentorId: string, payload: { date: string; notes?: string }) {
  try {
    const res = await api.post('/mentorship/sessions/book', {
      mentorId,
      scheduledAt: payload.date,
    });
    return res.data;
  } catch (e) {
    saveBooking(mentorId, payload);
    return { booking: { mentorId, scheduledAt: payload.date, notes: payload.notes, status: 'confirmed-local' } };
  }
}
