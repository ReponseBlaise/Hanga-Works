import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SiteLayout } from '../../components/layout/SiteLayout';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { CardMeta } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  getAdminUsers, updateAdminUserStatus,
  getAdminJobs, updateAdminJobStatus,
  getAdminCourses, updateAdminCourseStatus
} from '../../services/admin.service';

export default function AdminModerationPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'jobs' | 'courses'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const fetchData = async () => {
      try {
        if (activeTab === 'users' && users.length === 0) {
          const data = await getAdminUsers();
          if (active) setUsers(data ?? []);
        } else if (activeTab === 'jobs' && jobs.length === 0) {
          const data = await getAdminJobs();
          if (active) setJobs(data ?? []);
        } else if (activeTab === 'courses' && courses.length === 0) {
          const data = await getAdminCourses();
          if (active) setCourses(data ?? []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchData();
    return () => { active = false; };
  }, [activeTab]);

  const handleToggleUser = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await updateAdminUserStatus(id, nextStatus);
      setUsers(users.map(u => u.id === id ? { ...u, status: nextStatus } : u));
    } catch (err) { console.error(err); }
  };

  const handleToggleJob = async (id: string, isActive: boolean) => {
    try {
      await updateAdminJobStatus(id, !isActive);
      setJobs(jobs.map(j => j.id === id ? { ...j, isActive: !isActive } : j));
    } catch (err) { console.error(err); }
  };

  const handleToggleCourse = async (id: string, published: boolean) => {
    try {
      await updateAdminCourseStatus(id, !published);
      setCourses(courses.map(c => c.id === id ? { ...c, published: !published } : c));
    } catch (err) { console.error(err); }
  };

  return (
    <SiteLayout>
      <div className="app-shell-layout">
        <AdminSidebar />

        <div className="studio-dashboard dashboard-redesign">
          <header className="dashboard-redesign__hero">
            <div>
              <p className="eyebrow">Content control</p>
              <h1 className="display">Moderation Queue</h1>
              <p className="lead">Review flagged courses, pending institutions, and user accounts across the platform.</p>
            </div>
          </header>

          <section className="dashboard-redesign__layout mt-lg">
            <main className="dashboard-main-column">
              <div className="studio-section__head" style={{ marginBottom: '16px' }}>
                <div className="studio-toggle-group" style={{ display: 'inline-flex', gap: '8px' }}>
                  <Button variant={activeTab === 'users' ? 'primary' : 'ghost'} onClick={() => setActiveTab('users')}>Users</Button>
                  <Button variant={activeTab === 'jobs' ? 'primary' : 'ghost'} onClick={() => setActiveTab('jobs')}>Jobs</Button>
                  <Button variant={activeTab === 'courses' ? 'primary' : 'ghost'} onClick={() => setActiveTab('courses')}>Courses</Button>
                </div>
              </div>

              <div className="studio-stack mt-md">
                {loading ? (
                  <CardMeta>Loading moderation data...</CardMeta>
                ) : activeTab === 'users' ? (
                  users.length === 0 ? <CardMeta>No users found.</CardMeta> :
                  users.map(u => (
                    <div key={u.id} className="studio-inline-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--border)', borderRadius: '8px' }}>
                      <div>
                        <strong>{u.name}</strong> <span style={{ color: 'var(--text-muted)' }}>({u.email})</span>
                        <p>Role: {u.role} · Status: <span style={{ color: u.status === 'ACTIVE' ? 'green' : u.status === 'PENDING' ? 'orange' : 'red' }}>{u.status}</span></p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {u.status === 'PENDING' && (
                          <Link to={`/admin/users/${u.id}`} className="studio-btn studio-btn--secondary">Review Details</Link>
                        )}
                        <Button variant={u.status === 'ACTIVE' ? 'secondary' : 'primary'} onClick={() => handleToggleUser(u.id, u.status)}>
                          {u.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                        </Button>
                      </div>
                    </div>
                  ))
                ) : activeTab === 'jobs' ? (
                  jobs.length === 0 ? <CardMeta>No jobs found.</CardMeta> :
                  jobs.map(j => (
                    <div key={j.id} className="studio-inline-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--border)', borderRadius: '8px' }}>
                      <div>
                        <strong>{j.title}</strong>
                        <p>Employer: {j.employer?.name} · Status: <span style={{ color: j.isActive ? 'green' : 'red' }}>{j.isActive ? 'Active' : 'Deactivated'}</span></p>
                      </div>
                      <Button variant={j.isActive ? 'secondary' : 'primary'} onClick={() => handleToggleJob(j.id, j.isActive)}>
                        {j.isActive ? 'Deactivate' : 'Reactivate'}
                      </Button>
                    </div>
                  ))
                ) : (
                  courses.length === 0 ? <CardMeta>No courses found.</CardMeta> :
                  courses.map(c => (
                    <div key={c.id} className="studio-inline-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--border)', borderRadius: '8px' }}>
                      <div>
                        <strong>{c.title}</strong>
                        <p>Institution: {c.institution?.name || 'Hanga Works'} · Status: <span style={{ color: c.published ? 'green' : 'red' }}>{c.published ? 'Published' : 'Draft'}</span></p>
                      </div>
                      <Button variant={c.published ? 'secondary' : 'primary'} onClick={() => handleToggleCourse(c.id, c.published)}>
                        {c.published ? 'Unpublish' : 'Publish'}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </main>
          </section>
        </div>
      </div>
    </SiteLayout>
  );
}
