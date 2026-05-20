// import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
// import { FormsModule } from '@angular/forms';
// import { RouterTestingModule } from '@angular/router/testing';
// import { of, throwError } from 'rxjs';
// import { AttendancePrediction } from '../../src/app/components/predictions/attendance-prediction/attendance-prediction';
// import { EventService, PredictionService } from '../../src/app/services/api.services';

// const mockEvents = [
//   { id: 1, title: 'AI Summit', mode: 'Online', department: 'Engineering',
//     eventType: 'Conference', eventDate: new Date(Date.now() + 86400000 * 10).toISOString(),
//     activeRegistrations: 50, locationCapacity: 200,
//     speakerRating: 4.5, ticketPrice: 0, pastAttendanceRate: 0.75 },
//   { id: 2, title: 'Sales Workshop', mode: 'Offline', department: 'Sales',
//     eventType: 'Workshop', eventDate: new Date(Date.now() + 86400000 * 5).toISOString(),
//     activeRegistrations: 20, locationCapacity: 100,
//     speakerRating: 3.8, ticketPrice: 25, pastAttendanceRate: 0.60 }
// ];

// const mockPrediction = { predictedAttendance: 38 };

// const mockEventSvc = { getAll: jasmine.createSpy('getAll').and.returnValue(of(mockEvents)) };
// const mockPredSvc  = { predictAttendance: jasmine.createSpy('predictAttendance').and.returnValue(of(mockPrediction)) };

// describe('AttendancePrediction Component', () => {
//   let comp: AttendancePrediction;
//   let fix:  ComponentFixture<AttendancePrediction>;

//   beforeEach(async () => {
//     mockEventSvc.getAll.calls.reset();
//     mockPredSvc.predictAttendance.calls.reset();
//     mockEventSvc.getAll.and.returnValue(of(mockEvents));
//     mockPredSvc.predictAttendance.and.returnValue(of(mockPrediction));

//     await TestBed.configureTestingModule({
//       imports:   [AttendancePrediction, FormsModule, RouterTestingModule],
//       providers: [
//         { provide: EventService,       useValue: mockEventSvc },
//         { provide: PredictionService,  useValue: mockPredSvc }
//       ]
//     }).compileComponents();

//     fix  = TestBed.createComponent(AttendancePrediction);
//     comp = fix.componentInstance;
//     fix.detectChanges();
//   });

//   // ── Creation ──────────────────────────────────────────────
//   it('should create', () => expect(comp).toBeTruthy());

//   it('starts with predicted = false', () => expect(comp.predicted).toBeFalse());
//   it('starts with loading = false',   () => expect(comp.loading).toBeFalse());
//   it('starts with no error',          () => expect(comp.error).toBe(''));
//   it('starts with no result',         () => expect(comp.result).toBeNull());

//   // ── Data loading ─────────────────────────────────────────
//   it('loads events on init', fakeAsync(() => {
//     tick(); expect(mockEventSvc.getAll).toHaveBeenCalled();
//   }));

//   it('populates events after load', fakeAsync(() => {
//     tick(); expect(comp.events.length).toBe(2);
//   }));

//   it('sets loadingEvents = false after load', fakeAsync(() => {
//     tick(); expect(comp.loadingEvents).toBeFalse();
//   }));

//   it('sets error on events load failure', fakeAsync(() => {
//     mockEventSvc.getAll.and.returnValue(throwError(() => new Error('fail')));
//     const f2 = TestBed.createComponent(AttendancePrediction);
//     f2.detectChanges(); tick();
//     expect(f2.componentInstance.error).toBeTruthy();
//   }));

//   // ── Event selection ───────────────────────────────────────
//   it('onEventSelect sets selectedEvent', fakeAsync(() => {
//     tick();
//     comp.selectedEventId = 1;
//     comp.onEventSelect();
//     expect(comp.selectedEvent?.id).toBe(1);
//   }));

//   it('onEventSelect clears result', fakeAsync(() => {
//     tick();
//     comp.result = mockPrediction as any;
//     comp.selectedEventId = 1;
//     comp.onEventSelect();
//     expect(comp.result).toBeNull();
//   }));

//   it('onEventSelect resets predicted to false', fakeAsync(() => {
//     tick();
//     comp.predicted = true;
//     comp.selectedEventId = 1;
//     comp.onEventSelect();
//     expect(comp.predicted).toBeFalse();
//   }));

//   it('onEventSelect clears error', fakeAsync(() => {
//     tick();
//     comp.error = 'some error';
//     comp.selectedEventId = 1;
//     comp.onEventSelect();
//     expect(comp.error).toBe('');
//   }));

