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
