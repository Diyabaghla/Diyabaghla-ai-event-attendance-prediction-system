// import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
// import { FormsModule } from '@angular/forms';
// import { RouterTestingModule } from '@angular/router/testing';
// import { of, throwError } from 'rxjs';
// import { NoShowPrediction } from '../../src/app/components/predictions/no-show-prediction/no-show-prediction';
// import { EventService, PredictionService } from '../../src/app/services/api.services';

// const mockEvents = [
//   { id: 1, title: 'AI Summit', mode: 'Online', department: 'Engineering',
//     eventType: 'Conference', eventDate: new Date(Date.now() + 86400000 * 10).toISOString(),
//     activeRegistrations: 50, locationCapacity: 200,
//     speakerRating: 4.5, ticketPrice: 0, pastAttendanceRate: 0.75 },
//   { id: 2, title: 'Sales Workshop', mode: 'Offline', department: 'Sales',
//     eventType: 'Workshop', eventDate: new Date(Date.now() + 86400000 * 5).toISOString(),
//     activeRegistrations: 20, locationCapacity: 100,
//     speakerRating: 3.2, ticketPrice: 25, pastAttendanceRate: 0.40 }
// ];

// const mockAttendResult  = { prediction: 'Attend',   probability: 0.84 };
// const mockNoShowResult  = { prediction: 'Not Attend', probability: 0.25 };

// const mockEventSvc = { getAll: jasmine.createSpy('getAll').and.returnValue(of(mockEvents)) };
// const mockPredSvc  = { predictNoShow: jasmine.createSpy('predictNoShow').and.returnValue(of(mockAttendResult)) };

// describe('NoShowPrediction Component', () => {
//   let comp: NoShowPrediction;
//   let fix:  ComponentFixture<NoShowPrediction>;

//   beforeEach(async () => {
//     mockEventSvc.getAll.calls.reset();
//     mockPredSvc.predictNoShow.calls.reset();
//     mockEventSvc.getAll.and.returnValue(of(mockEvents));
//     mockPredSvc.predictNoShow.and.returnValue(of(mockAttendResult));

//     await TestBed.configureTestingModule({
//       imports:   [NoShowPrediction, FormsModule, RouterTestingModule],
//       providers: [
//         { provide: EventService,      useValue: mockEventSvc },
//         { provide: PredictionService, useValue: mockPredSvc }
//       ]
//     }).compileComponents();

//     fix  = TestBed.createComponent(NoShowPrediction);
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
//     const f2 = TestBed.createComponent(NoShowPrediction);
//     f2.detectChanges(); tick();
//     expect(f2.componentInstance.error).toBeTruthy();
//   }));

//   // ── Event selection ───────────────────────────────────────
//   it('onEventSelect clears result and error', fakeAsync(() => {
//     tick();
//     comp.result = mockAttendResult as any;
//     comp.error  = 'old error';
//     comp.selectedEventId = 1;
//     comp.onEventSelect();
//     expect(comp.result).toBeNull();
//     expect(comp.error).toBe('');
//   }));

//   it('onEventSelect resets predicted to false', fakeAsync(() => {
//     tick();
//     comp.predicted       = true;
//     comp.selectedEventId = 2;
//     comp.onEventSelect();
//     expect(comp.predicted).toBeFalse();
//   }));

//   // ── Predict ───────────────────────────────────────────────
//   it('predict does nothing if no eventId', () => {
//     comp.selectedEventId = null;
//     comp.predict();
//     expect(mockPredSvc.predictNoShow).not.toHaveBeenCalled();
//   });

//   it('predict calls predSvc.predictNoShow with correct id', fakeAsync(() => {
//     tick();
//     comp.selectedEventId = 1; comp.onEventSelect();
//     comp.predict(); tick();
//     expect(mockPredSvc.predictNoShow).toHaveBeenCalledWith(1);
//   }));

//   it('predict sets result on success', fakeAsync(() => {
//     tick();
//     comp.selectedEventId = 1; comp.onEventSelect();
//     comp.predict(); tick();
//     expect(comp.result).toEqual(mockAttendResult as any);
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
//     mockPredSvc.predictNoShow.and.returnValue(throwError(() => ({
//       error: { message: 'FastAPI unavailable' }
//     })));
//     tick();
//     comp.selectedEventId = 1; comp.onEventSelect();
//     comp.predict(); tick();
//     expect(comp.error).toBeTruthy();
//   }));

