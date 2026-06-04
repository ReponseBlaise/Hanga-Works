import { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';

type NotificationKind = 'info' | 'success' | 'warning' | 'error';

export type NotificationItem = {
	id: string;
	title: string;
	body: string;
	kind: NotificationKind;
	source: string;
	createdAt: string;
	read: boolean;
	relatedHref?: string;
};

const STORAGE_KEY = 'hanga-works-notification-feed';
const MAX_ITEMS = 30;

function resolveSocketUrl() {
	const configured = import.meta.env.VITE_SOCKET_URL;
	if (configured) {
		return configured as string;
	}

	const apiBase = import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE ?? '/api/v1';
	if (typeof apiBase === 'string' && apiBase.startsWith('http')) {
		try {
			return new URL(apiBase).origin;
		} catch {
			return apiBase;
		}
	}

	return 'http://localhost:3000';
}

function readStoredNotifications(): NotificationItem[] {
	if (typeof window === 'undefined') {
		return [];
	}

	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) {
			return [];
		}

		const parsed = JSON.parse(raw) as NotificationItem[];
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		window.localStorage.removeItem(STORAGE_KEY);
		return [];
	}
}

function buildNotification(entry: Pick<NotificationItem, 'title' | 'body' | 'kind' | 'source'> & Partial<Pick<NotificationItem, 'relatedHref'>>) {
	return {
		id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
		createdAt: new Date().toISOString(),
		read: false,
		...entry,
	} satisfies NotificationItem;
}

function toHumanText(value: unknown) {
	if (typeof value === 'string') return value;
	if (typeof value === 'number' || typeof value === 'boolean') return String(value);
	if (!value || typeof value !== 'object') return '';

	const record = value as Record<string, unknown>;
	const parts = [record.title, record.message, record.status, record.courseTitle, record.jobTitle, record.name]
		.filter((item) => typeof item === 'string' && item.trim())
		.map((item) => item as string);

	return parts.join(' · ') || JSON.stringify(value);
}

export function useNotificationsFeed(userId?: string) {
	const [items, setItems] = useState<NotificationItem[]>(() => readStoredNotifications());
	const [connected, setConnected] = useState(false);

	useEffect(() => {
		if (typeof window === 'undefined') {
			return;
		}

		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
	}, [items]);

	useEffect(() => {
		if (typeof window === 'undefined') {
			return;
		}

		const socket = io(resolveSocketUrl(), {
			transports: ['websocket'],
			withCredentials: true,
			autoConnect: true,
		});

		const push = (entry: Pick<NotificationItem, 'title' | 'body' | 'kind' | 'source'> & Partial<Pick<NotificationItem, 'relatedHref'>>) => {
			setItems((current) => [buildNotification(entry), ...current].slice(0, MAX_ITEMS));
		};

		socket.on('connect', () => {
			setConnected(true);
		});

		socket.on('disconnect', () => {
			setConnected(false);
		});

		socket.on('auth-event', () => {
			// Intentionally empty: removed spammy auth event notifications
		});

		if (userId) {
			socket.on(`job-match-${userId}`, (payload: unknown) => {
				push({
					title: 'New job match',
					body: toHumanText(payload) || 'A personalized job match was received.',
					kind: 'success',
					source: 'Jobs',
					relatedHref: '/jobs',
				});
			});

			socket.on(`application-status-${userId}`, (payload: unknown) => {
				push({
					title: 'Application update',
					body: toHumanText(payload) || 'Your application status changed.',
					kind: 'warning',
					source: 'Applications',
					relatedHref: '/applications',
				});
			});

			socket.on(`course-complete-${userId}`, (payload: unknown) => {
				push({
					title: 'Course completed',
					body: toHumanText(payload) || 'A course completion event was received.',
					kind: 'success',
					source: 'Learning',
					relatedHref: '/certifications',
				});
			});

			socket.on(`cert-issued-${userId}`, (payload: unknown) => {
				push({
					title: 'Certificate issued',
					body: toHumanText(payload) || 'A certificate was issued to your account.',
					kind: 'info',
					source: 'Certifications',
					relatedHref: '/certifications',
				});
			});
		}

		return () => {
			socket.removeAllListeners();
			socket.close();
		};
	}, [userId]);

	const unreadCount = useMemo(() => items.filter((item) => !item.read).length, [items]);

	function markRead(id: string) {
		setItems((current) => current.map((item) => (item.id === id ? { ...item, read: true } : item)));
	}

	function markAllRead() {
		setItems((current) => current.map((item) => ({ ...item, read: true })));
	}

	function clearNotifications() {
		setItems([]);
	}

	return {
		items,
		unreadCount,
		connected,
		markRead,
		markAllRead,
		clearNotifications,
	};
}
