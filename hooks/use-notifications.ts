// hooks/use-notifications.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type FetchParams = {
  page?: number;
  limit?: number;
  onlyUnread?: boolean;
  archived?: boolean;
  q?: string;
  category?: "requirement" | "labour" | "document" | "system";
  priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT";
};

export type UINotification = {
  id: string;
  type: string;
  title: string;
  message: string | null;
  isRead: boolean;
  isArchived?: boolean;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT" | string;
  createdAt: string;
  actionUrl?: string | null;
  actionText?: string | null;
  sender?: { name: string } | null;
};

export function useNotifications() {
  const [notifications, setNotifications] = useState<UINotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const nextCursorRef = useRef<string | null>(null);
  const streamRef = useRef<EventSource | null>(null);

  const fetchCount = useCallback(async () => {
    const r = await fetch("/api/notifications/count");
    if (r.ok) {
      const { count } = await r.json();
      setUnreadCount(count ?? 0);
    }
  }, []);

  const fetchNotifications = useCallback(
    async (params: FetchParams = {}) => {
      setLoading(true);
      try {
        const u = new URL("/api/notifications", window.location.origin);
        const {
          page = 1,
          limit = 30,
          onlyUnread,
          archived,
          q,
          category,
          priority,
        } = params;
        // cursor-style pagination supported by API; page calc stays client-side
        u.searchParams.set("limit", String(limit));
        if (onlyUnread) u.searchParams.set("includeRead", "false");
        if (archived) u.searchParams.set("archived", "true");
        if (q) u.searchParams.set("q", q);
        if (category) u.searchParams.set("category", category);
        if (priority) u.searchParams.set("priority", priority);

        // simple page-based: reset cursor on page 1; otherwise use previous nextCursor
        if (page > 1 && nextCursorRef.current) {
          u.searchParams.set("cursor", nextCursorRef.current);
        }

        const r = await fetch(u.toString());
        if (!r.ok) throw new Error("Failed to load notifications");
        const data = await r.json();
        setNotifications(data.notifications ?? []);
        nextCursorRef.current = data.nextCursor ?? null;
        // keep badge fresh
        fetchCount();
      } finally {
        setLoading(false);
      }
    },
    [fetchCount]
  );

  const markAllAsRead = useCallback(async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "markAllAsRead" }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    fetchCount();
  }, [fetchCount]);

  const markAsRead = useCallback(
    async (id: string) => {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markAsRead", notificationId: id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      fetchCount();
    },
    [fetchCount]
  );

  const markUnread = useCallback(
    async (id: string) => {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markAsUnread", notificationId: id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: false } : n))
      );
      fetchCount();
    },
    [fetchCount]
  );

  const archiveNotification = useCallback(
    async (id: string) => {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "archive", notificationId: id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isArchived: true } : n))
      );
      fetchCount();
    },
    [fetchCount]
  );

  const unarchiveNotification = useCallback(
    async (id: string) => {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unarchive", notificationId: id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isArchived: false } : n))
      );
      fetchCount();
    },
    [fetchCount]
  );

  const bulkAction = useCallback(
    async (
      ids: string[],
      action: "read" | "unread" | "archive" | "unarchive"
    ) => {
      if (!ids?.length) return;
      await fetch("/api/notifications/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ids }),
      });
      setNotifications((prev) =>
        prev.map((n) => {
          if (!ids.includes(n.id)) return n;
          if (action === "read") return { ...n, isRead: true };
          if (action === "unread") return { ...n, isRead: false };
          if (action === "archive") return { ...n, isArchived: true };
          if (action === "unarchive") return { ...n, isArchived: false };
          return n;
        })
      );
      fetchCount();
    },
    [fetchCount]
  );

  // live stream (SSE)
  useEffect(() => {
    const es = new EventSource("/api/notifications/stream");
    streamRef.current = es;
    es.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        if (msg?.type === "notification") {
          // prepend latest + bump count if unread
          setNotifications((prev) => [msg.payload, ...prev]);
          fetchCount();
        }
      } catch {}
    };
    es.onerror = () => {
      es.close();
      streamRef.current = null;
    };
    return () => {
      es.close();
      streamRef.current = null;
    };
  }, [fetchCount]);

  // online state
  useEffect(() => {
    const set = () => setIsOnline(navigator.onLine);
    set();
    window.addEventListener("online", set);
    window.addEventListener("offline", set);
    return () => {
      window.removeEventListener("online", set);
      window.removeEventListener("offline", set);
    };
  }, []);

  return {
    notifications,
    unreadCount,
    loading,
    isOnline,
    fetchNotifications,
    markAllAsRead,
    markAsRead,
    markUnread,
    archiveNotification,
    unarchiveNotification,
    bulkAction,
  };
}
