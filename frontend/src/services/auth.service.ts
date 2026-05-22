import api, { setAuthToken } from './api';

export type AuthUser = {
	name: string;
	email: string;
	username?: string;
	role?: string;
};

type AuthResponse = {
	token: string;
	user: AuthUser;
};

export async function register(payload: { name: string; email: string; password: string; role?: string }) {
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
	return res.data?.data;
}

export async function logout() {
	await api.post('/auth/logout');
	setAuthToken(null);
}

export default { register, login, profile, logout };
