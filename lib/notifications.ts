// lib/notifications.ts
import prisma from "./prisma";
import {
  NotificationType,
  NotificationPriority,
  UserRole,
} from "@prisma/client";

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

export class NotificationService {
  /**
   * Create a single notification
   */
  static async createNotification(params: CreateNotificationParams) {
    try {
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
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          sender: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      });

      console.log(
        `Notification created: ${notification.type} for ${notification.recipient.name}`
      );
      return notification;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  /**
   * Create notifications for multiple recipients
   */
  static async createNotificationsForUsers(
    userIds: string[],
    config: NotificationConfig,
    senderId?: string
  ) {
    const notifications = await Promise.all(
      userIds.map((recipientId) =>
        this.createNotification({
          ...config,
          recipientId,
          senderId,
        })
      )
    );

    return notifications;
  }

  /**
   * Create notifications for users by role
   */
  static async createNotificationsForRole(
    role: UserRole,
    config: NotificationConfig,
    senderId?: string
  ) {
    const users = await prisma.user.findMany({
      where: { role },
      select: { id: true },
    });

    const userIds = users.map((user) => user.id);
    return this.createNotificationsForUsers(userIds, config, senderId);
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: {
        id: notificationId,
        recipientId: userId,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: {
        recipientId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * Archive a notification
   */
  static async archiveNotification(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: {
        id: notificationId,
        recipientId: userId,
      },
      data: {
        isArchived: true,
        archivedAt: new Date(),
      },
    });
  }

  /**
   * Get notifications for a user
   */
  static async getUserNotifications(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      includeArchived?: boolean;
      includeRead?: boolean;
    } = {}
  ) {
    const {
      limit = 50,
      offset = 0,
      includeArchived = false,
      includeRead = true,
    } = options;

    const where: {
      recipientId: string;
      isArchived?: boolean;
      isRead?: boolean;
    } = {
      recipientId: userId,
    };

    if (!includeArchived) {
      where.isArchived = false;
    }

    if (!includeRead) {
      where.isRead = false;
    }

    return prisma.notification.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get unread notification count for a user
   */
  static async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: {
        recipientId: userId,
        isRead: false,
        isArchived: false,
      },
    });
  }

  /**
   * Delete old notifications (cleanup)
   */
  static async deleteOldNotifications(daysOld: number = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return prisma.notification.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
        isArchived: true,
      },
    });
  }
}

