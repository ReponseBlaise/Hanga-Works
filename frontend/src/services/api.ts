import axios from 'axios';

const BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:5000/api/v1';

export const api = axios.create({
	baseURL: BASE,
	withCredentials: true,
	headers: {
		'Content-Type': 'application/json',
		Accept: 'application/json',
	},
});

export function setAuthToken(token: string | null) {
	if (token) {
		api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
	} else {
		delete api.defaults.headers.common['Authorization'];
	}
}

export default api;
