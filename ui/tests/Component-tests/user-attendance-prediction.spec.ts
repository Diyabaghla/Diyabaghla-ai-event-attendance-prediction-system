// import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
// import { FormsModule } from '@angular/forms';
// import { RouterTestingModule } from '@angular/router/testing';
// import { of, throwError } from 'rxjs';
// import { UserAttendancePrediction } from '../../src/app/components/predictions/user-attendance-prediction/user-attendance-prediction';
// import { EventService, PredictionService } from '../../src/app/services/api.services';

// const mockEvents = [
//   { id: 1, title: 'AI Summit', mode: 'Online', department: 'Engineering',
//     eventType: 'Conference', eventDate: new Date(Date.now() + 86400000 * 10).toISOString(),
//     activeRegistrations: 50, locationCapacity: 200,
//     speakerRating: 4.5, ticketPrice: 0, pastAttendanceRate: 0.75 },
//   { id: 2, title: 'Sales Workshop', mode: 'Offline', department: 'Sales',
//     eventType: 'Workshop', eventDate: new Date(Date.now() + 86400000 * 5).toISOString(),
//     activeRegistrations: 20, locationCapacity: 100,
//     speakerRating: 3.2, ticketPrice: 50, pastAttendanceRate: 0.40 }
// ];

// const mockHighResult = { probability: 0.87 };
// const mockLowResult  = { probability: 0.22 };

// const mockEventSvc = { getAll: jasmine.createSpy('getAll').and.returnValue(of(mockEvents)) };
// const mockPredSvc  = { predictUserAttendance: jasmine.createSpy('predictUserAttendance').and.returnValue(of(mockHighResult)) };

// describe('UserAttendancePrediction Component', () => {
//   let comp: UserAttendancePrediction;
//   let fix:  ComponentFixture<UserAttendancePrediction>;

//   beforeEach(async () => {
//     mockEventSvc.getAll.calls.reset();
//     mockPredSvc.predictUserAttendance.calls.reset();
//     mockEventSvc.getAll.and.returnValue(of(mockEvents));
//     mockPredSvc.predictUserAttendance.and.returnValue(of(mockHighResult));

//     await TestBed.configureTestingModule({
//       imports:   [UserAttendancePrediction, FormsModule, RouterTestingModule],
//       providers: [
//         { provide: EventService,      useValue: mockEventSvc },
//         { provide: PredictionService, useValue: mockPredSvc }
//       ]
//     }).compileComponents();

//     fix  = TestBed.createComponent(UserAttendancePrediction);
//     comp = fix.componentInstance;
//     fix.detectChanges();
//   });

//   // ── Creation ──────────────────────────────────────────────
//   it('should create', () => expect(comp).toBeTruthy());
//   it('starts with predicted = false', () => expect(comp.predicted).toBeFalse());
//   it('starts with loading = false',   () => expect(comp.loading).toBeFalse());
//   it('starts with no error',          () => expect(comp.error).toBe(''));
//   it('starts with no result',         () => expect(comp.result).toBeNull());
//   // it('starts with displayProb = 0',   () => expect(comp.displayProb).toBe(0));

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

//   it('sets error on load failure', fakeAsync(() => {
//     mockEventSvc.getAll.and.returnValue(throwError(() => new Error('fail')));
//     const f2 = TestBed.createComponent(UserAttendancePrediction);
//     f2.detectChanges(); tick();
//     expect(f2.componentInstance.error).toBeTruthy();
//   }));

//   // ── Event selection ───────────────────────────────────────
//   it('onSelect clears result', fakeAsync(() => {
//     tick();
//     comp.result = mockHighResult as any;
//     comp.selectedEventId = 1;
//     comp.onSelect();
//     expect(comp.result).toBeNull();
//   }));

//   it('onSelect resets predicted', fakeAsync(() => {
//     tick();
//     comp.predicted = true;
//     comp.selectedEventId = 1;
//     comp.onSelect();
//     expect(comp.predict).toBeFalse();
//   }));

