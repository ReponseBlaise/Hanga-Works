import Navbar from '../../components/layout/Topbar';
import Footer from '../../components/layout/Footer';
import { Card, CardEyebrow, CardTitle, CardMeta } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function Contact() {
  return (
    <div className="landing-page">
      <Navbar />
      <main className="landing-main">
        <section className="landing-hero">
          <div className="landing-hero__copy">
            <CardEyebrow>Contact</CardEyebrow>
            <h1>Talk to the HANGA WORKS team</h1>
            <p className="landing-lead">
              Reach us for partnerships, support, employer onboarding, and product feedback.
            </p>
            <div className="landing-hero__actions">
              <Button href="mailto:hello@hanga.works" variant="primary">Email us</Button>
              <Button to="/register" variant="secondary">Create account</Button>
            </div>
          </div>

          <div className="landing-hero__visual">
            <Card className="hero-visual-card contact-card">
              <CardTitle>Contact details</CardTitle>
              <p className="contact-card__value">hello@hanga.works</p>
              <CardMeta>+250 700 000 000</CardMeta>
              <CardMeta>Kigali, Rwanda</CardMeta>
            </Card>
          </div>
        </section>

        <section className="landing-section">
          <div className="section-head">
            <div>
              <p className="section-head__eyebrow">What we support</p>
              <h2>Common requests</h2>
            </div>
          </div>

          <div className="contact-card-grid">
            <Card className="landing-category-card">
              <div className="landing-category-card__icon">✦</div>
              <div>
                <CardTitle>Employer onboarding</CardTitle>
                <CardMeta>Set up hiring workflows and team seats.</CardMeta>
              </div>
            </Card>
            <Card className="landing-category-card">
              <div className="landing-category-card__icon">✦</div>
              <div>
                <CardTitle>Learning partnerships</CardTitle>
                <CardMeta>Publish courses and issue verified credentials.</CardMeta>
              </div>
            </Card>
            <Card className="landing-category-card">
              <div className="landing-category-card__icon">✦</div>
              <div>
                <CardTitle>Platform support</CardTitle>
                <CardMeta>Get help with login, profile, and account issues.</CardMeta>
              </div>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
