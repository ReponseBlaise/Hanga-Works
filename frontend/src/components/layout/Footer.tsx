import { Link } from 'react-router-dom';

const columns = [
  {
    title: 'Resources',
    links: [
      { label: 'Home', href: '/' },
      { label: 'Courses', href: '/courses' },
      { label: 'Jobs', href: '/jobs' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'Mentors', href: '/mentors' },
      { label: 'Certifications', href: '/certifications' },
      { label: 'Login', href: '/login' },
    ],
  },
  {
    title: 'Quick Links',
    links: [
      { label: 'Register', href: '/register' },
      { label: 'Profile', href: '/profile' },
      { label: 'Applications', href: '/applications' },
    ],
  },
  {
    title: 'More',
    links: [
      { label: 'Privacy', href: '/contact' },
      { label: 'Help', href: '/contact' },
      { label: 'Terms', href: '/contact' },
      { label: 'FAQ', href: '/contact' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <img src="/hanga-works-logo.svg" alt="Hanga Works Logo" />
          <p className="site-footer__brand-text">
            Hanga Works unifies learning, hiring, and workforce intelligence in one enterprise-ready workspace.
          </p>
          <div className="site-footer__social">
            {[
              { label: 'email', href: 'mailto:hello@hanga.works' },
              { label: 'support', href: '/contact' },
              { label: 'learn', href: '/courses' },
            ].map((item) => (
              <a key={item.label} href={item.href} className="site-footer__social-link" aria-label={item.label}>
                {item.label[0].toUpperCase()}
              </a>
            ))}
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title} className="site-footer__column">
            <p className="site-footer__column-title">{col.title}</p>
            <div className="site-footer__links">
              {col.links.map((link) => (
                <Link key={link.label} to={link.href} className="site-footer__link">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="site-footer__bottom">
        <p className="site-footer__legal-link">Copyright © 2024. Hanga Works. All rights reserved.</p>
        <div className="site-footer__legal-links">
          {[
            { label: 'Privacy Policy', href: '/contact' },
            { label: 'Terms & Conditions', href: '/contact' },
            { label: 'Security', href: '/contact' },
          ].map((item) => (
            <Link key={item.label} to={item.href} className="site-footer__legal-link">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