//   it('onSelect clears error', fakeAsync(() => {
//     tick();
//     comp.error = 'old error';
//     comp.selectedEventId = 1;
//     comp.onSelect();
//     expect(comp.error).toBe('');
//   }));

//   // ── Predict ───────────────────────────────────────────────
//   it('predict does nothing if no eventId', () => {
//     comp.selectedEventId = null;
//     comp.predict();
//     expect(mockPredSvc.predictUserAttendance).not.toHaveBeenCalled();
//   });

//   it('predict calls predSvc.predictUserAttendance', fakeAsync(() => {
//     tick();
//     comp.selectedEventId = 1; comp.onSelect();
//     comp.predict(); tick();
//     expect(mockPredSvc.predictUserAttendance).toHaveBeenCalledWith(1);
//   }));

//   it('predict sets result on success', fakeAsync(() => {
//     tick();
//     comp.selectedEventId = 1; comp.onSelect();
//     comp.predict(); tick();
//     expect(comp.result).toEqual(mockHighResult as any);
//   }));

//   it('predict sets predicted = true on success', fakeAsync(() => {
//     tick();
//     comp.selectedEventId = 1; comp.onSelect();
//     comp.predict(); tick();
//     expect(comp.predicted).toBeTrue();
//   }));

//   it('predict sets loading = false on success', fakeAsync(() => {
//     tick();
//     comp.selectedEventId = 1; comp.onSelect();
//     comp.predict(); tick();
//     expect(comp.loading).toBeFalse();
//   }));

//   it('predict sets error on failure', fakeAsync(() => {
//     mockPredSvc.predictUserAttendance.and.returnValue(
//       throwError(() => ({ error: { message: 'FastAPI unavailable' } })));
//     tick();
//     comp.selectedEventId = 1; comp.onSelect();
//     comp.predict(); tick();
//     expect(comp.error).toBeTruthy();
//   }));

//   it('predict resets loading on failure', fakeAsync(() => {
//     mockPredSvc.predictUserAttendance.and.returnValue(throwError(() => ({ error: {} })));
//     tick();
//     comp.selectedEventId = 1; comp.onSelect();
//     comp.predict(); tick();
//     expect(comp.loading).toBeFalse();
//   }));

//   // ── Computed getters ──────────────────────────────────────
//   it('probabilityPct returns 0 when no result', () => {
//     comp.result = null;
//     expect(comp.probabilityPct).toBe(0);
//   });

//   it('probabilityPct returns correct rounded value', fakeAsync(() => {
//     tick();
//     comp.selectedEventId = 1; comp.onSelect();
//     comp.predict(); tick();
//     expect(comp.probabilityPct).toBe(87);
//   }));

//   it('probabilityLabel returns Very Likely for 80%+', fakeAsync(() => {
//     tick();
//     comp.selectedEventId = 1; comp.onSelect();
//     comp.predict(); tick();
//     expect(comp.probabilityLevel).toBe('Very Likely');
//   }));

//   it('probabilityLabel returns Likely for 60-79%', () => {
//     comp.result = { probability: 0.70 } as any;
//     expect(comp.probabilityLevel).toBe('Likely');
//   });

//   it('probabilityLabel returns Uncertain for 40-59%', () => {
//     comp.result = { probability: 0.50 } as any;
//     expect(comp.probabilityLevel).toBe('Uncertain');
//   });

//   it('probabilityLabel returns Unlikely for 20-39%', () => {
//     comp.result = { probability: 0.30 } as any;
//     expect(comp.probabilityLevel).toBe('Unlikely');
//   });

//   it('probabilityLabel returns Very Unlikely for < 20%', fakeAsync(() => {
//     mockPredSvc.predictUserAttendance.and.returnValue(of(mockLowResult));
//     tick();
//     comp.selectedEventId = 1; comp.onSelect();
//     comp.predict(); tick();
//     expect(comp.probabilityLevel).toBe('Unlikely');
//   }));

