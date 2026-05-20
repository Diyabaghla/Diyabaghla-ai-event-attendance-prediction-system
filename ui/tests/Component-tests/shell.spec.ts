import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { signal, computed } from '@angular/core';
import { Shell } from '../../src/app/components/shared/shell/shell';
import { AuthService } from '../../src/app/services/auth.service';
import { NotificationService } from '../../src/app/services/notification.service';

const mockAuth = {
  currentUser: { fullName: 'Diya Baghla', email: 'diya@test.com', role: 'Admin' },
  isAdmin: true, isLoggedIn: true,
  logout: jasmine.createSpy('logout')
};
const mockNotifSvc = {
  notifications: signal([]),
  unreadCount:   computed(() => 0),
  startPolling:  jasmine.createSpy('startPolling'),
  stopPolling:   jasmine.createSpy('stopPolling'),
  clearAll:      jasmine.createSpy('clearAll')
};

describe('Shell Component', () => {
  let comp: Shell;
  let fix:  ComponentFixture<Shell>;

  beforeEach(async () => {
    [mockAuth.logout, mockNotifSvc.startPolling,
     mockNotifSvc.stopPolling, mockNotifSvc.clearAll].forEach((s: jasmine.Spy) => s.calls.reset());
    await TestBed.configureTestingModule({
      imports:   [Shell, RouterTestingModule],
      providers: [
        { provide: AuthService,         useValue: mockAuth },
        { provide: NotificationService, useValue: mockNotifSvc }
      ]
    }).compileComponents();
    fix  = TestBed.createComponent(Shell);
    comp = fix.componentInstance;
    fix.detectChanges();
  });

  it('should create',                 () => expect(comp).toBeTruthy());
  it('sidebarOpen starts true',       () => expect(comp.sidebarOpen).toBeTrue());
  it('profileOpen starts false',      () => expect(comp.profileOpen).toBeFalse());
  it('ngOnInit calls startPolling',   () => expect(mockNotifSvc.startPolling).toHaveBeenCalled());
  it('toggleSidebar flips state',     () => { comp.toggleSidebar(); expect(comp.sidebarOpen).toBeFalse(); });
  it('logout calls auth.logout',      () => { comp.logout(); expect(mockAuth.logout).toHaveBeenCalled(); });
  it('logout calls stopPolling',      () => { comp.logout(); expect(mockNotifSvc.stopPolling).toHaveBeenCalled(); });
  it('getInitials returns DB',        () => expect(comp.getInitials()).toBe('DB'));
  it('navItems has 8 items',          () => expect(comp.navItems.length).toBe(8));
  it('navItems contains Dashboard',   () => {
    expect(comp.navItems.map((n: any) => n.label)).toContain('Dashboard');
  });
  it('ngOnDestroy calls stopPolling', () => { comp.ngOnDestroy(); expect(mockNotifSvc.stopPolling).toHaveBeenCalled(); });
});
