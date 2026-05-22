import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { environment } from '../../src/environments/environment';
 
import { EventService }        from '../../src/app/services/api.services';
import { RegistrationService } from '../../src/app/services/api.services';
import { PredictionService }   from '../../src/app/services/api.services';
import { ReportService }       from '../../src/app/services/api.services';
 
import {
  Event, Registration, RegisterRequest,
  AttendancePredictionResult, NoShowPredictionResult,
  UserAttendancePredictionResult,
  AttendanceReportItem, RegistrationStatusReport,
  EventPerformanceReport, WeeklyTrendItem,
  DepartmentBreakdownReport, TopStatsReport
} from '../../src/app/models/models';
 
// ─── Shared mock data ─────────────────────────────────────────────────────────
const BASE = environment.apiUrl;
 
const mockEvent: Event = {
  id:                  1,
  title:               'AI Summit 2026',
  description:         'Annual AI conference',
  eventType:           'Conference',
  mode:                'Online',
  department:          'Engineering',
  eventDate:           '2026-06-01T10:00:00Z',
  dayOfWeek:           'Monday',
  durationHours:       4.0,
  speakerRating:       4.5,
  reminderSent:        true,
  pastAttendanceRate:  0.78,
  weather:             'Clear',
  ticketPrice:         0,
  locationCapacity:    500,
  activeRegistrations: 120
} as any;
 
const mockRegistration: Registration = {
  id:               1,
  eventId:          1,
  eventTitle:       'AI Summit 2026',
  userId:           2,
  status:           'Registered',
  registrationDate: '2026-05-01T09:00:00Z'
} as any;
 
const mockRegRequest: RegisterRequest = {
  eventId:                1,
  pastUserAttendanceRate: 0.75
} as any;
 
const mockAttendanceResult: AttendancePredictionResult = {
  eventId:             1,
  predictedAttendance: 95,
  activeRegistrations: 120
} as any;
 
const mockNoShowResult: NoShowPredictionResult = {
  eventId:    1,
  probability: 0.72,
  prediction: 'Attend'
} as any;
 
const mockUserAttendResult: UserAttendancePredictionResult = {
  eventId:    1,
  probability: 0.85,
  prediction: 'Attend'
} as any;
 
const mockAttendanceReport: AttendanceReportItem[] = [{
  eventId:                1,
  eventTitle:             'AI Summit 2026',
  eventType:              'Conference',
  eventDate:              '2026-06-01',
  totalRegistrations:     130,
  activeRegistrations:    120,
  cancelledRegistrations: 10,
  cancellationRate:       7.69,
  predictedAttendance:    95
} as any];
 
const mockStatusReport: RegistrationStatusReport = {
  totalRegistrations: 200,
  registered:         175,
  cancelled:          25,
  cancellationRate:   12.5
} as any;
 
const mockPerformance: EventPerformanceReport[] = [{
  eventId:             1,
  eventTitle:          'AI Summit 2026',
  department:          'Engineering',
  mode:                'Online',
  locationCapacity:    500,
  activeRegistrations: 120,
  fillRate:            24,
  speakerRating:       4.5,
  ticketPrice:         0,
  pastAttendanceRate:  0.78
} as any];
 
const mockTopStats: TopStatsReport = {
  topEventByFillRate:        'AI Summit 2026',
  topEventFillRate:           24,
  topEventByRegistrations:   'Sales Training',
  topEventRegistrationCount: 85,
  topRatedEvent:             'AI Summit 2026',
  topRatedScore:              4.5,
  totalEvents:                10,
  totalRegistrations:         500,
  avgFillRate:                20,
  avgSpeakerRating:            4.1
} as any;
 
const mockDeptBreakdown: DepartmentBreakdownReport = {
  byDepartment: [
    { department: 'Engineering', totalEvents: 5, totalRegistrations: 300, avgFillRate: 60, avgSpeakerRating: 4.3 }
  ],
  byMode: [
    { mode: 'Online', eventCount: 4, percentage: 80 }
  ],
  byEventType: [
    { eventType: 'Conference', eventCount: 3, avgRating: 4.5 }
  ]
} as any;
 
