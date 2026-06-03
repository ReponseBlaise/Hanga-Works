import api, { AUTH_TOKEN_KEY, setAuthToken } from './api';

export type AuthUser = {
	id?: string;
	name: string;
	email: string;
	username?: string;
	role?: string;
	organizationId?: string | null;
	bio?: string | null;
	location?: string | null;
	avatarUrl?: string | null;
	skills?: Array<{
		id: string;
		skill: { id: string; name: string };
		level?: string;
	}>;
};

type AuthResponse = {
	access_token: string;
	user: AuthUser;
};

type RegisterResponse = AuthUser | AuthResponse;

export async function register(payload: {
	name: string;
	email: string;
	phone?: string;
	password: string;
	role?: 'LEARNER' | 'EMPLOYER' | 'INSTITUTION' | 'MENTOR';
	certificate?: File;
}) {
	// Create the account
	const formData = new FormData();
	formData.append('name', payload.name);
	formData.append('email', payload.email);
	if (payload.phone) formData.append('phone', payload.phone);
	formData.append('password', payload.password);
	if (payload.role) formData.append('role', payload.role);
	if (payload.certificate) formData.append('certificate', payload.certificate);

	await api.post('/auth/register', formData);
	// Immediately log in to get the token
	return await login({ email: payload.email, password: payload.password });
}

export async function login(payload: { email: string; password: string }) {
	const res = await api.post('/auth/login', payload);
	const data = res.data?.data ?? res.data;
	const token = data?.access_token ?? data?.token;

	if (token) {
		setAuthToken(token);
		window.localStorage.setItem(AUTH_TOKEN_KEY, token);
		return { access_token: token, user: data.user } as AuthResponse;
	}
	
	throw new Error("Invalid response from server");
}

export async function profile() {
	const res = await api.get('/users/me');
	return (res.data?.data ?? res.data) as AuthUser;
}

export async function updateProfile(payload: {
	name?: string;
	bio?: string;
	avatarUrl?: string;
	location?: string;
	skills?: Array<{ skillName: string; level: string }>;
}) {
	const res = await api.patch('/users/me', payload);
	return (res.data?.data ?? res.data) as AuthUser;
}

export async function uploadProfilePicture(file: File) {
	const formData = new FormData();
	formData.append('file', file);
	formData.append('purpose', 'avatar');

	const res = await api.post('/media/upload', formData);
	return res.data?.data ?? res.data;
}

export async function logout() {
	await api.post('/auth/logout');
	setAuthToken(null);
	window.localStorage.removeItem(AUTH_TOKEN_KEY);
}

export async function refresh() {
	try {
		const res = await api.post('/auth/refresh', null, {
			validateStatus: () => true,
		});

		if (res.status < 200 || res.status >= 300) {
			return null;
		}

		const data = (res.data?.data ?? res.data) as Partial<AuthResponse>;
		if (data?.access_token) setAuthToken(data.access_token);
		if (data?.access_token) window.localStorage.setItem(AUTH_TOKEN_KEY, data.access_token);
		return data;
	} catch {
		return null;
	}
}

export async function forgotPassword(payload: { email: string }) {
	const res = await api.post('/auth/forgot-password', payload);
	return res.data?.data ?? res.data;
}

export async function resetPassword(payload: { token: string; password: string }) {
	const res = await api.post('/auth/reset-password', payload);
	return res.data?.data ?? res.data;
}

export async function verifyEmail(token: string) {
	const res = await api.get(`/auth/verify-email?token=${token}`);
	return res.data?.data ?? res.data;
}

export async function resendVerification() {
	const res = await api.post('/auth/resend-verification');
	return res.data?.data ?? res.data;
}

export default { register, login, profile, updateProfile, logout, refresh, verifyEmail, resendVerification };
