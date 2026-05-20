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