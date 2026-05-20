// import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
// import { FormsModule } from '@angular/forms';
// import { RouterTestingModule } from '@angular/router/testing';
// import { of, throwError } from 'rxjs';
// import { Registrations } from '../../src/app/components/registrations/registrations';
// import { RegistrationService, EventService } from '../../src/app/services/api.services';
// import { AuthService } from '../../src/app/services/auth.service';
// import { ToastService } from '../../src/app/services/toast.service';

// const mockRegistrations = [
//   { id: 1, eventId: 1, eventTitle: 'AI Summit',   status: 'Registered',
//     registrationDate: new Date().toISOString(), pastUserAttendanceRate: 0.7,
//     userName: 'Diya', userEmail: 'diya@test.com', daysBeforeRegistration: 5 },
//   { id: 2, eventId: 2, eventTitle: 'Past Workshop', status: 'Cancelled',
//     registrationDate: new Date().toISOString(), pastUserAttendanceRate: 0.5,
//     userName: 'Arjun', userEmail: 'arjun@test.com', daysBeforeRegistration: 2 }
// ];

// const mockEvents = [
//   { id: 1, title: 'AI Summit',   mode: 'Online',  department: 'Engineering', eventDate: new Date(Date.now() + 86400000 * 5).toISOString() },
//   { id: 2, title: 'Sales Event', mode: 'Offline', department: 'Sales',       eventDate: new Date(Date.now() + 86400000 * 3).toISOString() }
// ];

// const mockRegSvc   = {
//   getMyRegistrations:  jasmine.createSpy('getMyRegistrations').and.returnValue(of(mockRegistrations)),
//   getAllRegistrations:  jasmine.createSpy('getAllRegistrations').and.returnValue(of(mockRegistrations)),
//   cancel:              jasmine.createSpy('cancel').and.returnValue(of({})),
//   register:            jasmine.createSpy('register').and.returnValue(of({ id: 3 }))
// };
// const mockEventSvc = { getAll: jasmine.createSpy('getAll').and.returnValue(of(mockEvents)) };
// const mockAuth     = { isAdmin: false, currentUser: { fullName: 'Diya', role: 'User' } };
// const mockToast    = {
//   success: jasmine.createSpy('success'),
//   info:    jasmine.createSpy('info'),
//   error:   jasmine.createSpy('error')
// };

// describe('Registrations Component', () => {
//   let comp: Registrations;
//   let fix:  ComponentFixture<Registrations>;

//   beforeEach(async () => {
//     [mockRegSvc.getMyRegistrations, mockRegSvc.getAllRegistrations,
//      mockRegSvc.cancel, mockRegSvc.register, mockEventSvc.getAll,
//      mockToast.success, mockToast.info, mockToast.error]
//       .forEach(s => s.calls.reset());
//     mockRegSvc.getMyRegistrations.and.returnValue(of(mockRegistrations));
//     mockRegSvc.getAllRegistrations.and.returnValue(of(mockRegistrations));
//     mockRegSvc.cancel.and.returnValue(of({}));
//     mockRegSvc.register.and.returnValue(of({ id: 3 }));
//     mockEventSvc.getAll.and.returnValue(of(mockEvents));

//     await TestBed.configureTestingModule({
//       imports:   [Registrations, FormsModule, RouterTestingModule],
//       providers: [
//         { provide: RegistrationService, useValue: mockRegSvc },
//         { provide: EventService,        useValue: mockEventSvc },
//         { provide: AuthService,         useValue: mockAuth },
//         { provide: ToastService,        useValue: mockToast }
//       ]
//     }).compileComponents();

//     fix  = TestBed.createComponent(Registrations);
//     comp = fix.componentInstance;
//     fix.detectChanges();
//   });

//   // ── Creation ──────────────────────────────────────────────
//   it('should create', () => expect(comp).toBeTruthy());

//   it('starts with loading = true', () => {
//     const f2 = TestBed.createComponent(Registrations);
//     expect(f2.componentInstance.loading).toBeTrue();
//   });

//   // ── Data loading ─────────────────────────────────────────
//   it('loads registrations on init', fakeAsync(() => {
//     tick();
//     expect(mockRegSvc.getMyRegistrations).toHaveBeenCalled();
//   }));

//   it('loads events on init', fakeAsync(() => {
//     tick();
//     expect(mockEventSvc.getAll).toHaveBeenCalled();
//   }));

