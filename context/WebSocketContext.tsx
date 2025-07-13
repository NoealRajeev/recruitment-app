"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  unreadCount: number;
  notifications: any[];
  fetchNotifications: () => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  archiveNotification: (notificationId: string) => void;
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
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (!session?.user?.id) return;

    // Create socket connection
    const newSocket = io(
      process.env.NEXT_PUBLIC_WEBSOCKET_URL || "http://localhost:3001",
      {
        transports: ["websocket", "polling"],
        autoConnect: true,
      }
    );

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

  const fetchNotifications = () => {
    if (socket && session?.user?.id) {
      socket.emit("fetchNotifications", {
        userId: session.user.id,
        limit: 20,
        includeRead: false,
      });
    }
  };

  const markAsRead = (notificationId: string) => {
    if (socket && session?.user?.id) {
      socket.emit("markAsRead", {
        notificationId,
        userId: session.user.id,
      });
    }
  };

  const markAllAsRead = () => {
    if (socket && session?.user?.id) {
      socket.emit("markAllAsRead", {
        userId: session.user.id,
      });
    }
  };

  const archiveNotification = (notificationId: string) => {
    if (socket && session?.user?.id) {
      socket.emit("archiveNotification", {
        notificationId,
        userId: session.user.id,
      });
    }
  };

  const value: WebSocketContextType = {
    socket,
    isConnected,
    unreadCount,
    notifications,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    archiveNotification,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
