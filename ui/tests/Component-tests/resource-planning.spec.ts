import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
 
import { ResourcePlanning } from '../../src/app/components/resource-planning/resource-planning';
import { EventService, PredictionService } from '../../src/app/services/api.services';
import { Event, AttendancePredictionResult } from '../../src/app/models/models';
 
// ─── Mock data ────────────────────────────────────────────────────────────────
const mockEvents: Event[] = [
  {
    id: 1,
    title: 'AI Summit 2026',
    description: 'Annual AI conference',
    eventType: 'Conference',
    mode: 'Online',
    department: 'Engineering',
    eventDate: '2026-06-01T10:00:00Z',
    dayOfWeek: 'Monday',
    durationHours: 4.0,
    speakerRating: 4.5,
    reminderSent: true,
    pastAttendanceRate: 0.78,
    weather: 'Clear',
    ticketPrice: 0,
    locationCapacity: 500,
    activeRegistrations: 120
  } as any,
  {
    id: 2,
    title: 'Sales Workshop',
    description: 'Quarterly training',
    eventType: 'Workshop',
    mode: 'Offline',
    department: 'Sales',
    eventDate: '2026-07-10T09:00:00Z',
    dayOfWeek: 'Friday',
    durationHours: 2.0,
    speakerRating: 3.5,
    reminderSent: false,
    pastAttendanceRate: 0.60,
    weather: 'Clear',
    ticketPrice: 10,
    locationCapacity: 100,
    activeRegistrations: 45
  } as any
];
 
const mockPrediction: AttendancePredictionResult = {
  predictedAttendance: 200,
  activeRegistrations: 250
} as any;
 
// ─── Stubs ────────────────────────────────────────────────────────────────────
const eventServiceStub = {
  getAll: jasmine.createSpy('getAll').and.returnValue(of(mockEvents))
};
 
const predictionServiceStub = {
  predictAttendance: jasmine.createSpy('predictAttendance').and.returnValue(of(mockPrediction))
};
 