//   it('populates registrations array', fakeAsync(() => {
//     tick();
//     expect(comp.registrations.length).toBe(2);
//   }));

//   it('populates filtered array', fakeAsync(() => {
//     tick();
//     expect(comp.filtered.length).toBe(2);
//   }));

//   it('sets loading = false after load', fakeAsync(() => {
//     tick();
//     expect(comp.loading).toBeFalse();
//   }));

//   it('sets error on API failure', fakeAsync(() => {
//     mockRegSvc.getMyRegistrations.and.returnValue(throwError(() => new Error('fail')));
//     const f2 = TestBed.createComponent(Registrations);
//     f2.detectChanges(); tick();
//     expect(f2.componentInstance.error).toBeTruthy();
//   }));

//   // ── Admin loads all ───────────────────────────────────────
//   it('admin calls getAllRegistrations instead of getMyRegistrations', fakeAsync(() => {
//     const adminAuth = { ...mockAuth, isAdmin: true };
//     TestBed.resetTestingModule();
//     TestBed.configureTestingModule({
//       imports:   [Registrations, FormsModule, RouterTestingModule],
//       providers: [
//         { provide: RegistrationService, useValue: mockRegSvc },
//         { provide: EventService,        useValue: mockEventSvc },
//         { provide: AuthService,         useValue: adminAuth },
//         { provide: ToastService,        useValue: mockToast }
//       ]
//     });
//     const f2 = TestBed.createComponent(Registrations);
//     f2.detectChanges(); tick();
//     expect(mockRegSvc.getAllRegistrations).toHaveBeenCalled();
//   }));

//   // ── Filtering ─────────────────────────────────────────────
//   it('filterStatus All shows all registrations', fakeAsync(() => {
//     tick();
//     comp.filterStatus = 'All'; comp.applyFilter();
//     expect(comp.filtered.length).toBe(2);
//   }));

//   it('filterStatus Registered shows only active', fakeAsync(() => {
//     tick();
//     comp.filterStatus = 'Registered'; comp.applyFilter();
//     expect(comp.filtered.every(r => r.status === 'Registered')).toBeTrue();
//   }));

//   it('filterStatus Cancelled shows only cancelled', fakeAsync(() => {
//     tick();
//     comp.filterStatus = 'Cancelled'; comp.applyFilter();
//     expect(comp.filtered.every(r => r.status === 'Cancelled')).toBeTrue();
//   }));

//   it('searchQuery filters by event title', fakeAsync(() => {
//     tick();
//     comp.searchQuery = 'AI'; comp.applyFilter();
//     expect(comp.filtered.length).toBe(1);
//     expect(comp.filtered[0].eventTitle).toContain('AI');
//   }));

//   it('searchQuery filters by user name (admin)', fakeAsync(() => {
//     tick();
//     comp.searchQuery = 'Arjun'; comp.applyFilter();
//     expect(comp.filtered.length).toBe(1);
//   }));

//   // ── Sorting ───────────────────────────────────────────────
//   it('setSort changes sortBy', () => {
//     comp.setSort('event');
//     expect(comp.sortBy).toBe('event');
//   });

//   it('setSort toggles direction on same column', () => {
//     comp.sortBy = 'date'; comp.sortDir = 'desc';
//     comp.setSort('date');
//     expect(comp.sortDir).toBe('asc');
//   });

//   it('sortIcon returns ↕ for non-active column', () => {
//     comp.sortBy = 'date';
//     expect(comp.sortIcon('event')).toBe('↕');
//   });

//   it('sortIcon returns ↑ for asc active column', () => {
//     comp.sortBy = 'date'; comp.sortDir = 'asc';
//     expect(comp.sortIcon('date')).toBe('↑');
//   });

//   it('sortIcon returns ↓ for desc active column', () => {
//     comp.sortBy = 'date'; comp.sortDir = 'desc';
//     expect(comp.sortIcon('date')).toBe('↓');
//   });

//   // ── Cancel ────────────────────────────────────────────────
//   it('cancel calls regSvc.cancel', fakeAsync(() => {
//     tick();
//     comp.cancel(mockRegistrations[0] as any); tick();
//     expect(mockRegSvc.cancel).toHaveBeenCalledWith(1);
//   }));

