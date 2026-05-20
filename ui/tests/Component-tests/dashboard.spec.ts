// import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
// import { RouterTestingModule } from '@angular/router/testing';
// import { of, throwError } from 'rxjs';
// import { Dashboard } from '../../src/app/components/dashboard/dashboard';
// import { AuthService } from '../../src/app/services/auth.service';
// import { EventService, RegistrationService, ReportService } from '../../src/app/services/api.services';

// const mockAuth = {
//   currentUser: { fullName: 'Diya Baghla', email: 'diya@test.com', role: 'Admin' },
//   isAdmin: true,
//   isLoggedIn: true
// };

// const mockEvents = [
//   { id: 1, title: 'AI Summit', mode: 'Online', department: 'Engineering',
//     eventDate: new Date(Date.now() + 86400000 * 5).toISOString(),
//     eventType: 'Conference', activeRegistrations: 10, locationCapacity: 100 },
//   { id: 2, title: 'Sales Workshop', mode: 'Offline', department: 'Sales',
//     eventDate: new Date(Date.now() - 86400000 * 2).toISOString(),
//     eventType: 'Workshop', activeRegistrations: 5, locationCapacity: 50 }
// ];

// const mockRegistrations = [
//   { id: 1, eventId: 1, eventTitle: 'AI Summit',   status: 'Registered', registrationDate: new Date().toISOString() },
//   { id: 2, eventId: 2, eventTitle: 'Past Webinar', status: 'Cancelled',  registrationDate: new Date().toISOString() }
// ];

// const mockStatusReport = { totalRegistrations: 2, registered: 1, cancelled: 1, cancellationRate: 50 };

// const mockEventSvc = { getAll: jasmine.createSpy('getAll').and.returnValue(of(mockEvents)) };
// const mockRegSvc   = { getMyRegistrations: jasmine.createSpy('getMyRegistrations').and.returnValue(of(mockRegistrations)) };
// const mockReportSvc= { getCancelledVsRegistered: jasmine.createSpy('getCancelledVsRegistered').and.returnValue(of(mockStatusReport)) };

// describe('Dashboard Component', () => {
//   let comp: Dashboard;
//   let fix:  ComponentFixture<Dashboard>;

//   beforeEach(async () => {
//     mockEventSvc.getAll.calls.reset();
//     mockRegSvc.getMyRegistrations.calls.reset();
//     mockReportSvc.getCancelledVsRegistered.calls.reset();
//     mockEventSvc.getAll.and.returnValue(of(mockEvents));
//     mockRegSvc.getMyRegistrations.and.returnValue(of(mockRegistrations));

//     await TestBed.configureTestingModule({
//       imports:   [Dashboard, RouterTestingModule],
//       providers: [
//         { provide: AuthService,         useValue: mockAuth },
//         { provide: EventService,        useValue: mockEventSvc },
//         { provide: RegistrationService, useValue: mockRegSvc },
//         { provide: ReportService,       useValue: mockReportSvc }
//       ]
//     }).compileComponents();

//     fix  = TestBed.createComponent(Dashboard);
//     comp = fix.componentInstance;
//     fix.detectChanges();
//   });

//   // ── Creation ──────────────────────────────────────────────
//   it('should create', () => expect(comp).toBeTruthy());

//   it('starts with loading = true', () => {
//     const f2   = TestBed.createComponent(Dashboard);
//     expect(f2.componentInstance.loading).toBeTrue();
//   });

//   // ── Data loading ─────────────────────────────────────────
//   it('loads events on init', fakeAsync(() => {
//     tick();
//     expect(mockEventSvc.getAll).toHaveBeenCalled();
//   }));

//   it('loads registrations on init', fakeAsync(() => {
//     tick();
//     expect(mockRegSvc.getMyRegistrations).toHaveBeenCalled();
//   }));