// Predefined notification configurations for common events
export const NotificationTemplates = {
  // User Management
  USER_REGISTERED: (userName: string): NotificationConfig => ({
    type: NotificationType.USER_REGISTERED,
    title: "New User Registration",
    message: `${userName} has registered on the platform`,
    priority: NotificationPriority.NORMAL,
  }),

  USER_VERIFIED: (userName: string): NotificationConfig => ({
    type: NotificationType.USER_VERIFIED,
    title: "Account Verified",
    message: `Account for ${userName} has been verified successfully`,
    priority: NotificationPriority.NORMAL,
  }),

  // Requirement Management
  REQUIREMENT_CREATED: (
    requirementId: string,
    companyName: string
  ): NotificationConfig => ({
    type: NotificationType.REQUIREMENT_CREATED,
    title: "New Requirement Created",
    message: `${companyName} has created a new requirement`,
    priority: NotificationPriority.HIGH,
    actionUrl: `/dashboard/admin/requirements/${requirementId}`,
    actionText: "Review Requirement",
  }),

  REQUIREMENT_STATUS_CHANGED: (
    requirementId: string,
    companyName: string,
    newStatus: string
  ): NotificationConfig => ({
    type: NotificationType.REQUIREMENT_STATUS_CHANGED,
    title: "Requirement Status Updated",
    message: `Requirement from ${companyName} status changed to ${newStatus}`,
    priority: NotificationPriority.NORMAL,
    actionUrl: `/dashboard/admin/requirements/${requirementId}`,
    actionText: "View Requirement",
  }),

  REQUIREMENT_FORWARDED_TO_AGENCY: (
    requirementId: string,
    agencyName: string
  ): NotificationConfig => ({
    type: NotificationType.REQUIREMENT_FORWARDED_TO_AGENCY,
    title: "New Requirement Assigned",
    message: `A new requirement has been assigned to ${agencyName}`,
    priority: NotificationPriority.HIGH,
    actionUrl: `/dashboard/agency/requirements/${requirementId}`,
    actionText: "View Requirement",
  }),

  // Labour Profile Management
  LABOUR_PROFILE_CREATED: (
    labourName: string,
    agencyName: string
  ): NotificationConfig => ({
    type: NotificationType.LABOUR_PROFILE_CREATED,
    title: "New Labour Profile Created",
    message: `${agencyName} has created a profile for ${labourName}`,
    priority: NotificationPriority.NORMAL,
  }),

  LABOUR_PROFILE_STATUS_CHANGED: (
    labourName: string,
    newStatus: string
  ): NotificationConfig => ({
    type: NotificationType.LABOUR_PROFILE_STATUS_CHANGED,
    title: "Labour Profile Status Updated",
    message: `Labour profile for ${labourName} status changed to ${newStatus}`,
    priority: NotificationPriority.NORMAL,
  }),

  // Stage Management
  STAGE_COMPLETED: (labourName: string, stage: string): NotificationConfig => ({
    type: NotificationType.STAGE_COMPLETED,
    title: "Stage Completed",
    message: `${stage} stage completed for ${labourName}`,
    priority: NotificationPriority.NORMAL,
  }),

  STAGE_PENDING_ACTION: (
    labourName: string,
    stage: string,
    actionRequired: string
  ): NotificationConfig => ({
    type: NotificationType.STAGE_PENDING_ACTION,
    title: "Action Required",
    message: `${actionRequired} required for ${labourName} at ${stage} stage`,
    priority: NotificationPriority.HIGH,
  }),

  TRAVEL_CONFIRMED: (
    labourName: string,
    travelDate: string
  ): NotificationConfig => ({
    type: NotificationType.TRAVEL_CONFIRMED,
    title: "Travel Confirmed",
    message: `Travel confirmed for ${labourName} on ${travelDate}`,
    priority: NotificationPriority.HIGH,
  }),

  ARRIVAL_CONFIRMED: (labourName: string): NotificationConfig => ({
    type: NotificationType.ARRIVAL_CONFIRMED,
    title: "Labour Arrived",
    message: `${labourName} has successfully arrived and been deployed`,
    priority: NotificationPriority.HIGH,
  }),

  // Document Management
  DOCUMENT_UPLOADED: (
    documentType: string,
    labourName: string
  ): NotificationConfig => ({
    type: NotificationType.DOCUMENT_UPLOADED,
    title: "Document Uploaded",
    message: `${documentType} uploaded for ${labourName}`,
    priority: NotificationPriority.NORMAL,
  }),

  DOCUMENT_VERIFIED: (
    documentType: string,
    labourName: string
  ): NotificationConfig => ({
    type: NotificationType.DOCUMENT_VERIFIED,
    title: "Document Verified",
    message: `${documentType} verified for ${labourName}`,
    priority: NotificationPriority.NORMAL,
  }),

  OFFER_LETTER_SIGNED: (labourName: string): NotificationConfig => ({
    type: NotificationType.OFFER_LETTER_SIGNED,
    title: "Offer Letter Signed",
    message: `Offer letter signed by ${labourName}`,
    priority: NotificationPriority.HIGH,
  }),

  // Assignment Management
  ASSIGNMENT_CREATED: (
    labourName: string,
    jobTitle: string
  ): NotificationConfig => ({
    type: NotificationType.ASSIGNMENT_CREATED,
    title: "New Assignment Created",
    message: `${labourName} assigned to ${jobTitle} position`,
    priority: NotificationPriority.NORMAL,
  }),

  ASSIGNMENT_FEEDBACK_RECEIVED: (
    labourName: string,
    feedbackType: string
  ): NotificationConfig => ({
    type: NotificationType.ASSIGNMENT_FEEDBACK_RECEIVED,
    title: "Feedback Received",
    message: `${feedbackType} feedback received for ${labourName}`,
    priority: NotificationPriority.NORMAL,
  }),

  // System Notifications
  WELCOME_MESSAGE: (userName: string): NotificationConfig => ({
    type: NotificationType.WELCOME_MESSAGE,
    title: "Welcome to the Platform",
    message: `Welcome ${userName}! We're glad to have you on board.`,
    priority: NotificationPriority.LOW,
  }),

  SYSTEM_MAINTENANCE: (maintenanceTime: string): NotificationConfig => ({
    type: NotificationType.SYSTEM_MAINTENANCE,
    title: "System Maintenance",
    message: `Scheduled maintenance on ${maintenanceTime}. Service may be temporarily unavailable.`,
    priority: NotificationPriority.HIGH,
  }),
};
