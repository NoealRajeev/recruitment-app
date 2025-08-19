"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";
import { publicEnv } from "@/lib/env.public";
import { getOfflineNotificationService } from "@/lib/offline-notifications";
import { usePathname } from "next/navigation";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  priority: string;
  createdAt: string;
  actionUrl?: string;
  actionText?: string;
  sender?: { name: string; role: string };
}

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  unreadCount: number;
  notifications: Notification[];
  fetchNotifications: () => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  archiveNotification: (notificationId: string) => void;
  isOnline: boolean;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

export const useWebSocket = () => {
  const ctx = useContext(WebSocketContext);
  if (!ctx)
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  return ctx;
};

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
}) => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isAuthArea = pathname?.startsWith("/auth");

  // Lazily init the offline service; never on /auth/*
  const serviceRef = useRef<ReturnType<
    typeof getOfflineNotificationService
  > | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isAuthArea) return;
    if (!serviceRef.current) {
      serviceRef.current = getOfflineNotificationService();
    }
  }, [isAuthArea]);

  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOnline, setIsOnline] = useState(
    typeof window !== "undefined" ? navigator.onLine : true
  );

  // Socket lifecycle (skip on /auth/*)
  useEffect(() => {
    if (!session?.user?.id) return;
    if (isAuthArea) return;

    const url = publicEnv.NEXT_PUBLIC_WEBSOCKET_URL || "";
    if (!url) {
      console.warn(
        "NEXT_PUBLIC_WEBSOCKET_URL is not set; skipping socket init."
      );
      return;
    }

    const newSocket = io(url, {
      transports: ["websocket", "polling"],
      autoConnect: true,
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
      newSocket.emit("authenticate", {
        userId: session.user.id,
        token: "your-auth-token", // TODO: pass a real token if needed
      });
    });

    newSocket.on("disconnect", () => setIsConnected(false));
    newSocket.on("unreadCount", (data) => setUnreadCount(data.count));
    newSocket.on("notifications", (data) =>
      setNotifications(data.notifications)
    );
    newSocket.on("newNotification", (n) => {
      setNotifications((prev) => [n, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });
    newSocket.on("allMarkedAsRead", () => {
      setNotifications((prev) => prev.map((x) => ({ ...x, isRead: true })));
    });
    newSocket.on("notificationArchived", (data) => {
      setNotifications((prev) =>
        prev.filter((x) => x.id !== data.notificationId)
      );
    });
    newSocket.on("error", (err) => console.error("WebSocket error:", err));

    // ✅ Cleanup must return void (not the Socket).
    return () => {
      try {
        newSocket.close(); // or newSocket.disconnect();
      } finally {
        setIsConnected(false);
        setSocket(null);
      }
    };
  }, [session?.user?.id, isAuthArea]);

  const fetchNotifications = async () => {
    if (isOnline && socket && session?.user?.id) {
      socket.emit("fetchNotifications", {
        userId: session.user.id,
        limit: 20,
        includeRead: false,
      });
    } else {
      const svc = serviceRef.current;
      if (!svc) return;
      const offline = await svc.fetchNotifications(20, false);
      setNotifications(offline);
      const count = await svc.getUnreadCount();
      setUnreadCount(count);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (isOnline && socket && session?.user?.id) {
      socket.emit("markAsRead", { notificationId, userId: session.user.id });
    } else {
      const svc = serviceRef.current;
      if (svc) await svc.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = async () => {
    if (isOnline && socket && session?.user?.id) {
      socket.emit("markAllAsRead", { userId: session.user.id });
    } else {
      const svc = serviceRef.current;
      if (svc) await svc.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    }
  };

  const archiveNotification = async (notificationId: string) => {
    if (isOnline && socket && session?.user?.id) {
      socket.emit("archiveNotification", {
        notificationId,
        userId: session.user.id,
      });
    } else {
      const svc = serviceRef.current;
      if (svc) await svc.archiveNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    }
  };

  // Update online status using service when present
  useEffect(() => {
    const update = () => {
      const online = serviceRef.current
        ? serviceRef.current.isOnlineMode()
        : navigator.onLine;
      setIsOnline(online);
      setIsConnected((prev) => (online ? prev : false));
    };
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    update();
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  const value: WebSocketContextType = {
    socket,
    isConnected,
    unreadCount,
    notifications,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    isOnline,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
