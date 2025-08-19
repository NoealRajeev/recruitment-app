interface OfflineAction {
  type: "markAsRead" | "markAllAsRead" | "archiveNotification";
  data: { notificationId?: string };
  timestamp: number;
}

interface OfflineNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  priority: string;
  createdAt: string;
  actionUrl?: string;
  actionText?: string;
  sender?: {
    name: string;
    role: string;
  };
}

class OfflineNotificationService {
  private isOnline = navigator.onLine;
  private serviceWorkerRegistration: ServiceWorkerRegistration | null = null;
  private offlineNotifications: OfflineNotification[] = [];
  private syncInProgress = false;

  constructor() {
    this.setupEventListeners();
    this.loadOfflineNotifications();
    this.initializeServiceWorker();
  }

  private async initializeServiceWorker() {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NEXT_PUBLIC_ENABLE_SW !== "true") return;
    if (process.env.NODE_ENV !== "production") return;
    const path = window.location.pathname;
    if (path.startsWith("/auth")) return;

    window.addEventListener("load", async () => {
      try {
        this.serviceWorkerRegistration = await navigator.serviceWorker.register(
          "/sw.js",
          { scope: "/" }
        );
        console.log(
          "Service Worker registered:",
          this.serviceWorkerRegistration
        );
        // Handle service worker updates
        this.serviceWorkerRegistration.addEventListener("updatefound", () => {
          const newWorker = this.serviceWorkerRegistration!.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                // New service worker available
                this.showUpdateNotification();
              }
            });
          }
        });
      } catch (error) {
        console.error("Service Worker registration failed:", error);
      }
    });
  }

  private setupEventListeners() {
    // Online/offline events
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.onOnline();
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
      this.onOffline();
    });

    // Visibility change for sync
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && this.isOnline) {
        this.syncOfflineActions();
      }
    });
  }

  private async loadOfflineNotifications() {
    try {
      const stored = localStorage.getItem("offlineNotifications");
      if (stored) {
        this.offlineNotifications = JSON.parse(stored);
      }
    } catch (error) {
      console.error("Failed to load offline notifications:", error);
    }
  }

  private saveOfflineNotifications() {
    try {
      localStorage.setItem(
        "offlineNotifications",
        JSON.stringify(this.offlineNotifications)
      );
    } catch (error) {
      console.error("Failed to save offline notifications:", error);
    }
  }

  private onOnline() {
    console.log("Back online - syncing offline actions");
    this.syncOfflineActions();
    this.showOnlineNotification();
  }

  private onOffline() {
    console.log("Gone offline - switching to offline mode");
    this.showOfflineNotification();
  }

  private async syncOfflineActions() {
    if (this.syncInProgress) return;

    this.syncInProgress = true;

    try {
      // Process offline queue via service worker
      if (this.serviceWorkerRegistration?.active) {
        this.serviceWorkerRegistration.active.postMessage({
          type: "PROCESS_OFFLINE_QUEUE",
        });
      }

      // Sync offline notifications
      await this.syncOfflineNotifications();
    } catch (error) {
      console.error("Failed to sync offline actions:", error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private async syncOfflineNotifications() {
    if (this.offlineNotifications.length === 0) return;

    try {
      // Send offline notifications to server
      const response = await fetch("/api/notifications/sync-offline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notifications: this.offlineNotifications,
        }),
      });

      if (response.ok) {
        // Clear offline notifications after successful sync
        this.offlineNotifications = [];
        this.saveOfflineNotifications();
        console.log("Offline notifications synced successfully");
      }
    } catch (error) {
      console.error("Failed to sync offline notifications:", error);
    }
  }

  private queueOfflineAction(action: OfflineAction) {
    if (this.serviceWorkerRegistration?.active) {
      this.serviceWorkerRegistration.active.postMessage({
        type: "QUEUE_OFFLINE_ACTION",
        data: action,
      });
    }
  }

  private showOfflineNotification() {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Offline Mode", {
        body: "You are currently offline. Notifications will be synced when you reconnect.",
        icon: "/assets/Logo-black.png",
        tag: "offline-status",
      });
    }
  }

  private showOnlineNotification() {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Back Online", {
        body: "Connection restored. Syncing offline data...",
        icon: "/assets/Logo-black.png",
        tag: "online-status",
      });
    }
  }

  private showUpdateNotification() {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("App Update Available", {
        body: "A new version is available. Refresh the page to update.",
        icon: "/assets/Logo-black.png",
        tag: "update-available",
      });
    }
  }

  // Public methods
  public isOnlineMode(): boolean {
    return this.isOnline;
  }

  public async markAsRead(notificationId: string): Promise<void> {
    if (this.isOnline) {
      try {
        const response = await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "markAsRead",
            notificationId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to mark as read");
        }
      } catch (error) {
        console.error("Failed to mark as read online:", error);
        // Fallback to offline mode
        this.queueOfflineAction({
          type: "markAsRead",
          data: { notificationId },
          timestamp: Date.now(),
        });
      }
    } else {
      // Queue for offline processing
      this.queueOfflineAction({
        type: "markAsRead",
        data: { notificationId },
        timestamp: Date.now(),
      });
    }
  }

  public async markAllAsRead(): Promise<void> {
    if (this.isOnline) {
      try {
        const response = await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "markAllAsRead",
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to mark all as read");
        }
      } catch (error) {
        console.error("Failed to mark all as read online:", error);
        // Fallback to offline mode
        this.queueOfflineAction({
          type: "markAllAsRead",
          data: {},
          timestamp: Date.now(),
        });
      }
    } else {
      // Queue for offline processing
      this.queueOfflineAction({
        type: "markAllAsRead",
        data: {},
        timestamp: Date.now(),
      });
    }
  }

  public async archiveNotification(notificationId: string): Promise<void> {
    if (this.isOnline) {
      try {
        const response = await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "archive",
            notificationId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to archive notification");
        }
      } catch (error) {
        console.error("Failed to archive notification online:", error);
        // Fallback to offline mode
        this.queueOfflineAction({
          type: "archiveNotification",
          data: { notificationId },
          timestamp: Date.now(),
        });
      }
    } else {
      // Queue for offline processing
      this.queueOfflineAction({
        type: "archiveNotification",
        data: { notificationId },
        timestamp: Date.now(),
      });
    }
  }

  public async fetchNotifications(
    limit = 20,
    includeRead = false
  ): Promise<OfflineNotification[]> {
    if (this.isOnline) {
      try {
        const response = await fetch(
          `/api/notifications?limit=${limit}&includeRead=${includeRead}`
        );

        if (response.ok) {
          const data = await response.json();
          return data.notifications || [];
        }
      } catch (error) {
        console.error("Failed to fetch notifications online:", error);
      }
    }

    // Return cached/offline notifications
    return this.offlineNotifications.slice(0, limit);
  }

  public async getUnreadCount(): Promise<number> {
    if (this.isOnline) {
      try {
        const response = await fetch("/api/notifications/count");

        if (response.ok) {
          const data = await response.json();
          return data.count || 0;
        }
      } catch (error) {
        console.error("Failed to get unread count online:", error);
      }
    }

    // Return offline count
    return this.offlineNotifications.filter((n) => !n.isRead).length;
  }

  public addOfflineNotification(notification: OfflineNotification) {
    this.offlineNotifications.unshift(notification);

    // Keep only the latest 100 notifications
    if (this.offlineNotifications.length > 100) {
      this.offlineNotifications = this.offlineNotifications.slice(0, 100);
    }

    this.saveOfflineNotifications();
  }

  public getOfflineNotifications(): OfflineNotification[] {
    return [...this.offlineNotifications];
  }

  public clearOfflineNotifications() {
    this.offlineNotifications = [];
    this.saveOfflineNotifications();
  }

  public async requestNotificationPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission === "denied") {
      console.log("Notification permission denied");
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === "granted";
  }
}

let __offlineNotificationService: OfflineNotificationService | null = null;
export function getOfflineNotificationService() {
  if (!__offlineNotificationService) {
    __offlineNotificationService = new OfflineNotificationService();
  }
  return __offlineNotificationService;
}
export type OfflineNotificationServiceType = ReturnType<
  typeof getOfflineNotificationService
>;
