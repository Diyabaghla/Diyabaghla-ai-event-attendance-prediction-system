// import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
// import { ReactiveFormsModule, FormsModule } from '@angular/forms';
// import { RouterTestingModule } from '@angular/router/testing';
// import { of, throwError } from 'rxjs';
// import { Events } from '../../src/app/components/events/events';
// import { EventService, RegistrationService } from '../../src/app/services/api.services';
// import { AuthService } from '../../src/app/services/auth.service';
// import { ToastService } from '../../src/app/services/toast.service';

// const mockEvents = [
//   { id: 1, title: 'AI Conference', mode: 'Online',  department: 'Engineering',
//     eventType: 'Conference', eventDate: new Date(Date.now() + 86400000 * 10).toISOString(),
//     durationHours: 2, speakerRating: 4.5, ticketPrice: 0,  locationCapacity: 100,
//     activeRegistrations: 20, pastAttendanceRate: 0.7, reminderSent: false, weather: 'Clear' },
//   { id: 2, title: 'Sales Workshop', mode: 'Offline', department: 'Sales',
//     eventType: 'Workshop', eventDate: new Date(Date.now() + 86400000 * 5).toISOString(),
//     durationHours: 3, speakerRating: 3.8, ticketPrice: 25, locationCapacity: 50,
//     activeRegistrations: 10, pastAttendanceRate: 0.6, reminderSent: true, weather: 'Cloudy' }
// ];

// const mockEventSvc = {
//   getAll:  jasmine.createSpy('getAll').and.returnValue(of(mockEvents)),
//   create:  jasmine.createSpy('create').and.returnValue(of({ id: 3, title: 'New Event', ...mockEvents[0] })),
//   update:  jasmine.createSpy('update').and.returnValue(of({ ...mockEvents[0], title: 'Updated' })),
//   delete:  jasmine.createSpy('delete').and.returnValue(of({}))
// };
// const mockRegSvc   = { register: jasmine.createSpy('register').and.returnValue(of({})) };
// const mockAuth     = { isAdmin: true, currentUser: { fullName: 'Admin', role: 'Admin' } };
// const mockToast    = {
//   success: jasmine.createSpy('success'),
//   info:    jasmine.createSpy('info'),
//   error:   jasmine.createSpy('error')
// };

// describe('Events Component', () => {
//   let comp: Events;
//   let fix:  ComponentFixture<Events>;

//   beforeEach(async () => {
//     [mockEventSvc.getAll, mockEventSvc.create, mockEventSvc.update,
//      mockEventSvc.delete, mockRegSvc.register,
//      mockToast.success, mockToast.info, mockToast.error]
//       .forEach((s: jasmine.Spy) => s.calls.reset());
//     mockEventSvc.getAll.and.returnValue(of(mockEvents));
//     mockEventSvc.create.and.returnValue(of({ id: 3, title: 'New Event', ...mockEvents[0] }));
//     mockEventSvc.update.and.returnValue(of({ ...mockEvents[0], title: 'Updated' }));
//     mockEventSvc.delete.and.returnValue(of({}));

//     await TestBed.configureTestingModule({
//       imports:   [Events, ReactiveFormsModule, FormsModule, RouterTestingModule],
//       providers: [
//         { provide: EventService,        useValue: mockEventSvc },
//         { provide: RegistrationService, useValue: mockRegSvc },
//         { provide: AuthService,         useValue: mockAuth },
//         { provide: ToastService,        useValue: mockToast }
//       ]
//     }).compileComponents();

//     fix  = TestBed.createComponent(Events);
//     comp = fix.componentInstance;
//     fix.detectChanges();
//   });

//   // ── Creation ──────────────────────────────────────────────
//   it('should create', () => expect(comp).toBeTruthy());

//   it('starts with loading = true', () => {
//     const f2 = TestBed.createComponent(Events);
//     expect(f2.componentInstance.loading).toBeTrue();
//   });

//   // ── Data loading ─────────────────────────────────────────
//   it('loads events on init', fakeAsync(() => {
//     tick(); expect(mockEventSvc.getAll).toHaveBeenCalled();
//   }));

//   it('populates events after load', fakeAsync(() => {
//     tick(); expect(comp.events.length).toBe(2);
//   }));