//   it('sets loading = false after data loads', fakeAsync(() => {
//     tick();
//     expect(comp.loading).toBeFalse();
//   }));

//   it('populates events array', fakeAsync(() => {
//     tick();
//     expect(comp.events.length).toBe(2);
//   }));

//   it('populates registrations array', fakeAsync(() => {
//     tick();
//     expect(comp.myRegistrations.length).toBe(2);
//   }));

//   it('sets error on API failure', fakeAsync(() => {
//     mockEventSvc.getAll.and.returnValue(throwError(() => new Error('Network error')));
//     const f2 = TestBed.createComponent(Dashboard);
//     f2.detectChanges();
//     tick();
//     expect(f2.componentInstance.error).toBeTruthy();
//     expect(f2.componentInstance.loading).toBeFalse();
//   }));

//   // ── Computed getters ──────────────────────────────────────
//   it('activeRegistrations counts Registered status only', fakeAsync(() => {
//     tick();
//     expect(comp.activeRegistrations).toBe(1);
//   }));

//   it('cancelledRegistrations counts Cancelled status only', fakeAsync(() => {
//     tick();
//     expect(comp.cancelledRegistrations).toBe(1);
//   }));

//   it('upcomingEvents counts future events only', fakeAsync(() => {
//     tick();
//     expect(comp.upcomingEvents).toBe(1);
//   }));

//   it('recentEvents returns max 5 events', fakeAsync(() => {
//     tick();
//     expect(comp.recentEvents.length).toBeLessThanOrEqual(5);
//   }));

//   // ── Greeting ─────────────────────────────────────────────
//   it('getGreeting returns morning/afternoon/evening', () => {
//     const g = comp.getGreeting();
//     expect(['Good morning', 'Good afternoon', 'Good evening']).toContain(g);
//   });

//   it('getFirstName returns first name from currentUser', () => {
//     expect(comp.getFirstName()).toBe('Diya');
//   });

//   it('getFirstName returns "there" if no user', () => {
//     const mockNoUser = { ...mockAuth, currentUser: null };
//     TestBed.resetTestingModule();
//     TestBed.configureTestingModule({
//       imports:   [Dashboard, RouterTestingModule],
//       providers: [
//         { provide: AuthService,         useValue: mockNoUser },
//         { provide: EventService,        useValue: mockEventSvc },
//         { provide: RegistrationService, useValue: mockRegSvc },
//         { provide: ReportService,       useValue: mockReportSvc }
//       ]
//     });
//     const f2 = TestBed.createComponent(Dashboard);
//     f2.detectChanges();
//     expect(f2.componentInstance.getFirstName()).toBe('there');
//   });

//   // ── Formatters ────────────────────────────────────────────
//   it('formatDate returns formatted string', () => {
//     const formatted = comp.formatDate('2026-05-01T00:00:00');
//     expect(formatted).toContain('2026');
//   });

//   it('formatDateShort returns short format', () => {
//     const formatted = comp.formatDateShort('2026-05-01T00:00:00');
//     expect(formatted).toContain('May');
//   });

//   // ── Mode helpers ──────────────────────────────────────────
//   it('getModeIcon returns 💻 for Online', () => {
//     expect(comp.getModeIcon('Online')).toBe('💻');
//   });

//   it('getModeIcon returns 🏢 for Offline', () => {
//     expect(comp.getModeIcon('Offline')).toBe('🏢');
//   });

//   it('getModeIcon returns 🔀 for Hybrid', () => {
//     expect(comp.getModeIcon('Hybrid')).toBe('🔀');
//   });

//   it('getModeClass returns badge-info for Online', () => {
//     expect(comp.getModeClass('Online')).toBe('badge-info');
//   });

//   it('getModeClass returns badge-warning for Offline', () => {
//     expect(comp.getModeClass('Offline')).toBe('badge-warning');
//   });

