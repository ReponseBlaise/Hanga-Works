import Navbar from '../../components/layout/Topbar';
import Footer from '../../components/layout/Footer';
import { Card, CardEyebrow, CardMeta, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

const candidates = [
  { name: 'Robert Fox', title: 'UI/UX Designer', location: 'Chicago, US', rate: '$45/hour', skills: ['Figma', 'Adobe XD', 'PSD'] },
  { name: 'Cody Fisher', title: 'Python developer', location: 'Chicago, US', rate: '$45/hour', skills: ['Figma', 'Adobe XD', 'PSD'] },
  { name: 'Jerome Bell', title: 'Content Manager', location: 'Chicago, US', rate: '$45/hour', skills: ['Figma', 'Adobe XD', 'PSD'] },
  { name: 'Jane Cooper', title: 'Network', location: 'Chicago, US', rate: '$45/hour', skills: ['Figma', 'Adobe XD', 'PSD'] },
];

export default function Candidates() {
  return (
    <div className="landing-page">
      <Navbar />
      <main className="landing-main">
        <section className="landing-hero">
          <div className="landing-hero__copy">
            <CardEyebrow>Candidates</CardEyebrow>
            <h1>Browse candidates</h1>
            <p className="landing-lead">Discover verified talent profiles and connect to skills-first hiring pipelines.</p>
          </div>

          <div className="landing-hero__visual">
            <Card className="hero-visual-card">
              <CardTitle>Talent discovery</CardTitle>
              <CardMeta>Search by skills, location, or role fit.</CardMeta>
            </Card>
          </div>
        </section>

        <section className="landing-section">
          <div className="landing-category-row candidate-grid">
            {candidates.map((candidate) => (
              <Card key={candidate.name} className="candidate-card">
                <CardEyebrow>{candidate.title}</CardEyebrow>
                <CardTitle>{candidate.name}</CardTitle>
                <CardMeta>{candidate.location}</CardMeta>
                <div className="job-card__tags">
                  {candidate.skills.map((skill) => <span key={skill}>{skill}</span>)}
                </div>
                <CardMeta>{candidate.rate}</CardMeta>
                <Button to="/register" variant="secondary">View profile</Button>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
