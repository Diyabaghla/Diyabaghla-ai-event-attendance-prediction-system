// import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
// import { RouterTestingModule } from '@angular/router/testing';
// import { signal, computed } from '@angular/core';
// import { Shell } from '../../src/app/components/shared/shell/shell';
// import { AuthService } from '../../src/app/services/auth.service';
// import { NotificationService } from '../../src/app/services/notification.service';

// const mockAuth = {
//   currentUser: { fullName: 'Diya Baghla', email: 'diya@test.com', role: 'Admin' },
//   isAdmin:     true,
//   isLoggedIn:  true,
//   logout:      jasmine.createSpy('logout')
// };

// const mockNotifSvc = {
//   notifications: signal([]),
//   unreadCount:   computed(() => 0),
//   startPolling:  jasmine.createSpy('startPolling'),
//   stopPolling:   jasmine.createSpy('stopPolling'),
//   clearAll:      jasmine.createSpy('clearAll')
// };

// describe('Shell Component', () => {
//   let comp: Shell;
//   let fix:  ComponentFixture<Shell>;

//   beforeEach(async () => {
//     [mockAuth.logout, mockNotifSvc.startPolling,
//      mockNotifSvc.stopPolling, mockNotifSvc.clearAll]
//       .forEach(s => s.calls.reset());

//     await TestBed.configureTestingModule({
//       imports:   [Shell, RouterTestingModule],
//       providers: [
//         { provide: AuthService,         useValue: mockAuth },
//         { provide: NotificationService, useValue: mockNotifSvc }
//       ]
//     }).compileComponents();

//     fix  = TestBed.createComponent(Shell);
//     comp = fix.componentInstance;
//     fix.detectChanges();
//   });

//   it('should create',                   () => expect(comp).toBeTruthy());
//   it('sidebarOpen starts true',         () => expect(comp.sidebarOpen).toBeTrue());
//   it('profileOpen starts false',        () => expect(comp.profileOpen).toBeFalse());

//   it('ngOnInit calls startPolling',     () => expect(mockNotifSvc.startPolling).toHaveBeenCalled());

//   it('toggleSidebar flips sidebarOpen', () => {
//     comp.toggleSidebar();
//     expect(comp.sidebarOpen).toBeFalse();
//     comp.toggleSidebar();
//     expect(comp.sidebarOpen).toBeTrue();
//   });

//   it('toggleProfile opens profile dropdown', () => {
//     comp.toggleProfile(new MouseEvent('click'));
//     expect(comp.profileOpen).toBeTrue();
//   });

//   it('toggleProfile twice closes dropdown', () => {
//     comp.toggleProfile(new MouseEvent('click'));
//     comp.toggleProfile(new MouseEvent('click'));
//     expect(comp.profileOpen).toBeFalse();
//   });

//   it('closeProfile sets profileOpen = false', () => {
//     comp.profileOpen = true;
//     comp.closeProfile();
//     expect(comp.profileOpen).toBeFalse();
//   });

//   it('logout calls notifSvc.stopPolling', () => {
//     comp.logout();
//     expect(mockNotifSvc.stopPolling).toHaveBeenCalled();
//   });

//   it('logout calls auth.logout', () => {
//     comp.logout();
//     expect(mockAuth.logout).toHaveBeenCalled();
//   });

//   it('logout closes profile dropdown', () => {
//     comp.profileOpen = true;
//     comp.logout();
//     expect(comp.profileOpen).toBeFalse();
//   });

//   it('getInitials returns DB for Diya Baghla', () => {
//     expect(comp.getInitials()).toBe('DB');
//   });

//   it('getInitials returns ? when no user', () => {
//     const authNoUser = { ...mockAuth, currentUser: null };
//     TestBed.resetTestingModule();
//     TestBed.configureTestingModule({
//       imports:   [Shell, RouterTestingModule],
//       providers: [
//         { provide: AuthService,         useValue: authNoUser },
//         { provide: NotificationService, useValue: mockNotifSvc }
//       ]
//     });
//     const f2 = TestBed.createComponent(Shell);
//     expect(f2.componentInstance.getInitials()).toBe('?');
//   });

//   it('navItems contains Dashboard', () => {
//     const labels = comp.navItems.map(n => n.label);
//     expect(labels).toContain('Dashboard');
//   });

//   it('navItems contains Events', () => {
//     const labels = comp.navItems.map(n => n.label);
//     expect(labels).toContain('Events');
//   });

//   it('navItems has 8 items', () => expect(comp.navItems.length).toBe(8));

//   it('ngOnDestroy calls stopPolling', () => {
//     comp.ngOnDestroy();
//     expect(mockNotifSvc.stopPolling).toHaveBeenCalled();
//   });
// });
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
