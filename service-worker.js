// service-worker.js

const CACHE_NAME = "khymn-v1.0";
const CACHE_FILES = [
  "/khymn/icon-192.png",
  "/khymn/icon-512.png",
  "/khymn/index.html"
];


// 설치 이벤트: 캐시 저장 성공 시에만 완료
self.addEventListener("install", (event) => {
  console.log("📦 [Install] 캐시 저장 시작...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CACHE_FILES);
    }).then(() => {
      console.log("✅ [Install] 캐시 저장 완료");
      self.skipWaiting(); // 바로 적용
    }).catch((err) => {
      console.error("❌ [Install] 캐시 저장 실패:", err);
      // 설치 실패 시 activate가 실행되지 않음 → 기존 캐시 유지됨
    })
  );
});

// 활성화 이벤트: 이전 캐시 제거 (단, 현재 캐시가 준비된 경우에만)
self.addEventListener("activate", (event) => {
  console.log("🟢 [Activate] Service Worker 활성화됨");
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

// 요청 이벤트: 캐시 우선, 없으면 네트워크 → 실패 시 fallback 또는 에러 방지
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response; // 캐시 우선 응답
      }
      return fetch(event.request).catch((err) => {
        console.warn("⚠️ [Fetch] 네트워크 실패, 캐시도 없음:", event.request.url);
        // fallback.html이 있다면 여기에 넣을 수 있습니다.
        return new Response("⚠️ 오프라인 상태이며 요청한 파일이 캐시에 없습니다.", {
          status: 503,
          statusText: "Offline fallback",
          headers: { "Content-Type": "text/plain" }
        });
      });
    })
  );
});

