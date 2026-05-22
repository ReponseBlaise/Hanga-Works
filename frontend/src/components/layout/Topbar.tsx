import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

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
  const initials = (userName ?? 'User')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <header className="topbar--dashboard">
      <button
        type="button"
        className="topbar__menu"
        onClick={onMenuToggle}
        aria-label="Open navigation"
      >
        <span />
        <span />
        <span />
      </button>

      <div className="topbar__copy">
        <p className="topbar__eyebrow">Dashboard overview</p>
        <h1>Welcome back, {userName ?? 'Guest'}</h1>
        <p>{role ?? 'Monitor your progress, applications, and learning in one place.'}</p>
      </div>

      <div className="topbar__actions">
        <div className="topbar__badge" aria-label={`${unreadCount ?? 0} unread notifications`}>
          <span className="topbar__badge-count">{unreadCount ?? 0}</span>
          <span className="topbar__badge-label">Alerts</span>
        </div>

        <div className="topbar__user">
          <div className="avatar avatar-md" aria-hidden="true">{initials || 'U'}</div>
          <div>
            <strong>{userName ?? 'User'}</strong>
            <span>{role ?? 'Dashboard user'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Navbar() {
  const [hovered, setHovered] = useState<string | null>(null);
  const { isAuthenticated, user, signOut } = useAuth();
  const navItems = isAuthenticated ? [{ label: 'Dashboard', href: '/dashboard' }, ...navLinks] : navLinks;

  const handleLogout = () => {
    signOut();
  };

  return (
    <nav style={{
      width: '100%',
      background: 'rgba(255, 255, 255, 0.78)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 10px 30px rgba(13, 47, 103, 0.08)',
      backdropFilter: 'blur(18px)',
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
          <img src="/hanga-works-logo.svg" alt="Hanga Works Logo" style={{ height: '32px', width: 'auto' }} />
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
          {navItems.map(link => (
            <Link
              key={link.label}
              to={link.href}
              onMouseEnter={() => setHovered(link.label)}
              onMouseLeave={() => setHovered(null)}
              style={{
                padding: '6px 12px',
                fontSize: '0.88rem',
                fontWeight: 500,
                  color: hovered === link.label ? 'var(--accent)' : 'var(--text-soft)',
                textDecoration: 'none',
                borderRadius: '8px',
                  transition: 'color 150ms, background-color 150ms',
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
          {isAuthenticated ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '999px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.82)' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '999px', background: 'var(--accent)' }} />
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text)' }}>{user?.name ?? 'Signed in'}</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  color: '#fff',
                  border: 'none',
                  padding: '7px 18px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #202a44, #0f172a)',
                  boxShadow: '0 4px 14px rgba(15, 23, 42, 0.18)',
                  cursor: 'pointer',
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/register" style={{
                fontSize: '0.88rem',
                fontWeight: 600,
                color: 'var(--text)',
                textDecoration: 'none',
                padding: '6px 14px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                background: 'rgba(255,255,255,0.82)',
                transition: 'background 150ms, border-color 150ms',
              }}>
                Sign Up
              </Link>
              <Link to="/login" style={{
                fontSize: '0.88rem',
                fontWeight: 700,
                color: '#fff',
                textDecoration: 'none',
                padding: '7px 18px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--accent), var(--accent-strong))',
                boxShadow: '0 4px 14px rgba(37, 71, 202, 0.22)',
              }}>
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
