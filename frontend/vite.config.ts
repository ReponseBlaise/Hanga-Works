import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
	plugins: [react()],
	server: {
		proxy: {
			// Proxy /api/* to backend /api/v1/* during development
			'/api': {
				target: 'http://localhost:3000/api/v1',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, ''),
			},
		},
	},
});
