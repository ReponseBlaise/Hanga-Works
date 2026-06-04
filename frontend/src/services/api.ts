import axios from 'axios';

export const AUTH_TOKEN_KEY = 'sewi-platform-auth-token';

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE ?? '/api/v1';

export const api = axios.create({
	baseURL: API_BASE_URL,
	withCredentials: true,
	headers: {
		'Content-Type': 'application/json',
		Accept: 'application/json',
	},
});

const refreshClient = axios.create({
	baseURL: API_BASE_URL,
	withCredentials: true,
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

api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;
		const status = error?.response?.status;

		if (!originalRequest || status !== 401 || originalRequest._retry) {
			return Promise.reject(error);
		}

		const requestUrl = String(originalRequest.url ?? '');
		if (requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register') || requestUrl.includes('/auth/refresh') || requestUrl.includes('/auth/logout')) {
			return Promise.reject(error);
		}

		originalRequest._retry = true;

		try {
			const refreshResponse = await refreshClient.post('/auth/refresh', null, {
				validateStatus: () => true,
				withCredentials: true,
			});

			if (refreshResponse.status !== 200) {
				console.error('Refresh endpoint returned non-200', { status: refreshResponse.status, data: refreshResponse.data });
				setAuthToken(null);
				if (typeof window !== 'undefined') window.dispatchEvent(new Event('auth:unauthorized'));
				return Promise.reject(error);
			}

			const refreshedToken = refreshResponse.data?.data?.access_token ?? refreshResponse.data?.access_token;

			if (!refreshedToken) {
				console.error('No access token in refresh response', { data: refreshResponse.data });
				setAuthToken(null);
				if (typeof window !== 'undefined') window.dispatchEvent(new Event('auth:unauthorized'));
				return Promise.reject(error);
			}

			setAuthToken(refreshedToken);
			if (typeof window !== 'undefined') {
				window.localStorage.setItem(AUTH_TOKEN_KEY, refreshedToken);
			}
			originalRequest.headers = originalRequest.headers ?? {};
			originalRequest.headers.Authorization = `Bearer ${refreshedToken}`;
			return api(originalRequest);
		} catch (err) {
			console.error('Error while refreshing token', err);
			setAuthToken(null);
			if (typeof window !== 'undefined') window.dispatchEvent(new Event('auth:unauthorized'));
			return Promise.reject(error);
		}
	}
);

export default api;
