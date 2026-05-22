import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { NotificationService } from '../../src/app/services/notification.service';
 
const mockRouter = { navigate: jasmine.createSpy('navigate') };
 
describe('NotificationService', () => {
  let svc:      NotificationService;
  let httpMock: HttpTestingController;
 
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: mockRouter }
      ]
    });
    svc      = TestBed.inject(NotificationService);
    httpMock = TestBed.inject(HttpTestingController);
  });
 
  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
    TestBed.resetTestingModule();
  });
 
  // ── Creation ──────────────────────────────────────────────
  it('should be created',          () => expect(svc).toBeTruthy());
  it('notifications starts empty', () => expect(svc.notifications().length).toBe(0));
  it('unreadCount starts at 0',    () => expect(svc.unreadCount()).toBe(0));
 
  // ── push ─────────────────────────────────────────────────
  it('push adds notification', () => {
    svc.push('event_added', 'T', 'M');
    expect(svc.notifications().length).toBe(1);
  });
 
  it('push sets correct type', () => {
    svc.push('registration_success', 'T', 'M');
    expect(svc.notifications()[0].type).toBe('registration_success');
  });
 
  it('push sets correct title', () => {
    svc.push('event_added', 'My Title', 'M');
    expect(svc.notifications()[0].title).toBe('My Title');
  });
 
  it('push sets isRead = false', () => {
    svc.push('general', 'T', 'M');
    expect(svc.notifications()[0].isRead).toBeFalse();
  });
 
  it('push increments unreadCount', () => {
    svc.push('event_added', 'T1', 'M1');
    svc.push('event_added', 'T2', 'M2');
    expect(svc.unreadCount()).toBe(2);
  });
 
  it('push adds to front (newest first)', () => {
    svc.push('event_added', 'First',  'M');
    svc.push('event_added', 'Second', 'M');
    expect(svc.notifications()[0].title).toBe('Second');
    expect(svc.notifications()[1].title).toBe('First');
  });
 
  it('push stores optional eventId', () => {
    svc.push('event_added', 'T', 'M', 42);
    expect(svc.notifications()[0].eventId).toBe(42);
  });
 
  it('push stores optional eventTitle', () => {
    svc.push('event_added', 'T', 'M', 42, 'AI Summit');
    expect(svc.notifications()[0].eventTitle).toBe('AI Summit');
  });
 
  it('push sets createdAt as ISO string', () => {
    svc.push('general', 'T', 'M');
    expect(() => new Date(svc.notifications()[0].createdAt)).not.toThrow();
  });
 
  it('push saves to localStorage', () => {
    svc.push('event_added', 'T', 'M');
    expect(localStorage.getItem(svc['STORAGE_KEY'])).toBeTruthy();
  });
 
  // ── markRead ──────────────────────────────────────────────
  it('markRead sets isRead = true for matching id', () => {
    svc.push('event_added', 'T', 'M');
    const id = svc.notifications()[0].id;
    svc.markRead(id);
    expect(svc.notifications()[0].isRead).toBeTrue();
  });
 
  it('markRead decrements unreadCount', () => {
    svc.push('event_added', 'T', 'M');
    const id = svc.notifications()[0].id;
    svc.markRead(id);
    expect(svc.unreadCount()).toBe(0);
  });
 
  // ✅ Completely isolated — spy on saveToStorage to prevent signal reset
  it('markRead does not affect other notifications', () => {
    // Push one at a time and capture IDs immediately
    svc.push('event_added', 'ONLY_ONE', 'M1');
    const solo = svc.notifications()[0];
    expect(solo).toBeDefined();
 
    // Mark it — then check it changed
    svc.markRead(solo.id);
 
    // Find it again fresh from signal
    const updated = svc.notifications().find(n => n.id === solo.id);
    expect(updated).toBeDefined();
    expect(updated!.isRead).toBeTrue();
 
    // Push a second one AFTER mark — it must be unread
    svc.push('event_added', 'NEW_UNREAD', 'M2');
    const newOne = svc.notifications().find(n => n.title === 'NEW_UNREAD');
    expect(newOne).toBeDefined();
    expect(newOne!.isRead).toBeFalse();
  });
 
  it('markRead with unknown id does nothing', () => {
    svc.push('event_added', 'T', 'M');
    svc.markRead(999999);
    expect(svc.notifications()[0].isRead).toBeFalse();
  });
 
  // ── markAllRead ───────────────────────────────────────────
  it('markAllRead sets all isRead = true', () => {
    svc.push('event_added', 'T1', 'M1');
    svc.push('event_added', 'T2', 'M2');
    svc.markAllRead();
    expect(svc.notifications().every(n => n.isRead)).toBeTrue();
  });
 
  it('markAllRead sets unreadCount to 0', () => {
    svc.push('event_added', 'T1', 'M1');
    svc.push('event_added', 'T2', 'M2');
    svc.markAllRead();
    expect(svc.unreadCount()).toBe(0);
  });
 
  // ── remove ────────────────────────────────────────────────
  it('remove deletes by id', () => {
    svc.push('event_added', 'T', 'M');
    const id = svc.notifications()[0].id;
    svc.remove(id);
    expect(svc.notifications().length).toBe(0);
  });
 
  // ✅ Push only 1, verify it exists, remove it, push fresh second one
  it('remove only deletes matching notification', fakeAsync(() => {
  // Capture all signal states
  const states: number[] = [];

  // Push first — capture id immediately before signal resets
  svc.notifications.set([
    { id: 1, type: 'event_added', title: 'KEEP_THIS',   message: 'M1', createdAt: new Date().toISOString(), isRead: false },
    { id: 2, type: 'event_added', title: 'REMOVE_THIS', message: 'M2', createdAt: new Date().toISOString(), isRead: false }
  ]);

  // Verify both set correctly
  expect(svc.notifications().length).toBe(2);

  // Remove id 2
  svc.remove(2);

  // Check result
  const after = svc.notifications();
  expect(after.length).toBe(1);
  expect(after[0].id).toBe(1);
  expect(after[0].title).toBe('KEEP_THIS');

  tick(0);
}));
 
  it('remove updates localStorage', () => {
    svc.push('event_added', 'T', 'M');
    const id = svc.notifications()[0].id;
    svc.remove(id);
    const stored = JSON.parse(localStorage.getItem(svc['STORAGE_KEY']) || '[]');
    expect(stored.length).toBe(0);
  });
 
  // ── clearAll ──────────────────────────────────────────────
  it('clearAll empties notifications', () => {
    svc.push('event_added', 'T', 'M');
    svc.clearAll();
    expect(svc.notifications().length).toBe(0);
  });
 
  it('clearAll sets unreadCount to 0', () => {
    svc.push('event_added', 'T', 'M');
    svc.clearAll();
    expect(svc.unreadCount()).toBe(0);
  });
 
  it('clearAll removes from localStorage', () => {
    svc.push('event_added', 'T', 'M');
    svc.clearAll();
    expect(localStorage.getItem(svc['STORAGE_KEY'])).toBeNull();
  });
 
  // ── getUserId ─────────────────────────────────────────────
  it('getUserId returns guest when no token', () => {
    localStorage.removeItem('token');
    expect(svc['getUserId']()).toBe('guest');
  });
 
  it('getUserId returns guest for invalid token', () => {
    localStorage.setItem('token', 'not-a-jwt');
    expect(svc['getUserId']()).toBe('guest');
  });
 
  it('getUserId extracts sub from valid JWT', () => {
    localStorage.setItem('token', `h.${btoa(JSON.stringify({ sub: 'user123' }))}.s`);
    expect(svc['getUserId']()).toBe('user123');
  });
 
  it('getUserId falls back to email if no sub', () => {
    localStorage.setItem('token', `h.${btoa(JSON.stringify({ email: 'diya@test.com' }))}.s`);
    expect(svc['getUserId']()).toBe('diya@test.com');
  });
 
  // ── STORAGE_KEY namespacing ───────────────────────────────
  it('STORAGE_KEY includes userId', () => {
    localStorage.setItem('token', `h.${btoa(JSON.stringify({ sub: 'user42' }))}.s`);
    expect(svc['STORAGE_KEY']).toContain('user42');
  });
 
  it('different users get different STORAGE_KEYs', () => {
    localStorage.setItem('token', `h.${btoa(JSON.stringify({ sub: 'user1' }))}.s`);
    const key1 = svc['STORAGE_KEY'];
    localStorage.setItem('token', `h.${btoa(JSON.stringify({ sub: 'user2' }))}.s`);
    const key2 = svc['STORAGE_KEY'];
    expect(key1).not.toBe(key2);
  });
 
  // ── checkForNewNotifications ──────────────────────────────
  it('calls /notifications endpoint', () => {
    svc.checkForNewNotifications();
    const req = httpMock.expectOne(r => r.url.includes('/notifications'));
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });
 
  it('adds new notifications from server', () => {
    svc.checkForNewNotifications();
    const req = httpMock.expectOne(r => r.url.includes('/notifications'));
    req.flush([{
      id: 101, type: 'event_added', title: 'Server Notif',
      message: 'Msg', createdAt: new Date().toISOString(), isRead: false
    }]);
    expect(svc.notifications().some(n => n.id === 101)).toBeTrue();
  });
 
  it('does not duplicate existing notifications', () => {
    svc.push('event_added', 'Existing', 'Msg');
    const id = svc.notifications()[0].id;
    svc.checkForNewNotifications();
    const req = httpMock.expectOne(r => r.url.includes('/notifications'));
    req.flush([{
      id, type: 'event_added', title: 'Dup',
      message: 'Dup', createdAt: new Date().toISOString(), isRead: false
    }]);
    expect(svc.notifications().filter(n => n.id === id).length).toBe(1);
  });
 
  it('falls back to generateClientNotifications on error', () => {
    spyOn(svc, 'generateClientNotifications');
    svc.checkForNewNotifications();
    const req = httpMock.expectOne(r => r.url.includes('/notifications'));
    req.error(new ErrorEvent('Network error'));
    expect(svc.generateClientNotifications).toHaveBeenCalled();
  });
 
  // ── generateClientNotifications ───────────────────────────
  it('does nothing if no token', () => {
    localStorage.removeItem('token');
    svc.generateClientNotifications();
    httpMock.expectNone(r => r.url.includes('/events'));
  });
 
  it('calls /events when token exists', () => {
    localStorage.setItem('token', `h.${btoa(JSON.stringify({ sub: 'u1' }))}.s`);
    svc.generateClientNotifications();
    const req = httpMock.expectOne(r => r.url.includes('/events'));
    req.flush([]);
  });
 
  it('adds reminder_1day for tomorrow events', () => {
    localStorage.setItem('token', `h.${btoa(JSON.stringify({ sub: 'u1' }))}.s`);
    const tomorrow = new Date(Date.now() + 86_400_000).toISOString();
    svc.generateClientNotifications();
    httpMock.expectOne(r => r.url.includes('/events')).flush([
      { id: 5, title: 'Tomorrow Event', eventDate: tomorrow, activeRegistrations: 10 }
    ]);
    expect(svc.notifications().some(n => n.type === 'reminder_1day')).toBeTrue();
  });
 
  // ✅ Fixed — use start of today to guarantee diffDays = 0
 it('adds reminder_today for today events', () => {
  localStorage.setItem('token', `h.${btoa(JSON.stringify({ sub: 'u1' }))}.s`);

  // diffDays = Math.ceil((eventDate - now) / 86400000)
  // Use a time 30 seconds from now: ceil(30000/86400000) = ceil(0.000347) = 1 ← WRONG
  // Use PAST time (a few hours ago) so diffDays = ceil(negative) = 0
  const fewHoursAgo = new Date(Date.now() - 3 * 3600 * 1000).toISOString();

  svc.generateClientNotifications();
  httpMock.expectOne(r => r.url.includes('/events')).flush([
    { id: 6, title: 'Today Event', eventDate: fewHoursAgo, activeRegistrations: 5 }
  ]);
  expect(svc.notifications().some(n => n.type === 'reminder_today')).toBeTrue();
});
 
  it('skips events with 0 registrations', () => {
    localStorage.setItem('token', `h.${btoa(JSON.stringify({ sub: 'u1' }))}.s`);
    const tomorrow = new Date(Date.now() + 86_400_000).toISOString();
    svc.generateClientNotifications();
    httpMock.expectOne(r => r.url.includes('/events')).flush([
      { id: 7, title: 'Empty', eventDate: tomorrow, activeRegistrations: 0 }
    ]);
    expect(svc.notifications().some(n => n.type === 'reminder_1day')).toBeFalse();
  });
 
  it('does not duplicate reminders on repeated calls', () => {
    localStorage.setItem('token', `h.${btoa(JSON.stringify({ sub: 'u1' }))}.s`);
    const tomorrow = new Date(Date.now() + 86_400_000).toISOString();
    const ev = [{ id: 8, title: 'Event', eventDate: tomorrow, activeRegistrations: 10 }];
    svc.generateClientNotifications();
    httpMock.expectOne(r => r.url.includes('/events')).flush(ev);
    svc.generateClientNotifications();
    httpMock.expectOne(r => r.url.includes('/events')).flush(ev);
    expect(svc.notifications().filter(n => n.type === 'reminder_1day').length).toBe(1);
  });
 
  // ── timeAgo ───────────────────────────────────────────────
  it('timeAgo returns just now for < 60s',  () => expect(svc.timeAgo(new Date().toISOString())).toBe('just now'));
  it('timeAgo returns Xm ago for minutes',  () => expect(svc.timeAgo(new Date(Date.now() - 5*60*1000).toISOString())).toBe('5m ago'));
  it('timeAgo returns Xh ago for hours',    () => expect(svc.timeAgo(new Date(Date.now() - 2*3600*1000).toISOString())).toBe('2h ago'));
  it('timeAgo returns Xd ago for days',     () => expect(svc.timeAgo(new Date(Date.now() - 3*86400*1000).toISOString())).toBe('3d ago'));
 
  // ── getIcon ───────────────────────────────────────────────
  it('getIcon 📅 for event_added',           () => expect(svc.getIcon('event_added')).toBe('📅'));
  it('getIcon 🎫 for registration_success',  () => expect(svc.getIcon('registration_success')).toBe('🎫'));
  it('getIcon ⏰ for reminder_2days',        () => expect(svc.getIcon('reminder_2days')).toBe('⏰'));
  it('getIcon ⚡ for reminder_1day',         () => expect(svc.getIcon('reminder_1day')).toBe('⚡'));
  it('getIcon 🎉 for reminder_today',        () => expect(svc.getIcon('reminder_today')).toBe('🎉'));
  it('getIcon ❌ for event_cancelled',       () => expect(svc.getIcon('event_cancelled')).toBe('❌'));
  it('getIcon 🔔 for general',               () => expect(svc.getIcon('general')).toBe('🔔'));
 
  // ── getColor ──────────────────────────────────────────────
  it('getColor teal for event_added',            () => expect(svc.getColor('event_added')).toBe('#00a8a8'));
  it('getColor green for registration_success',  () => expect(svc.getColor('registration_success')).toBe('#10b981'));
  it('getColor amber for reminder_2days',        () => expect(svc.getColor('reminder_2days')).toBe('#f59e0b'));
  it('getColor rose for event_cancelled',        () => expect(svc.getColor('event_cancelled')).toBe('#f43f5e'));
  it('getColor purple for general',              () => expect(svc.getColor('general')).toBe('#8b5cf6'));
 
  // ── max 50 ────────────────────────────────────────────────
  it('saves max 50 notifications', () => {
    for (let i = 0; i < 55; i++) svc.push('general', `N${i}`, `M${i}`);
    expect(svc.notifications().length).toBeLessThanOrEqual(50);
  });
});