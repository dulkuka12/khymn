// service-worker.js
// 1) 캐시 이름은 앱별 프리픽스로 완전히 분리
const CACHE_PREFIX = "kbcp-";
const CACHE_VERSION = "v2025-10-23-02";
const CACHE_NAME = `${CACHE_PREFIX}${CACHE_VERSION}`;

// 2) kbcp 전용 파일만 절대경로로 명시
const CACHE_FILES = [
  "/kbcp/all-proper-select.html",
  "/kbcp/anointing-sick-lesson.html",
  "/kbcp/anointing-sick.html",
  "/kbcp/baptism-lesson.html",
  "/kbcp/baptism.html",
  "/kbcp/bcp-guide.html",
  "/kbcp/blessing-artifacts-text.html",
  "/kbcp/blessing.html",
  "/kbcp/brief-prayer.html",
//  "/kbcp/burial-prayer.html",
  "/kbcp/coffin-prayer.html",
  "/kbcp/collect-list-p.html",
  "/kbcp/collect-list.html",
  "/kbcp/collect-text.html",
  "/kbcp/commandments-text.html",
  "/kbcp/commendatory-prayer.html",
  "/kbcp/compline-prayer.html",
  "/kbcp/creeds-text.html",
//  "/kbcp/cremate-prayer.html",
  "/kbcp/daily-office-select.html",
  "/kbcp/departure-prayer.html",
  "/kbcp/enshrining-prayer.html",
  "/kbcp/evening-prayer.html",
  "/kbcp/funeral-select.html",
  "/kbcp/great-litany-text.html",
  "/kbcp/holyday-select.html",
  "/kbcp/holyday-text.html",
  "/kbcp/icon-192.png",
  "/kbcp/icon-512.png",
  "/kbcp/index.html",
  "/kbcp/install-guide.html",
  "/kbcp/lesson1-list-p.html",
  "/kbcp/lesson1-list.html",
  "/kbcp/lesson1-text.html",
  "/kbcp/lesson2-list-p.html",
  "/kbcp/lesson2-list.html",
  "/kbcp/lesson2-text.html",
  "/kbcp/litanies-select-p.html",
  "/kbcp/litanies-select.html",
  "/kbcp/litanies-text.html",
  "/kbcp/main-prayer-select.html",
  "/kbcp/main-prayer-text.html",
  "/kbcp/main.js",
  "/kbcp/manifest.json",
  "/kbcp/maternity.html",
  "/kbcp/matrimony.html",
  "/kbcp/matrimony-lesson.html",
  "/kbcp/memorial-prayer-lesson.html",
  "/kbcp/memorial-prayer.html",
  "/kbcp/morning-prayer.html",
//  "/kbcp/non-believer-lesson.html",
//  "/kbcp/non-believer.html",
  "/kbcp/noonday-prayer.html",
  "/kbcp/outline-list.html",
  "/kbcp/outline-text.html",
  "/kbcp/pastoral-select.html",
  "/kbcp/prayer-for-dead-lesson.html",
  "/kbcp/prayer-for-dead.html",
  "/kbcp/prayer-select-p.html",
  "/kbcp/prayer-select.html",
  "/kbcp/prayer-text.html",
  "/kbcp/proper-guide.html",
  "/kbcp/proper-list-p.html",
  "/kbcp/proper-list.html",
  "/kbcp/proper-text.html",
  "/kbcp/psalm-guide.html",
  "/kbcp/psalm-list1-p.html",
  "/kbcp/psalm-list1.html",
  "/kbcp/psalm-list2-p.html",
  "/kbcp/psalm-list2.html",
  "/kbcp/psalm-select-p.html",
  "/kbcp/psalm-select.html",
  "/kbcp/psalm-text.html",
  "/kbcp/reception.html",
  "/kbcp/reconciliation.html",
  "/kbcp/sacrament-select.html",
  "/kbcp/service-worker.js",
  "/kbcp/splash.html",
  "/kbcp/style.css",
  "/kbcp/ucharist-form1.html",
  "/kbcp/ucharist-form2.html",
  "/kbcp/ucharist-select.html",
  "/kbcp/user-guide.html",
  "/kbcp/vestry.html"
];

// 1️⃣ 설치: 새 버전 캐시 저장
self.addEventListener("install", (event) => {
  console.log("📦 [kbcp] 설치 시작:", CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CACHE_FILES))
      .then(() => self.skipWaiting())
      .catch((err) => console.error("❌ [kbcp][Install] 캐시 실패:", err))
  );
});

// 2️⃣ 활성화: 이전 버전 캐시 삭제
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((k) => {
          if (k.startsWith(CACHE_PREFIX) && k !== CACHE_NAME) {
            console.log("🧹 [kbcp] 오래된 캐시 삭제:", k);
            return caches.delete(k);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// 3️⃣ fetch: /kbcp/ 요청만 캐시 처리
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (!url.pathname.startsWith("/kbcp/")) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(req);
      if (cached) return cached;

      try {
        const resp = await fetch(req);
        return resp;
      } catch {
        return new Response(
          "⚠️ 오프라인 상태이며 kbcp 캐시에 없습니다.",
          { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } }
        );
      }
    })
  );
});

// 4️⃣ 메시지 수신: SKIP_WAITING 명령 처리
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

