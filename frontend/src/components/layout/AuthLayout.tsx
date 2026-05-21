import { Outlet } from 'react-router-dom';
import { Topbar } from './Topbar';
import Footer from './Footer';

export default function AuthLayout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <Topbar userName="Guest" role="Welcome" unreadCount={0} onMenuToggle={() => {}} />
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
