// 创建 src/service-worker.js

// Service Worker缓存版本
const CACHE_VERSION = 'v1';
const CACHE_NAME = `unimall-cache-${CACHE_VERSION}`;

// 需要缓存的资源列表
const CACHE_URLS = [
      '/',
      '/index.html',
      '/unimall.png',
      '/src/assets/styles/index.css',
      '/src/assets/styles/tailwind.css',
];

// 安装事件 - 预缓存核心资源
self.addEventListener('install', event => {
      event.waitUntil(
            caches.open(CACHE_NAME)
                  .then(cache => {
                        return cache.addAll(CACHE_URLS);
                  })
                  .then(() => self.skipWaiting())
      );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', event => {
      event.waitUntil(
            caches.keys().then(cacheNames => {
                  return Promise.all(
                        cacheNames
                              .filter(name => name !== CACHE_NAME)
                              .map(name => caches.delete(name))
                  );
            }).then(() => self.clients.claim())
      );
});

// 请求拦截
self.addEventListener('fetch', event => {
      // 排除API请求，不对API使用缓存策略
      if (event.request.url.includes('/api/') || event.request.url.includes('/v1/shop/')) {
            return;
      }

      // 对静态资源使用缓存优先策略
      event.respondWith(
            caches.match(event.request)
                  .then(response => {
                        if (response) {
                              return response;
                        }

                        // 如果没有缓存，则发起网络请求
                        return fetch(event.request).then(networkResponse => {
                              // 只缓存成功的响应
                              if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                                    return networkResponse;
                              }

                              // 复制响应（因为响应流只能使用一次）
                              const responseToCache = networkResponse.clone();

                              caches.open(CACHE_NAME)
                                    .then(cache => {
                                          cache.put(event.request, responseToCache);
                                    });

                              return networkResponse;
                        });
                  })
      );
});