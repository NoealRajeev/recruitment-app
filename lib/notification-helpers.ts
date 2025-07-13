import {
  NotificationService,
  NotificationTemplates,
  NotificationConfig,
} from "./notifications";
import { UserRole } from "@prisma/client";

/**
 * Notification helpers for different application events
 * These functions handle creating notifications for specific events
 * and ensure they go to the right users based on their roles
 */

// User Management Notifications
export async function notifyUserRegistration(userId: string, userName: string) {
  // Notify admins about new user registration
  await NotificationService.createNotificationsForRole(
    UserRole.RECRUITMENT_ADMIN,
    NotificationTemplates.USER_REGISTERED(userName),
    userId
  );
}

export async function notifyUserVerification(userId: string, userName: string) {
  // Notify the user that their account was verified
  await NotificationService.createNotification({
    ...NotificationTemplates.USER_VERIFIED(userName),
    recipientId: userId,
  });
}

// Requirement Management Notifications
export async function notifyRequirementCreated(
  requirementId: string,
  companyName: string,
  clientId: string
) {
  // Notify admins about new requirement
  await NotificationService.createNotificationsForRole(
    UserRole.RECRUITMENT_ADMIN,
    NotificationTemplates.REQUIREMENT_CREATED(requirementId, companyName),
    clientId
  );
}

export async function notifyRequirementStatusChanged(
  requirementId: string,
  companyName: string,
  newStatus: string,
  clientId: string
) {
  // Notify client about status change
  await NotificationService.createNotification({
    ...NotificationTemplates.REQUIREMENT_STATUS_CHANGED(
      requirementId,
      companyName,
      newStatus
    ),
    recipientId: clientId,
  });
}

export async function notifyRequirementForwardedToAgency(
  requirementId: string,
  agencyName: string,
  agencyId: string
) {
  // Notify agency about new requirement assignment
  await NotificationService.createNotification({
    ...NotificationTemplates.REQUIREMENT_FORWARDED_TO_AGENCY(
      requirementId,
      agencyName
    ),
    recipientId: agencyId,
  });
}

// Labour Profile Notifications
export async function notifyLabourProfileCreated(
  labourName: string,
  agencyName: string,
  agencyId: string
) {
  // Notify admins about new labour profile
  await NotificationService.createNotificationsForRole(
    UserRole.RECRUITMENT_ADMIN,
    NotificationTemplates.LABOUR_PROFILE_CREATED(labourName, agencyName),
    agencyId
  );
}

export async function notifyLabourProfileStatusChanged(
  labourName: string,
  newStatus: string,
  agencyId: string
) {
  // Notify agency about labour status change
  await NotificationService.createNotification({
    ...NotificationTemplates.LABOUR_PROFILE_STATUS_CHANGED(
      labourName,
      newStatus
    ),
    recipientId: agencyId,
  });
}

// Stage Management Notifications
export async function notifyStageCompleted(
  labourName: string,
  stage: string,
  agencyId: string,
  clientId?: string
) {
  const config = NotificationTemplates.STAGE_COMPLETED(labourName, stage);

  // Notify agency
  await NotificationService.createNotification({
    ...config,
    recipientId: agencyId,
  });

  // Notify client if provided
  if (clientId) {
    await NotificationService.createNotification({
      ...config,
      recipientId: clientId,
    });
  }
}

export async function notifyStagePendingAction(
  labourName: string,
  stage: string,
  actionRequired: string,
  recipientId: string
) {
  await NotificationService.createNotification({
    ...NotificationTemplates.STAGE_PENDING_ACTION(
      labourName,
      stage,
      actionRequired
    ),
    recipientId,
  });
}

export async function notifyTravelConfirmed(
  labourName: string,
  travelDate: string,
  agencyId: string,
  clientId: string
) {
  const config = NotificationTemplates.TRAVEL_CONFIRMED(labourName, travelDate);

  // Notify agency
  await NotificationService.createNotification({
    ...config,
    recipientId: agencyId,
  });

  // Notify client
  await NotificationService.createNotification({
    ...config,
    recipientId: clientId,
  });
}

