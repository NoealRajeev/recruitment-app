import prisma from "./prisma";
import {
  NotificationType,
  NotificationPriority,
  UserRole,
} from "@prisma/client";
import { notificationBus } from "./notification-bus";
import { sendEmail } from "./utils/email-service";

export interface CreateNotificationParams {
  type: NotificationType;
  title: string;
  message: string;
  recipientId: string;
  senderId?: string;
  entityType?: string;
  entityId?: string;
  priority?: NotificationPriority;
  actionUrl?: string;
  actionText?: string;
}

export interface NotificationConfig {
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  actionUrl?: string;
  actionText?: string;
}

/** Map a NotificationType to a UserSettings toggle bucket */
function getSettingsBucketForType(
  t: NotificationType
): "notifyRequirement" | "notifyLabour" | "notifyDocument" | "notifySystem" {
  switch (t) {
    // Requirement lifecycle
    case "REQUIREMENT_CREATED":
    case "REQUIREMENT_UPDATED":
    case "REQUIREMENT_STATUS_CHANGED":
    case "REQUIREMENT_FORWARDED_TO_AGENCY":
    case "REQUIREMENT_ACCEPTED":
    case "REQUIREMENT_REJECTED":
    case "REQUIREMENT_NEEDS_REVISION":
      return "notifyRequirement";

    // Labour/Profile lifecycle
    case "LABOUR_PROFILE_CREATED":
    case "LABOUR_PROFILE_STATUS_CHANGED":
    case "LABOUR_PROFILE_VERIFIED":
    case "LABOUR_PROFILE_DOCUMENT_UPLOADED":
    case "LABOUR_PROFILE_STAGE_UPDATED":
      return "notifyLabour";

    // Assignment / Offer / Visa / Docs
    case "ASSIGNMENT_CREATED":
    case "ASSIGNMENT_STATUS_CHANGED":
    case "ASSIGNMENT_FEEDBACK_RECEIVED":
    case "DOCUMENT_UPLOADED":
    case "DOCUMENT_VERIFIED":
    case "DOCUMENT_REJECTED":
    case "OFFER_LETTER_GENERATED":
    case "OFFER_LETTER_SIGNED":
    case "VISA_UPLOADED":
    case "TRAVEL_DOCUMENTS_UPLOADED":
      return "notifyDocument";

    // System / security / welcome / maintenance
    default:
      return "notifySystem";
  }
}

async function shouldDeliverPush(recipientId: string, type: NotificationType) {
  const s = await prisma.userSettings.findUnique({
    where: { userId: recipientId },
  });
  if (!s) return true; // default on
  const bucket = getSettingsBucketForType(type);
  return (s as any)[bucket] && s.notifyPush;
}

async function shouldDeliverEmail(recipientId: string, type: NotificationType) {
  const s = await prisma.userSettings.findUnique({
    where: { userId: recipientId },
  });
  if (!s) return true; // default on
  const bucket = getSettingsBucketForType(type);
  return (s as any)[bucket] && s.notifyEmail;
}

export class NotificationService {
  static async createNotification(params: CreateNotificationParams) {
    const notification = await prisma.notification.create({
      data: {
        type: params.type,
        title: params.title,
        message: params.message,
        recipientId: params.recipientId,
        senderId: params.senderId,
        entityType: params.entityType,
        entityId: params.entityId,
        priority: params.priority || NotificationPriority.NORMAL,
        actionUrl: params.actionUrl,
        actionText: params.actionText,
      },
      include: {
        recipient: {
          select: { id: true, name: true, email: true, role: true },
        },
        sender: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    // SSE push (respect push prefs)
    if (await shouldDeliverPush(notification.recipientId, notification.type)) {
      notificationBus.publish(notification.recipientId, {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        isRead: notification.isRead,
        priority: notification.priority,
        createdAt: notification.createdAt,
        actionUrl: notification.actionUrl,
        actionText: notification.actionText,
        sender: notification.sender
          ? { name: notification.sender.name, role: notification.sender.role }
          : undefined,
      });
    }

    // Email fan-out for HIGH/URGENT (respect email prefs)
    if (
      (notification.priority === "HIGH" ||
        notification.priority === "URGENT") &&
      (await shouldDeliverEmail(notification.recipientId, notification.type))
    ) {
      const to = notification.recipient.email;
      if (to) {
        const subject = `[${notification.priority}] ${notification.title}`;
        const html = `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #eee;border-radius:8px">
            <h2 style="color:#2C0053;margin:0 0 10px">${notification.title}</h2>
            <p style="margin:0 0 16px">${notification.message}</p>
            ${notification.actionUrl ? `<p><a href="${notification.actionUrl}" style="background:#2C0053;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;display:inline-block">${notification.actionText || "Open"}</a></p>` : ""}
            <p style="color:#777;font-size:12px;margin-top:24px">Priority: ${notification.priority}</p>
          </div>`;
        await sendEmail({ to, subject, html });
      }
    }

    return notification;
  }

  static async createNotificationsForUsers(
    userIds: string[],
    config: NotificationConfig,
    senderId?: string
  ) {
    return Promise.all(
      userIds.map((recipientId) =>
        this.createNotification({ ...config, recipientId, senderId })
      )
    );
  }

  static async createNotificationsForRole(
    role: UserRole,
    config: NotificationConfig,
    senderId?: string
  ) {
    const users = await prisma.user.findMany({
      where: { role },
      select: { id: true },
    });
    return this.createNotificationsForUsers(
      users.map((u) => u.id),
      config,
      senderId
    );
  }

  static async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, recipientId: userId },
      data: { isRead: true, readAt: new Date() },
    });
  }
  static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { recipientId: userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }
  static async archiveNotification(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, recipientId: userId },
      data: { isArchived: true, archivedAt: new Date() },
    });
  }
}
