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
			<div className="page-shell notifications-page">
				<header className="page-head">
					<div>
						<p className="section-head__eyebrow">Notifications</p>
						<h1>Live activity feed</h1>
						<p className="muted">This view listens to the backend Socket.IO gateway and keeps a local history of recent activity.</p>
					</div>
					<div className="notifications-page__summary">
						<NotificationBell count={unreadCount} />
						<div>
							<CardMeta>{connected ? 'Connected to backend events' : 'Waiting for backend connection'}</CardMeta>
							<CardMeta>{unreadCount} unread notification{unreadCount === 1 ? '' : 's'}</CardMeta>
						</div>
					</div>
				</header>

				<div className="notifications-page__actions">
					<Button type="button" variant="secondary" onClick={markAllRead}>Mark all read</Button>
					<Button type="button" variant="ghost" onClick={clearNotifications}>Clear feed</Button>
				</div>

				<section className="dashboard-section">
					{items.length === 0 ? (
						<Card>
							<CardEyebrow>Empty feed</CardEyebrow>
							<CardTitle>No notifications yet</CardTitle>
							<CardMeta>Keep this page open while you sign in, apply for jobs, finish courses, or receive certificate updates.</CardMeta>
						</Card>
					) : (
						<div className="list-stack">
							{items.map((item) => (
								<Card key={item.id} className={item.read ? 'notification-card' : 'notification-card notification-card--unread'}>
									<div className="notification-card__top">
										<div>
											<CardEyebrow>{kindLabels[item.kind]} · {item.source}</CardEyebrow>
											<CardTitle>{item.title}</CardTitle>
											<CardMeta>{new Date(item.createdAt).toLocaleString()}</CardMeta>
										</div>
										{item.relatedHref ? <Button to={item.relatedHref} variant="ghost">Open</Button> : null}
									</div>
									<CardMeta>{item.body}</CardMeta>
									<div className="notifications-page__item-actions">
										{!item.read ? <Button type="button" variant="secondary" onClick={() => markRead(item.id)}>Mark read</Button> : null}
									</div>
								</Card>
							))}
						</div>
					)}
				</section>
			</div>
		</SiteLayout>
	);
}
