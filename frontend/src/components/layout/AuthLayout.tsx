import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Topbar';
import Footer from './Footer';

export default function AuthLayout() {
  const location = useLocation();
  const isRegister = location.pathname.includes('/register');

  return (
    <div className="auth-page">
      <Navbar />
      <main className="auth-page__main" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px 20px' }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