export async function notifyArrivalConfirmed(
  labourName: string,
  agencyId: string,
  clientId: string
) {
  const config = NotificationTemplates.ARRIVAL_CONFIRMED(labourName);

  // Notify agency
  await NotificationService.createNotification({
    ...config,
    recipientId: agencyId,
  });

  // Notify client
  await NotificationService.createNotification({
    ...config,
    recipientId: clientId,
  });
}

// Document Management Notifications
export async function notifyDocumentUploaded(
  documentType: string,
  labourName: string,
  agencyId: string,
  adminId?: string
) {
  const config = NotificationTemplates.DOCUMENT_UPLOADED(
    documentType,
    labourName
  );

  // Notify agency
  await NotificationService.createNotification({
    ...config,
    recipientId: agencyId,
  });

  // Notify admins if provided
  if (adminId) {
    await NotificationService.createNotification({
      ...config,
      recipientId: adminId,
    });
  }
}

export async function notifyDocumentVerified(
  documentType: string,
  labourName: string,
  agencyId: string
) {
  await NotificationService.createNotification({
    ...NotificationTemplates.DOCUMENT_VERIFIED(documentType, labourName),
    recipientId: agencyId,
  });
}

export async function notifyOfferLetterSigned(
  labourName: string,
  agencyId: string,
  clientId: string
) {
  const config = NotificationTemplates.OFFER_LETTER_SIGNED(labourName);

  // Notify agency
  await NotificationService.createNotification({
    ...config,
    recipientId: agencyId,
  });

  // Notify client
  await NotificationService.createNotification({
    ...config,
    recipientId: clientId,
  });
}

// Assignment Management Notifications
export async function notifyAssignmentCreated(
  labourName: string,
  jobTitle: string,
  agencyId: string,
  clientId: string
) {
  const config = NotificationTemplates.ASSIGNMENT_CREATED(labourName, jobTitle);

  // Notify agency
  await NotificationService.createNotification({
    ...config,
    recipientId: agencyId,
  });

  // Notify client
  await NotificationService.createNotification({
    ...config,
    recipientId: clientId,
  });
}

export async function notifyAssignmentFeedbackReceived(
  labourName: string,
  feedbackType: string,
  recipientId: string
) {
  await NotificationService.createNotification({
    ...NotificationTemplates.ASSIGNMENT_FEEDBACK_RECEIVED(
      labourName,
      feedbackType
    ),
    recipientId,
  });
}

// System Notifications
export async function notifyWelcomeMessage(userId: string, userName: string) {
  await NotificationService.createNotification({
    ...NotificationTemplates.WELCOME_MESSAGE(userName),
    recipientId: userId,
  });
}

export async function notifySystemMaintenance(maintenanceTime: string) {
  // Notify all users about system maintenance
  await NotificationService.createNotificationsForRole(
    UserRole.RECRUITMENT_ADMIN,
    NotificationTemplates.SYSTEM_MAINTENANCE(maintenanceTime)
  );

  await NotificationService.createNotificationsForRole(
    UserRole.CLIENT_ADMIN,
    NotificationTemplates.SYSTEM_MAINTENANCE(maintenanceTime)
  );

  await NotificationService.createNotificationsForRole(
    UserRole.RECRUITMENT_AGENCY,
    NotificationTemplates.SYSTEM_MAINTENANCE(maintenanceTime)
  );
}

// Role-specific notification helpers
export async function notifyAdmins(
  config: NotificationConfig,
  senderId?: string
) {
  await NotificationService.createNotificationsForRole(
    UserRole.RECRUITMENT_ADMIN,
    config,
    senderId
  );
}

export async function notifyClients(
  config: NotificationConfig,
  senderId?: string
) {
  await NotificationService.createNotificationsForRole(
    UserRole.CLIENT_ADMIN,
    config,
    senderId
  );
}

export async function notifyAgencies(
  config: NotificationConfig,
  senderId?: string
) {
  await NotificationService.createNotificationsForRole(
    UserRole.RECRUITMENT_AGENCY,
    config,
    senderId
  );
}