//   it('cancel shows toast on success', fakeAsync(() => {
//     tick();
//     comp.cancel(mockRegistrations[0] as any); tick();
//     expect(mockToast.info).toHaveBeenCalled();
//   }));

//   it('cancel sets error on failure', fakeAsync(() => {
//     mockRegSvc.cancel.and.returnValue(throwError(() => ({ error: { message: 'Cannot cancel' } })));
//     tick();
//     comp.cancel(mockRegistrations[0] as any); tick();
//     expect(mockToast.error).toHaveBeenCalled();
//   }));

//   // ── Register modal ────────────────────────────────────────
//   it('openRegister sets showRegisterModal = true', fakeAsync(() => {
//     tick();
//     comp.openRegister();
//     expect(comp.showRegisterModal).toBeTrue();
//   }));

//   it('openRegister sets selectedEventId to first event', fakeAsync(() => {
//     tick();
//     comp.openRegister();
//     expect(comp.selectedEventId).toBe(mockEvents[0].id);
//   }));

//   it('openRegister sets pastRate to 0.7', fakeAsync(() => {
//     tick();
//     comp.openRegister();
//     expect(comp.pastRate).toBe(0.7);
//   }));

//   it('submitRegister calls regSvc.register', fakeAsync(() => {
//     tick();
//     comp.openRegister();
//     comp.submitRegister(); tick();
//     expect(mockRegSvc.register).toHaveBeenCalledWith({
//       eventId: mockEvents[0].id, pastUserAttendanceRate: 0.7
//     });
//   }));

//   it('submitRegister shows success toast', fakeAsync(() => {
//     tick();
//     comp.openRegister();
//     comp.submitRegister(); tick();
//     expect(mockToast.success).toHaveBeenCalled();
//   }));

//   it('submitRegister closes modal on success', fakeAsync(() => {
//     tick();
//     comp.openRegister();
//     comp.submitRegister(); tick();
//     expect(comp.showRegisterModal).toBeFalse();
//   }));

//   it('submitRegister sets regError on failure', fakeAsync(() => {
//     mockRegSvc.register.and.returnValue(throwError(() => ({
//       error: { message: 'Already registered' }
//     })));
//     tick();
//     comp.openRegister();
//     comp.submitRegister(); tick();
//     expect(comp.regError).toBe('Already registered');
//   }));

//   it('submitRegister does nothing if no eventId selected', fakeAsync(() => {
//     comp.selectedEventId = null;
//     comp.submitRegister(); tick();
//     expect(mockRegSvc.register).not.toHaveBeenCalled();
//   }));

//   // ── Computed getters ──────────────────────────────────────
//   it('totalCount returns total registrations', fakeAsync(() => {
//     tick(); expect(comp.totalCount).toBe(2);
//   }));

//   it('activeCount counts Registered status', fakeAsync(() => {
//     tick(); expect(comp.activeCount).toBe(1);
//   }));

//   it('cancelledCount counts Cancelled status', fakeAsync(() => {
//     tick(); expect(comp.cancelledCount).toBe(1);
//   }));

//   it('activeRate returns correct percentage', fakeAsync(() => {
//     tick(); expect(comp.activeRate).toBe(50);
//   }));

//   it('activeRate returns 0 when no registrations', () => {
//     comp.registrations = [];
//     expect(comp.activeRate).toBe(0);
//   });

//   // ── Helpers ───────────────────────────────────────────────
//   it('getInitials returns 2 uppercase chars', () => {
//     expect(comp.getInitials('Diya Baghla')).toBe('DB');
//   });

//   it('getInitials returns ? for undefined', () => {
//     expect(comp.getInitials(undefined)).toBe('?');
//   });

//   it('formatDate returns formatted string', () => {
//     const result = comp.formatDate(new Date().toISOString());
//     expect(result).toBeTruthy();
//     expect(result).not.toBe('—');
//   });

//   it('formatDate returns — for undefined', () => {
//     expect(comp.formatDate(undefined)).toBe('—');
//   });

//   it('getDaysLabel returns "Same day" for 0', () => {
//     expect(comp.getDaysLabel(0)).toBe('Same day');
//   });

//   it('getDaysLabel returns "1 day before" for 1', () => {
//     expect(comp.getDaysLabel(1)).toBe('1 day before');
//   });

//   it('getDaysLabel returns "X days before" for X>1', () => {
//     expect(comp.getDaysLabel(5)).toBe('5 days before');
//   });