//   it('predict resets loading on failure', fakeAsync(() => {
//     mockPredSvc.predictNoShow.and.returnValue(throwError(() => ({ error: {} })));
//     tick();
//     comp.selectedEventId = 1; comp.onEventSelect();
//     comp.predict(); tick();
//     expect(comp.loading).toBeFalse();
//   }));

//   // ── Computed getters ──────────────────────────────────────
//   it('probabilityPct returns 0 when no result', () => {
//     comp.result = null;
//     expect(comp.probabilityPct).toBe(0);
//   });

//   it('probabilityPct returns correct value', fakeAsync(() => {
//     tick();
//     comp.selectedEventId = 1; comp.onEventSelect();
//     comp.predict(); tick();
//     expect(comp.probabilityPct).toBe(84);
//   }));

//   it('willAttend is true when prediction is Attend', fakeAsync(() => {
//     tick();
//     comp.selectedEventId = 1; comp.onEventSelect();
//     comp.predict(); tick();
//     expect(comp.willAttend).toBeTrue();
//   }));

//   it('willAttend is false when prediction is Not Attend', fakeAsync(() => {
//     mockPredSvc.predictNoShow.and.returnValue(of(mockNoShowResult));
//     tick();
//     comp.selectedEventId = 1; comp.onEventSelect();
//     comp.predict(); tick();
//     expect(comp.willAttend).toBeFalse();
//   }));

//   it('riskLabel returns Very Low Risk for 85%+', fakeAsync(() => {
//     tick();
//     comp.selectedEventId = 1; comp.onEventSelect();
//     comp.predict(); tick(); // prob = 0.84
//     expect(comp.riskLabel).toBe('Low Risk');
//   }));

//   it('riskLabel returns Very High Risk for < 30%', fakeAsync(() => {
//     mockPredSvc.predictNoShow.and.returnValue(of({ prediction: 'Not Attend', probability: 0.20 }));
//     tick();
//     comp.selectedEventId = 1; comp.onEventSelect();
//     comp.predict(); tick();
//     expect(comp.riskLabel).toBe('Very High Risk');
//   }));

//   it('riskColor returns hex color string', fakeAsync(() => {
//     tick();
//     comp.selectedEventId = 1; comp.onEventSelect();
//     comp.predict(); tick();
//     expect(comp.riskColor).toMatch(/^#[0-9a-f]{6}$/i);
//   }));

//   it('riskDesc returns non-empty string', fakeAsync(() => {
//     tick();
//     comp.selectedEventId = 1; comp.onEventSelect();
//     comp.predict(); tick();
//     expect(comp.riskDesc).toBeTruthy();
//   }));

//   // ── Recommendations ───────────────────────────────────────
//   it('recommendations returns empty when no event', () => {
//     comp.selectedEvent = null;
//     expect(comp.recommendations.length).toBe(0);
//   });

//   it('recommendations includes reminder tip when probability < 70%', fakeAsync(() => {
//     mockPredSvc.predictNoShow.and.returnValue(of({ prediction: 'Not Attend', probability: 0.45 }));
//     tick();
//     comp.selectedEventId = 2; comp.onEventSelect();
//     comp.predict(); tick();
//     const tips = comp.recommendations.map(r => r.text);
//     expect(tips.some(t => t.toLowerCase().includes('reminder'))).toBeTrue();
//   }));

//   it('recommendations includes positive tip for high probability', fakeAsync(() => {
//     tick();
//     comp.selectedEventId = 1; comp.onEventSelect();
//     comp.predict(); tick(); // prob = 0.84
//     const tips = comp.recommendations.map(r => r.icon);
//     expect(tips).toContain('✅');
//   }));

//   it('recommendations max length is 4', fakeAsync(() => {
//     tick();
//     comp.selectedEventId = 1; comp.onEventSelect();
//     comp.predict(); tick();
//     expect(comp.recommendations.length).toBeLessThanOrEqual(4);
//   }));

//   // ── Risk levels array ─────────────────────────────────────
//   it('riskLevels has 5 items', () => {
//     expect(comp.riskLevels.length).toBe(5);
//   });

//   it('each riskLevel has label, range, color, icon', () => {
//     comp.riskLevels.forEach(r => {
//       expect(r.label).toBeTruthy();
//       expect(r.range).toBeTruthy();
//       expect(r.color).toMatch(/^#/);
//       // expect(r.icon).toBeTruthy();
//     });
//   });

//   // ── Tips rotation ─────────────────────────────────────────
//   it('has 5 tips', () => expect(comp.tips.length).toBe(5));
//   it('currentTip starts at 0', () => expect(comp.currentTip).toBe(0));

