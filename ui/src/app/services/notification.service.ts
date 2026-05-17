import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { environment } from '../../environments/environment';
import { AppNotification, NotificationType } from '../models/models';

@Injectable({ providedIn: 'root' })
export class NotificationService {

  // ✅ Fix 1 — user-specific storage keys
  private get STORAGE_KEY(): string {
    return `app_notifications_${this.getUserId()}`;
  }
  private get LAST_CHECK_KEY(): string {
    return `notif_last_check_${this.getUserId()}`;
  }

  notifications = signal<AppNotification[]>([]);
  unreadCount   = computed(() => this.notifications().filter(n => !n.isRead).length);

  private pollSub?: Subscription;

  constructor(private http: HttpClient, private router: Router) {
    // Don't load from storage in constructor —
    // wait until startPolling() is called with correct user context
  }

  // ── Start polling when user logs in ─────────────────────────
  startPolling(): void {
    // ✅ Fix 2 — reload storage for THIS user on every login
    this.loadFromStorage();
    this.checkForNewNotifications();
    this.pollSub = interval(60_000).subscribe(() => this.checkForNewNotifications());
  }

  stopPolling(): void {
    this.pollSub?.unsubscribe();
  }

  // ── Main check — calls backend ───────────────────────────────
  checkForNewNotifications(): void {
    this.http.get<any[]>(`${environment.apiUrl}/notifications`).subscribe({
      next: (serverNotifs) => {
        const existingIds = new Set(this.notifications().map(n => n.id));
        const newOnes     = serverNotifs.filter(n => !existingIds.has(n.id));
        if (newOnes.length > 0) {
          this.notifications.update(list => [...newOnes, ...list]);
          this.saveToStorage();
        }
      },
      error: () => {
        // Backend has no /notifications endpoint — fallback to client-side
        this.generateClientNotifications();
      }
    });
  }

  // ── Client-side notification generation (fallback) ───────────
  generateClientNotifications(): void {
    const token = localStorage.getItem('token');
    if (!token) return;

    const now = new Date();

    this.http.get<any[]>(`${environment.apiUrl}/events`).subscribe({
      next: (events) => {
        const newNotifs: AppNotification[] = [];

        events.forEach(ev => {
          const eventDate = new Date(ev.eventDate);
          const diffDays  = Math.ceil((eventDate.getTime() - now.getTime()) / 86_400_000);
          const registered = (ev.activeRegistrations ?? 0) > 0;

          if (diffDays === 2 && registered) {
            const key = `reminder_2days_${ev.id}`;
            if (!this.notifExists(key)) {
              newNotifs.push(this.make('reminder_2days',
                '⏰ 2 Days Left!',
                `"${ev.title}" is happening in 2 days. Don't forget!`,
                ev.id, ev.title, key));
            }
          }
          if (diffDays === 1 && registered) {
            const key = `reminder_1day_${ev.id}`;
            if (!this.notifExists(key)) {
              newNotifs.push(this.make('reminder_1day',
                '⚡ Tomorrow!',
                `"${ev.title}" is happening tomorrow. Get ready!`,
                ev.id, ev.title, key));
            }
          }
          if (diffDays === 0 && registered) {
            const key = `reminder_today_${ev.id}`;
            if (!this.notifExists(key)) {
              newNotifs.push(this.make('reminder_today',
                '🎉 Event Today!',
                `"${ev.title}" is happening today! Best of luck.`,
                ev.id, ev.title, key));
            }
          }
        });

        if (newNotifs.length > 0) {
          this.notifications.update(list => [...newNotifs, ...list]);
          this.saveToStorage();
        }
      },
      error: () => {}
    });
  }

  // ── Push a notification manually ─────────────────────────────
  push(
    type:        NotificationType,
    title:       string,
    message:     string,
    eventId?:    number,
    eventTitle?: string
  ): void {
    const notif: AppNotification = {
      id:        Date.now(),
      type,
      title,
      message,
      createdAt: new Date().toISOString(),
      isRead:    false,
      eventId,
      eventTitle
    };
    this.notifications.update(list => [notif, ...list]);
    this.saveToStorage();
  }

  // ── Mark one as read ─────────────────────────────────────────
  markRead(id: number): void {
    this.notifications.update(list =>
      list.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
    this.saveToStorage();
  }

  // ── Mark all as read ─────────────────────────────────────────
  markAllRead(): void {
    this.notifications.update(list => list.map(n => ({ ...n, isRead: true })));
    this.saveToStorage();
  }

  // ── Delete one ───────────────────────────────────────────────
  remove(id: number): void {
    this.notifications.update(list => list.filter(n => n.id !== id));
    this.saveToStorage();
  }

  // ── Clear all (called on logout) ─────────────────────────────
  clearAll(): void {
    // ✅ Fix 3 — reset signal before next user logs in
    this.notifications.set([]);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // ── Get user ID from JWT for storage namespacing ─────────────
  private getUserId(): string {
    try {
      const raw = localStorage.getItem('token');
      if (!raw) return 'guest';
      const payload = JSON.parse(atob(raw.split('.')[1]));
      // Try common JWT claim names for user identity
      return payload.sub
          || payload.email
          || payload.nameid
          || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
          || 'guest';
    } catch {
      return 'guest';
    }
  }

  // ── Helpers ──────────────────────────────────────────────────
  private make(
    type: NotificationType, title: string, message: string,
    eventId?: number, eventTitle?: string, dedupeKey?: string
  ): AppNotification {
    return {
      id:        dedupeKey ? this.hashKey(dedupeKey) : Date.now() + Math.random(),
      type, title, message,
      createdAt: new Date().toISOString(),
      isRead:    false,
      eventId,
      eventTitle
    };
  }

  private notifExists(dedupeKey: string): boolean {
    return this.notifications().some(n => n.id === this.hashKey(dedupeKey));
  }

  private hashKey(key: string): number {
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      hash = ((hash << 5) - hash) + key.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  private saveToStorage(): void {
    const trimmed = this.notifications().slice(0, 50);
    this.notifications.set(trimmed);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmed));
  }

  // ✅ Fix 4 — always reset signal before loading
  private loadFromStorage(): void {
    try {
      this.notifications.set([]);
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) this.notifications.set(JSON.parse(raw));
    } catch {
      this.notifications.set([]);
    }
  }

  // ── Time-ago formatter ────────────────────────────────────────
  timeAgo(isoString: string): string {
    const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diff < 60)     return 'just now';
    if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  getIcon(type: NotificationType): string {
    const map: Record<NotificationType, string> = {
      event_added:          '📅',
      registration_success: '🎫',
      reminder_2days:       '⏰',
      reminder_1day:        '⚡',
      reminder_today:       '🎉',
      event_cancelled:      '❌',
      general:              '🔔'
    };
    return map[type] ?? '🔔';
  }

  getColor(type: NotificationType): string {
    const map: Record<NotificationType, string> = {
      event_added:          '#00a8a8',
      registration_success: '#10b981',
      reminder_2days:       '#f59e0b',
      reminder_1day:        '#f59e0b',
      reminder_today:       '#6366f1',
      event_cancelled:      '#f43f5e',
      general:              '#8b5cf6'
    };
    return map[type] ?? '#8b5cf6';
  }
}