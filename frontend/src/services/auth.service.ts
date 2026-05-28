import api, { setAuthToken } from './api';

export type AuthUser = {
	id?: string;
	name: string;
	email: string;
	username?: string;
	role?: string;
	organizationId?: string | null;
};

type AuthResponse = {
	token: string;
	user: AuthUser;
};

export async function register(payload: { name: string; email: string; password: string; role?: 'LEARNER' | 'EMPLOYER' | 'INSTITUTION' | 'MENTOR' }) {
	const res = await api.post('/auth/register', payload);
	const data = res.data?.data as AuthResponse;
	if (data?.token) setAuthToken(data.token);
	return data;
}

export async function login(payload: { email: string; password: string }) {
	const res = await api.post('/auth/login', payload);
	const data = res.data?.data as AuthResponse;
	if (data?.token) setAuthToken(data.token);
	return data;
}

export async function profile() {
	const res = await api.get('/auth/profile');
	return res.data?.data?.user as AuthUser;
}

export async function logout() {
	await api.post('/auth/logout');
	setAuthToken(null);
}

export async function refresh() {
	try {
		const res = await api.post('/auth/refresh', null, {
			validateStatus: () => true,
		});

		if (res.status < 200 || res.status >= 300) {
			return null;
		}

		const data = res.data?.data as AuthResponse;
		if (data?.token) setAuthToken(data.token);
		return data;
	} catch {
		return null;
	}
}

export default { register, login, profile, logout, refresh };