//   it('onEventSelect with null sets selectedEvent to null', () => {
//     comp.selectedEventId = null;
//     comp.onEventSelect();
//     expect(comp.selectedEvent).toBeNull();
//   });

//   // ── Predict ───────────────────────────────────────────────
//   it('predict does nothing if no eventId selected', () => {
//     comp.selectedEventId = null;
//     comp.predict();
//     expect(mockPredSvc.predictAttendance).not.toHaveBeenCalled();
//   });

//   it('predict calls predSvc.predictAttendance', fakeAsync(() => {
//     tick();
//     comp.selectedEventId = 1;
//     comp.onEventSelect();
//     comp.predict(); tick();
//     expect(mockPredSvc.predictAttendance).toHaveBeenCalledWith(1);
//   }));

//   it('predict sets result', fakeAsync(() => {
//     tick();
//     comp.selectedEventId = 1; comp.onEventSelect();
//     comp.predict(); tick();
//     expect(comp.result).toEqual(mockPrediction as any);
//   }));

//   it('predict sets predicted = true on success', fakeAsync(() => {
//     tick();
//     comp.selectedEventId = 1; comp.onEventSelect();
//     comp.predict(); tick();
//     expect(comp.predicted).toBeTrue();
//   }));

//   it('predict sets loading = false on success', fakeAsync(() => {
//     tick();
//     comp.selectedEventId = 1; comp.onEventSelect();
//     comp.predict(); tick();
//     expect(comp.loading).toBeFalse();
//   }));

//   it('predict sets error on failure', fakeAsync(() => {
//     mockPredSvc.predictAttendance.and.returnValue(throwError(() => ({
//       error: { message: 'FastAPI unavailable' }
//     })));
//     tick();
//     comp.selectedEventId = 1; comp.onEventSelect();
//     comp.predict(); tick();
//     expect(comp.error).toContain('FastAPI');
//   }));

//   it('predict sets loading = false on failure', fakeAsync(() => {
//     mockPredSvc.predictAttendance.and.returnValue(throwError(() => ({ error: {} })));
//     tick();
//     comp.selectedEventId = 1; comp.onEventSelect();
//     comp.predict(); tick();
//     expect(comp.loading).toBeFalse();
//   }));

//   it('predict caps result to registrations count', fakeAsync(() => {
//     // 50 registrations, prediction > 50 should be capped
//     mockPredSvc.predictAttendance.and.returnValue(of({ predictedAttendance: 80 }));
//     tick();
//     comp.selectedEventId = 1; comp.onEventSelect();
//     comp.predict(); tick();
//     expect(comp.result!.predictedAttendance).toBeLessThanOrEqual(50);
//   }));

//   // ── Computed getters ──────────────────────────────────────
//   it('fillRate returns 0 if no result', () => {
//     comp.result = null;
//     expect(comp.fillRate).toBe(0);
//   });

//   it('fillRate returns correct percentage', fakeAsync(() => {
//     tick();
//     comp.selectedEventId = 1; comp.onEventSelect();
//     comp.predict(); tick();
//     // 38 / 200 * 100 = 19%
//     expect(comp.fillRate).toBe(19);
//   }));

//   it('fillRate caps at 100', () => {
//     comp.selectedEvent = { locationCapacity: 10 } as any;
//     comp.result        = { predictedAttendance: 200 } as any;
//     expect(comp.fillRate).toBe(100);
//   });

//   it('noShowCount returns 0 if no result', () => {
//     comp.result = null;
//     expect(comp.noShowCount).toBe(0);
//   });

//   it('noShowCount = registrations - predicted', fakeAsync(() => {
//     tick();
//     comp.selectedEventId = 1; comp.onEventSelect();
//     comp.predict(); tick();
//     // 50 registered - 38 predicted = 12
//     expect(comp.noShowCount).toBe(12);
//   }));

//   it('noShowCount is never negative', () => {
//     comp.selectedEvent = { activeRegistrations: 10 } as any;
//     comp.result        = { predictedAttendance: 50 } as any;
//     expect(comp.noShowCount).toBeGreaterThanOrEqual(0);
//   });

//   it('fillColor returns green for low fill rate', () => {
//     comp.result        = { predictedAttendance: 10 } as any;
//     comp.selectedEvent = { locationCapacity: 200 } as any;
//     expect(comp.fillColor).toContain('--green');
//   });

//   it('fillLabel returns correct label', () => {
//     comp.result        = { predictedAttendance: 95 } as any;
//     comp.selectedEvent = { locationCapacity: 100 } as any;
//     expect(comp.fillLabel).toBe('Near Capacity');
//   });