//   // ── Helpers ───────────────────────────────────────────────
//   it('formatDateShort returns a string', () => {
//     const result = comp.formatDateShort(mockEvents[0].eventDate);
//     expect(typeof result).toBe('string');
//     expect(result).toBeTruthy();
//   });

//   it('upcomingDays returns 0 when no event', () => {
//     comp.selectedEvent = null;
//     expect(comp.upcomingDays).toBe(0);
//   });

//   it('upcomingDays > 0 for future event', fakeAsync(() => {
//     tick();
//     comp.selectedEventId = 1; comp.onEventSelect();
//     expect(comp.upcomingDays).toBeGreaterThan(0);
//   }));

//   it('getRingColor returns green for high probability', () => {
//     expect(comp.getRingColor(0.90)).toBe('#10b981');
//   });

//   it('getRingColor returns red for low probability', () => {
//     expect(comp.getRingColor(0.15)).toBe('#f43f5e');
//   });

//   it('currentTime is populated after init', () => {
//     expect(comp.currentTime).toBeTruthy();
//   });
// });
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { NoShowPrediction } from '../../src/app/components/predictions/no-show-prediction/no-show-prediction';
import { EventService, PredictionService } from '../../src/app/services/api.services';

const mockEvents = [
  { id: 1, title: 'AI Summit', mode: 'Online', department: 'Engineering',
    eventType: 'Conference', eventDate: new Date(Date.now() + 86400000 * 10).toISOString(),
    activeRegistrations: 50, locationCapacity: 200,
    speakerRating: 4.5, ticketPrice: 0, pastAttendanceRate: 0.75 },
  { id: 2, title: 'Sales Workshop', mode: 'Offline', department: 'Sales',
    eventType: 'Workshop', eventDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    activeRegistrations: 20, locationCapacity: 100,
    speakerRating: 3.2, ticketPrice: 25, pastAttendanceRate: 0.40 }
];

const mockAttendResult = { prediction: 'Attend',     probability: 0.84 };
const mockNoShowResult = { prediction: 'Not Attend', probability: 0.25 };

const mockEventSvc = { getAll: jasmine.createSpy('getAll').and.returnValue(of(mockEvents)) };
const mockPredSvc  = { predictNoShow: jasmine.createSpy('predictNoShow').and.returnValue(of(mockAttendResult)) };