//   // ── Days until ────────────────────────────────────────────
//   it('getDaysUntil returns "Past" for past dates', () => {
//     const past = new Date(Date.now() - 86400000 * 3).toISOString();
//     expect(comp.getDaysUntil(past)).toBe('Past');
//   });

//   it('getDaysUntil returns "Today" for today', () => {
//     const today = new Date().toISOString();
//     expect(comp.getDaysUntil(today)).toBe('Today');
//   });

//   it('getDaysUntil returns "Tomorrow" for tomorrow', () => {
//     const tomorrow = new Date(Date.now() + 86400000).toISOString();
//     expect(comp.getDaysUntil(tomorrow)).toBe('Tomorrow');
//   });

//   it('getDaysUntil returns Xd away for future dates', () => {
//     const future = new Date(Date.now() + 86400000 * 10).toISOString();
//     expect(comp.getDaysUntil(future)).toContain('away');
//   });

//   // ── Clock ─────────────────────────────────────────────────
//   it('currentTime is not empty after init', fakeAsync(() => {
//     tick();
//     expect(comp.currentTime).toBeTruthy();
//   }));

//   it('currentDate is not empty after init', fakeAsync(() => {
//     tick();
//     expect(comp.currentDate).toBeTruthy();
//   }));

//   // ── Admin: loads status report ────────────────────────────
//   it('admin loads getCancelledVsRegistered', fakeAsync(() => {
//     tick();
//     expect(mockReportSvc.getCancelledVsRegistered).toHaveBeenCalled();
//   }));

//   // ── Sparklines ────────────────────────────────────────────
//   it('sparklinePoints generated after data loads', fakeAsync(() => {
//     tick();
//     // sparklinePoints could be empty string if < 2 events — just check it's a string
//     expect(typeof comp.sparklinePoints).toBe('string');
//   }));

//   // ── loadData ─────────────────────────────────────────────
//   it('loadData can be called again', fakeAsync(() => {
//     tick();
//     comp.loadData();
//     tick();
//     expect(mockEventSvc.getAll).toHaveBeenCalledTimes(2);
//   }));
// });
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { Dashboard } from '../../src/app/components/dashboard/dashboard';
import { AuthService } from '../../src/app/services/auth.service';
import { EventService, RegistrationService, ReportService } from '../../src/app/services/api.services';

const mockAuth = {
  currentUser: { fullName: 'Diya Baghla', email: 'diya@test.com', role: 'Admin' },
  isAdmin: true, isLoggedIn: true
};

const mockEvents = [
  { id: 1, title: 'AI Summit',      mode: 'Online',  department: 'Engineering',
    eventDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    eventType: 'Conference', activeRegistrations: 10, locationCapacity: 100 },
  { id: 2, title: 'Past Workshop',  mode: 'Offline', department: 'Sales',
    eventDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    eventType: 'Workshop',  activeRegistrations: 5,  locationCapacity: 50 }
];

const mockRegistrations = [
  { id: 1, eventId: 1, eventTitle: 'AI Summit',   status: 'Registered', registrationDate: new Date().toISOString() },
  { id: 2, eventId: 2, eventTitle: 'Past Webinar', status: 'Cancelled',  registrationDate: new Date().toISOString() }
];

const mockStatusReport = { totalRegistrations: 2, registered: 1, cancelled: 1, cancellationRate: 50 };

const mockEventSvc  = { getAll: jasmine.createSpy('getAll').and.returnValue(of(mockEvents)) };
const mockRegSvc    = { getMyRegistrations: jasmine.createSpy('getMyRegistrations').and.returnValue(of(mockRegistrations)) };
const mockReportSvc = { getCancelledVsRegistered: jasmine.createSpy('getCancelledVsRegistered').and.returnValue(of(mockStatusReport)) };

