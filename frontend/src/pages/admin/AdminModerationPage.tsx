import { Link } from 'react-router-dom';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { Card, CardMeta, CardTitle, CardEyebrow } from '../../components/ui/Card';

export default function AdminModerationPage() {
  return (
    <SiteLayout>
      <div className="app-shell-layout">
        <aside className="app-shell-sidebar">
          <div className="app-shell-brand">
            <strong>Hanga Works</strong>
            <span>Admin Control</span>
          </div>
          <nav className="app-shell-nav">
            <Link to="/admin" className="app-shell-nav__item">Platform Overview</Link>
            <Link to="/admin/export" className="app-shell-nav__item">Data Exports</Link>
            <Link to="/admin/moderation" className="app-shell-nav__item is-active">Moderation Queue</Link>
            <Link to="/profile" className="app-shell-nav__item">Admin Profile</Link>
          </nav>
        </aside>

        <div className="studio-dashboard dashboard-redesign">
          <header className="dashboard-redesign__hero">
            <div>
              <p className="eyebrow">Content control</p>
              <h1 className="display">Moderation Queue</h1>
              <p className="lead">Review flagged courses, pending institutions, and reported content across the platform.</p>
            </div>
          </header>

          <section className="dashboard-redesign__layout mt-lg">
            <main className="dashboard-main-column">
              <Card className="studio-block">
                <div className="studio-section__head">
                  <div>
                    <p className="eyebrow">Pending approvals</p>
                    <h2>Items awaiting review</h2>
                  </div>
                </div>
                <div className="studio-stack mt-md">
                  <div className="studio-inline-item">
                    <div>
                      <strong>No items in moderation queue</strong>
                      <p>All platform content looks clean and approved.</p>
                    </div>
                  </div>
                </div>
              </Card>
            </main>
          </section>
        </div>
      </div>
    </SiteLayout>
  );
}