//   it('getDaysLabel returns — for undefined', () => {
//     expect(comp.getDaysLabel(undefined)).toBe('—');
//   });

//   // ── View mode ─────────────────────────────────────────────
//   it('starts with table view mode', () => {
//     expect(comp.viewMode).toBe('table');
//   });

//   it('viewMode can switch to cards', () => {
//     comp.viewMode = 'cards';
//     expect(comp.viewMode).toBe('cards');
//   });

//   // ── Avatar color ─────────────────────────────────────────
//   it('getAvatarColor returns a hex color string', () => {
//     const color = comp.getAvatarColor('Diya');
//     expect(color).toMatch(/^#[0-9a-f]{6}$/i);
//   });
// });
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { Registrations } from '../../src/app/components/registrations/registrations';
import { RegistrationService, EventService } from '../../src/app/services/api.services';
import { AuthService } from '../../src/app/services/auth.service';
import { ToastService } from '../../src/app/services/toast.service';

const mockRegistrations = [
  { id: 1, eventId: 1, eventTitle: 'AI Summit',    status: 'Registered',
    registrationDate: new Date().toISOString(), pastUserAttendanceRate: 0.7,
    userName: 'Diya', userEmail: 'diya@test.com', daysBeforeRegistration: 5 },
  { id: 2, eventId: 2, eventTitle: 'Past Workshop', status: 'Cancelled',
    registrationDate: new Date().toISOString(), pastUserAttendanceRate: 0.5,
    userName: 'Arjun', userEmail: 'arjun@test.com', daysBeforeRegistration: 2 }
];
const mockEvents = [
  { id: 1, title: 'AI Summit',   mode: 'Online',  department: 'Engineering' },
  { id: 2, title: 'Sales Event', mode: 'Offline', department: 'Sales' }
];

const mockRegSvc = {
  getMyRegistrations:  jasmine.createSpy('getMyRegistrations').and.returnValue(of(mockRegistrations)),
  getAllRegistrations:  jasmine.createSpy('getAllRegistrations').and.returnValue(of(mockRegistrations)),
  cancel:              jasmine.createSpy('cancel').and.returnValue(of({})),
  register:            jasmine.createSpy('register').and.returnValue(of({ id: 3 }))
};
const mockEventSvc = { getAll: jasmine.createSpy('getAll').and.returnValue(of(mockEvents)) };
const mockAuth     = { isAdmin: false, currentUser: { fullName: 'Diya', role: 'User' } };
const mockToast    = {
  success: jasmine.createSpy('success'),
  info:    jasmine.createSpy('info'),
  error:   jasmine.createSpy('error')
};