//   it('probabilityColor returns hex string', fakeAsync(() => {
//     tick();
//     comp.selectedEventId = 1; comp.onSelect();
//     comp.predict(); tick();
//     expect(comp.probabilityPct).toMatch(/^#[0-9a-f]{6}$/i);
//   }));

//   it('probabilityDesc returns non-empty string', fakeAsync(() => {
//     tick();
//     comp.selectedEventId = 1; comp.onSelect();
//     comp.predict(); tick();
//     expect(comp.probabilityPct).toBeTruthy();
//   }));

//   // ── currentBand ───────────────────────────────────────────
//   it('currentBand returns 4 for high probability', fakeAsync(() => {
//     tick();
//     comp.selectedEventId = 1; comp.onSelect();
//     comp.predict(); tick();
//     expect(comp.currentBand).toBe(4);
//   }));

//   it('currentBand returns 1 for low probability', fakeAsync(() => {
//     mockPredSvc.predictUserAttendance.and.returnValue(of({ probability: 0.25 }));
//     tick();
//     comp.selectedEventId = 1; comp.onSelect();
//     comp.predict(); tick();
//     expect(comp.currentBand).toBe(1);
//   }));

//   // ── selectedBandItem ──────────────────────────────────────
//   it('selectedBandItem returns correct band', fakeAsync(() => {
//     tick();
//     comp.selectedEventId = 1; comp.onSelect();
//     comp.predict(); tick();
//     expect(comp.selectedBandItem?.label).toBe('Very Likely');
//   }));

//   // ── Improvement tips ──────────────────────────────────────
//   it('improvementTips returns empty when no event', () => {
//     comp.selectedEvent = null;
//     expect(comp.improvementTips.length).toBe(0);
//   });

//   it('improvementTips returns max 4 items', fakeAsync(() => {
//     tick();
//     comp.selectedEventId = 2; comp.onSelect();
//     comp.predict(); tick();
//     expect(comp.improvementTips.length).toBeLessThanOrEqual(4);
//   }));

//   it('improvementTips includes registration tip', fakeAsync(() => {
//     tick();
//     comp.selectedEventId = 1; comp.onSelect();
//     const tips = comp.improvementTips.map(t => t.tip);
//     expect(tips.some(t => t.toLowerCase().includes('register'))).toBeTrue();
//   }));

//   it('each improvement tip has icon, tip, impact', fakeAsync(() => {
//     tick();
//     comp.selectedEventId = 1; comp.onSelect();
//     comp.predict(); tick();
//     comp.improvementTips.forEach(t => {
//       expect(t.icon).toBeTruthy();
//       expect(t.tip).toBeTruthy();
//       expect(t.impact).toBeTruthy();
//     });
//   }));

//   // ── Probability bands ─────────────────────────────────────
//   it('probabilityBands has 5 items', () => {
//     expect(comp.probabilityBands.length).toBe(5);
//   });

//   it('each band has label, range, color, icon', () => {
//     comp.probabilityBands.forEach(b => {
//       expect(b.label).toBeTruthy();
//       expect(b.range).toBeTruthy();
//       expect(b.color).toMatch(/^#/);
//       expect(b.icon).toBeTruthy();
//     });
//   });

//   // ── selectedEvent getter ──────────────────────────────────
//   it('selectedEvent returns null when no id selected', () => {
//     comp.selectedEventId = null;
//     expect(comp.selectedEvent).toBeUndefined();
//   });

//   it('selectedEvent returns correct event', fakeAsync(() => {
//     tick();
//     comp.selectedEventId = 1; comp.onSelect();
//     expect(comp.selectedEvent?.title).toBe('AI Summit');
//   }));

//   // ── daysUntil ─────────────────────────────────────────────
//   it('daysUntil returns 0 when no event', () => {
//     comp.selectedEvent = null;
//     expect(comp.daysUntil).toBe(0);
//   });

