import Navbar from '../../components/layout/Topbar';
import Footer from '../../components/layout/Footer';
import { Card, CardEyebrow, CardMeta, CardTitle } from '../../components/ui/Card';

const posts = [
  { title: 'How skills-first hiring changes the funnel', category: 'Hiring', excerpt: 'A short overview of why measurable skills outperform CV-only screening.' },
  { title: 'Building better learner journeys', category: 'Learning', excerpt: 'Designing course paths that move people toward employable outcomes.' },
  { title: 'What employers should look for in a profile', category: 'Recruiting', excerpt: 'Practical tips for reviewing profile data, certifications, and experience.' },
];

export default function Blog() {
  return (
    <div className="landing-page">
      <Navbar />
      <main className="landing-main">
        <section className="landing-hero">
          <div className="landing-hero__copy">
            <CardEyebrow>Blog</CardEyebrow>
            <h1>Insights for learners and employers.</h1>
            <p className="landing-lead">Short articles, hiring guidance, and product updates for the platform.</p>
          </div>

          <div className="landing-hero__visual">
            <Card className="hero-visual-card">
              <CardTitle>Latest reading</CardTitle>
              <CardMeta>Articles are styled as a lightweight public feed.</CardMeta>
            </Card>
          </div>
        </section>

        <section className="landing-section">
          <div className="landing-blog-grid">
            {posts.map((post) => (
              <Card key={post.title} className="landing-blog-card">
                <div className="landing-blog-card__body">
                  <CardEyebrow>{post.category}</CardEyebrow>
                  <CardTitle>{post.title}</CardTitle>
                  <CardMeta>{post.excerpt}</CardMeta>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
