# Offline Notification System

## Overview

The offline notification system provides seamless notification functionality even when users are offline. It includes service worker caching, offline action queuing, and automatic synchronization when connectivity is restored.

## Features

### 1. Service Worker (PWA)

- **Location**: `public/sw.js`
- **Functionality**:
  - Caches essential resources for offline access
  - Handles notification API requests with offline fallback
  - Queues offline actions for later synchronization
  - Processes background sync when connection is restored
  - Supports push notifications

### 2. Offline Notification Service

- **Location**: `lib/offline-notifications.ts`
- **Functionality**:
  - Manages online/offline state detection
  - Queues notification actions when offline
  - Syncs offline data when back online
  - Stores notifications in localStorage
  - Handles browser notification permissions

### 3. Enhanced WebSocket Context

- **Location**: `context/WebSocketContext.tsx`
- **Enhancements**:
  - Integrates with offline service
  - Falls back to offline mode when disconnected
  - Provides online/offline status
  - Handles notification actions in both modes

### 4. UI Components

- **NotificationBell**: Shows online/offline status with WiFi icon
- **OfflineStatusIndicator**: Banner showing connection status
- **OfflineHandler**: Initializes offline functionality

## How It Works

### Online Mode

1. Real-time notifications via WebSocket
2. Immediate action processing
3. Live notification count updates

### Offline Mode

1. Actions are queued in service worker
2. Notifications stored in localStorage
3. UI shows offline status indicators
4. Graceful degradation of functionality

### Reconnection

1. Automatic detection of online status
2. Processing of queued actions
3. Syncing of offline notifications
4. UI updates to show online status

## API Endpoints

### `/api/notifications/sync-offline`

- **Method**: POST
- **Purpose**: Sync offline notifications when back online
- **Request Body**: `{ notifications: Notification[] }`
- **Response**: `{ success: boolean, syncedCount: number }`

## Usage

### For Developers

```typescript
import offlineNotificationService from "@/lib/offline-notifications";

// Check online status
const isOnline = offlineNotificationService.isOnlineMode();

// Add offline notification
offlineNotificationService.addOfflineNotification(notification);

// Request notification permission
await offlineNotificationService.requestNotificationPermission();
```

### For Users

1. **Install as PWA**: Users can install the app for better offline experience
2. **Offline Indicators**: Clear visual indicators when offline
3. **Automatic Sync**: Actions sync automatically when back online
4. **Browser Notifications**: Desktop notifications for important events

## Configuration

### Service Worker

- Caches essential routes and API endpoints
- Handles notification API requests
- Queues offline actions

### PWA Manifest

- App metadata and icons
- Installation prompts
- Theme colors and display settings

## Browser Support

- **Service Workers**: Chrome 40+, Firefox 44+, Safari 11.1+
- **PWA Features**: Chrome 67+, Firefox 67+, Safari 11.3+
- **Notifications**: Chrome 42+, Firefox 22+, Safari 16+

## Testing

### Offline Testing

1. Open browser dev tools
2. Go to Network tab
3. Check "Offline" checkbox
4. Test notification functionality

### Service Worker Testing

1. Go to Application tab in dev tools
2. Check Service Workers section
3. View cached resources
4. Test background sync

## Troubleshooting

### Common Issues

1. **Service Worker not registering**: Check HTTPS requirement
2. **Notifications not working**: Verify permission status
3. **Sync not happening**: Check network connectivity
4. **Cache not updating**: Clear browser cache

### Debug Commands

```javascript
// Check service worker status
navigator.serviceWorker.getRegistrations();

// Check offline notifications
localStorage.getItem("offlineNotifications");

// Force sync
offlineNotificationService.syncOfflineActions();
```

## Future Enhancements

1. **Background Sync API**: For more reliable offline sync
2. **Push Notifications**: Server-sent notifications
3. **Advanced Caching**: Intelligent cache strategies
4. **Offline Analytics**: Track offline usage patterns