//   it('daysUntil > 0 for future event', fakeAsync(() => {
//     tick();
//     comp.selectedEventId = 1; comp.onSelect();
//     expect(comp.daysUntil).toBeGreaterThan(0);
//   }));

//   // ── Helpers ───────────────────────────────────────────────
//   it('getColor returns green for high prob', () => {
//     expect(comp.getColor(0.90)).toBe('#10b981');
//   });

//   it('getColor returns red for low prob', () => {
//     expect(comp.getColor(0.10)).toBe('#f43f5e');
//   });

//   it('formatDateShort returns date string', () => {
//     const result = comp.formatDateShort(mockEvents[0].eventDate);
//     expect(typeof result).toBe('string');
//     expect(result).toBeTruthy();
//   });

//   it('currentTime populated after init', () => {
//     expect(comp.currentTime).toBeTruthy();
//   });

//   it('tips has 5 items', () => expect(comp.tips.length).toBe(5));
//   it('currentTip starts at 0', () => expect(comp.currentTip).toBe(0));

//   // ── History simulated ─────────────────────────────────────
//   it('historySimulated has 7 items', () => {
//     expect(comp.historySimulated.length).toBe(7);
//   });

//   it('last historySimulated item updated after predict', fakeAsync(() => {
//     tick();
//     comp.selectedEventId = 1; comp.onSelect();
//     comp.predict(); tick();
//     const last = comp.historySimulated[comp.historySimulated.length - 1];
//     expect(last.prob).toBe(0.87);
//   }));
// });
// import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
// import { FormsModule } from '@angular/forms';
// import { RouterTestingModule } from '@angular/router/testing';
// import { of, throwError } from 'rxjs';
// import { UserAttendancePrediction } from '../../src/app/components/predictions/user-attendance-prediction/user-attendance-prediction';
// import { EventService, PredictionService } from '../../src/app/services/api.services';

// const mockEvents = [
//   { id: 1, title: 'AI Summit', mode: 'Online', department: 'Engineering',
//     eventType: 'Conference', eventDate: new Date(Date.now() + 86400000 * 10).toISOString(),
//     activeRegistrations: 50, locationCapacity: 200,
//     speakerRating: 4.5, ticketPrice: 0, pastAttendanceRate: 0.75 },
//   { id: 2, title: 'Sales Workshop', mode: 'Offline', department: 'Sales',
//     eventType: 'Workshop', eventDate: new Date(Date.now() + 86400000 * 5).toISOString(),
//     activeRegistrations: 20, locationCapacity: 100,
//     speakerRating: 3.2, ticketPrice: 50, pastAttendanceRate: 0.40 }
// ];

// const mockHighResult = { probability: 0.87 };
// const mockLowResult  = { probability: 0.22 };

// const mockEventSvc = { getAll: jasmine.createSpy('getAll').and.returnValue(of(mockEvents)) };
// const mockPredSvc  = { predictUserAttendance: jasmine.createSpy('predictUserAttendance').and.returnValue(of(mockHighResult)) };

// describe('UserAttendancePrediction Component', () => {
//   let comp: UserAttendancePrediction;
//   let fix:  ComponentFixture<UserAttendancePrediction>;

//   beforeEach(async () => {
//     mockEventSvc.getAll.calls.reset();
//     mockPredSvc.predictUserAttendance.calls.reset();
//     mockEventSvc.getAll.and.returnValue(of(mockEvents));
//     mockPredSvc.predictUserAttendance.and.returnValue(of(mockHighResult));

//     await TestBed.configureTestingModule({
//       imports:   [UserAttendancePrediction, FormsModule, RouterTestingModule],
//       providers: [
//         { provide: EventService,      useValue: mockEventSvc },
//         { provide: PredictionService, useValue: mockPredSvc }
//       ]
//     }).compileComponents();

//     fix  = TestBed.createComponent(UserAttendancePrediction);
//     comp = fix.componentInstance;
//     fix.detectChanges();
//   });

