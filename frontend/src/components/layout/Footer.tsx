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
    <footer style={{
      background: 'rgba(255, 255, 255, 0.76)',
      borderTop: '1px solid var(--border)',
      marginTop: 'auto',
      backdropFilter: 'blur(18px)',
    }}>
      {/* Main footer */}
      <div style={{
        maxWidth: '1180px',
        margin: '0 auto',
        padding: '40px 24px 32px',
        display: 'grid',
        gridTemplateColumns: '1.6fr 1fr 1fr 1fr 1fr',
        gap: '32px',
      }}>
        {/* Brand column */}
        <div>
          <div style={{ marginBottom: '12px' }}>
            <img src="/hanga-works-logo.svg" alt="Hanga Works Logo" style={{ height: '40px', width: 'auto' }} />
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-soft)', lineHeight: 1.6, margin: '0 0 16px', maxWidth: '200px' }}>
            HANGA WORKS is the home of the skills employment and workforce intelligence platform.
          </p>
          {/* Social icons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            {[
              { label: 'email', href: 'mailto:hello@hanga.works' },
              { label: 'support', href: '/contact' },
              { label: 'learn', href: '/courses' },
            ].map((item) => (
              <a key={item.label} href={item.href} style={{
                width: '30px', height: '30px', borderRadius: '50%',
                background: 'var(--accent-wash)',
                display: 'grid', placeItems: 'center',
                fontSize: '0.75rem', fontWeight: 700,
                color: 'var(--accent)', textDecoration: 'none',
              }}>{item.label[0].toUpperCase()}</a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {columns.map((col) => (
          <div key={col.title}>
            <p style={{ margin: '0 0 12px', fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)' }}>
              {col.title}
            </p>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.href} style={{ fontSize: '0.82rem', color: 'var(--text-soft)', textDecoration: 'none' }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div style={{
        borderTop: '1px solid var(--border)',
        padding: '14px 24px',
        maxWidth: '1180px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px',
      }}>
        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-soft)' }}>
          Copyright © 2024. Hanga Works. All rights reserved.
        </p>
        <div style={{ display: 'flex', gap: '20px' }}>
          {[
            { label: 'Privacy Policy', href: '/contact' },
            { label: 'Terms & Conditions', href: '/contact' },
            { label: 'Security', href: '/contact' },
          ].map((item) => (
            <Link key={item.label} to={item.href} style={{ fontSize: '0.78rem', color: 'var(--text-soft)', textDecoration: 'none' }}>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
