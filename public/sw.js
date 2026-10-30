
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    if (event.data) {
      payload = event.data.json();
    }
  } catch {
    payload = { title: "Fubrio", body: event.data ? event.data.text() : "New announcement" };
  }
  const title = payload.title || "Fubrio Announcement";
  const options = {
    body: payload.body || "A new announcement has been published.",
    icon: payload.icon || "/fubrio-logo.png",
    badge: payload.badge || "/favicon-32.png",
    data: {
      url: payload.url || "/#announcements",
    },
    tag: payload.tag || "fubrio-announcement",
    renotify: true,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification?.data?.url || "/#announcements";
  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const c of allClients) {
        try {
          if (c.url.includes(self.location.origin)) {
            c.focus();
            if (c.navigate) {
              await c.navigate(targetUrl);
            } else {
              c.postMessage({ type: "navigate", url: targetUrl });
            }
            return;
          }
        } catch {}
      }
      try {
        await self.clients.openWindow(targetUrl);
      } catch {}
    })(),
  );
});
