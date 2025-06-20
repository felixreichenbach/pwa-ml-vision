// Service Workers: https://svelte.dev/docs/kit/service-workers

self.addEventListener('install', (event) => {
	self.skipWaiting();
});

self.addEventListener('activate', (event) => {
	self.clients.claim();
});
