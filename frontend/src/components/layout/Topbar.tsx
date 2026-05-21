import { useState } from 'react';
import { Link } from 'react-router-dom';

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Find a Job', href: '/jobs' },
  { label: 'Recruiters', href: '/recruiters' },
  { label: 'Candidates', href: '/candidates' },
  { label: 'Pages', href: '#' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

export function Topbar({ userName, role, unreadCount, onMenuToggle }: { userName?: string; role?: string; unreadCount?: number; onMenuToggle?: () => void }) {
  return null; // used by DashboardLayout — dashboard topbar handled separately
}

export default function Navbar() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <nav style={{
      width: '100%',
      background: 'var(--text)',
      borderBottom: 'none',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 16px rgba(13,47,103,0.18)',
    }}>
      <div style={{
        maxWidth: '1180px',
        margin: '0 auto',
        padding: '0 24px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', flexShrink: 0 }}>
          <img src="/hanga-works-logo.svg" alt="Hanga Works Logo" style={{ height: '32px', width: 'auto', filter: 'brightness(0) invert(1)' }} />
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
          {navLinks.map(link => (
            <Link
              key={link.label}
              to={link.href}
              onMouseEnter={() => setHovered(link.label)}
              onMouseLeave={() => setHovered(null)}
              style={{
                padding: '6px 12px',
                fontSize: '0.88rem',
                fontWeight: 500,
                color: hovered === link.label ? '#a8c0ff' : 'rgba(255,255,255,0.82)',
                textDecoration: 'none',
                borderRadius: '8px',
                transition: 'color 150ms',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              {link.label}
              {['Find a Job', 'Recruiters', 'Candidates', 'Pages', 'Blog'].includes(link.label) && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              )}
            </Link>
          ))}
        </div>

        {/* Auth buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <Link to="/register" style={{
            fontSize: '0.88rem',
            fontWeight: 600,
            color: '#fff',
            textDecoration: 'none',
            padding: '6px 14px',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.5)',
            transition: 'background 150ms',
          }}>
            Register
          </Link>
          <Link to="/login" style={{
            fontSize: '0.88rem',
            fontWeight: 700,
            color: '#fff',
            textDecoration: 'none',
            padding: '7px 18px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))',
            boxShadow: '0 4px 14px rgba(63,102,244,0.3)',
          }}>
            Sign In
          </Link>
        </div>
      </div>
    </nav>
  );
}