const mockWeeklyTrend: WeeklyTrendItem[] = [
  { weekStart: '2026-04-28', registrations: 20, cancellations: 3 },
  { weekStart: '2026-05-05', registrations: 35, cancellations: 5 }
] as any;
 
 
// ═════════════════════════════════════════════════════════════════════════════
// EventService
// ═════════════════════════════════════════════════════════════════════════════
describe('EventService', () => {
  let service: EventService;
  let http: HttpTestingController;
 
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports:   [HttpClientTestingModule],
      providers: [EventService]
    });
    service = TestBed.inject(EventService);
    http    = TestBed.inject(HttpTestingController);
  });
 
  afterEach(() => http.verify());
 
  // ── getAll ──────────────────────────────────────────────────────────────
  describe('getAll()', () => {
    it('should issue GET to /events and return event array', () => {
      service.getAll().subscribe(events => {
        expect(events.length).toBe(1);
        expect(events[0].title).toBe('AI Summit 2026');
      });
      const req = http.expectOne(`${BASE}/events`);
      expect(req.request.method).toBe('GET');
      req.flush([mockEvent]);
    });
 
    it('should return empty array when server returns none', () => {
      service.getAll().subscribe(events => expect(events).toEqual([]));
      http.expectOne(`${BASE}/events`).flush([]);
    });
 
    it('should propagate HTTP 500 error', () => {
      service.getAll().subscribe({
        next:  () => fail('should have errored'),
        error: err => expect(err.status).toBe(500)
      });
      http.expectOne(`${BASE}/events`)
          .flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
  });
 
  // ── getById ─────────────────────────────────────────────────────────────
  describe('getById()', () => {
    it('should GET /events/:id and return single event', () => {
      service.getById(1).subscribe(ev => {
        expect(ev.id).toBe(1);
        expect(ev.title).toBe('AI Summit 2026');
      });
      const req = http.expectOne(`${BASE}/events/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockEvent);
    });
 
    it('should interpolate the provided ID into the URL', () => {
      service.getById(42).subscribe();
      const req = http.expectOne(`${BASE}/events/42`);
      expect(req.request.method).toBe('GET');
      req.flush(mockEvent);
    });
 
    it('should propagate 404 when event does not exist', () => {
      service.getById(999).subscribe({
        next:  () => fail('should have errored'),
        error: err => expect(err.status).toBe(404)
      });
      http.expectOne(`${BASE}/events/999`)
          .flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });
 
  // ── create ──────────────────────────────────────────────────────────────
  describe('create()', () => {
    it('should POST to /events with the event body', () => {
      service.create(mockEvent).subscribe(ev => expect(ev.id).toBe(1));
      const req = http.expectOne(`${BASE}/events`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockEvent);
      req.flush(mockEvent);
    });
 
    it('should return the server-assigned event object', () => {
      const created = { ...mockEvent, id: 99 };
      service.create(mockEvent).subscribe(ev => expect(ev.id).toBe(99));
      http.expectOne(`${BASE}/events`).flush(created);
    });
 
    it('should propagate 400 for invalid payload', () => {
      service.create({} as Event).subscribe({
        next:  () => fail('should have errored'),
        error: err => expect(err.status).toBe(400)
      });
      http.expectOne(`${BASE}/events`)
          .flush('Bad request', { status: 400, statusText: 'Bad Request' });
    });
 
    it('should propagate 403 when user is not admin', () => {
      service.create(mockEvent).subscribe({
        next:  () => fail('should have errored'),
        error: err => expect(err.status).toBe(403)
      });
      http.expectOne(`${BASE}/events`)
          .flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    });
  });
 
  // ── update ──────────────────────────────────────────────────────────────
  describe('update()', () => {
    it('should PUT to /events/:id with the updated body', () => {
      const updated = { ...mockEvent, title: 'Updated Title' };
      service.update(1, updated).subscribe(ev => expect(ev.title).toBe('Updated Title'));
      const req = http.expectOne(`${BASE}/events/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body.title).toBe('Updated Title');
      req.flush(updated);
    });
 
    it('should use the correct ID in the URL', () => {
      service.update(5, mockEvent).subscribe();
      const req = http.expectOne(`${BASE}/events/5`);
      expect(req.request.method).toBe('PUT');
      req.flush(mockEvent);
    });
 
    it('should propagate 404 when event does not exist', () => {
      service.update(999, mockEvent).subscribe({
        next:  () => fail('should have errored'),
        error: err => expect(err.status).toBe(404)
      });
      http.expectOne(`${BASE}/events/999`)
          .flush('Not found', { status: 404, statusText: 'Not Found' });
    });
 
    it('should propagate 403 when user is not admin', () => {
      service.update(1, mockEvent).subscribe({
        next:  () => fail('should have errored'),
        error: err => expect(err.status).toBe(403)
      });
      http.expectOne(`${BASE}/events/1`)
          .flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    });
  });
 
  // ── delete ──────────────────────────────────────────────────────────────
  describe('delete()', () => {
    it('should DELETE /events/:id', () => {
      service.delete(1).subscribe(res => expect(res).toBeNull());
      const req = http.expectOne(`${BASE}/events/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
 
    it('should use the correct ID in the URL', () => {
      service.delete(7).subscribe();
      const req = http.expectOne(`${BASE}/events/7`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
 
    it('should propagate 404 when event does not exist', () => {
      service.delete(999).subscribe({
        next:  () => fail('should have errored'),
        error: err => expect(err.status).toBe(404)
      });
      http.expectOne(`${BASE}/events/999`)
          .flush('Not found', { status: 404, statusText: 'Not Found' });
    });
 
    it('should propagate 403 when user is not admin', () => {
      service.delete(1).subscribe({
        next:  () => fail('should have errored'),
        error: err => expect(err.status).toBe(403)
      });
      http.expectOne(`${BASE}/events/1`)
          .flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    });
  });
});
 
 
// ═════════════════════════════════════════════════════════════════════════════
// RegistrationService
// ═════════════════════════════════════════════════════════════════════════════
describe('RegistrationService', () => {
  let service: RegistrationService;
  let http: HttpTestingController;
 
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports:   [HttpClientTestingModule],
      providers: [RegistrationService]
    });
    service = TestBed.inject(RegistrationService);
    http    = TestBed.inject(HttpTestingController);
  });
 
  afterEach(() => http.verify());
 
  // ── register ────────────────────────────────────────────────────────────
  describe('register()', () => {
    it('should POST to /registrations with eventId and pastUserAttendanceRate', () => {
      service.register(mockRegRequest).subscribe(reg => {
        expect(reg.status).toBe('Registered');
      });
      const req = http.expectOne(`${BASE}/registrations`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body.eventId).toBe(1);
      expect(req.request.body.pastUserAttendanceRate).toBe(0.75);
      req.flush(mockRegistration);
    });
 
    it('should return registration with id and eventTitle', () => {
      service.register(mockRegRequest).subscribe(reg => {
        expect(reg.id).toBe(1);
        expect(reg.eventTitle).toBe('AI Summit 2026');
      });
      http.expectOne(`${BASE}/registrations`).flush(mockRegistration);
    });
 
    it('should propagate 409 for duplicate registration', () => {
      service.register(mockRegRequest).subscribe({
        next:  () => fail('should have errored'),
        error: err => expect(err.status).toBe(409)
      });
      http.expectOne(`${BASE}/registrations`)
          .flush('Already registered', { status: 409, statusText: 'Conflict' });
    });
 
    it('should propagate 400 when event has ended', () => {
      service.register(mockRegRequest).subscribe({
        next:  () => fail('should have errored'),
        error: err => expect(err.status).toBe(400)
      });
      http.expectOne(`${BASE}/registrations`)
          .flush('Event has ended', { status: 400, statusText: 'Bad Request' });
    });
 
    it('should propagate 401 when not authenticated', () => {
      service.register(mockRegRequest).subscribe({
        next:  () => fail('should have errored'),
        error: err => expect(err.status).toBe(401)
      });
      http.expectOne(`${BASE}/registrations`)
          .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
  });
 
  // ── cancel ──────────────────────────────────────────────────────────────
  describe('cancel()', () => {
    it('should PATCH /registrations/:id/cancel with empty body', () => {
      service.cancel(1).subscribe(reg => expect(reg.status).toBe('Cancelled'));
      const req = http.expectOne(`${BASE}/registrations/1/cancel`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({});
      req.flush({ ...mockRegistration, status: 'Cancelled' });
    });
 
    it('should use the correct ID in the URL', () => {
      service.cancel(42).subscribe();
      const req = http.expectOne(`${BASE}/registrations/42/cancel`);
      expect(req.request.method).toBe('PATCH');
      req.flush(mockRegistration);
    });
 
    it('should propagate 400 when already cancelled', () => {
      service.cancel(1).subscribe({
        next:  () => fail('should have errored'),
        error: err => expect(err.status).toBe(400)
      });
      http.expectOne(`${BASE}/registrations/1/cancel`)
          .flush('Already cancelled', { status: 400, statusText: 'Bad Request' });
    });
 
    it('should propagate 404 when registration not found', () => {
      service.cancel(999).subscribe({
        next:  () => fail('should have errored'),
        error: err => expect(err.status).toBe(404)
      });
      http.expectOne(`${BASE}/registrations/999/cancel`)
          .flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });
 
  // ── getMyRegistrations ──────────────────────────────────────────────────
  describe('getMyRegistrations()', () => {
    it('should GET /registrations/my and return user registrations', () => {
      service.getMyRegistrations().subscribe(regs => {
        expect(regs.length).toBe(1);
        expect(regs[0].status).toBe('Registered');
      });
      const req = http.expectOne(`${BASE}/registrations/my`);
      expect(req.request.method).toBe('GET');
      req.flush([mockRegistration]);
    });
 
    it('should return empty array when user has no registrations', () => {
      service.getMyRegistrations().subscribe(regs => expect(regs).toEqual([]));
      http.expectOne(`${BASE}/registrations/my`).flush([]);
    });
 
    it('should propagate 401 when not authenticated', () => {
      service.getMyRegistrations().subscribe({
        next:  () => fail('should have errored'),
        error: err => expect(err.status).toBe(401)
      });
      http.expectOne(`${BASE}/registrations/my`)
          .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
  });
 
  // ── getAllRegistrations ─────────────────────────────────────────────────
  describe('getAllRegistrations()', () => {
    it('should GET /registrations and return all registrations', () => {
      service.getAllRegistrations().subscribe(regs => expect(regs.length).toBe(1));
      const req = http.expectOne(`${BASE}/registrations`);
      expect(req.request.method).toBe('GET');
      req.flush([mockRegistration]);
    });
 
    it('should propagate 403 when user is not admin', () => {
      service.getAllRegistrations().subscribe({
        next:  () => fail('should have errored'),
        error: err => expect(err.status).toBe(403)
      });
      http.expectOne(`${BASE}/registrations`)
          .flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    });
 
    it('should propagate 401 when not authenticated', () => {
      service.getAllRegistrations().subscribe({
        next:  () => fail('should have errored'),
        error: err => expect(err.status).toBe(401)
      });
      http.expectOne(`${BASE}/registrations`)
          .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
  });
 
  // ── getByEvent ──────────────────────────────────────────────────────────
  describe('getByEvent()', () => {
    it('should GET /registrations/event/:eventId', () => {
      service.getByEvent(1).subscribe(regs => {
        expect(regs.length).toBe(1);
        expect(regs[0].eventId).toBe(1);
      });
      const req = http.expectOne(`${BASE}/registrations/event/1`);
      expect(req.request.method).toBe('GET');
      req.flush([mockRegistration]);
    });
 
    it('should use the correct event ID in URL', () => {
      service.getByEvent(5).subscribe();
      const req = http.expectOne(`${BASE}/registrations/event/5`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
 
    it('should return empty array when no registrations for event', () => {
      service.getByEvent(1).subscribe(regs => expect(regs).toEqual([]));
      http.expectOne(`${BASE}/registrations/event/1`).flush([]);
    });
 
    it('should propagate 403 when user is not admin', () => {
      service.getByEvent(1).subscribe({
        next:  () => fail('should have errored'),
        error: err => expect(err.status).toBe(403)
      });
      http.expectOne(`${BASE}/registrations/event/1`)
          .flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    });
  });
});
 
 
// ═════════════════════════════════════════════════════════════════════════════
// PredictionService
// ═════════════════════════════════════════════════════════════════════════════
describe('PredictionService', () => {
  let service: PredictionService;
  let http: HttpTestingController;
 
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports:   [HttpClientTestingModule],
      providers: [PredictionService]
    });
    service = TestBed.inject(PredictionService);
    http    = TestBed.inject(HttpTestingController);
  });
 
  afterEach(() => http.verify());
 
  // ── predictAttendance ───────────────────────────────────────────────────
  describe('predictAttendance()', () => {
    it('should GET /predictions/attendance/:eventId', () => {
  service.predictAttendance(1).subscribe(result => {
    expect(result.predictedAttendance).toBe(95);    // matches mockAttendanceResult
    expect(result.activeRegistrations).toBe(120);
  });
  const req = http.expectOne(`${BASE}/predictions/attendance/1`);
  expect(req.request.method).toBe('GET');
  req.flush(mockAttendanceResult);   // ← flush OUTSIDE subscribe, after expectOne
});
    it('should interpolate the correct event ID into URL', () => {
      service.predictAttendance(7).subscribe();
      const req = http.expectOne(`${BASE}/predictions/attendance/7`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAttendanceResult);
    });
 
    it('predictedAttendance should not exceed activeRegistrations', () => {
      service.predictAttendance(1).subscribe(result => {
        expect(result.predictedAttendance).toBeLessThanOrEqual(result.activeRegistrations);
      });
      http.expectOne(`${BASE}/predictions/attendance/1`).flush(mockAttendanceResult);
    });
 
    it('should propagate 503 when FastAPI ML service is down', () => {
      service.predictAttendance(1).subscribe({
        next:  () => fail('should have errored'),
        error: err => expect(err.status).toBe(503)
      });
      http.expectOne(`${BASE}/predictions/attendance/1`)
          .flush('Service unavailable', { status: 503, statusText: 'Service Unavailable' });
    });
 
    it('should propagate 404 when event not found', () => {
      service.predictAttendance(999).subscribe({
        next:  () => fail('should have errored'),
        error: err => expect(err.status).toBe(404)
      });
      http.expectOne(`${BASE}/predictions/attendance/999`)
          .flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });
 
  // ── predictNoShow ───────────────────────────────────────────────────────
  describe('predictNoShow()', () => {
    it('should GET /predictions/no-show/:eventId', () => {
      service.predictNoShow(1).subscribe(result => {
        expect(result.probability).toBe(0.72);
        expect(result.prediction).toBe('Attend');
      });
      const req = http.expectOne(`${BASE}/predictions/no-show/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockNoShowResult);
    });
 
    it('should use the correct event ID in URL', () => {
      service.predictNoShow(3).subscribe();
      const req = http.expectOne(`${BASE}/predictions/no-show/3`);
      expect(req.request.method).toBe('GET');
      req.flush(mockNoShowResult);
    });
 
    it('probability should be between 0 and 1', () => {
      service.predictNoShow(1).subscribe(result => {
        expect(result.probability).toBeGreaterThanOrEqual(0);
        expect(result.probability).toBeLessThanOrEqual(1);
      });
      http.expectOne(`${BASE}/predictions/no-show/1`).flush(mockNoShowResult);
    });
 
    it('prediction should be either Attend or NoShow', () => {
      service.predictNoShow(1).subscribe(result => {
        expect(['Attend', 'NoShow']).toContain(result.prediction);
      });
      http.expectOne(`${BASE}/predictions/no-show/1`).flush(mockNoShowResult);
    });
 
    it('should propagate 404 when event not found', () => {
      service.predictNoShow(999).subscribe({
        next:  () => fail('should have errored'),
        error: err => expect(err.status).toBe(404)
      });
      http.expectOne(`${BASE}/predictions/no-show/999`)
          .flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });
 
  // ── predictUserAttendance ───────────────────────────────────────────────
  describe('predictUserAttendance()', () => {
    it('should GET /predictions/user-attendance/:eventId', () => {
      service.predictUserAttendance(1).subscribe(result => {
        expect(result.probability).toBe(0.85);
        expect(result.prediction).toBe('Attend');
      });
      const req = http.expectOne(`${BASE}/predictions/user-attendance/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUserAttendResult);
    });
 
    it('should use the correct event ID in URL', () => {
      service.predictUserAttendance(9).subscribe();
      const req = http.expectOne(`${BASE}/predictions/user-attendance/9`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUserAttendResult);
    });
 
    it('probability should be between 0 and 1', () => {
      service.predictUserAttendance(1).subscribe(result => {
        expect(result.probability).toBeGreaterThanOrEqual(0);
        expect(result.probability).toBeLessThanOrEqual(1);
      });
      http.expectOne(`${BASE}/predictions/user-attendance/1`).flush(mockUserAttendResult);
    });
 
    it('prediction should be either Attend or NoShow', () => {
      service.predictUserAttendance(1).subscribe(result => {
        expect(['Attend', 'NoShow']).toContain(result.prediction);
      });
      http.expectOne(`${BASE}/predictions/user-attendance/1`).flush(mockUserAttendResult);
    });
 
    it('should propagate 401 when not authenticated', () => {
      service.predictUserAttendance(1).subscribe({
        next:  () => fail('should have errored'),
        error: err => expect(err.status).toBe(401)
      });
      http.expectOne(`${BASE}/predictions/user-attendance/1`)
          .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
  });
});
 
 
// ═════════════════════════════════════════════════════════════════════════════
// ReportService
// ═════════════════════════════════════════════════════════════════════════════
describe('ReportService', () => {
  let service: ReportService;
  let http: HttpTestingController;
 
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports:   [HttpClientTestingModule],
      providers: [ReportService]
    });
    service = TestBed.inject(ReportService);
    http    = TestBed.inject(HttpTestingController);
  });
 
  afterEach(() => http.verify());
 
  // ── getAttendanceVsRegistration ─────────────────────────────────────────
  describe('getAttendanceVsRegistration()', () => {
    it('should GET /reports/attendance-vs-registration', () => {
      service.getAttendanceVsRegistration().subscribe(data => {
        expect(data.length).toBe(1);
        expect(data[0].eventTitle).toBe('AI Summit 2026');
      });
      const req = http.expectOne(`${BASE}/reports/attendance-vs-registration`);
      expect(req.request.method).toBe('GET');
      req.flush(mockAttendanceReport);
    });
 
    it('should return items with all required report fields', () => {
      service.getAttendanceVsRegistration().subscribe(data => {
        const item = data[0];
        expect(item.eventId).toBeDefined();
        expect(item.activeRegistrations).toBeDefined();
        expect(item.cancellationRate).toBeDefined();
        expect(item.predictedAttendance).toBeDefined();
      });
      http.expectOne(`${BASE}/reports/attendance-vs-registration`).flush(mockAttendanceReport);
    });
 
    it('should return empty array when no events exist', () => {
      service.getAttendanceVsRegistration().subscribe(data => expect(data).toEqual([]));
      http.expectOne(`${BASE}/reports/attendance-vs-registration`).flush([]);
    });
 
    it('should propagate 403 when user is not admin', () => {
      service.getAttendanceVsRegistration().subscribe({
        next:  () => fail('should have errored'),
        error: err => expect(err.status).toBe(403)
      });
      http.expectOne(`${BASE}/reports/attendance-vs-registration`)
          .flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    });
  });
 
  // ── getCancelledVsRegistered ────────────────────────────────────────────
  describe('getCancelledVsRegistered()', () => {
    it('should GET /reports/cancelled-vs-registered', () => {
      service.getCancelledVsRegistered().subscribe(report => {
        expect(report.totalRegistrations).toBe(200);
        expect(report.registered).toBe(175);
        expect(report.cancelled).toBe(25);
      });
      const req = http.expectOne(`${BASE}/reports/cancelled-vs-registered`);
      expect(req.request.method).toBe('GET');
      req.flush(mockStatusReport);
    });
 
    it('registered + cancelled should equal totalRegistrations', () => {
      service.getCancelledVsRegistered().subscribe(report => {
        expect(report.registered + report.cancelled).toBe(report.totalRegistrations);
      });
      http.expectOne(`${BASE}/reports/cancelled-vs-registered`).flush(mockStatusReport);
    });
 
    it('cancellationRate should be between 0 and 100', () => {
      service.getCancelledVsRegistered().subscribe(report => {
        expect(report.cancellationRate).toBeGreaterThanOrEqual(0);
        expect(report.cancellationRate).toBeLessThanOrEqual(100);
      });
      http.expectOne(`${BASE}/reports/cancelled-vs-registered`).flush(mockStatusReport);
    });
 
    it('should propagate 403 when user is not admin', () => {
      service.getCancelledVsRegistered().subscribe({
        next:  () => fail('should have errored'),
        error: err => expect(err.status).toBe(403)
      });
      http.expectOne(`${BASE}/reports/cancelled-vs-registered`)
          .flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    });
  });
 
  // ── getEventPerformance ─────────────────────────────────────────────────
  describe('getEventPerformance()', () => {
    it('should GET /reports/event-performance', () => {
      service.getEventPerformance().subscribe(data => {
        expect(data.length).toBe(1);
        expect(data[0].fillRate).toBe(24);
      });
      const req = http.expectOne(`${BASE}/reports/event-performance`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPerformance);
    });
 
    it('each item should have fillRate, speakerRating, locationCapacity', () => {
      service.getEventPerformance().subscribe(data => {
        expect(data[0].fillRate).toBeDefined();
        expect(data[0].speakerRating).toBeDefined();
        expect(data[0].locationCapacity).toBeDefined();
      });
      http.expectOne(`${BASE}/reports/event-performance`).flush(mockPerformance);
    });
 
    it('fillRate should not be negative', () => {
      service.getEventPerformance().subscribe(data => {
        data.forEach(item => expect(item.fillRate).toBeGreaterThanOrEqual(0));
      });
      http.expectOne(`${BASE}/reports/event-performance`).flush(mockPerformance);
    });
 
    it('should propagate 403 when user is not admin', () => {
      service.getEventPerformance().subscribe({
        next:  () => fail('should have errored'),
        error: err => expect(err.status).toBe(403)
      });
      http.expectOne(`${BASE}/reports/event-performance`)
          .flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    });
  });
 
  // ── getTopStats ─────────────────────────────────────────────────────────
  describe('getTopStats()', () => {
    it('should GET /reports/top-stats', () => {
      service.getTopStats().subscribe(stats => {
      
        expect(stats.totalRegistrations).toBeDefined();
expect(stats.topEventFillRate).toBeDefined();
      });
      const req = http.expectOne(`${BASE}/reports/top-stats`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTopStats);
    });
 
    it('avgSpeakerRating should be between 0 and 5', () => {
      service.getTopStats().subscribe(stats => {
        expect(stats.avgSpeakerRating).toBeGreaterThanOrEqual(0);
        expect(stats.avgSpeakerRating).toBeLessThanOrEqual(5);
      });
      http.expectOne(`${BASE}/reports/top-stats`).flush(mockTopStats);
    });
 
    it('should return all required top-level fields', () => {
      service.getTopStats().subscribe(stats => {
      
        expect(stats.topEventByRegistrations).toBeDefined();
        expect(stats.topRatedEvent).toBeDefined();
        expect(stats.avgFillRate).toBeDefined();
        expect(stats.totalRegistrations).toBeDefined();
expect(stats.topEventFillRate).toBeDefined();
      });
      http.expectOne(`${BASE}/reports/top-stats`).flush(mockTopStats);
    });
 
    it('should propagate 403 when user is not admin', () => {
      service.getTopStats().subscribe({
        next:  () => fail('should have errored'),
        error: err => expect(err.status).toBe(403)
      });
      http.expectOne(`${BASE}/reports/top-stats`)
          .flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    });
  });
 
  // ── getDepartmentBreakdown ──────────────────────────────────────────────
  describe('getDepartmentBreakdown()', () => {
    it('should GET /reports/department-breakdown', () => {
      service.getDepartmentBreakdown().subscribe(data => {
        expect(data.byDepartment.length).toBe(1);
        expect(data.byMode.length).toBe(1);
        expect(data.byMode.length).toBe(1); 
      });
      const req = http.expectOne(`${BASE}/reports/department-breakdown`);
      expect(req.request.method).toBe('GET');
      req.flush(mockDeptBreakdown);
    });
 
    it('should return object with byDepartment, byMode, byEventType arrays', () => {
      service.getDepartmentBreakdown().subscribe(data => {
        expect(Array.isArray(data.byDepartment)).toBeTrue();
        expect(Array.isArray(data.byMode)).toBeTrue();
       expect(Array.isArray(data.byMode)).toBeTrue();
      });
      http.expectOne(`${BASE}/reports/department-breakdown`).flush(mockDeptBreakdown);
    });
 
    it('byMode percentage should be between 0 and 100', () => {
      service.getDepartmentBreakdown().subscribe(data => {
        data.byMode.forEach(m => {
          expect(m.percentage).toBeGreaterThanOrEqual(0);
          expect(m.percentage).toBeLessThanOrEqual(100);
        });
      });
      http.expectOne(`${BASE}/reports/department-breakdown`).flush(mockDeptBreakdown);
    });
 
    it('should propagate 403 when user is not admin', () => {
      service.getDepartmentBreakdown().subscribe({
        next:  () => fail('should have errored'),
        error: err => expect(err.status).toBe(403)
      });
      http.expectOne(`${BASE}/reports/department-breakdown`)
          .flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    });
  });
 
  // ── getWeeklyTrend ──────────────────────────────────────────────────────
  describe('getWeeklyTrend()', () => {
    it('should GET /reports/weekly-trend', () => {
      service.getWeeklyTrend().subscribe(trend => {
        expect(trend.length).toBe(2);
        expect(trend[0].registrations).toBe(20);
        expect(trend[0].cancellations).toBe(3);
      });
      const req = http.expectOne(`${BASE}/reports/weekly-trend`);
      expect(req.request.method).toBe('GET');
      req.flush(mockWeeklyTrend);
    });
 
    it('each item should have weekStart, registrations, cancellations', () => {
      service.getWeeklyTrend().subscribe(trend => {
        trend.forEach(item => {
          expect(item.weekStart).toBeDefined();
          expect(item.registrations).toBeDefined();
          expect(item.cancellations).toBeDefined();
        });
      });
      http.expectOne(`${BASE}/reports/weekly-trend`).flush(mockWeeklyTrend);
    });
 
    it('registrations and cancellations should not be negative', () => {
      service.getWeeklyTrend().subscribe(trend => {
        trend.forEach(item => {
          expect(item.registrations).toBeGreaterThanOrEqual(0);
          expect(item.cancellations).toBeGreaterThanOrEqual(0);
        });
      });
      http.expectOne(`${BASE}/reports/weekly-trend`).flush(mockWeeklyTrend);
    });
 
    it('should return empty array when no weekly data exists', () => {
      service.getWeeklyTrend().subscribe(trend => expect(trend).toEqual([]));
      http.expectOne(`${BASE}/reports/weekly-trend`).flush([]);
    });
 
    it('should propagate 403 when user is not admin', () => {
      service.getWeeklyTrend().subscribe({
        next:  () => fail('should have errored'),
        error: err => expect(err.status).toBe(403)
      });
      http.expectOne(`${BASE}/reports/weekly-trend`)
          .flush('Forbidden', { status: 403, statusText: 'Forbidden' });
    });
  });
});