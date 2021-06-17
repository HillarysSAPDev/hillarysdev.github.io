// const CACHE_NAME = 'pwa-ui5-todo-v1.0.07';
// const RESOURCES_TO_PRELOAD = [
// 	'index.html',
// 	'logo.svg',
// 	'register-worker.js',
// 	'manifest.json',
// 	'./controller/ViewMain.controller.js',
// 	'./view/ViewMain.view.xml',
// 	'./controller/Start.controller.js',
// 	'./view/Start.view.xml',
// 	'./controller/WorkStation.controller.js',
// 	'./view/WorkStation.view.xml',
// 	'./controller/Details.controller.js',
// 	'./view/Details.view.xml',
// 	'./view/waiting.fragment.xml'
// 	//'offline-404.html'
// ];
var STATIC_CACHE_NAME = 'static-cache-v1';
var APP_CACHE_NAME = 'app-cache-1.0.8';

var CACHE_APP = [
	'index.html',
];

var CACHE_STATIC = [
	'https://fonts.googleapis.com/css?family=Roboto:400,300,500,700',
	'https://cdnjs.cloudflare.com/ajax/libs/normalize/4.1.1/normalize.min.css'
]

self.addEventListener('install', function (e) {
	e.waitUntil(
		Promise.all([caches.open(STATIC_CACHE_NAME), caches.open(APP_CACHE_NAME), self.skipWaiting()]).then(function (storage) {
			var static_cache = storage[0];
			var app_cache = storage[1];
			return Promise.all([static_cache.addAll(CACHE_STATIC), app_cache.addAll(CACHE_APP)]);
		})
	);
});

self.addEventListener('activate', function (e) {
	e.waitUntil(
		Promise.all([
			self.clients.claim(),
			caches.keys().then(function (cacheNames) {
				return Promise.all(
					cacheNames.map(function (cacheName) {
						if (cacheName !== APP_CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
							console.log('deleting', cacheName);
							return caches.delete(cacheName);
						}
					})
				);
			})
		])
	);
});
self.addEventListener('fetch', function (e) {
	var url = new URL(e.request.url);
	if (url.hostname === 'static.mysite.co' || url.hostname === 'cdnjs.cloudflare.com' || url.hostname === 'fonts.googleapis.com') {
		e.respondWith(
			caches.match(e.request).then(function (response) {
				if (response) {
					return response;
				}
				var fetchRequest = e.request.clone();

				return fetch(fetchRequest).then(function (response) {
					if (!response || response.status !== 200 || response.type !== 'basic') {
						return response;
					}
					var responseToCache = response.clone();
					caches.open(STATIC_CACHE_NAME).then(function (cache) {
						cache.put(e.request, responseToCache);
					});
					return response;
				});
			})
		);
	} else if (CACHE_APP.indexOf(url.pathname) !== -1) {
		e.respondWith(caches.match(e.request));
	}
});