//   it('should create',                 () => expect(comp).toBeTruthy());
//   it('starts with predicted = false', () => expect(comp.predicted).toBeFalse());
//   it('starts with loading = false',   () => expect(comp.loading).toBeFalse());
//   it('starts with no error',          () => expect(comp.error).toBe(''));
//   it('starts with result = null',     () => expect(comp.result).toBeNull());
//   it('starts with displayProb = 0',   () => expect(comp.displayProb).toBe(0));

//   it('loads events on init', fakeAsync(() => {
//     tick(); expect(mockEventSvc.getAll).toHaveBeenCalled();
//   }));

//   it('populates events', fakeAsync(() => {
//     tick(); expect(comp.events.length).toBe(2);
//   }));

//   it('sets loadingEvents = false', fakeAsync(() => {
//     tick(); expect(comp.loadingEvents).toBeFalse();
//   }));

//   it('onSelect clears result', fakeAsync(() => {
//     tick();
//     comp.result = mockHighResult as any;
//     comp.selectedEventId = 1; comp.onSelect();
//     expect(comp.result).toBeNull();
//   }));

//   it('onSelect resets predicted', fakeAsync(() => {
//     tick();
//     comp.predicted = true; comp.selectedEventId = 1; comp.onSelect();
//     expect(comp.predicted).toBeFalse();
//   }));

//   it('predict does nothing if no eventId', () => {
//     comp.selectedEventId = null; comp.predict();
//     expect(mockPredSvc.predictUserAttendance).not.toHaveBeenCalled();
//   });

//   it('predict calls predSvc.predictUserAttendance', fakeAsync(() => {
//     tick();
//     comp.selectedEventId = 1; comp.onSelect();
//     comp.predict(); tick();
//     expect(mockPredSvc.predictUserAttendance).toHaveBeenCalledWith(1);
//   }));

//   it('predict sets result on success', fakeAsync(() => {
//     tick();
//     comp.selectedEventId = 1; comp.onSelect();
//     comp.predict(); tick();
//     expect(comp.result).toEqual(mockHighResult as any);
//   }));

//   it('predict sets predicted = true', fakeAsync(() => {
//     tick();
//     comp.selectedEventId = 1; comp.onSelect();
//     comp.predict(); tick();
//     expect(comp.predicted).toBeTrue();
//   }));

//   it('predict sets loading = false on success', fakeAsync(() => {
//     tick();
//     comp.selectedEventId = 1; comp.onSelect();
//     comp.predict(); tick();
//     expect(comp.loading).toBeFalse();
//   }));

//   it('predict sets error on failure', fakeAsync(() => {
//     mockPredSvc.predictUserAttendance.and.returnValue(throwError(() => ({
//       error: { message: 'FastAPI unavailable' }
//     })));
//     tick();
//     comp.selectedEventId = 1; comp.onSelect();
//     comp.predict(); tick();
//     expect(comp.error).toBeTruthy();
//   }));

//   it('probabilityPct returns 0 when no result', () => {
//     comp.result = null; expect(comp.probabilityPct).toBe(0);
//   });

//   it('probabilityPct returns 87 for 0.87', fakeAsync(() => {
//     tick();
//     comp.selectedEventId = 1; comp.onSelect();
//     comp.predict(); tick();
//     expect(comp.probabilityPct).toBe(87);
//   }));

//   it('probabilityLabel returns Very Likely for 0.87', fakeAsync(() => {
//     tick();
//     comp.selectedEventId = 1; comp.onSelect();
//     comp.predict(); tick();
//     expect(comp.probabilityLabel).toBe('Very Likely');
//   }));

//   it('probabilityLabel returns Likely for 0.70', () => {
//     comp.result = { probability: 0.70 } as any;
//     expect(comp.probabilityLabel).toBe('Likely');
//   });

