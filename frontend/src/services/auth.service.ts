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
	access_token: string;
	user: AuthUser;
};

export async function register(payload: { name: string; email: string; password: string; role?: 'LEARNER' | 'EMPLOYER' | 'INSTITUTION' | 'MENTOR' }) {
	// Create the account
	await api.post('/auth/register', payload);
	// Immediately log in to get the token
	return await login({ email: payload.email, password: payload.password });
}

export async function login(payload: { email: string; password: string }) {
	const res = await api.post('/auth/login', payload);
	const data = res.data;
	
	if (data?.access_token) {
		setAuthToken(data.access_token);
		return { access_token: data.access_token, user: data.user } as AuthResponse;
	}
	throw new Error("Invalid response from server");
}

export async function profile() {
	const res = await api.get('/users/me');
	return res.data as AuthUser;
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

		const data = (res.data?.data ?? res.data) as Partial<AuthResponse>;
		if (data?.access_token) setAuthToken(data.access_token);
		return data;
	} catch {
		return null;
	}
}

export default { register, login, profile, logout, refresh };