//   it('populates filteredEvents after load', fakeAsync(() => {
//     tick(); expect(comp.filteredEvents.length).toBe(2);
//   }));

//   it('sets loading = false after load', fakeAsync(() => {
//     tick(); expect(comp.loading).toBeFalse();
//   }));

//   it('sets error on API failure', fakeAsync(() => {
//     mockEventSvc.getAll.and.returnValue(throwError(() => new Error('fail')));
//     const f2 = TestBed.createComponent(Events); f2.detectChanges(); tick();
//     expect(f2.componentInstance.error).toBeTruthy();
//   }));

//   // ── Filtering ─────────────────────────────────────────────
//   it('applyFilter by mode Online returns only Online events', fakeAsync(() => {
//     tick();
//     comp.filterMode = 'Online'; comp.applyFilter();
//     expect(comp.filteredEvents.every(e => e.mode === 'Online')).toBeTrue();
//   }));

//   it('applyFilter by mode All returns all events', fakeAsync(() => {
//     tick();
//     comp.filterMode = 'All'; comp.applyFilter();
//     expect(comp.filteredEvents.length).toBe(2);
//   }));

//   it('applyFilter by searchQuery filters by title', fakeAsync(() => {
//     tick();
//     comp.searchQuery = 'AI'; comp.applyFilter();
//     expect(comp.filteredEvents.length).toBe(1);
//     expect(comp.filteredEvents[0].title).toContain('AI');
//   }));

//   it('applyFilter by searchQuery case-insensitive', fakeAsync(() => {
//     tick();
//     comp.searchQuery = 'sales'; comp.applyFilter();
//     expect(comp.filteredEvents.length).toBe(1);
//   }));

//   it('applyFilter clears results for no match', fakeAsync(() => {
//     tick();
//     comp.searchQuery = 'zzzznotfound'; comp.applyFilter();
//     expect(comp.filteredEvents.length).toBe(0);
//   }));

//   // ── Modal open/close ──────────────────────────────────────
//   it('openCreate sets showModal = true', () => {
//     comp.openCreate(); expect(comp.showModal).toBeTrue();
//   });

//   it('openCreate sets editMode = false', () => {
//     comp.openCreate(); expect(comp.editMode).toBeFalse();
//   });

//   it('openCreate resets form', () => {
//     comp.form.get('title')?.setValue('Old Value');
//     comp.openCreate();
//     expect(comp.form.get('title')?.value).toBe('');
//   });

//   it('openEdit sets editMode = true', fakeAsync(() => {
//     tick();
//     comp.openEdit(mockEvents[0] as any);
//     expect(comp.editMode).toBeTrue();
//   }));

//   it('openEdit sets editId', fakeAsync(() => {
//     tick();
//     comp.openEdit(mockEvents[0] as any);
//     expect(comp.editId).toBe(1);
//   }));

//   it('openEdit patches form with event values', fakeAsync(() => {
//     tick();
//     comp.openEdit(mockEvents[0] as any);
//     expect(comp.form.get('title')?.value).toBe('AI Conference');
//   }));

//   it('closeModal sets showModal = false', () => {
//     comp.showModal = true;
//     comp.closeModal();
//     expect(comp.showModal).toBeFalse();
//   });

//   it('closeModal clears error', () => {
//     comp.error = 'some error';
//     comp.closeModal();
//     expect(comp.error).toBe('');
//   });

//   // ── Create ────────────────────────────────────────────────
//   it('save with invalid form marks all touched', () => {
//     comp.openCreate();
//     comp.save();
//     expect(comp.form.touched).toBeTrue();
//   });

//   it('save creates event when form valid and not editMode', fakeAsync(() => {
//     comp.openCreate();
//     comp.form.setValue({
//       title: 'New', description: '', eventType: 'Conference', mode: 'Online',
//       department: 'Engineering', eventDate: new Date(Date.now() + 86400000).toISOString().slice(0,16),
//       durationHours: 2, speakerRating: 4, reminderSent: false,
//       pastAttendanceRate: 0.7, weather: 'Clear', ticketPrice: 0, locationCapacity: 100
//     });
//     comp.save();
//     tick();
//     expect(mockEventSvc.create).toHaveBeenCalled();
//   }));