//   it('probabilityLabel returns Uncertain for 0.50', () => {
//     comp.result = { probability: 0.50 } as any;
//     expect(comp.probabilityLabel).toBe('Uncertain');
//   });

//   it('probabilityLabel returns Unlikely for 0.30', () => {
//     comp.result = { probability: 0.30 } as any;
//     expect(comp.probabilityLabel).toBe('Unlikely');
//   });

//   it('probabilityColor returns hex string', fakeAsync(() => {
//     tick();
//     comp.selectedEventId = 1; comp.onSelect();
//     comp.predict(); tick();
//     expect(comp.probabilityColor).toMatch(/^#[0-9a-f]{6}$/i);
//   }));

//   it('currentBand returns 4 for 0.87', fakeAsync(() => {
//     tick();
//     comp.selectedEventId = 1; comp.onSelect();
//     comp.predict(); tick();
//     expect(comp.currentBand).toBe(4);
//   }));

//   it('improvementTips returns empty when no event', () => {
//     comp.selectedEvent = null;
//     expect(comp.improvementTips.length).toBe(0);
//   });

//   it('improvementTips max 4 items', fakeAsync(() => {
//     tick();
//     comp.selectedEventId = 2; comp.onSelect();
//     comp.predict(); tick();
//     expect(comp.improvementTips.length).toBeLessThanOrEqual(4);
//   }));

//   it('each improvement tip has icon, tip, impact', fakeAsync(() => {
//     tick();
//     comp.selectedEventId = 1; comp.onSelect();
//     comp.predict(); tick();
//     comp.improvementTips.forEach((t: any) => {
//       expect(t.icon).toBeTruthy();
//       expect(t.tip).toBeTruthy();
//       expect(t.impact).toBeTruthy();
//     });
//   }));

//   it('probabilityBands has 5 items', () => expect(comp.probabilityBands.length).toBe(5));

//   it('each band has label, range, color, icon', () => {
//     comp.probabilityBands.forEach((b: any) => {
//       expect(b.label).toBeTruthy();
//       expect(b.range).toBeTruthy();
//       expect(b.color).toMatch(/^#/);
//       expect(b.icon).toBeTruthy();
//     });
//   });

//   it('daysUntil returns 0 when no event', () => {
//     comp.selectedEvent = null; expect(comp.daysUntil).toBe(0);
//   });

//   it('getColor returns green for 0.90', () => {
//     expect(comp.getColor(0.90)).toBe('#10b981');
//   });

//   it('getColor returns red for 0.10', () => {
//     expect(comp.getColor(0.10)).toBe('#f43f5e');
//   });

//   it('tips has 5 items', () => expect(comp.tips.length).toBe(5));
//   it('historySimulated has 7 items', () => expect(comp.historySimulated.length).toBe(7));

//   it('last historySimulated updated after predict', fakeAsync(() => {
//     tick();
//     comp.selectedEventId = 1; comp.onSelect();
//     comp.predict(); tick();
//     const last = comp.historySimulated[comp.historySimulated.length - 1];
//     expect(last.prob).toBe(0.87);
//   }));

//   it('currentTime populated after init', () => expect(comp.currentTime).toBeTruthy());
// });
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { UserAttendancePrediction } from '../../src/app/components/predictions/user-attendance-prediction/user-attendance-prediction';
import { EventService, PredictionService } from '../../src/app/services/api.services';
import { UserAttendancePredictionResult } from '../../src/app/models/models';

