import axios from 'axios';

export const AUTH_TOKEN_KEY = 'sewi-platform-auth-token';

const BASE = import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE ?? '/api/v1';

export const api = axios.create({
	baseURL: BASE,
	withCredentials: true,
	headers: {
		'Content-Type': 'application/json',
		Accept: 'application/json',
	},
});

if (typeof window !== 'undefined') {
	const storedToken = window.localStorage.getItem(AUTH_TOKEN_KEY);
	if (storedToken) {
		api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
	}
}

export function setAuthToken(token: string | null) {
	if (token) {
		api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
	} else {
		delete api.defaults.headers.common['Authorization'];
	}
}

export default api;