//   it('save updates event when editMode = true', fakeAsync(() => {
//     tick();
//     comp.openEdit(mockEvents[0] as any);
//     comp.form.get('title')?.setValue('Updated Title');
//     comp.save();
//     tick();
//     expect(mockEventSvc.update).toHaveBeenCalledWith(1, jasmine.anything());
//   }));

//   it('successful save shows toast', fakeAsync(() => {
//     comp.openCreate();
//     comp.form.setValue({
//       title: 'Toast Test', description: '', eventType: 'Conference', mode: 'Online',
//       department: 'Engineering', eventDate: new Date(Date.now() + 86400000).toISOString().slice(0,16),
//       durationHours: 2, speakerRating: 4, reminderSent: false,
//       pastAttendanceRate: 0.7, weather: 'Clear', ticketPrice: 0, locationCapacity: 100
//     });
//     comp.save(); tick();
//     expect(mockToast.success).toHaveBeenCalled();
//   }));

//   it('save error sets error message', fakeAsync(() => {
//     mockEventSvc.create.and.returnValue(throwError(() => ({ error: { message: 'Failed' } })));
//     comp.openCreate();
//     comp.form.setValue({
//       title: 'Err', description: '', eventType: 'Conference', mode: 'Online',
//       department: 'Engineering', eventDate: new Date(Date.now() + 86400000).toISOString().slice(0,16),
//       durationHours: 2, speakerRating: 4, reminderSent: false,
//       pastAttendanceRate: 0.7, weather: 'Clear', ticketPrice: 0, locationCapacity: 100
//     });
//     comp.save(); tick();
//     expect(comp.error).toBe('Failed');
//   }));

//   // ── Delete ────────────────────────────────────────────────
//   it('confirmDelete sets deleteConfirmId', () => {
//     comp.confirmDelete(1);
//     expect(comp.deleteConfirmId).toBe(1);
//   });

//   it('cancelDelete clears deleteConfirmId', () => {
//     comp.deleteConfirmId = 1;
//     comp.cancelDelete();
//     expect(comp.deleteConfirmId).toBeNull();
//   });

//   it('deleteEvent calls eventSvc.delete', fakeAsync(() => {
//     comp.deleteConfirmId = 1;
//     comp.deleteEvent(); tick();
//     expect(mockEventSvc.delete).toHaveBeenCalledWith(1);
//   }));

//   it('deleteEvent shows toast', fakeAsync(() => {
//     comp.deleteConfirmId = 1;
//     comp.deleteEvent(); tick();
//     expect(mockToast.info).toHaveBeenCalled();
//   }));

//   it('deleteEvent clears deleteConfirmId', fakeAsync(() => {
//     comp.deleteConfirmId = 1;
//     comp.deleteEvent(); tick();
//     expect(comp.deleteConfirmId).toBeNull();
//   }));

//   // ── Register ─────────────────────────────────────────────
//   it('registerForEvent calls regSvc.register', fakeAsync(() => {
//     comp.registerForEvent(mockEvents[0] as any); tick();
//     expect(mockRegSvc.register).toHaveBeenCalledWith({ eventId: 1, pastUserAttendanceRate: 0.7 });
//   }));

//   it('registerForEvent shows success toast', fakeAsync(() => {
//     comp.registerForEvent(mockEvents[0] as any); tick();
//     expect(mockToast.success).toHaveBeenCalled();
//   }));

//   // ── Helpers ───────────────────────────────────────────────
//   it('getTypeIcon returns 🏛️ for Conference', () => {
//     expect(comp.getTypeIcon('Conference')).toBe('🏛️');
//   });

//   it('getTypeIcon returns 📅 for unknown type', () => {
//     expect(comp.getTypeIcon('Unknown')).toBe('📅');
//   });

//   it('getModeClass returns badge-info for Online', () => {
//     expect(comp.getModeClass('Online')).toBe('badge-info');
//   });

//   it('getCapacityPct returns correct percentage', () => {
//     const ev = { activeRegistrations: 50, locationCapacity: 100 } as any;
//     expect(comp.getCapacityPct(ev)).toBe(50);
//   });

//   it('getCapacityPct caps at 100', () => {
//     const ev = { activeRegistrations: 200, locationCapacity: 100 } as any;
//     expect(comp.getCapacityPct(ev)).toBe(100);
//   });

