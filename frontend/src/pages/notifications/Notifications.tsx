import { SiteLayout } from '../../components/layout/SiteLayout';
import { NotificationBell } from '../../components/shared/NotificationBell';
import { Button } from '../../components/ui/Button';
import { Card, CardEyebrow, CardMeta, CardTitle } from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { useNotificationsFeed } from '../../services/notifications.service';

const kindLabels = {
  info: 'Info',
  success: 'Success',
  warning: 'Warning',
  error: 'Error',
} as const;

export default function Notifications() {
  const { user } = useAuth();
  const { items, unreadCount, connected, markRead, markAllRead, clearNotifications } = useNotificationsFeed(user?.id);

  return (
    <SiteLayout>
      <section className="studio-dashboard">
        <header className="studio-hero">
          <div className="studio-hero__intro">
            <p className="eyebrow">Notifications</p>
            <h1 className="display-large">Live activity feed</h1>
            <p className="lead">This view listens to the backend Socket.IO gateway and keeps a local history of recent activity.</p>
            <div className="studio-action-row mt-md">
              <Button type="button" variant="secondary" onClick={markAllRead}>Mark all read</Button>
              <Button type="button" variant="ghost" onClick={clearNotifications}>Clear feed</Button>
            </div>
          </div>
          
          <Card className="studio-hero__spotlight">
            <CardEyebrow>Connection status</CardEyebrow>
            <div className="studio-action-row mb-md">
              <NotificationBell count={unreadCount} />
              <div>
                <CardMeta>{connected ? 'Connected to backend events' : 'Waiting for backend connection'}</CardMeta>
                <strong>{unreadCount} unread notification{unreadCount === 1 ? '' : 's'}</strong>
              </div>
            </div>
          </Card>
        </header>

        <section className="studio-section">
          {items.length === 0 ? (
            <Card className="studio-block">
              <CardEyebrow>Empty feed</CardEyebrow>
              <CardTitle>No notifications yet</CardTitle>
              <CardMeta>Keep this page open while you sign in, apply for jobs, finish courses, or receive certificate updates.</CardMeta>
            </Card>
          ) : (
            <div className="studio-stack">
              {items.map((item) => (
                <Card key={item.id} className={item.read ? 'studio-job-card' : 'studio-job-card studio-job-card--unread'}>
                  <div className="studio-job-card__head">
                    <div>
                      <CardEyebrow>{kindLabels[item.kind]} · {item.source}</CardEyebrow>
                      <CardTitle>{item.title}</CardTitle>
                      <span className="muted">{new Date(item.createdAt).toLocaleString()}</span>
                    </div>
                    {item.relatedHref ? <Button to={item.relatedHref} variant="ghost">Open</Button> : null}
                  </div>
                  <CardMeta>{item.body}</CardMeta>
                  <div className="studio-action-row mt-md">
                    {!item.read ? <Button type="button" variant="secondary" onClick={() => markRead(item.id)}>Mark read</Button> : null}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </section>
    </SiteLayout>
  );
}