// ═════════════════════════════════════════════════════════════════════════════
// ResourcePlanning Component Tests
// ═════════════════════════════════════════════════════════════════════════════
describe('ResourcePlanning', () => {
  let component: ResourcePlanning;
  let fixture: ComponentFixture<ResourcePlanning>;
 
  beforeEach(async () => {
    // Reset spy call counts AND return values before every test
    eventServiceStub.getAll.calls.reset();
    predictionServiceStub.predictAttendance.calls.reset();
    eventServiceStub.getAll.and.returnValue(of(mockEvents));
    predictionServiceStub.predictAttendance.and.returnValue(of(mockPrediction));
 
    await TestBed.configureTestingModule({
      imports: [ResourcePlanning, CommonModule, FormsModule],
      providers: [
        { provide: EventService,    useValue: eventServiceStub },
        { provide: PredictionService, useValue: predictionServiceStub }
      ]
    }).compileComponents();
 
    fixture = TestBed.createComponent(ResourcePlanning);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
 
  // ── Component creation ────────────────────────────────────────────────────
  describe('Initialisation', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });
 
    it('should start with correct default values', () => {
      expect(component.selectedEventId).toBeNull();
      expect(component.prediction).toBeNull();
      expect(component.categories).toEqual([]);
      expect(component.loading).toBeFalse();
      expect(component.error).toBe('');
      expect(component.manualOverride).toBeFalse();
      expect(component.manualAttendance).toBe(100);
      expect(component.activeCategory).toBe('seating');
      expect(component.calculated).toBeFalse();
      expect(component.bufferPercent).toBe(8);
    });
 
    it('should load events on init', () => {
      expect(eventServiceStub.getAll).toHaveBeenCalled();
      expect(component.events.length).toBe(2);
      expect(component.loadingEvents).toBeFalse();
    });
 
    it('should set loadingEvents false after events load', () => {
      expect(component.loadingEvents).toBeFalse();
    });
 
    it('should handle event loading error gracefully', async () => {
      eventServiceStub.getAll.and.returnValue(throwError(() => new Error('Network error')));
      component.ngOnInit();
      expect(component.loadingEvents).toBeFalse();
    });
  });
 
  // ── selectedEvent getter ──────────────────────────────────────────────────
  describe('selectedEvent getter', () => {
    it('should return undefined when no event is selected', () => {
      component.selectedEventId = null;
      expect(component.selectedEvent).toBeUndefined();
    });
 
    it('should return the correct event when one is selected', () => {
      component.selectedEventId = 1;
      const ev = component.selectedEvent;
      expect(ev).toBeDefined();
      expect(ev!.title).toBe('AI Summit 2026');
    });
 
    it('should return undefined for an ID that does not exist', () => {
      component.selectedEventId = 999;
      expect(component.selectedEvent).toBeUndefined();
    });
  });
 
  // ── activeCategory$ getter ────────────────────────────────────────────────
  describe('activeCategory$ getter', () => {
    it('should return undefined when categories are empty', () => {
      component.categories = [];
      expect(component.activeCategory$).toBeUndefined();
    });
 
    it('should return the matching category by id', () => {
      component.buildCategories(100);
      component.activeCategory = 'catering';
      const cat = component.activeCategory$;
      expect(cat).toBeDefined();
      expect(cat!.id).toBe('catering');
    });
  });
 
  // ── onSelect ──────────────────────────────────────────────────────────────
  describe('onSelect()', () => {
    it('should reset prediction, categories, error and calculated flag', () => {
      component.prediction   = mockPrediction;
      component.categories   = [{ id: 'seating', icon: '🪑', label: 'Seating', color: '#00a8a8', items: [] }];
      component.error        = 'Some error';
      component.calculated   = true;
 
      component.onSelect();
 
      expect(component.prediction).toBeNull();
      expect(component.categories).toEqual([]);
      expect(component.error).toBe('');
      expect(component.calculated).toBeFalse();
    });
  });
 
  // ── setMode ───────────────────────────────────────────────────────────────
  describe('setMode()', () => {
    it('should set manualOverride to true and reset state', () => {
      component.categories = [{ id: 'seating', icon: '🪑', label: 'Seating', color: '#00a8a8', items: [] }];
      component.calculated = true;
      component.error = 'err';
 
      component.setMode(true);
 
      expect(component.manualOverride).toBeTrue();
      expect(component.categories).toEqual([]);
      expect(component.calculated).toBeFalse();
      expect(component.error).toBe('');
    });
 
    it('should set manualOverride to false when switching to AI mode', () => {
      component.setMode(false);
      expect(component.manualOverride).toBeFalse();
    });
 
    it('should reset categories when switching modes', () => {
      component.categories = [{ id: 'seating', icon: '🪑', label: 'Seating', color: '#00a8a8', items: [] }];
      component.setMode(true);
      expect(component.categories).toEqual([]);
    });
  });
 
  // ── calculate ─────────────────────────────────────────────────────────────
  describe('calculate()', () => {
    it('should do nothing when no event is selected', () => {
      component.selectedEventId = null;
      component.calculate();
      expect(predictionServiceStub.predictAttendance).not.toHaveBeenCalled();
    });
 
    it('should call buildCategories with manualAttendance when in manual mode', () => {
      component.selectedEventId = 1;
      component.manualOverride  = true;
      component.manualAttendance = 150;
 
      spyOn(component, 'buildCategories');
      component.calculate();
 
      expect(component.buildCategories).toHaveBeenCalledWith(150);
      expect(predictionServiceStub.predictAttendance).not.toHaveBeenCalled();
    });
 
    it('should call predictAttendance API when in AI mode', () => {
      component.selectedEventId = 1;
      component.manualOverride  = false;
 
      component.calculate();
 
      expect(predictionServiceStub.predictAttendance).toHaveBeenCalledWith(1);
    });
 
    it('should set loading true then false after AI prediction', () => {
      component.selectedEventId = 1;
      component.manualOverride  = false;
 
      component.calculate();
 
      expect(component.loading).toBeFalse(); // synchronous with of()
      expect(component.prediction).toEqual(mockPrediction);
    });
 
    it('should build categories after successful AI prediction', () => {
      component.selectedEventId = 1;
      component.manualOverride  = false;
 
      spyOn(component, 'buildCategories');
      component.calculate();
 
      expect(component.buildCategories).toHaveBeenCalledWith(mockPrediction.predictedAttendance);
    });
 
    it('should set error message when AI prediction fails', () => {
      component.selectedEventId = 1;
      component.manualOverride  = false;
      predictionServiceStub.predictAttendance.and.returnValue(
        throwError(() => ({ error: { message: 'ML service down' } }))
      );
 
      component.calculate();
 
      expect(component.error).toBe('ML service down');
      expect(component.loading).toBeFalse();
    });
 
    it('should set fallback error message when error has no message', () => {
      component.selectedEventId = 1;
      component.manualOverride  = false;
      predictionServiceStub.predictAttendance.and.returnValue(
        throwError(() => ({}))
      );
 
      component.calculate();
 
      expect(component.error).toBe('AI service unavailable. Switch to Manual mode.');
    });
  });
 
  // ── buildCategories ───────────────────────────────────────────────────────
  describe('buildCategories()', () => {
    it('should create exactly 4 categories', () => {
      component.buildCategories(100);
      expect(component.categories.length).toBe(4);
    });
 
    it('should create categories with ids: seating, catering, staff, equipment', () => {
      component.buildCategories(100);
      const ids = component.categories.map(c => c.id);
      expect(ids).toContain('seating');
      expect(ids).toContain('catering');
      expect(ids).toContain('staff');
      expect(ids).toContain('equipment');
    });
 
    it('should set calculated to true', () => {
      component.buildCategories(100);
      expect(component.calculated).toBeTrue();
    });
 
    it('should reset activeCategory to seating', () => {
      component.activeCategory = 'staff';
      component.buildCategories(100);
      expect(component.activeCategory).toBe('seating');
    });
 
    it('should compute chairs with buffer for 100 attendees (default 8% buffer)', () => {
      component.bufferPercent = 8;
      component.buildCategories(100);
      const seating = component.categories.find(c => c.id === 'seating')!;
      const chairs  = seating.items.find(i => i.label === 'Main Chairs')!;
      expect(chairs.value).toBe(Math.ceil(100 * 1.08)); // 108
    });
 
    it('should compute tables at ratio 1:6', () => {
      component.buildCategories(120);
      const seating = component.categories.find(c => c.id === 'seating')!;
      const tables  = seating.items.find(i => i.label === 'Tables')!;
      expect(tables.value).toBe(Math.ceil(120 / 6)); // 20
    });
 
    it('should compute water at 2.5 bottles per attendee', () => {
      component.buildCategories(100);
      const catering = component.categories.find(c => c.id === 'catering')!;
      const water    = catering.items.find(i => i.label === 'Water Bottles')!;
      expect(water.value).toBe(Math.ceil(100 * 2.5)); // 250
    });
 
    it('should enforce minimum staff of 4 for very small events', () => {
      component.buildCategories(10); // 10/25 = 0.4 → min 4
      const staffCat = component.categories.find(c => c.id === 'staff')!;
      const staff    = staffCat.items.find(i => i.label === 'Total Staff')!;
      expect(staff.value).toBe(4);
    });
 
    it('should scale staff correctly for large attendance', () => {
      component.buildCategories(500);
      const staffCat = component.categories.find(c => c.id === 'staff')!;
      const staff    = staffCat.items.find(i => i.label === 'Total Staff')!;
      expect(staff.value).toBe(Math.ceil(500 / 25)); // 20
    });
 
    it('should enforce minimum 2 security guards', () => {
      component.buildCategories(50); // 50/100 = 0.5 → min 2
      const staffCat   = component.categories.find(c => c.id === 'staff')!;
      const security   = staffCat.items.find(i => i.label === 'Security')!;
      expect(security.value).toBe(2);
    });
 
    it('should enforce minimum 1 projector', () => {
      component.buildCategories(10);
      const equipment = component.categories.find(c => c.id === 'equipment')!;
      const projector = equipment.items.find(i => i.label === 'Projectors')!;
      expect(projector.value).toBe(1);
    });
 
    it('should enforce minimum 2 microphones', () => {
      component.buildCategories(10);
      const equipment = component.categories.find(c => c.id === 'equipment')!;
      const mics      = equipment.items.find(i => i.label === 'Microphones')!;
      expect(mics.value).toBe(2);
    });
 
    it('should compute totalItems correctly', () => {
      component.buildCategories(100);
      const buf     = 1 + 8 / 100;
      const chairs  = Math.ceil(100 * buf);
      const extra   = Math.ceil(100 * 0.05);
      const tables  = Math.ceil(100 / 6);
      const meals   = Math.ceil(100 * buf);
      const snacks  = Math.ceil(100 * 1.15);
      expect(component.totalItems).toBe(chairs + extra + tables + meals + snacks);
    });
 
    it('should compute totalStaff correctly', () => {
      component.buildCategories(200);
      const staff    = Math.ceil(200 / 25);
      const regDesk  = Math.ceil(200 / 80);
      const security = Math.max(2, Math.ceil(200 / 100));
      const tech     = Math.max(1, Math.ceil(200 / 150));
      expect(component.totalStaff).toBe(staff + regDesk + security + tech);
    });
 
    it('should initialise all display values to 0 before animation', () => {
      // Stop animation timer from interfering
      spyOn(component, 'animateCounters');
      component.buildCategories(100);
      component.categories.forEach(cat => {
        cat.items.forEach(item => expect(item.display).toBe(0));
      });
    });
 
    it('should call animateCounters after building categories', () => {
      spyOn(component, 'animateCounters');
      component.buildCategories(100);
      expect(component.animateCounters).toHaveBeenCalled();
    });
  });
 
  // ── animateCounters ───────────────────────────────────────────────────────
  describe('animateCounters()', () => {
    it('should animate display values to final values', fakeAsync(() => {
      spyOn(component, 'animateCounters').and.callThrough();
      component.buildCategories(100);
 
      tick(1500); // wait longer than 1000ms animation
 
      component.categories.forEach(cat => {
        cat.items.forEach(item => {
          expect(item.display).toBe(item.value);
        });
      });
    }));
  });
 
  // ── attendanceCount getter ────────────────────────────────────────────────
  describe('attendanceCount getter', () => {
    it('should return manualAttendance when manualOverride is true', () => {
      component.manualOverride   = true;
      component.manualAttendance = 250;
      expect(component.attendanceCount).toBe(250);
    });
 
    it('should return predictedAttendance when manualOverride is false', () => {
      component.manualOverride = false;
      component.prediction     = mockPrediction;
      expect(component.attendanceCount).toBe(mockPrediction.predictedAttendance);
    });
 
    it('should return 0 when not manual and no prediction exists', () => {
      component.manualOverride = false;
      component.prediction     = null;
      expect(component.attendanceCount).toBe(0);
    });
  });
 
  // ── capacityFill getter ───────────────────────────────────────────────────
  describe('capacityFill getter', () => {
    it('should return 0 when no event is selected', () => {
      component.selectedEventId = null;
      expect(component.capacityFill).toBe(0);
    });
 
    it('should return 0 when attendance count is 0', () => {
      component.selectedEventId = 1;
      component.manualOverride  = true;
      component.manualAttendance = 0;
      expect(component.capacityFill).toBe(0);
    });
 
    it('should calculate correct fill percentage', () => {
      component.selectedEventId = 1;      // locationCapacity = 500
      component.manualOverride   = true;
      component.manualAttendance = 250;   // 250/500 = 50%
      expect(component.capacityFill).toBe(50);
    });
 
    it('should cap fill at 100 even if attendance exceeds capacity', () => {
      component.selectedEventId = 1;      // locationCapacity = 500
      component.manualOverride   = true;
      component.manualAttendance = 1000;  // would be 200%
      expect(component.capacityFill).toBe(100);
    });
  });
 
  // ── capacityColor getter ──────────────────────────────────────────────────
  describe('capacityColor getter', () => {
    it('should return green when fill is below 70%', () => {
      component.selectedEventId = 1;
      component.manualOverride   = true;
      component.manualAttendance = 100; // 100/500 = 20%
      expect(component.capacityColor).toBe('#10b981');
    });
 
    it('should return amber when fill is between 70% and 89%', () => {
      component.selectedEventId = 1;
      component.manualOverride   = true;
      component.manualAttendance = 375; // 375/500 = 75%
      expect(component.capacityColor).toBe('#f59e0b');
    });
 
    it('should return red when fill is 90% or above', () => {
      component.selectedEventId = 1;
      component.manualOverride   = true;
      component.manualAttendance = 480; // 480/500 = 96%
      expect(component.capacityColor).toBe('#f43f5e');
    });
  });
 
  // ── donutCircumference getter ─────────────────────────────────────────────
  describe('donutCircumference getter', () => {
    it('should return 2 * PI * 54', () => {
      const expected = 2 * Math.PI * 54;
      expect(component.donutCircumference).toBeCloseTo(expected, 5);
    });
  });
 
  // ── getCategoryDash ───────────────────────────────────────────────────────
  describe('getCategoryDash()', () => {
    it('should return 0 when categories total is 0', () => {
      component.buildCategories(100);
      // Simulate all values as 0
      component.categories.forEach(c => c.items.forEach(i => i.value = 0));
      const cat = component.categories[0];
      expect(component.getCategoryDash(cat)).toBe(0);
    });
 
    it('should return proportional dash for a category', () => {
      component.buildCategories(100);
      const cat   = component.categories[0];
      const total = component.categories.reduce(
        (s, c) => s + c.items.reduce((ss, i) => ss + i.value, 0), 0
      );
      const catTotal = cat.items.reduce((s, i) => s + i.value, 0);
      const expected = (catTotal / total) * component.donutCircumference;
      expect(component.getCategoryDash(cat)).toBeCloseTo(expected, 5);
    });
  });
 
  // ── getCategoryOffset ─────────────────────────────────────────────────────
  describe('getCategoryOffset()', () => {
    it('should return full circumference for the first category (offset 0)', () => {
      component.buildCategories(100);
      const offset = component.getCategoryOffset(0);
      expect(offset).toBeCloseTo(component.donutCircumference, 5);
    });
 
    it('should return 0 when categories total is 0', () => {
      component.buildCategories(100);
      component.categories.forEach(c => c.items.forEach(i => i.value = 0));
      expect(component.getCategoryOffset(0)).toBe(0);
    });
  });
 
  // ── formatDate ────────────────────────────────────────────────────────────
  describe('formatDate()', () => {
    it('should format ISO date string to readable format', () => {
      const formatted = component.formatDate('2026-06-01T10:00:00Z');
      expect(formatted).toContain('Jun');
      expect(formatted).toContain('2026');
    });
 
    it('should include the day number in the formatted date', () => {
      const formatted = component.formatDate('2026-06-01T10:00:00Z');
      expect(formatted).toContain('1');
    });
  });
 
  // ── bufferPercent effect ──────────────────────────────────────────────────
  describe('bufferPercent effect on calculations', () => {
    it('should produce more chairs with a higher buffer percent', () => {
      component.bufferPercent = 5;
      component.buildCategories(100);
      const seating5 = component.categories.find(c => c.id === 'seating')!;
      const chairs5  = seating5.items.find(i => i.label === 'Main Chairs')!.value;
 
      component.bufferPercent = 20;
      component.buildCategories(100);
      const seating20 = component.categories.find(c => c.id === 'seating')!;
      const chairs20  = seating20.items.find(i => i.label === 'Main Chairs')!.value;
 
      expect(chairs20).toBeGreaterThan(chairs5);
    });
 
    it('should produce more meals with a higher buffer percent', () => {
      component.bufferPercent = 5;
      component.buildCategories(100);
      const catering5 = component.categories.find(c => c.id === 'catering')!;
      const meals5    = catering5.items.find(i => i.label === 'Full Meals')!.value;
 
      component.bufferPercent = 20;
      component.buildCategories(100);
      const catering20 = component.categories.find(c => c.id === 'catering')!;
      const meals20    = catering20.items.find(i => i.label === 'Full Meals')!.value;
 
      expect(meals20).toBeGreaterThan(meals5);
    });
  });
 
  // ── Edge cases ────────────────────────────────────────────────────────────
  describe('Edge cases', () => {
    it('should handle attendance of 1 without errors', () => {
      expect(() => component.buildCategories(1)).not.toThrow();
    });
 
    it('should handle very large attendance without errors', () => {
      expect(() => component.buildCategories(10000)).not.toThrow();
    });
 
    it('should handle events returning empty array from API', () => {
      eventServiceStub.getAll.and.returnValue(of([]));
      component.ngOnInit();
      expect(component.events).toEqual([]);
      expect(component.loadingEvents).toBeFalse();
    });
 
    it('should handle null response from events API', () => {
      eventServiceStub.getAll.and.returnValue(of(null as any));
      component.ngOnInit();
      expect(component.events).toEqual([]);
    });
  });
});
 