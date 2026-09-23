// Меняй номер версии при каждом обновлении игры
const CACHE_NAME = 'snake-v7';
const urls = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

// Установка: кладём файлы в новый кэш и сразу активируемся
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(urls)));
  self.skipWaiting();
});

// Активация: удаляем ВСЕ старые кэши
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Запросы: сначала интернет (свежая версия), без сети — кэш.
// Музыку браузер грузит кусками (Range) — такие запросы пропускаем мимо кэша.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || e.request.headers.has('range')) return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.status === 200){
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
