/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { NotificationService, NotificationConfig } from "@/lib/notifications";
import { sendEmail } from "@/lib/utils/email-service";
import {
  NotificationPriority,
  NotificationType,
  UserRole,
} from "@prisma/client";

type Category = "requirement" | "labour" | "document" | "system";

const QUIET_HOURS_START = 22; // 22:00 local
const QUIET_HOURS_END = 7; // 07:00 local
const DEDUPE_MINUTES = 10;

function typeToCategory(t: NotificationType): Category {
  switch (t) {
    // Requirements
    case "REQUIREMENT_CREATED":
    case "REQUIREMENT_UPDATED":
    case "REQUIREMENT_STATUS_CHANGED":
    case "REQUIREMENT_FORWARDED_TO_AGENCY":
    case "REQUIREMENT_ACCEPTED":
    case "REQUIREMENT_REJECTED":
    case "REQUIREMENT_NEEDS_REVISION":
      // case "AGENCY_REJECTED":
      return "requirement";

    // Labour / stages / assignments
    case "LABOUR_PROFILE_CREATED":
    case "LABOUR_PROFILE_STATUS_CHANGED":
    case "LABOUR_PROFILE_VERIFIED":
    case "LABOUR_PROFILE_DOCUMENT_UPLOADED":
    case "LABOUR_PROFILE_STAGE_UPDATED":
    case "ASSIGNMENT_CREATED":
    case "ASSIGNMENT_STATUS_CHANGED":
    case "ASSIGNMENT_FEEDBACK_RECEIVED":
    case "STAGE_COMPLETED":
    case "STAGE_FAILED":
    case "STAGE_PENDING_ACTION":
    case "TRAVEL_CONFIRMED":
    case "ARRIVAL_CONFIRMED":
    case "LABOUR_DEPLOYED":
      return "labour";

    // Docs
    case "DOCUMENT_UPLOADED":
    case "DOCUMENT_VERIFIED":
    case "DOCUMENT_REJECTED":
    case "OFFER_LETTER_GENERATED":
    case "OFFER_LETTER_SIGNED":
    case "VISA_UPLOADED":
    case "TRAVEL_DOCUMENTS_UPLOADED":
      return "document";

    // System / auth
    case "USER_REGISTERED":
    case "USER_VERIFIED":
    case "USER_SUSPENDED":
    case "USER_DELETED":
    case "PASSWORD_CHANGED":
    case "ACCOUNT_RECOVERY":
    case "SYSTEM_MAINTENANCE":
    case "SYSTEM_UPDATE":
    case "SECURITY_ALERT":
    case "WELCOME_MESSAGE":
    default:
      return "system";
  }
}

function categoryEnabledFlagKey(category: Category): keyof {
  notifyRequirement: boolean;
  notifyLabour: boolean;
  notifyDocument: boolean;
  notifySystem: boolean;
} {
  switch (category) {
    case "requirement":
      return "notifyRequirement";
    case "labour":
      return "notifyLabour";
    case "document":
      return "notifyDocument";
    case "system":
      return "notifySystem";
  }
}

function isQuietHours(timezone: string | null | undefined): boolean {
  try {
    const tz = timezone || "UTC";
    const hourStr = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone: tz,
    }).format(new Date());
    const hour = Number(hourStr);
    return hour >= QUIET_HOURS_START || hour < QUIET_HOURS_END;
  } catch {
    // fallback if TZ fails
    const h = new Date().getUTCHours();
    return h >= QUIET_HOURS_START || h < QUIET_HOURS_END;
  }
}

async function shouldEmail(
  recipientId: string,
  priority: NotificationPriority,
  type: NotificationType
): Promise<boolean> {
  const settings = await prisma.userSettings.findUnique({
    where: { userId: recipientId },
  });

  // Defaults mirror your Prisma defaults if missing
  const notifyEmail = settings?.notifyEmail ?? true;
  if (!notifyEmail) return false;

  const category = typeToCategory(type);
  const flag = categoryEnabledFlagKey(category);
  const enabled = (settings?.[flag] as boolean | undefined) ?? true;
  if (!enabled) return false;

  const isHigh = priority === "HIGH" || priority === "URGENT";
  if (!isHigh) return false;

  // Quiet hours gate (defer unless URGENT)
  const quiet = isQuietHours(settings?.timezone);
  if (quiet && priority !== "URGENT") return false;

  return true;
}

async function dedupeExists(
  recipientId: string,
  type: NotificationType,
  entityId?: string | null,
  message?: string
): Promise<boolean> {
  const minDate = new Date(Date.now() - DEDUPE_MINUTES * 60 * 1000);
  const found = await prisma.notification.findFirst({
    where: {
      recipientId,
      type,
      ...(entityId ? { entityId } : {}),
      ...(message ? { message } : {}),
      createdAt: { gte: minDate },
      isArchived: false,
    },
    select: { id: true },
  });
  return !!found;
}

async function inAppAllowed(recipientId: string, type: NotificationType) {
  const settings = await prisma.userSettings.findUnique({
    where: { userId: recipientId },
  });
  const category = typeToCategory(type);
  const flag = categoryEnabledFlagKey(category);
  const enabled = (settings?.[flag] as boolean | undefined) ?? true;
  return enabled;
}

export const NotificationDelivery = {
  /**
   * Core deliver: applies preference gate, dedupe, creates in-app, conditionally emails.
   */
  async deliverToUser(
    recipientId: string,
    config: NotificationConfig,
    senderId?: string,
    entityType?: string,
    entityId?: string
  ) {
    // Dedupe (recent)
    if (
      await dedupeExists(recipientId, config.type, entityId, config.message)
    ) {
      return null;
    }

    // In-app gate
    if (await inAppAllowed(recipientId, config.type)) {
      await NotificationService.createNotification({
        ...config,
        recipientId,
        senderId,
        entityType,
        entityId,
      });
    }

    // Email gate
    if (await shouldEmail(recipientId, config.priority, config.type)) {
      const user = await prisma.user.findUnique({
        where: { id: recipientId },
        select: { email: true },
      });
      if (user?.email) {
        const subject = config.title;
        const text = config.actionUrl
          ? `${config.message}\n\nOpen: ${config.actionUrl}`
          : config.message;
        await sendEmail({ to: user.email, subject, text });
      }
    }

    return true;
  },

  async deliverToUsers(
    recipientIds: string[],
    config: NotificationConfig,
    senderId?: string,
    entityType?: string,
    entityId?: string
  ) {
    await Promise.all(
      recipientIds.map((id) =>
        NotificationDelivery.deliverToUser(
          id,
          config,
          senderId,
          entityType,
          entityId
        )
      )
    );
  },

  async deliverToRole(
    role: UserRole,
    config: NotificationConfig,
    senderId?: string,
    entityType?: string,
    entityId?: string
  ) {
    const users = await prisma.user.findMany({
      where: { role },
      select: { id: true },
    });
    const ids = users.map((u) => u.id);
    await NotificationDelivery.deliverToUsers(
      ids,
      config,
      senderId,
      entityType,
      entityId
    );
  },
};