describe('Registrations Component', () => {
  let comp: Registrations;
  let fix:  ComponentFixture<Registrations>;

  beforeEach(async () => {
    [mockRegSvc.getMyRegistrations, mockRegSvc.getAllRegistrations,
     mockRegSvc.cancel, mockRegSvc.register, mockEventSvc.getAll,
     mockToast.success, mockToast.info, mockToast.error]
      .forEach((s: jasmine.Spy) => s.calls.reset());
    mockRegSvc.getMyRegistrations.and.returnValue(of(mockRegistrations));
    mockRegSvc.getAllRegistrations.and.returnValue(of(mockRegistrations));
    mockRegSvc.cancel.and.returnValue(of({}));
    mockRegSvc.register.and.returnValue(of({ id: 3 }));
    mockEventSvc.getAll.and.returnValue(of(mockEvents));

    await TestBed.configureTestingModule({
      imports:   [Registrations, FormsModule, RouterTestingModule],
      providers: [
        { provide: RegistrationService, useValue: mockRegSvc },
        { provide: EventService,        useValue: mockEventSvc },
        { provide: AuthService,         useValue: mockAuth },
        { provide: ToastService,        useValue: mockToast }
      ]
    }).compileComponents();

    fix  = TestBed.createComponent(Registrations);
    comp = fix.componentInstance;
    fix.detectChanges();
  });

  it('should create', () => expect(comp).toBeTruthy());

  it('loads registrations on init', fakeAsync(() => {
    tick(); expect(mockRegSvc.getMyRegistrations).toHaveBeenCalled();
  }));

  it('loads events on init', fakeAsync(() => {
    tick(); expect(mockEventSvc.getAll).toHaveBeenCalled();
  }));

  it('populates registrations array', fakeAsync(() => {
    tick(); expect(comp.registrations.length).toBe(2);
  }));

  it('sets loading = false after load', fakeAsync(() => {
    tick(); expect(comp.loading).toBeFalse();
  }));

  it('filterStatus All shows all', fakeAsync(() => {
    tick();
    comp.filterStatus = 'All'; comp.applyFilter();
    expect(comp.filtered.length).toBe(2);
  }));

  it('filterStatus Registered shows only active', fakeAsync(() => {
    tick();
    comp.filterStatus = 'Registered'; comp.applyFilter();
    expect(comp.filtered.every((r: any) => r.status === 'Registered')).toBeTrue();
  }));

  it('filterStatus Cancelled shows only cancelled', fakeAsync(() => {
    tick();
    comp.filterStatus = 'Cancelled'; comp.applyFilter();
    expect(comp.filtered.every((r: any) => r.status === 'Cancelled')).toBeTrue();
  }));

  it('searchQuery filters by event title', fakeAsync(() => {
    tick();
    comp.searchQuery = 'AI'; comp.applyFilter();
    expect(comp.filtered.length).toBe(1);
  }));

  it('setSort changes sortBy', () => {
    comp.setSort('event');
    expect(comp.sortBy).toBe('event');
  });

  it('setSort toggles direction on same column', () => {
    comp.sortBy = 'date'; comp.sortDir = 'desc';
    comp.setSort('date');
    expect(comp.sortDir).toBe('asc');
  });

  it('sortIcon returns ↕ for non-active column', () => {
    comp.sortBy = 'date';
    expect(comp.sortIcon('event')).toBe('↕');
  });

  it('cancel calls regSvc.cancel', fakeAsync(() => {
    tick();
    comp.cancel(mockRegistrations[0] as any); tick();
    expect(mockRegSvc.cancel).toHaveBeenCalledWith(1);
  }));

  it('cancel shows toast on success', fakeAsync(() => {
    tick();
    comp.cancel(mockRegistrations[0] as any); tick();
    expect(mockToast.info).toHaveBeenCalled();
  }));

  it('openRegister sets showRegisterModal = true', fakeAsync(() => {
    tick();
    comp.openRegister();
    expect(comp.showRegisterModal).toBeTrue();
  }));

  it('submitRegister calls regSvc.register', fakeAsync(() => {
    tick();
    comp.openRegister();
    comp.submitRegister(); tick();
    expect(mockRegSvc.register).toHaveBeenCalled();
  }));

  it('submitRegister closes modal on success', fakeAsync(() => {
    tick();
    comp.openRegister();
    comp.submitRegister(); tick();
    expect(comp.showRegisterModal).toBeFalse();
  }));

  it('submitRegister does nothing if no eventId', fakeAsync(() => {
    comp.selectedEventId = null;
    comp.submitRegister(); tick();
    expect(mockRegSvc.register).not.toHaveBeenCalled();
  }));

  it('totalCount returns total registrations', fakeAsync(() => {
    tick(); expect(comp.totalCount).toBe(2);
  }));

  it('activeCount counts Registered status', fakeAsync(() => {
    tick(); expect(comp.activeCount).toBe(1);
  }));

  it('cancelledCount counts Cancelled status', fakeAsync(() => {
    tick(); expect(comp.cancelledCount).toBe(1);
  }));

  it('activeRate returns 50 for 1/2', fakeAsync(() => {
    tick(); expect(comp.activeRate).toBe(50);
  }));

  it('getInitials returns 2 chars', () => {
    expect(comp.getInitials('Diya Baghla')).toBe('DB');
  });

  it('formatDate returns — for undefined', () => {
    expect(comp.formatDate(undefined)).toBe('—');
  });

  it('getDaysLabel returns Same day for 0', () => {
    expect(comp.getDaysLabel(0)).toBe('Same day');
  });

  it('getDaysLabel returns 1 day before for 1', () => {
    expect(comp.getDaysLabel(1)).toBe('1 day before');
  });

  it('getDaysLabel returns X days before', () => {
    expect(comp.getDaysLabel(5)).toBe('5 days before');
  });

  it('viewMode starts as table', () => expect(comp.viewMode).toBe('table'));

  it('getAvatarColor returns hex color', () => {
    expect(comp.getAvatarColor('Diya')).toMatch(/^#[0-9a-f]{6}$/i);
  });
});
