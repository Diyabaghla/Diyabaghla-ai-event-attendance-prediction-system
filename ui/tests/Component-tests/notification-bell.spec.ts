import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { signal, computed } from '@angular/core';
import { NotificationBell } from '../../src/app/components/shared/notification-bell/notification-bell';
import { NotificationService } from '../../src/app/services/notification.service';

const mockNotifications = [
  { id: 1, type: 'event_added', title: 'New Event', message: 'AI Summit added',
    createdAt: new Date().toISOString(), isRead: false },
  { id: 2, type: 'registration_success', title: 'Registered', message: 'You registered',
    createdAt: new Date().toISOString(), isRead: true }
];

const mockNotifSvc = {
  notifications: signal(mockNotifications),
  unreadCount:   computed(() => mockNotifications.filter(n => !n.isRead).length),
  markRead:      jasmine.createSpy('markRead'),
  markAllRead:   jasmine.createSpy('markAllRead'),
  remove:        jasmine.createSpy('remove'),
  clearAll:      jasmine.createSpy('clearAll'),
  timeAgo:       jasmine.createSpy('timeAgo').and.returnValue('2m ago'),
  getIcon:       jasmine.createSpy('getIcon').and.returnValue('📅'),
  getColor:      jasmine.createSpy('getColor').and.returnValue('#00a8a8')
};

describe('NotificationBell Component', () => {
  let comp: NotificationBell;
  let fix:  ComponentFixture<NotificationBell>;

  beforeEach(async () => {
    [mockNotifSvc.markRead, mockNotifSvc.markAllRead,
     mockNotifSvc.remove, mockNotifSvc.clearAll].forEach((s: jasmine.Spy) => s.calls.reset());
    await TestBed.configureTestingModule({
      imports:   [NotificationBell, RouterTestingModule],
      providers: [{ provide: NotificationService, useValue: mockNotifSvc }]
    }).compileComponents();
    fix  = TestBed.createComponent(NotificationBell);
    comp = fix.componentInstance;
    fix.detectChanges();
  });

  it('should create',                 () => expect(comp).toBeTruthy());
  it('isOpen starts false',           () => expect(comp.isOpen()).toBeFalse());
  it('toggle opens panel',            () => { comp.toggle(new MouseEvent('click')); expect(comp.isOpen()).toBeTrue(); });
  it('toggle twice closes panel',     () => { comp.toggle(new MouseEvent('click')); comp.toggle(new MouseEvent('click')); expect(comp.isOpen()).toBeFalse(); });
  it('markRead calls service',        () => { comp.markRead(mockNotifications[0] as any, new MouseEvent('click')); expect(mockNotifSvc.markRead).toHaveBeenCalledWith(1); });
  it('markAllRead calls service',     () => { comp.markAllRead(new MouseEvent('click')); expect(mockNotifSvc.markAllRead).toHaveBeenCalled(); });
  it('remove calls service',          () => { comp.remove(mockNotifications[0] as any, new MouseEvent('click')); expect(mockNotifSvc.remove).toHaveBeenCalledWith(1); });
  it('clearAll calls service',        () => { comp.clearAll(new MouseEvent('click')); expect(mockNotifSvc.clearAll).toHaveBeenCalled(); });
  it('navigate marks as read',        () => { comp.navigate(mockNotifications[0] as any); expect(mockNotifSvc.markRead).toHaveBeenCalledWith(1); });
  it('navigate closes panel',         () => { comp.isOpen.set(true); comp.navigate(mockNotifications[0] as any); expect(comp.isOpen()).toBeFalse(); });
  it('trackById returns id',          () => { expect(comp.trackById(0, mockNotifications[0] as any)).toBe(1); });
  it('unreadCount reflects 1 unread', () => { expect(mockNotifSvc.unreadCount()).toBe(1); });
});
