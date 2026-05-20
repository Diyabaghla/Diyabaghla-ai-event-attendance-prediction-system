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
