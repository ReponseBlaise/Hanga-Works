import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Topbar';
import Footer from '../../components/layout/Footer';
import { Card, CardMeta, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

const categoryCards = [
  { label: 'Marketing & Sale', jobs: '1526 jobs available', icon: '▲' },
  { label: 'Customer Help', jobs: '185 jobs available', icon: '◆' },
  { label: 'Finance', jobs: '168 jobs available', icon: '●' },
  { label: 'Software', jobs: '1856 jobs available', icon: '✦' },
  { label: 'Human Resource', jobs: '165 jobs available', icon: '◐' },
];

const jobTabs = ['Management', 'Marketing & Sale', 'Finance', 'Human Resource', 'Retail & Products', 'Content Writer'];

const featuredJobs = [
  {
    company: 'LinkedIn',
    location: 'New York, US',
    title: 'UI / UX Designer fulltime',
    type: 'Full time',
    time: '4 minutes ago',
    salary: '$500/hour',
    tags: ['Adobe XD', 'Figma', 'Photoshop'],
    badge: 'Hot',
  },
  {
    company: 'Adobe Illustrator',
    location: 'New York, US',
    title: 'Full Stack Engineer',
    type: 'Part time',
    time: '5 minutes ago',
    salary: '$800/hour',
    tags: ['React', 'Node.js'],
    badge: 'New',
  },
  {
    company: 'Bing Search',
    location: 'New York, US',
    title: 'Java Software Engineer',
    type: 'Full time',
    time: '6 minutes ago',
    salary: '$250/hour',
    tags: ['Python', 'AWS', 'Photoshop'],
    badge: 'Hot',
  },
  {
    company: 'Dailymotion',
    location: 'New York, US',
    title: 'Frontend Developer',
    type: 'Full time',
    time: '6 minutes ago',
    salary: '$250/hour',
    tags: ['Typescript', 'Java'],
    badge: 'Hot',
  },
  {
    company: 'LinkedIn',
    location: 'New York, US',
    title: 'React Native Web Developer',
    type: 'Full time',
    time: '4 minutes ago',
    salary: '$640/hour',
    tags: ['React Native', 'Expo'],
    badge: 'New',
  },
  {
    company: 'Quora JSC',
    location: 'New York, US',
    title: 'Senior System Engineer',
    type: 'Part time',
    time: '5 minutes ago',
    salary: '$750/hour',
    tags: ['DevOps', 'Azure'],
    badge: 'New',
  },
];

const locationCards = [
  { city: 'Paris, France', vacancy: '5 Vacancy', companies: '120 companies' },
  { city: 'London, England', vacancy: '7 Vacancy', companies: '68 companies' },
  { city: 'New York, USA', vacancy: '9 Vacancy', companies: '80 companies' },
  { city: 'Amsterdam, Holland', vacancy: '16 Vacancy', companies: '86 companies' },
  { city: 'Copenhagen, Denmark', vacancy: '39 Vacancy', companies: '186 companies' },
  { city: 'Berlin, Germany', vacancy: '15 Vacancy', companies: '632 companies' },
];

const blogCards = [
  {
    tag: 'News',
    title: '21 Job Interview Tips: How To Make a Great Impression',
    excerpt: 'Our mission is to create the world’s most useful skills-first platform for hiring and career growth.',
    author: 'Sarah Harding',
    date: '06 September',
    read: '8 mins read',
  },
  {
    tag: 'Events',
    title: '39 Strengths and Weaknesses To Discuss in a Job Interview',
    excerpt: 'Practical interview guidance and career readiness content that can later be pulled from the CMS.',
    author: 'Steven Jobs',
    date: '06 September',
    read: '6 mins read',
  },
  {
    tag: 'News',
    title: 'Interview Question: Why Dont You Have a Degree?',
    excerpt: 'A skills-first hiring story that reflects the platform’s verification and matching approach.',
    author: 'William Kend',
    date: '06 September',
    read: '9 mins read',
  },
];

function HeroVisualCard({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <Card className="hero-visual-card">
      <div className="hero-visual-card__badge">{title}</div>
      <div className="hero-visual-card__art">
        <span className="hero-visual-card__art-block hero-visual-card__art-block--large" />
        <span className="hero-visual-card__art-block hero-visual-card__art-block--small" />
      </div>
      <p>{subtitle}</p>
    </Card>
  );
}

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="landing-page">
      <Navbar />

      <main className="landing-main">
        <section className="landing-hero">
          <div className="landing-hero__copy">
            <h1>The Easiest Way to Get Your New Job</h1>
            <p className="landing-lead">
              HANGA WORKS is a skills-first workforce platform. The homepage is designed as a public landing page now, and it can connect to the database-driven jobs, categories, and content soon.
            </p>

            <div className="landing-searchbar" role="search" aria-label="Search jobs">
              <div className="landing-searchbar__field">Industry <span>⌄</span></div>
              <div className="landing-searchbar__field">Location <span>⌄</span></div>
              <div className="landing-searchbar__field landing-searchbar__field--wide">Your keyword...</div>
              <Button href="#jobs-of-the-day" variant="primary" className="landing-searchbar__button">
                Search
              </Button>
            </div>

            <div className="landing-popular-searches">
              <span>Popular Searches:</span>
              <Link to="#">Designer</Link>
              <Link to="#">Web</Link>
              <Link to="#">iOS</Link>
              <Link to="#">Developer</Link>
              <Link to="#">PHP</Link>
              <Link to="#">Senior</Link>
              <Link to="#">Engineer</Link>
            </div>

            <div className="landing-hero__actions">
              <Link to={isAuthenticated ? '/dashboard' : '/register'} className="button button-primary">
                {isAuthenticated ? 'Go to dashboard' : 'Create account'}
              </Link>
              <Link to="/login" className="button button-secondary">
                Sign in
              </Link>
            </div>
          </div>

          <div className="landing-hero__visual">
            <HeroVisualCard title="Team collaboration" subtitle="Placeholder visuals now. Database and uploaded media can replace these blocks later." />
            <HeroVisualCard title="Employer hiring" subtitle="Jobs, candidates, and analytics are ready to become data-driven sections soon." />
          </div>
        </section>

        <section className="landing-section">
          <div className="section-head">
            <div>
              <p className="section-head__eyebrow">Browse by category</p>
              <h2>Find the job that’s perfect for you</h2>
            </div>
          </div>

          <div className="landing-category-row">
            {categoryCards.map((item) => (
              <Card key={item.label} className="landing-category-card">
                <div className="landing-category-card__icon">{item.icon}</div>
                <div>
                  <CardTitle>{item.label}</CardTitle>
                  <CardMeta>{item.jobs}</CardMeta>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="landing-banner-card">
          <div>
            <p className="landing-banner-card__kicker">We are hiring</p>
            <h2>Let’s work together and explore opportunities</h2>
          </div>
          <Button href="#jobs-of-the-day" variant="primary">
            Apply now
          </Button>
        </section>

        <section className="landing-section" id="jobs-of-the-day">
          <div className="section-head">
            <div>
              <p className="section-head__eyebrow">Jobs of the day</p>
              <h2>Search and connect with the right candidates faster.</h2>
            </div>
          </div>

          <div className="landing-tab-row" aria-label="Job categories">
            {jobTabs.map((tab, index) => (
              <span key={tab} className={index === 0 ? 'is-active' : ''}>
                {tab}
              </span>
            ))}
          </div>

          <div className="landing-job-grid">
            {featuredJobs.map((job) => (
              <Card key={`${job.company}-${job.title}`} className="landing-job-card">
                <div className="landing-job-card__badge">{job.badge}</div>
                <div className="landing-job-card__header">
                  <div className="landing-job-card__company">
                    <div className="landing-job-card__logo">{job.company.slice(0, 2)}</div>
                    <div>
                      <CardTitle>{job.company}</CardTitle>
                      <CardMeta>{job.location}</CardMeta>
                    </div>
                  </div>
                  <span className="landing-job-card__time">{job.time}</span>
                </div>
                <h3 className="landing-job-card__title">{job.title}</h3>
                <p className="landing-job-card__type">{job.type}</p>
                <p className="landing-job-card__desc">Placeholder job description for the upcoming database connection and API feed.</p>
                <div className="landing-job-card__tags">
                  {job.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <div className="landing-job-card__footer">
                  <strong>{job.salary}</strong>
                  <Button href="#" variant="secondary">
                    Apply Now
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="landing-section">
          <div className="section-head">
            <div>
              <p className="section-head__eyebrow">Jobs by location</p>
              <h2>Find your favorite jobs and the benefits of your search</h2>
            </div>
          </div>

          <div className="landing-location-grid">
            {locationCards.map((location, index) => (
              <Card key={location.city} className="landing-location-card">
                <div className={`landing-location-card__image landing-location-card__image--${index % 6}`} />
                <div className="landing-location-card__body">
                  <CardTitle>{location.city}</CardTitle>
                  <CardMeta>{location.vacancy}</CardMeta>
                  <span>{location.companies}</span>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="landing-section landing-news-section">
          <div className="section-head">
            <div>
              <p className="section-head__eyebrow">News and blog</p>
              <h2>Get the latest news, updates and tips</h2>
            </div>
          </div>

          <div className="landing-blog-grid">
            {blogCards.map((post) => (
              <Card key={post.title} className="landing-blog-card">
                <div className="landing-blog-card__image" />
                <span className="landing-blog-card__tag">{post.tag}</span>
                <CardTitle>{post.title}</CardTitle>
                <CardMeta>{post.excerpt}</CardMeta>
                <div className="landing-blog-card__footer">
                  <div>
                    <strong>{post.author}</strong>
                    <span>{post.date}</span>
                  </div>
                  <span>{post.read}</span>
                </div>
              </Card>
            ))}
          </div>

          <div className="landing-blog-actions">
            <Button href="#" variant="primary">
              Load More Posts
            </Button>
          </div>
        </section>

        <section className="landing-newsletter">
          <div>
            <p className="landing-banner-card__kicker">Newsletter</p>
            <h2>New Things Will Always Update Regularly</h2>
          </div>

          <div className="landing-newsletter__form">
            <input type="email" placeholder="Enter your email here" aria-label="Email address" />
            <Button href="#" variant="primary">
              Subscribe
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}