// khymn/service-worker.js

// 1) 앱 전용 프리픽스
const CACHE_PREFIX = "khymn-";
// 배포 시 이 값만 올리세요
const VERSION = "v2025-10-18-01";
const CACHE_NAME = `${CACHE_PREFIX}${VERSION}`;

// 2) 이 앱에 필요한 파일만 절대경로로
const ASSETS = [
  "/khymn/index.html",
  "/khymn/hymn-index-final.json",
  "/khymn/icon-192.png",
  "/khymn/icon-512.png",
  "/khymn/manifest.json",
  "/khymn/hymnbook.pdf",
  "/khymn/pdf.js",
  "/khymn/pdf.worker.js",
];

// 3) 설치: 캐시 프리로드
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
      .catch(err => console.error("[khymn][install] 실패:", err))
  );
});

// 4) 활성화: khymn- 으로 시작하는 오래된 캐시만 삭제 (kbcp 것은 건드리지 않음)
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME) {
            return caches.delete(key);
          }
          return null;
        })
      )
    ).then(() => self.clients.claim())
  );
});

// 5) 헬퍼: 이 SW가 처리할 요청만 필터링 (같은 오리진 + /khymn/ 경로)
function handles(request) {
  const url = new URL(request.url);
  return url.origin === location.origin && url.pathname.startsWith("/khymn/");
}

// 6) 전략: HTML은 Network First, 그 외는 Cache First
async function networkFirst(req) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const res = await fetch(req);
    cache.put(req, res.clone());
    return res;
  } catch {
    const cached = await cache.match(req);
    if (cached) return cached;
    return new Response("Offline", { status: 503, statusText: "Offline" });
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

// 7) fetch 핸들러: khymn 경로만 응답 (다른 앱은 건드리지 않음)
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // GET만 처리
  if (req.method !== "GET") return;
  // 이 앱이 담당하는 경로 아니면 무시
  if (!handles(req)) return;

  // HTML 탐색 요청은 최신 우선
  const accepts = req.headers.get("accept") || "";
  if (req.mode === "navigate" || accepts.includes("text/html")) {
    event.respondWith(networkFirst(req));
    return;
  }

  // 그 외 정적 자원은 캐시 우선
  event.respondWith(cacheFirst(req));
});

// 8) 즉시 활성화 메시지 처리(선택)
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});