//   it('getDaysUntil returns "Ended" for past date', () => {
//     const past = new Date(Date.now() - 86400000 * 3).toISOString();
//     expect(comp.getDaysUntil(past)).toBe('Ended');
//   });

//   it('getDaysUntil returns "Today" for today', () => {
//     const today = new Date().toISOString();
//     expect(comp.getDaysUntil(today)).toBe('Today');
//   });

//   it('formatDate returns string containing year', () => {
//     const result = comp.formatDate(mockEvents[0].eventDate);
//     expect(result).toContain('2026');
//   });

//   it('getRatingStars returns 5 chars for rating 5', () => {
//     expect(comp.getRatingStars(5).length).toBeGreaterThan(0);
//   });

//   // ── Stats getters ─────────────────────────────────────────
//   it('totalEvents returns count of events', fakeAsync(() => {
//     tick(); expect(comp.totalEvents).toBe(2);
//   }));

//   it('onlineCount returns count of Online events', fakeAsync(() => {
//     tick(); expect(comp.onlineCount).toBe(1);
//   }));

//   it('form getter returns form controls', () => {
//     expect(comp.f['title']).toBeDefined();
//   });

//   // ── View mode ─────────────────────────────────────────────
//   it('starts with grid view mode', () => {
//     expect(comp.viewMode).toBe('grid');
//   });

//   it('view mode can be switched to list', () => {
//     comp.viewMode = 'list';
//     expect(comp.viewMode).toBe('list');
//   });
// });
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { Events } from '../../src/app/components/events/events';
import { EventService, RegistrationService } from '../../src/app/services/api.services';
import { AuthService } from '../../src/app/services/auth.service';
import { ToastService } from '../../src/app/services/toast.service';

const mockEvents = [
  { id: 1, title: 'AI Conference', mode: 'Online',  department: 'Engineering',
    eventType: 'Conference', eventDate: new Date(Date.now() + 86400000 * 10).toISOString(),
    durationHours: 2, speakerRating: 4.5, ticketPrice: 0, locationCapacity: 100,
    activeRegistrations: 20, pastAttendanceRate: 0.7, reminderSent: false, weather: 'Clear' },
  { id: 2, title: 'Sales Workshop', mode: 'Offline', department: 'Sales',
    eventType: 'Workshop', eventDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    durationHours: 3, speakerRating: 3.8, ticketPrice: 25, locationCapacity: 50,
    activeRegistrations: 10, pastAttendanceRate: 0.6, reminderSent: true, weather: 'Cloudy' }
];

const mockEventSvc = {
  getAll:  jasmine.createSpy('getAll').and.returnValue(of(mockEvents)),
  create:  jasmine.createSpy('create').and.returnValue(of({ id: 3, title: 'New Event', mode: 'Online', department: 'Engineering', eventType: 'Conference', eventDate: new Date().toISOString() })),
  update:  jasmine.createSpy('update').and.returnValue(of({ ...mockEvents[0], title: 'Updated' })),
  delete:  jasmine.createSpy('delete').and.returnValue(of({}))
};
const mockRegSvc = { register: jasmine.createSpy('register').and.returnValue(of({})) };
const mockAuth   = { isAdmin: true, currentUser: { fullName: 'Admin', role: 'Admin' } };
const mockToast  = {
  success: jasmine.createSpy('success'),
  info:    jasmine.createSpy('info'),
  error:   jasmine.createSpy('error')
};