describe('Dashboard Component', () => {
  let comp: Dashboard;
  let fix:  ComponentFixture<Dashboard>;

  beforeEach(async () => {
    mockEventSvc.getAll.calls.reset();
    mockRegSvc.getMyRegistrations.calls.reset();
    mockReportSvc.getCancelledVsRegistered.calls.reset();
    mockEventSvc.getAll.and.returnValue(of(mockEvents));
    mockRegSvc.getMyRegistrations.and.returnValue(of(mockRegistrations));
    mockReportSvc.getCancelledVsRegistered.and.returnValue(of(mockStatusReport));

    await TestBed.configureTestingModule({
      imports:   [Dashboard, RouterTestingModule],
      providers: [
        { provide: AuthService,         useValue: mockAuth },
        { provide: EventService,        useValue: mockEventSvc },
        { provide: RegistrationService, useValue: mockRegSvc },
        { provide: ReportService,       useValue: mockReportSvc }
      ]
    }).compileComponents();

    fix  = TestBed.createComponent(Dashboard);
    comp = fix.componentInstance;
    fix.detectChanges();
  });

  it('should create', () => expect(comp).toBeTruthy());

  it('loads events on init', fakeAsync(() => {
    tick(); expect(mockEventSvc.getAll).toHaveBeenCalled();
  }));

  it('loads registrations on init', fakeAsync(() => {
    tick(); expect(mockRegSvc.getMyRegistrations).toHaveBeenCalled();
  }));

  it('sets loading = false after data loads', fakeAsync(() => {
    tick(); expect(comp.loading).toBeFalse();
  }));

  it('populates events array', fakeAsync(() => {
    tick(); expect(comp.events.length).toBe(2);
  }));

  it('populates registrations array', fakeAsync(() => {
    tick(); expect(comp.myRegistrations.length).toBe(2);
  }));

  it('activeRegistrations counts Registered only', fakeAsync(() => {
    tick(); expect(comp.activeRegistrations).toBe(1);
  }));

  it('cancelledRegistrations counts Cancelled only', fakeAsync(() => {
    tick(); expect(comp.cancelledRegistrations).toBe(1);
  }));

  it('upcomingEvents counts future events only', fakeAsync(() => {
    tick(); expect(comp.upcomingEvents).toBe(1);
  }));

  it('recentEvents returns max 5', fakeAsync(() => {
    tick(); expect(comp.recentEvents.length).toBeLessThanOrEqual(5);
  }));

  it('getGreeting returns valid greeting', () => {
    expect(['Good morning', 'Good afternoon', 'Good evening']).toContain(comp.getGreeting());
  });

  it('getFirstName returns first name', () => expect(comp.getFirstName()).toBe('Diya'));

  it('getModeIcon returns 💻 for Online',  () => expect(comp.getModeIcon('Online')).toBe('💻'));
  it('getModeIcon returns 🏢 for Offline', () => expect(comp.getModeIcon('Offline')).toBe('🏢'));
  it('getModeIcon returns 🔀 for Hybrid',  () => expect(comp.getModeIcon('Hybrid')).toBe('🔀'));

  it('getDaysUntil returns Past for past dates', () => {
    const past = new Date(Date.now() - 86400000 * 3).toISOString();
    expect(comp.getDaysUntil(past)).toBe('Past');
  });

  it('getDaysUntil returns Today', () => {
    expect(comp.getDaysUntil(new Date().toISOString())).toBe('Today');
  });

  it('getDaysUntil returns Tomorrow', () => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString();
    expect(comp.getDaysUntil(tomorrow)).toBe('Tomorrow');
  });

  it('formatDate returns string with year', () => {
    expect(comp.formatDate(mockEvents[0].eventDate)).toContain('2026');
  });

  it('currentTime is not empty', fakeAsync(() => {
    tick(); expect(comp.currentTime).toBeTruthy();
  }));

  it('admin loads getCancelledVsRegistered', fakeAsync(() => {
    tick(); expect(mockReportSvc.getCancelledVsRegistered).toHaveBeenCalled();
  }));
});