describe('UserAttendancePrediction Component', () => {
  let comp: UserAttendancePrediction;
  let fixture: ComponentFixture<UserAttendancePrediction>;

  const mockEventService = {
    getAll: jasmine.createSpy('getAll')
  };

  const mockPredictionService = {
    predictUserAttendance: jasmine.createSpy('predictUserAttendance')
  };

  const mockEvents = [
    { id: 1, name: 'Event 1', locationCapacity: 100 },
    { id: 2, name: 'Event 2', locationCapacity: 200 }
  ];

  beforeEach(async () => {
    mockEventService.getAll.calls.reset();
    mockPredictionService.predictUserAttendance.calls.reset();

    mockEventService.getAll.and.returnValue(of([]));
    await TestBed.configureTestingModule({
      imports: [UserAttendancePrediction],
      providers: [
        { provide: EventService, useValue: mockEventService },
        { provide: PredictionService, useValue: mockPredictionService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserAttendancePrediction);
    comp = fixture.componentInstance;
  });

  // ─── Initialization ─────────────────────────────

  it('should create', () => {
    expect(comp).toBeTruthy();
  });

  it('should load events on init', fakeAsync(() => {
    mockEventService.getAll.and.returnValue(of(mockEvents));

    comp.ngOnInit();
    tick();

    expect(comp.events.length).toBe(2);
    expect(comp.loadingEvents).toBeFalse();
  }));

  it('should handle error when loading events', fakeAsync(() => {
    mockEventService.getAll.and.returnValue(throwError(() => ({})));

    comp.ngOnInit();
    tick();

    expect(comp.loadingEvents).toBeFalse();
  }));

  // ─── onSelect ─────────────────────────────

  it('onSelect should reset result and error', () => {
    comp.result = { probability: 0.5 } as any;
    comp.error = 'Some error';

    comp.onSelect();

    expect(comp.result).toBeNull();
    expect(comp.error).toBe('');
  });

  // ─── predict() ─────────────────────────────

  it('should NOT call API if no event selected', () => {
    comp.selectedEventId = null;
    comp.predict();

    expect(mockPredictionService.predictUserAttendance).not.toHaveBeenCalled();
  });

  it('should call API and set result on success', fakeAsync(() => {
    const mockResult: UserAttendancePredictionResult = {
  probability: 0.8,
  prediction: 'Attend'
};

    mockPredictionService.predictUserAttendance.and.returnValue(of(mockResult));

    comp.selectedEventId = 1;
    comp.predict();
    tick();

    expect(comp.result).toEqual(mockResult);
    expect(comp.loading).toBeFalse();
  }));

  it('should handle API error', fakeAsync(() => {
    mockPredictionService.predictUserAttendance.and.returnValue(
      throwError(() => ({ error: { message: 'Failed' } }))
    );

    comp.selectedEventId = 1;
    comp.predict();
    tick();

    expect(comp.error).toBe('Failed');
    expect(comp.loading).toBeFalse();
  }));

  // ─── Getters ─────────────────────────────

  it('probabilityPct should calculate correctly', () => {
    comp.result = { probability: 0.75 } as any;
    expect(comp.probabilityPct).toBe(75);
  });

  it('probabilityLevel should return High/Medium/Low', () => {
    comp.result = { probability: 0.85 } as any;
    expect(comp.probabilityLevel).toBe('High');

    comp.result = { probability: 0.6 } as any;
    expect(comp.probabilityLevel).toBe('Medium');

    comp.result = { probability: 0.2 } as any;
    expect(comp.probabilityLevel).toBe('Low');
  });

  it('levelEmoji should return correct emoji', () => {
    comp.result = { probability: 0.9 } as any;
    expect(comp.levelEmoji).toBe('🟢');

    comp.result = { probability: 0.6 } as any;
    expect(comp.levelEmoji).toBe('🟡');

    comp.result = { probability: 0.3 } as any;
    expect(comp.levelEmoji).toBe('🔴');
  });

  it('circumference should be constant', () => {
    expect(comp.circumference).toBeCloseTo(2 * Math.PI * 54);
  });

  it('dashoffset should calculate correctly', () => {
    comp.result = { probability: 0.5 } as any;
    expect(comp.dashoffset).toBeCloseTo(comp.circumference * 0.5);
  });

  it('selectedEvent should return correct event', () => {
    comp.events = mockEvents as any;
    comp.selectedEventId = 2;

    expect(comp.selectedEvent?.id).toBe(2);
  });
});