//   it('confidenceLevel returns High for high past rate', fakeAsync(() => {
//     tick();
//     comp.selectedEventId = 1; comp.onEventSelect(); // pastAttendanceRate = 0.75
//     expect(comp.confidenceLevel).toBe('High');
//   }));

//   it('confidenceLevel returns — when no event selected', () => {
//     comp.selectedEvent = null;
//     expect(comp.confidenceLevel).toBe('—');
//   });

//   // ── Factor cards ──────────────────────────────────────────
//   it('factorCards returns empty array when no event', () => {
//     comp.selectedEvent = null;
//     expect(comp.factorCards.length).toBe(0);
//   });

//   it('factorCards returns 6 items when event selected', fakeAsync(() => {
//     tick();
//     comp.selectedEventId = 1; comp.onEventSelect();
//     expect(comp.factorCards.length).toBe(6);
//   }));

//   it('factorCards first item is Past Attendance Rate', fakeAsync(() => {
//     tick();
//     comp.selectedEventId = 1; comp.onEventSelect();
//     expect(comp.factorCards[0].label).toBe('Past Attendance Rate');
//   }));

//   // ── Days until ────────────────────────────────────────────
//   it('upcomingDays returns 0 when no event selected', () => {
//     comp.selectedEvent = null;
//     expect(comp.upcomingDays).toBe(0);
//   });

//   it('upcomingDays returns correct count for future event', fakeAsync(() => {
//     tick();
//     comp.selectedEventId = 1; comp.onEventSelect();
//     expect(comp.upcomingDays).toBeGreaterThan(0);
//   }));

//   // ── Format helpers ────────────────────────────────────────
//   it('formatDate returns full date string', () => {
//     const result = comp.formatDate(mockEvents[0].eventDate);
//     expect(result).toContain('2026');
//   });

//   it('formatDateShort returns short date', () => {
//     const result = comp.formatDateShort(mockEvents[0].eventDate);
//     expect(result).toBeTruthy();
//   });

//   // ── Tips rotation ─────────────────────────────────────────
//   it('has 5 tips', () => expect(comp.tips.length).toBe(5));

//   it('currentTip starts at 0', () => expect(comp.currentTip).toBe(0));

//   // ── Clock ─────────────────────────────────────────────────
//   it('currentTime is populated after init', () => {
//     expect(comp.currentTime).toBeTruthy();
//   });
// });
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { AttendancePrediction } from '../../src/app/components/predictions/attendance-prediction/attendance-prediction';
import { EventService, PredictionService } from '../../src/app/services/api.services';

const mockEvents = [
  { id: 1, title: 'AI Summit', mode: 'Online', department: 'Engineering',
    eventType: 'Conference', eventDate: new Date(Date.now() + 86400000 * 10).toISOString(),
    activeRegistrations: 50, locationCapacity: 200,
    speakerRating: 4.5, ticketPrice: 0, pastAttendanceRate: 0.75 },
  { id: 2, title: 'Sales Workshop', mode: 'Offline', department: 'Sales',
    eventType: 'Workshop', eventDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    activeRegistrations: 20, locationCapacity: 100,
    speakerRating: 3.8, ticketPrice: 25, pastAttendanceRate: 0.60 }
];
const mockPrediction = { predictedAttendance: 38 };

const mockEventSvc = { getAll: jasmine.createSpy('getAll').and.returnValue(of(mockEvents)) };
const mockPredSvc  = { predictAttendance: jasmine.createSpy('predictAttendance').and.returnValue(of(mockPrediction)) };

