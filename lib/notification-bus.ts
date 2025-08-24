// lib/notification-bus.ts
type Listener = (payload: any) => void;

class UserChannel {
  private listeners = new Set<Listener>();
  add(l: Listener) {
    this.listeners.add(l);
  }
  remove(l: Listener) {
    this.listeners.delete(l);
  }
  emit(payload: any) {
    for (const l of this.listeners) l(payload);
  }
  size() {
    return this.listeners.size;
  }
}

class NotificationBus {
  private channels = new Map<string, UserChannel>(); // key = userId

  subscribe(userId: string, listener: Listener) {
    const channel = this.channels.get(userId) ?? new UserChannel();
    channel.add(listener);
    this.channels.set(userId, channel);
    return () => {
      channel.remove(listener);
      if (channel.size() === 0) this.channels.delete(userId);
    };
  }

  publish(userId: string, payload: any) {
    const channel = this.channels.get(userId);
    if (channel) channel.emit(payload);
  }
}

// ensure singleton across route-handlers in dev
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const g: any = globalThis as any;
export const notificationBus: NotificationBus =
  g.__notifBus || new NotificationBus();
if (!g.__notifBus) g.__notifBus = notificationBus;
