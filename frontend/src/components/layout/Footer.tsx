import { Link } from 'react-router-dom';

const columns = [
  {
    title: 'Resources',
    links: ['About Us', 'Our Team', 'Products', 'Contact'],
  },
  {
    title: 'Community',
    links: ['Feature', 'Blog', 'Credit', 'FAQ'],
  },
  {
    title: 'Quick Links',
    links: ['iOS', 'Android', 'Microsoft', 'Desktop'],
  },
  {
    title: 'More',
    links: ['Privacy', 'Help', 'Terms', 'FAQ'],
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
            {['f', 't', 'in'].map(s => (
              <a key={s} href="#" style={{
                width: '30px', height: '30px', borderRadius: '50%',
                background: 'var(--accent-wash)',
                display: 'grid', placeItems: 'center',
                fontSize: '0.75rem', fontWeight: 700,
                color: 'var(--accent)', textDecoration: 'none',
              }}>{s}</a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {columns.map(col => (
          <div key={col.title}>
            <p style={{ margin: '0 0 12px', fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)' }}>
              {col.title}
            </p>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {col.links.map(link => (
                <li key={link}>
                  <Link to="#" style={{ fontSize: '0.82rem', color: 'var(--text-soft)', textDecoration: 'none' }}>
                    {link}
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
          {['Privacy Policy', 'Terms & Conditions', 'Security'].map(item => (
            <Link key={item} to="#" style={{ fontSize: '0.78rem', color: 'var(--text-soft)', textDecoration: 'none' }}>
              {item}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
