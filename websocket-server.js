import { createServer } from "http";
import { Server } from "socket.io";
import { PrismaClient } from "./lib/generated/prisma/index.js";
import { env } from "@/lib/env";

const prisma = new PrismaClient();

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: env.isProduction
      ? "https://findly.breaktroughf1.com"
      : "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Store user connections
const userConnections = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Handle user authentication
  socket.on("authenticate", async (data) => {
    try {
      const { userId } = data;

      // In a real app, you'd verify the token here
      // For now, we'll just store the connection
      userConnections.set(userId, socket.id);
      socket.userId = userId;

      console.log(`User ${userId} authenticated`);

      // Send initial unread count
      const unreadCount = await prisma.notification.count({
        where: {
          recipientId: userId,
          isRead: false,
          isArchived: false,
        },
      });

      socket.emit("unreadCount", { count: unreadCount });
    } catch (error) {
      console.error("Authentication error:", error);
      socket.emit("error", { message: "Authentication failed" });
    }
  });

  // Handle fetching notifications
  socket.on("fetchNotifications", async (data) => {
    try {
      const { userId, limit = 20, includeRead = false } = data;

      const whereClause = {
        recipientId: userId,
        isArchived: false,
        ...(includeRead ? {} : { isRead: false }),
      };

      const notifications = await prisma.notification.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        take: limit,
        include: {
          sender: {
            select: {
              name: true,
              role: true,
            },
          },
        },
      });

      socket.emit("notifications", { notifications });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      socket.emit("error", { message: "Failed to fetch notifications" });
    }
  });

  // Handle marking notification as read
  socket.on("markAsRead", async (data) => {
    try {
      const { notificationId, userId } = data;

      await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });

      // Update unread count
      const unreadCount = await prisma.notification.count({
        where: {
          recipientId: userId,
          isRead: false,
          isArchived: false,
        },
      });

      socket.emit("unreadCount", { count: unreadCount });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      socket.emit("error", { message: "Failed to mark notification as read" });
    }
  });

  // Handle marking all as read
  socket.on("markAllAsRead", async (data) => {
    try {
      const { userId } = data;

      await prisma.notification.updateMany({
        where: {
          recipientId: userId,
          isRead: false,
          isArchived: false,
        },
        data: { isRead: true },
      });

      socket.emit("unreadCount", { count: 0 });
      socket.emit("allMarkedAsRead");
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      socket.emit("error", {
        message: "Failed to mark all notifications as read",
      });
    }
  });

  // Handle archiving notification
  socket.on("archiveNotification", async (data) => {
    try {
      const { notificationId, userId } = data;

      await prisma.notification.update({
        where: { id: notificationId },
        data: { isArchived: true },
      });

      // Update unread count
      const unreadCount = await prisma.notification.count({
        where: {
          recipientId: userId,
          isRead: false,
          isArchived: false,
        },
      });

      socket.emit("unreadCount", { count: unreadCount });
      socket.emit("notificationArchived", { notificationId });
    } catch (error) {
      console.error("Error archiving notification:", error);
      socket.emit("error", { message: "Failed to archive notification" });
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    if (socket.userId) {
      userConnections.delete(socket.userId);
    }
    console.log("User disconnected:", socket.id);
  });
});

// Function to send notification to specific user
const sendNotificationToUser = async (userId, notificationData) => {
  const socketId = userConnections.get(userId);
  if (socketId) {
    const socket = io.sockets.sockets.get(socketId);
    if (socket) {
      socket.emit("newNotification", notificationData);

      // Update unread count
      const unreadCount = await prisma.notification.count({
        where: {
          recipientId: userId,
          isRead: false,
          isArchived: false,
        },
      });

      socket.emit("unreadCount", { count: unreadCount });
    }
  }
};

// Export the function for use in other parts of the app
export { sendNotificationToUser };

const PORT = env.NEXT_PUBLIC_WEBSOCKET_URL?.split(":").pop() || 3001;
httpServer.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});
