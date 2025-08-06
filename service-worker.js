// service-worker.js

const CACHE_NAME = "khymn-v1.2";
const CACHE_FILES = [
  "/khymn/index.html",
  "/khymn/icon-192.png",
  "/khymn/icon-512.png",
  "/khymn/manifest.json"
];

// 1️⃣ 설치: 캐시 파일 저장
self.addEventListener("install", (event) => {
  console.log("📦 [Install] 캐시 저장 시작...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CACHE_FILES);
    }).then(() => {
      console.log("✅ [Install] 캐시 저장 완료");
      self.skipWaiting();
    }).catch((err) => {
      console.error("❌ [Install] 캐시 실패:", err);
    })
  );
});

// 2️⃣ 활성화: 이전 캐시 삭제
self.addEventListener("activate", (event) => {
  console.log("🟢 [Activate] Service Worker 활성화");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("🗑 [Activate] 이전 캐시 삭제:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3️⃣ 요청 처리: 캐시 우선
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        return new Response("⚠️ 오프라인 상태이며 요청한 파일이 캐시에 없습니다.", {
          status: 503,
          statusText: "Offline fallback",
          headers: { "Content-Type": "text/plain" }
        });
      });
    })
  );
});