# Notification System Documentation

## Overview

The notification system provides real-time notifications for all three user roles (Admin, Client, Agency) across the recruitment platform. It tracks all important events and sends appropriate notifications to relevant users.

## Features

- **Real-time notifications** with unread count badges
- **Role-based notifications** - different users get different notifications
- **Priority levels** - Urgent, High, Normal, Low
- **Action buttons** - notifications can include clickable actions
- **Auto-refresh** - notifications update every 30 seconds
- **Mark as read/archive** functionality
- **Comprehensive event tracking** for all platform activities

## Database Schema

### Notification Model

```prisma
model Notification {
  id              String           @id @default(uuid())
  type            NotificationType
  title           String
  message         String
  recipientId     String
  recipient       User             @relation("UserNotifications", fields: [recipientId], references: [id], onDelete: Cascade)
  senderId        String?
  sender          User?            @relation("UserSentNotifications", fields: [senderId], references: [id], onDelete: SetNull)

  // Related entities
  entityType      String?          @db.VarChar(50)
  entityId        String?

  // Notification metadata
  isRead          Boolean          @default(false)
  isArchived      Boolean          @default(false)
  priority        NotificationPriority @default(NORMAL)

  // Action data
  actionUrl       String?
  actionText      String?

  // Timestamps
  createdAt       DateTime         @default(now())
  readAt          DateTime?
  archivedAt      DateTime?
}
```

### Notification Types

The system supports 40+ different notification types covering:

- **User Management**: Registration, verification, suspension
- **Requirement Management**: Creation, status changes, forwarding
- **Labour Profile Management**: Creation, status changes, verification
- **Document Management**: Uploads, verification, signing
- **Stage Management**: Completion, failures, pending actions
- **Assignment Management**: Creation, feedback, status changes
- **System Notifications**: Maintenance, updates, security alerts

## Components

### 1. NotificationBell Component

Located at `components/ui/NotificationBell.tsx`

**Features:**

- Shows unread count badge
- Dropdown with recent notifications
- Mark as read/archive functionality
- Priority indicators
- Action buttons for navigation

**Usage:**

```tsx
import NotificationBell from "@/components/ui/NotificationBell";

<NotificationBell className="custom-class" />;
```

### 2. Notification Service

Located at `lib/notifications.ts`

**Core Methods:**

- `createNotification()` - Create single notification
- `createNotificationsForUsers()` - Create for multiple users
- `createNotificationsForRole()` - Create for all users of a role
- `markAsRead()` - Mark notification as read
- `markAllAsRead()` - Mark all notifications as read
- `archiveNotification()` - Archive a notification
- `getUserNotifications()` - Get user's notifications
- `getUnreadCount()` - Get unread count

### 3. Notification Helpers

Located at `lib/notification-helpers.ts`

**Pre-built functions for common events:**

- `notifyUserRegistration()` - New user registration
- `notifyRequirementCreated()` - New requirement
- `notifyLabourProfileCreated()` - New labour profile
- `notifyStageCompleted()` - Stage completion
- `notifyTravelConfirmed()` - Travel confirmation
- `notifyArrivalConfirmed()` - Arrival confirmation
- `notifyDocumentUploaded()` - Document upload
- `notifyOfferLetterSigned()` - Offer letter signing

## API Endpoints

### GET /api/notifications

Get user's notifications with pagination and filters.

**Query Parameters:**

- `limit` - Number of notifications (default: 50)
- `offset` - Pagination offset (default: 0)
- `includeArchived` - Include archived notifications (default: false)
- `includeRead` - Include read notifications (default: true)

**Response:**

```json
{
  "notifications": [
    {
      "id": "uuid",
      "type": "REQUIREMENT_CREATED",
      "title": "New Requirement Created",
      "message": "Company ABC has created a new requirement",
      "isRead": false,
      "priority": "HIGH",
      "createdAt": "2024-01-01T00:00:00Z",
      "actionUrl": "/dashboard/admin/requirements/123",
      "actionText": "Review Requirement",
      "sender": {
        "name": "John Doe",
        "role": "CLIENT_ADMIN"
      }
    }
  ]
}
```

### GET /api/notifications/count

Get unread notification count for current user.

**Response:**

```json
{
  "count": 5
}
```

### PATCH /api/notifications

Update notification status.

**Request Body:**

```json
{
  "action": "markAsRead|markAllAsRead|archive",
  "notificationId": "uuid" // Required for markAsRead and archive
}
```

## Integration Examples