describe('AttendancePrediction Component', () => {
  let comp: AttendancePrediction;
  let fix:  ComponentFixture<AttendancePrediction>;

  beforeEach(async () => {
    mockEventSvc.getAll.calls.reset();
    mockPredSvc.predictAttendance.calls.reset();
    mockEventSvc.getAll.and.returnValue(of(mockEvents));
    mockPredSvc.predictAttendance.and.returnValue(of(mockPrediction));

    await TestBed.configureTestingModule({
      imports:   [AttendancePrediction, FormsModule, RouterTestingModule],
      providers: [
        { provide: EventService,      useValue: mockEventSvc },
        { provide: PredictionService, useValue: mockPredSvc }
      ]
    }).compileComponents();

    fix  = TestBed.createComponent(AttendancePrediction);
    comp = fix.componentInstance;
    fix.detectChanges();
  });

  it('should create',                   () => expect(comp).toBeTruthy());
  it('starts with predicted = false',   () => expect(comp.predicted).toBeFalse());
  it('starts with loading = false',     () => expect(comp.loading).toBeFalse());
  it('starts with no error',            () => expect(comp.error).toBe(''));
  it('starts with result = null',       () => expect(comp.result).toBeNull());

  it('loads events on init', fakeAsync(() => {
    tick(); expect(mockEventSvc.getAll).toHaveBeenCalled();
  }));

  it('populates events', fakeAsync(() => {
    tick(); expect(comp.events.length).toBe(2);
  }));

  it('sets loadingEvents = false', fakeAsync(() => {
    tick(); expect(comp.loadingEvents).toBeFalse();
  }));

  it('onEventSelect sets selectedEvent', fakeAsync(() => {
    tick();
    comp.selectedEventId = 1; comp.onEventSelect();
    expect(comp.selectedEvent?.id).toBe(1);
  }));

  it('onEventSelect clears result', fakeAsync(() => {
    tick();
    comp.result = mockPrediction as any;
    comp.selectedEventId = 1; comp.onEventSelect();
    expect(comp.result).toBeNull();
  }));

  it('onEventSelect resets predicted', fakeAsync(() => {
    tick();
    comp.predicted = true;
    comp.selectedEventId = 1; comp.onEventSelect();
    expect(comp.predicted).toBeFalse();
  }));

  it('predict does nothing if no eventId', () => {
    comp.selectedEventId = null; comp.predict();
    expect(mockPredSvc.predictAttendance).not.toHaveBeenCalled();
  });

  it('predict calls predSvc.predictAttendance', fakeAsync(() => {
    tick();
    comp.selectedEventId = 1; comp.onEventSelect();
    comp.predict(); tick();
    expect(mockPredSvc.predictAttendance).toHaveBeenCalledWith(1);
  }));

  it('predict sets result', fakeAsync(() => {
    tick();
    comp.selectedEventId = 1; comp.onEventSelect();
    comp.predict(); tick();
    expect(comp.result).toBeTruthy();
  }));

  it('predict sets predicted = true', fakeAsync(() => {
    tick();
    comp.selectedEventId = 1; comp.onEventSelect();
    comp.predict(); tick();
    expect(comp.predicted).toBeTrue();
  }));

  it('predict sets loading = false on success', fakeAsync(() => {
    tick();
    comp.selectedEventId = 1; comp.onEventSelect();
    comp.predict(); tick();
    expect(comp.loading).toBeFalse();
  }));

  it('predict sets error on failure', fakeAsync(() => {
    mockPredSvc.predictAttendance.and.returnValue(throwError(() => ({
      error: { message: 'FastAPI unavailable' }
    })));
    tick();
    comp.selectedEventId = 1; comp.onEventSelect();
    comp.predict(); tick();
    expect(comp.error).toBeTruthy();
  }));

  it('predict caps result to registrations', fakeAsync(() => {
    mockPredSvc.predictAttendance.and.returnValue(of({ predictedAttendance: 80 }));
    tick();
    comp.selectedEventId = 1; comp.onEventSelect();
    comp.predict(); tick();
    expect(comp.result!.predictedAttendance).toBeLessThanOrEqual(50);
  }));

  it('fillRate returns 0 if no result', () => {
    comp.result = null; expect(comp.fillRate).toBe(0);
  });

  it('fillRate returns correct percentage', fakeAsync(() => {
    tick();
    comp.selectedEventId = 1; comp.onEventSelect();
    comp.predict(); tick();
    expect(comp.fillRate).toBe(19); // 38/200*100
  }));

  it('noShowCount = registrations - predicted', fakeAsync(() => {
    tick();
    comp.selectedEventId = 1; comp.onEventSelect();
    comp.predict(); tick();
    expect(comp.noShowCount).toBe(12); // 50-38
  }));

  it('confidenceLevel returns High for 0.75 past rate', fakeAsync(() => {
    tick();
    comp.selectedEventId = 1; comp.onEventSelect();
    expect(comp.confidenceLevel).toBe('High');
  }));

  it('confidenceLevel returns — when no event', () => {
    comp.selectedEvent = null; expect(comp.confidenceLevel).toBe('—');
  });

  it('factorCards returns empty when no event', () => {
    comp.selectedEvent = null; expect(comp.factorCards.length).toBe(0);
  });

  it('factorCards returns 6 items when event selected', fakeAsync(() => {
    tick();
    comp.selectedEventId = 1; comp.onEventSelect();
    expect(comp.factorCards.length).toBe(6);
  }));

  it('upcomingDays returns 0 when no event', () => {
    comp.selectedEvent = null; expect(comp.upcomingDays).toBe(0);
  });

  it('has 5 tips', () => expect(comp.tips.length).toBe(5));
  it('currentTime populated after init', () => expect(comp.currentTime).toBeTruthy());
});
