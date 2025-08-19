const CACHE_NAME = "notification-cache-v1";
const NOTIFICATION_CACHE = "notifications-v1";
const OFFLINE_QUEUE = "offline-queue-v1";

// Install event - cache essential resources
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        "/",
        "/dashboard/client",
        "/dashboard/agency",
        "/dashboard/admin",
        "/api/notifications",
        "/api/notifications/count",
      ]);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== CACHE_NAME &&
            cacheName !== NOTIFICATION_CACHE &&
            cacheName !== OFFLINE_QUEUE
          ) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - handle offline scenarios
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Let the browser/Next.js handle real page navigations
  if (req.mode === "navigate") {
    return; // do NOT event.respondWith for navigations
  }

  // Never touch API/auth
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // Example: cache-only for immutable build assets
  if (
    url.origin === self.location.origin &&
    url.pathname.startsWith("/_next/static/")
  ) {
    event.respondWith(
      (async () => {
        const cache = await caches.open("static-v2");
        const hit = await cache.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        cache.put(req, res.clone());
        return res;
      })()
    );
  }
});

// Handle notification requests with offline support
async function handleNotificationRequest(request) {
  try {
    // Try to fetch from network first
    const response = await fetch(request);

    if (response.ok) {
      // Cache successful responses
      const responseToCache = response.clone();
      const cache = await caches.open(NOTIFICATION_CACHE);
      cache.put(request, responseToCache);

      // Process offline queue if we're back online
      await processOfflineQueue();

      return response;
    }
  } catch (error) {
    console.log("Network request failed, serving from cache:", error);
  }

  // Fallback to cache
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  // Return offline response for notification endpoints
  if (request.url.includes("/api/notifications/count")) {
    return new Response(JSON.stringify({ count: 0 }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (request.url.includes("/api/notifications")) {
    return new Response(JSON.stringify({ notifications: [] }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response("Offline", { status: 503 });
}

// Queue offline actions
async function queueOfflineAction(action) {
  try {
    const cache = await caches.open(OFFLINE_QUEUE);
    const queue = await getOfflineQueue();
    queue.push({
      ...action,
      timestamp: Date.now(),
    });
    await cache.put("/queue", new Response(JSON.stringify(queue)));
  } catch (error) {
    console.error("Failed to queue offline action:", error);
  }
}

// Get offline queue
async function getOfflineQueue() {
  try {
    const cache = await caches.open(OFFLINE_QUEUE);
    const response = await cache.match("/queue");
    if (response) {
      return await response.json();
    }
  } catch (error) {
    console.error("Failed to get offline queue:", error);
  }
  return [];
}

// Process offline queue when back online
async function processOfflineQueue() {
  try {
    const queue = await getOfflineQueue();
    if (queue.length === 0) return;

    console.log("Processing offline queue:", queue.length, "items");

    for (const action of queue) {
      try {
        await processOfflineAction(action);
      } catch (error) {
        console.error("Failed to process offline action:", action, error);
      }
    }

    // Clear the queue after processing
    const cache = await caches.open(OFFLINE_QUEUE);
    await cache.delete("/queue");
  } catch (error) {
    console.error("Failed to process offline queue:", error);
  }
}

// Process individual offline action
async function processOfflineAction(action) {
  const { type, data, timestamp } = action;

  switch (type) {
    case "markAsRead":
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "markAsRead",
          notificationId: data.notificationId,
        }),
      });
      break;

    case "markAllAsRead":
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "markAllAsRead",
        }),
      });
      break;

    case "archiveNotification":
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "archive",
          notificationId: data.notificationId,
        }),
      });
      break;

    default:
      console.warn("Unknown offline action type:", type);
  }
}

// Listen for messages from the main thread
self.addEventListener("message", (event) => {
  const { type, data } = event.data;

  switch (type) {
    case "QUEUE_OFFLINE_ACTION":
      queueOfflineAction(data);
      break;

    case "PROCESS_OFFLINE_QUEUE":
      processOfflineQueue();
      break;

    case "SKIP_WAITING":
      self.skipWaiting();
      break;
  }
});

// Background sync for notifications
self.addEventListener("sync", (event) => {
  if (event.tag === "notification-sync") {
    event.waitUntil(processOfflineQueue());
  }
});

// Push notification handling
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.message,
      icon: "/assets/Logo-black.png",
      badge: "/assets/Logo-black.png",
      tag: "notification",
      data: {
        url: data.actionUrl || "/dashboard",
      },
      actions: data.actionText
        ? [
            {
              action: "view",
              title: data.actionText,
            },
          ]
        : [],
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

// Notification click handling
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "view" || !event.action) {
    const url = event.notification.data?.url || "/dashboard";
    event.waitUntil(clients.openWindow(url));
  }
});
