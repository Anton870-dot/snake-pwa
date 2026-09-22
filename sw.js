// Меняй номер версии при каждом обновлении игры
const CACHE_NAME = 'snake-v3';
const urls = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

// Установка: кладём файлы в новый кэш и сразу активируемся
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(urls)));
  self.skipWaiting();
});

// Активация: удаляем ВСЕ старые кэши (snake-v1, snake-v2 и т.д.)
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Запросы: сначала пробуем интернет (свежая версия), без сети — берём из кэша
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
