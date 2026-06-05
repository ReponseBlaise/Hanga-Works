import { Link, useLocation } from 'react-router-dom';

export function AdminSidebar() {
  const { pathname } = useLocation();

  const isActive = (to: string) =>
    to === '/admin' ? pathname === to : pathname === to || pathname.startsWith(to + '/');

  const nav = [
    { to: '/admin', label: 'Platform Overview' },
    { to: '/admin/moderation', label: 'Moderation Queue' },
    { to: '/admin/export', label: 'Data Exports' },
  ];

  const manage = [
    { to: '/admin/manage/users', label: 'Users' },
    { to: '/admin/manage/jobs', label: 'Jobs' },
    { to: '/admin/manage/courses', label: 'Courses' },
  ];

  return (
    <aside className="app-shell-sidebar">
      <div className="app-shell-brand">
        <strong>Hanga Works</strong>
        <span>Admin Control</span>
      </div>
      <nav className="app-shell-nav">
        {nav.map(({ to, label }) => (
          <Link key={to} to={to} className={`app-shell-nav__item${isActive(to) ? ' is-active' : ''}`}>
            {label}
          </Link>
        ))}
        <div style={{ margin: '8px 0 4px', fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-faint)', padding: '0 12px' }}>
          Manage
        </div>
        {manage.map(({ to, label }) => (
          <Link key={to} to={to} className={`app-shell-nav__item${isActive(to) ? ' is-active' : ''}`}>
            {label}
          </Link>
        ))}
        <Link to="/profile" className={`app-shell-nav__item${isActive('/profile') ? ' is-active' : ''}`}>
          Admin Profile
        </Link>
      </nav>
    </aside>
  );
}