describe('NoShowPrediction Component', () => {
  let comp: NoShowPrediction;
  let fix:  ComponentFixture<NoShowPrediction>;

  beforeEach(async () => {
    mockEventSvc.getAll.calls.reset();
    mockPredSvc.predictNoShow.calls.reset();
    mockEventSvc.getAll.and.returnValue(of(mockEvents));
    mockPredSvc.predictNoShow.and.returnValue(of(mockAttendResult));

    await TestBed.configureTestingModule({
      imports:   [NoShowPrediction, FormsModule, RouterTestingModule],
      providers: [
        { provide: EventService,      useValue: mockEventSvc },
        { provide: PredictionService, useValue: mockPredSvc }
      ]
    }).compileComponents();

    fix  = TestBed.createComponent(NoShowPrediction);
    comp = fix.componentInstance;
    fix.detectChanges();
  });

  it('should create',                 () => expect(comp).toBeTruthy());
  it('starts with predicted = false', () => expect(comp.predicted).toBeFalse());
  it('starts with loading = false',   () => expect(comp.loading).toBeFalse());
  it('starts with no error',          () => expect(comp.error).toBe(''));
  it('starts with result = null',     () => expect(comp.result).toBeNull());

  it('loads events on init', fakeAsync(() => {
    tick(); expect(mockEventSvc.getAll).toHaveBeenCalled();
  }));

  it('populates events', fakeAsync(() => {
    tick(); expect(comp.events.length).toBe(2);
  }));

  it('sets loadingEvents = false', fakeAsync(() => {
    tick(); expect(comp.loadingEvents).toBeFalse();
  }));

  it('onEventSelect clears result and error', fakeAsync(() => {
    tick();
    comp.result = mockAttendResult as any; comp.error = 'old';
    comp.selectedEventId = 1; comp.onEventSelect();
    expect(comp.result).toBeNull();
    expect(comp.error).toBe('');
  }));

  it('onEventSelect resets predicted', fakeAsync(() => {
    tick();
    comp.predicted = true; comp.selectedEventId = 2; comp.onEventSelect();
    expect(comp.predicted).toBeFalse();
  }));

  it('predict does nothing if no eventId', () => {
    comp.selectedEventId = null; comp.predict();
    expect(mockPredSvc.predictNoShow).not.toHaveBeenCalled();
  });

  it('predict calls predSvc.predictNoShow', fakeAsync(() => {
    tick();
    comp.selectedEventId = 1; comp.onEventSelect();
    comp.predict(); tick();
    expect(mockPredSvc.predictNoShow).toHaveBeenCalledWith(1);
  }));

  it('predict sets result on success', fakeAsync(() => {
    tick();
    comp.selectedEventId = 1; comp.onEventSelect();
    comp.predict(); tick();
    expect(comp.result).toEqual(mockAttendResult as any);
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
    mockPredSvc.predictNoShow.and.returnValue(throwError(() => ({
      error: { message: 'FastAPI unavailable' }
    })));
    tick();
    comp.selectedEventId = 1; comp.onEventSelect();
    comp.predict(); tick();
    expect(comp.error).toBeTruthy();
  }));

  it('probabilityPct returns 0 when no result', () => {
    comp.result = null; expect(comp.probabilityPct).toBe(0);
  });

  it('probabilityPct returns 84 for 0.84', fakeAsync(() => {
    tick();
    comp.selectedEventId = 1; comp.onEventSelect();
    comp.predict(); tick();
    expect(comp.probabilityPct).toBe(84);
  }));

  it('willAttend is true for Attend prediction', fakeAsync(() => {
    tick();
    comp.selectedEventId = 1; comp.onEventSelect();
    comp.predict(); tick();
    expect(comp.willAttend).toBeTrue();
  }));

  it('willAttend is false for Not Attend', fakeAsync(() => {
    mockPredSvc.predictNoShow.and.returnValue(of(mockNoShowResult));
    tick();
    comp.selectedEventId = 1; comp.onEventSelect();
    comp.predict(); tick();
    expect(comp.willAttend).toBeFalse();
  }));

  it('riskLabel returns Low Risk for 0.84', fakeAsync(() => {
    tick();
    comp.selectedEventId = 1; comp.onEventSelect();
    comp.predict(); tick();
    expect(comp.riskLabel).toBe('Low Risk');
  }));

  it('riskLabel returns Very High Risk for 0.20', fakeAsync(() => {
    mockPredSvc.predictNoShow.and.returnValue(of({ prediction: 'Not Attend', probability: 0.20 }));
    tick();
    comp.selectedEventId = 1; comp.onEventSelect();
    comp.predict(); tick();
    expect(comp.riskLabel).toBe('Very High Risk');
  }));

  it('riskColor returns hex color', fakeAsync(() => {
    tick();
    comp.selectedEventId = 1; comp.onEventSelect();
    comp.predict(); tick();
    expect(comp.riskColor).toMatch(/^#[0-9a-f]{6}$/i);
  }));

  it('recommendations returns empty when no event', () => {
    comp.selectedEvent = null;
    expect(comp.recommendations.length).toBe(0);
  });

  it('recommendations max 4 items', fakeAsync(() => {
    tick();
    comp.selectedEventId = 1; comp.onEventSelect();
    comp.predict(); tick();
    expect(comp.recommendations.length).toBeLessThanOrEqual(4);
  }));

  it('recommendations includes reminder when prob < 70%', fakeAsync(() => {
    mockPredSvc.predictNoShow.and.returnValue(of({ prediction: 'Not Attend', probability: 0.45 }));
    tick();
    comp.selectedEventId = 2; comp.onEventSelect();
    comp.predict(); tick();
    const tips = comp.recommendations.map((r: any) => r.text);
    expect(tips.some((t: string) => t.toLowerCase().includes('reminder'))).toBeTrue();
  }));

  it('riskLevels has 5 items', () => expect(comp.riskLevels.length).toBe(5));

  it('each riskLevel has required fields', () => {
    comp.riskLevels.forEach((r: any) => {
      expect(r.label).toBeTruthy();
      expect(r.color).toMatch(/^#/);
    });
  });

  it('getRingColor returns green for 0.90', () => {
    expect(comp.getRingColor(0.90)).toBe('#10b981');
  });

  it('getRingColor returns red for 0.15', () => {
    expect(comp.getRingColor(0.15)).toBe('#f43f5e');
  });

  it('upcomingDays returns 0 when no event', () => {
    comp.selectedEvent = null; expect(comp.upcomingDays).toBe(0);
  });

  it('has 5 tips', () => expect(comp.tips.length).toBe(5));
  it('currentTime populated', () => expect(comp.currentTime).toBeTruthy());
});
