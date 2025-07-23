"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";
import offlineNotificationService from "@/lib/offline-notifications";

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
  sender?: {
    name: string;
    role: string;
  };
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
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
}) => {
  const { data: session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOnline, setIsOnline] = useState(
    offlineNotificationService.isOnlineMode()
  );

  useEffect(() => {
    if (!session?.user?.id) return;

    // Create socket connection
    const newSocket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    setSocket(newSocket);

    // Connection events
    newSocket.on("connect", () => {
      console.log("Connected to WebSocket server");
      setIsConnected(true);

      // Authenticate with the server
      newSocket.emit("authenticate", {
        userId: session.user.id,
        token: "your-auth-token", // In a real app, you'd pass the actual token
      });
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
      setIsConnected(false);
    });

    // Notification events
    newSocket.on("unreadCount", (data) => {
      setUnreadCount(data.count);
    });

    newSocket.on("notifications", (data) => {
      setNotifications(data.notifications);
    });

    newSocket.on("newNotification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    newSocket.on("allMarkedAsRead", () => {
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
    });

    newSocket.on("notificationArchived", (data) => {
      setNotifications((prev) =>
        prev.filter((notif) => notif.id !== data.notificationId)
      );
    });

    newSocket.on("error", (error) => {
      console.error("WebSocket error:", error);
    });

    return () => {
      newSocket.close();
    };
  }, [session?.user?.id]);

  const fetchNotifications = async () => {
    if (isOnline && socket && session?.user?.id) {
      socket.emit("fetchNotifications", {
        userId: session.user.id,
        limit: 20,
        includeRead: false,
      });
    } else {
      // Use offline service
      const offlineNotifications =
        await offlineNotificationService.fetchNotifications(20, false);
      setNotifications(offlineNotifications);
      const count = await offlineNotificationService.getUnreadCount();
      setUnreadCount(count);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (isOnline && socket && session?.user?.id) {
      socket.emit("markAsRead", {
        notificationId,
        userId: session.user.id,
      });
    } else {
      // Use offline service
      await offlineNotificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = async () => {
    if (isOnline && socket && session?.user?.id) {
      socket.emit("markAllAsRead", {
        userId: session.user.id,
      });
    } else {
      // Use offline service
      await offlineNotificationService.markAllAsRead();
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
      // Use offline service
      await offlineNotificationService.archiveNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    }
  };

  // Update online status when it changes
  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = offlineNotificationService.isOnlineMode();
      setIsOnline(online);
      setIsConnected(online);
    };

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
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
