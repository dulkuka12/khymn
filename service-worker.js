// khymn/service-worker.js

// 1️⃣ 기본 설정
const CACHE_PREFIX = "khymn-";
const VERSION = "v2025-10-15-02";
const CACHE_NAME = `${CACHE_PREFIX}${VERSION}`;

// 2️⃣ 핵심 파일(업데이트 시마다 교체)
const CORE_ASSETS = [
  "/khymn/index.html",
  "/khymn/hymn-index-final.json",
  "/khymn/manifest.json",
  "/khymn/icon-192.png",
  "/khymn/icon-512.png",
  "/khymn/service-worker.js"
];

// 3️⃣ 대용량(한 번만 캐시)
const LARGE_FILES = [
  "/khymn/hymnbook.pdf",
  "/khymn/pdf.js",
  "/khymn/pdf.worker.js"
];

// 4️⃣ 설치 이벤트
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(CORE_ASSETS);
      console.log("📦 CORE_ASSETS cached");
      self.skipWaiting();
    })()
  );
});

// 5️⃣ 활성화: 이전 캐시 정리
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME) {
            console.log("🗑 Deleting old cache:", key);
            return caches.delete(key);
          }
        })
      );
      await caches.open(CACHE_NAME).then(cache => cache.addAll(LARGE_FILES));
      await self.clients.claim();
      console.log("✅ Service Worker activated");
    })()
  );
});

// 6️⃣ 요청 처리
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // khymn 경로만 처리
  if (url.origin !== location.origin || !url.pathname.startsWith("/khymn/")) return;

  if (req.method !== "GET") return;

  // HTML은 네트워크 우선
  const accepts = req.headers.get("accept") || "";
  if (req.mode === "navigate" || accepts.includes("text/html")) {
    event.respondWith(networkFirst(req));
    return;
  }

  // 나머지: 캐시 우선
  event.respondWith(cacheFirst(req));
});

// 7️⃣ 전략 정의
async function networkFirst(req) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const res = await fetch(req);
    cache.put(req, res.clone());
    return res;
  } catch {
    const cached = await cache.match(req);
    return cached || new Response("Offline", { status: 503 });
  }
}

async function cacheFirst(req) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(req);
  if (cached) return cached;
  const res = await fetch(req);
  cache.put(req, res.clone());
  return res;
}

// 8️⃣ 즉시 활성화
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});