describe('Events Component', () => {
  let comp: Events;
  let fix:  ComponentFixture<Events>;

  beforeEach(async () => {
    [mockEventSvc.getAll, mockEventSvc.create, mockEventSvc.update,
     mockEventSvc.delete, mockRegSvc.register,
     mockToast.success, mockToast.info, mockToast.error].forEach((s: jasmine.Spy) => s.calls.reset());
    mockEventSvc.getAll.and.returnValue(of(mockEvents));
    mockEventSvc.create.and.returnValue(of({ id: 3, title: 'New Event', mode: 'Online', department: 'Engineering', eventType: 'Conference', eventDate: new Date().toISOString() }));
    mockEventSvc.update.and.returnValue(of({ ...mockEvents[0], title: 'Updated' }));
    mockEventSvc.delete.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports:   [Events, ReactiveFormsModule, FormsModule, RouterTestingModule],
      providers: [
        { provide: EventService,        useValue: mockEventSvc },
        { provide: RegistrationService, useValue: mockRegSvc },
        { provide: AuthService,         useValue: mockAuth },
        { provide: ToastService,        useValue: mockToast }
      ]
    }).compileComponents();

    fix  = TestBed.createComponent(Events);
    comp = fix.componentInstance;
    fix.detectChanges();
  });

  it('should create', () => expect(comp).toBeTruthy());

  it('loads events on init', fakeAsync(() => {
    tick(); expect(mockEventSvc.getAll).toHaveBeenCalled();
  }));

  it('populates events after load', fakeAsync(() => {
    tick(); expect(comp.events.length).toBe(2);
  }));

  it('sets loading = false after load', fakeAsync(() => {
    tick(); expect(comp.loading).toBeFalse();
  }));

  it('applyFilter by mode Online returns only Online events', fakeAsync(() => {
    tick();
    comp.filterMode = 'Online'; comp.applyFilter();
    expect(comp.filteredEvents.every((e: any) => e.mode === 'Online')).toBeTrue();
  }));

  it('applyFilter All returns all events', fakeAsync(() => {
    tick();
    comp.filterMode = 'All'; comp.applyFilter();
    expect(comp.filteredEvents.length).toBe(2);
  }));

  it('applyFilter by searchQuery filters by title', fakeAsync(() => {
    tick();
    comp.searchQuery = 'AI'; comp.applyFilter();
    expect(comp.filteredEvents.length).toBe(1);
  }));

  it('openCreate sets showModal = true', () => {
    comp.openCreate(); expect(comp.showModal).toBeTrue();
  });

  it('openCreate sets editMode = false', () => {
    comp.openCreate(); expect(comp.editMode).toBeFalse();
  });

  it('openEdit sets editMode = true', fakeAsync(() => {
    tick();
    comp.openEdit(mockEvents[0] as any);
    expect(comp.editMode).toBeTrue();
  }));

  it('openEdit sets editId', fakeAsync(() => {
    tick();
    comp.openEdit(mockEvents[0] as any);
    expect(comp.editId).toBe(1);
  }));

  it('closeModal sets showModal = false', () => {
    comp.showModal = true; comp.closeModal();
    expect(comp.showModal).toBeFalse();
  });

  it('save with invalid form marks all touched', () => {
    comp.openCreate(); comp.save();
    expect(comp.form.touched).toBeTrue();
  });

  it('save updates event when editMode = true', fakeAsync(() => {
    tick();
    comp.openEdit(mockEvents[0] as any);
    comp.form.get('title')?.setValue('Updated Title');
    comp.save(); tick();
    expect(mockEventSvc.update).toHaveBeenCalledWith(1, jasmine.anything());
  }));

  it('confirmDelete sets deleteConfirmId', () => {
    comp.confirmDelete(1);
    expect(comp.deleteConfirmId).toBe(1);
  });

  it('cancelDelete clears deleteConfirmId', () => {
    comp.deleteConfirmId = 1; comp.cancelDelete();
    expect(comp.deleteConfirmId).toBeNull();
  });

  it('deleteEvent calls eventSvc.delete', fakeAsync(() => {
    comp.deleteConfirmId = 1;
    comp.deleteEvent(); tick();
    expect(mockEventSvc.delete).toHaveBeenCalledWith(1);
  }));

  it('getModeClass returns badge-info for Online', () => {
    expect(comp.getModeClass('Online')).toBe('badge-info');
  });

  it('getCapacityPct returns correct percentage', () => {
    const ev = { activeRegistrations: 50, locationCapacity: 100 } as any;
    expect(comp.getCapacityPct(ev)).toBe(50);
  });

  it('getDaysUntil returns Today for today', () => {
    expect(comp.getDaysUntil(new Date().toISOString())).toBe('Today');
  });

  it('totalEvents returns count', fakeAsync(() => {
    tick(); expect(comp.totalEvents).toBe(2);
  }));

  it('viewMode starts as grid', () => expect(comp.viewMode).toBe('grid'));
});