### 1. Adding Notifications to API Routes

```typescript
import { notifyArrivalConfirmed } from "@/lib/notification-helpers";

// In your API route
export async function POST(request: NextRequest) {
  // ... existing logic ...

  // Send notifications
  try {
    await notifyArrivalConfirmed(labourName, agencyId, clientId);
  } catch (notificationError) {
    console.error("Notification sending failed:", notificationError);
    // Continue even if notification fails
  }

  return NextResponse.json({ success: true });
}
```

### 2. Custom Notifications

```typescript
import {
  NotificationService,
  NotificationTemplates,
} from "@/lib/notifications";

// Create custom notification
await NotificationService.createNotification({
  type: NotificationType.CUSTOM_EVENT,
  title: "Custom Title",
  message: "Custom message",
  recipientId: userId,
  priority: NotificationPriority.HIGH,
  actionUrl: "/dashboard/some-page",
  actionText: "View Details",
});

// Or use templates
const config = NotificationTemplates.REQUIREMENT_CREATED(
  requirementId,
  companyName
);
await NotificationService.createNotification({
  ...config,
  recipientId: userId,
});
```

### 3. Role-based Notifications

```typescript
import {
  notifyAdmins,
  notifyClients,
  notifyAgencies,
} from "@/lib/notification-helpers";

// Notify all admins
await notifyAdmins({
  type: NotificationType.SYSTEM_MAINTENANCE,
  title: "System Maintenance",
  message: "Scheduled maintenance on Sunday",
  priority: NotificationPriority.HIGH,
});

// Notify specific role
await NotificationService.createNotificationsForRole(
  UserRole.RECRUITMENT_ADMIN,
  notificationConfig
);
```

## Notification Types by Role

### Admin Notifications

- New user registrations
- New requirements created
- Labour profile status changes
- Document verification requests
- System maintenance alerts
- Security alerts

### Client Notifications

- Requirement status updates
- Labour profile updates for their requirements
- Document uploads for their labour
- Travel confirmations
- Arrival confirmations
- Assignment status changes

### Agency Notifications

- New requirement assignments
- Labour profile status changes
- Document verification results
- Stage completion notifications
- Travel confirmations
- Client feedback

## Priority Levels

### URGENT (Red)

- System maintenance
- Security alerts
- Critical stage failures

### HIGH (Orange)

- New requirement assignments
- Travel confirmations
- Arrival confirmations
- Document verification requests

### NORMAL (Blue)

- Status updates
- Stage completions
- Document uploads
- General updates

### LOW (Gray)

- Welcome messages
- Informational updates

## Best Practices

### 1. Error Handling

Always wrap notification calls in try-catch blocks:

```typescript
try {
  await notifySomeEvent(data);
} catch (error) {
  console.error("Notification failed:", error);
  // Continue execution - don't let notification failures break the main flow
}
```

### 2. Performance

- Use bulk notifications for multiple recipients
- Don't send notifications for every minor event
- Use appropriate priority levels

### 3. User Experience

- Provide meaningful action URLs
- Use clear, concise messages
- Include relevant context in notifications

### 4. Testing

- Test notifications for all user roles
- Verify action URLs work correctly
- Check notification timing and frequency

## Future Enhancements

### Planned Features

- **Email notifications** - Send notifications via email
- **Push notifications** - Browser push notifications
- **Notification preferences** - User-configurable notification settings
- **Notification templates** - Customizable notification templates
- **Bulk operations** - Mark multiple notifications as read/archive
- **Notification history** - Full notification history page
- **Real-time updates** - WebSocket integration for instant updates

### Integration Points

- **Email service** - Integrate with email service for email notifications
- **WebSocket service** - Real-time notification delivery
- **Analytics** - Track notification engagement
- **Mobile app** - Push notifications for mobile users

## Troubleshooting

### Common Issues

1. **Notifications not appearing**

   - Check if user is authenticated
   - Verify notification is being created in database
   - Check browser console for errors

2. **Unread count not updating**

   - Verify API endpoints are working
   - Check if notification is marked as read
   - Clear browser cache

3. **Performance issues**
   - Limit number of notifications fetched
   - Use pagination for large notification lists
   - Optimize database queries

### Debug Mode

Enable debug logging by setting environment variable:

```
NOTIFICATION_DEBUG=true
```

This will log all notification operations to the console.

## Support

For issues or questions about the notification system:

1. Check this documentation
2. Review the code examples
3. Check the database for notification records
4. Contact the development team
