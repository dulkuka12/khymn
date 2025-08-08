// service-worker.js
// 🔧 배포할 때마다 VERSION만 올려주세요 (예: v2025-08-08-01)
const VERSION = "v2025-08-08-01";
const CACHE_NAME = `khymn-${VERSION}`;

const ASSETS = [
  "/khymn/index.html",
  "/khymn/hymn-index-final.json",
  "/khymn/icon-192.png",
  "/khymn/icon-512.png",
  "/khymn/manifest.json",
  "/khymn/hymnbook.pdf",
  "/khymn/pdfjs/pdf.js",
  "/khymn/pdfjs/pdf.worker.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    ).then(() => self.clients.claim())
  );
});

// 네비게이션 요청은 최신 우선(새 HTML 빨리 받기)
async function networkFirst(event) {
  try {
    const res = await fetch(event.request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(event.request, res.clone());
    return res;
  } catch {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    return new Response("Offline", { status: 503, statusText: "Offline" });
  }
}

// 그 외는 캐시우선, 없으면 네트워크
async function cacheFirst(event) {
  const cached = await caches.match(event.request);
  if (cached) return cached;
  const res = await fetch(event.request);
  const cache = await caches.open(CACHE_NAME);
  cache.put(event.request, res.clone());
  return res;
}

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // HTML 탐색 요청은 최신 우선
  if (req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html")) {
    event.respondWith(networkFirst(event));
    return;
  }

  event.respondWith(cacheFirst(event));
});

// 페이지에서 보내는 'SKIP_WAITING' 메세지 처리 → 즉시 활성화
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
