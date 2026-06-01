import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Topbar';
import Footer from './Footer';

export default function AuthLayout() {
  return (
    <div className="auth-page">
      <Navbar />
      <main className="auth-page__main">
        <div className="auth-studio-shell auth-studio-shell--centered">
          <section className="auth-studio-content auth-studio-content--centered">
            <Outlet />
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
