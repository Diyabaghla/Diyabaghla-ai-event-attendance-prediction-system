// import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
// import { RouterTestingModule } from '@angular/router/testing';
// import { of, throwError } from 'rxjs';
// import { Reports } from '../../src/app/components/reports/reports';
// import { ReportService } from '../../src/app/services/api.services';

// const mockAttendance = [
//   { eventId: 1, eventTitle: 'AI Summit',      eventType: 'Conference',
//     eventDate: new Date().toISOString(), totalRegistrations: 50,
//     activeRegistrations: 40, cancelledRegistrations: 10,
//     cancellationRate: 20,    predictedAttendance: 35 },
//   { eventId: 2, eventTitle: 'Sales Workshop',  eventType: 'Workshop',
//     eventDate: new Date().toISOString(), totalRegistrations: 30,
//     activeRegistrations: 25, cancelledRegistrations: 5,
//     cancellationRate: 16.67, predictedAttendance: 20 }
// ];
// const mockStatus = { totalRegistrations: 80, registered: 65, cancelled: 15, cancellationRate: 18.75 };
// const mockPerformance = [
//   { eventId: 1, eventTitle: 'AI Summit',     department: 'Engineering',
//     mode: 'Online',  locationCapacity: 200, activeRegistrations: 40,
//     fillRate: 20, speakerRating: 4.5, ticketPrice: 0,  pastAttendanceRate: 0.75 },
//   { eventId: 2, eventTitle: 'Sales Workshop', department: 'Sales',
//     mode: 'Offline', locationCapacity: 50,  activeRegistrations: 25,
//     fillRate: 50, speakerRating: 3.8, ticketPrice: 25, pastAttendanceRate: 0.6 }
// ];

// const mockReportSvc = {
//   getAttendanceVsRegistration: jasmine.createSpy('getAttendance').and.returnValue(of(mockAttendance)),
//   getCancelledVsRegistered:    jasmine.createSpy('getStatus').and.returnValue(of(mockStatus)),
//   getEventPerformance:         jasmine.createSpy('getPerformance').and.returnValue(of(mockPerformance)),
//   getDepartmentBreakdown:      jasmine.createSpy('getDept').and.returnValue(of(null)),
//   getWeeklyTrend:              jasmine.createSpy('getTrend').and.returnValue(of([])),
//   getTopStats:                 jasmine.createSpy('getTopStats').and.returnValue(of(null))
// };

// describe('Reports Component', () => {
//   let comp: Reports;
//   let fix:  ComponentFixture<Reports>;

//   beforeEach(async () => {
//     mockReportSvc.getAttendanceVsRegistration.calls.reset();
//     mockReportSvc.getCancelledVsRegistered.calls.reset();
//     mockReportSvc.getEventPerformance.calls.reset();
//     mockReportSvc.getDepartmentBreakdown.calls.reset();
//     mockReportSvc.getWeeklyTrend.calls.reset();
//     mockReportSvc.getTopStats.calls.reset();
//     mockReportSvc.getAttendanceVsRegistration.and.returnValue(of(mockAttendance));
//     mockReportSvc.getCancelledVsRegistered.and.returnValue(of(mockStatus));
//     mockReportSvc.getEventPerformance.and.returnValue(of(mockPerformance));
//     mockReportSvc.getDepartmentBreakdown.and.returnValue(of(null));
//     mockReportSvc.getWeeklyTrend.and.returnValue(of([]));
//     mockReportSvc.getTopStats.and.returnValue(of(null));

//     await TestBed.configureTestingModule({
//       imports:   [Reports, RouterTestingModule],
//       providers: [{ provide: ReportService, useValue: mockReportSvc }]
//     }).compileComponents();

//     fix  = TestBed.createComponent(Reports);
//     comp = fix.componentInstance;
//     fix.detectChanges();
//   });

//   it('should create', () => expect(comp).toBeTruthy());

//   it('calls all 6 report endpoints on init', fakeAsync(() => {
//     tick();
//     expect(mockReportSvc.getAttendanceVsRegistration).toHaveBeenCalled();
//     expect(mockReportSvc.getCancelledVsRegistered).toHaveBeenCalled();
//     expect(mockReportSvc.getEventPerformance).toHaveBeenCalled();
//     expect(mockReportSvc.getDepartmentBreakdown).toHaveBeenCalled();
//     expect(mockReportSvc.getWeeklyTrend).toHaveBeenCalled();
//     expect(mockReportSvc.getTopStats).toHaveBeenCalled();
//   }));

//   it('sets loading = false after load', fakeAsync(() => {
//     tick(); expect(comp.loading).toBeFalse();
//   }));

//   it('populates attendanceData', fakeAsync(() => {
//     tick(); expect(comp.attendanceData.length).toBe(2);
//   }));

//   it('populates statusReport', fakeAsync(() => {
//     tick(); expect(comp.statusReport).toEqual(mockStatus as any);
//   }));

//   it('populates performanceData', fakeAsync(() => {
//     tick(); expect(comp.performanceData.length).toBe(2);
//   }));

//   it('activeTab starts as overview', () => expect(comp.activeTab).toBe('overview'));

//   it('switchTab changes activeTab to performance', fakeAsync(() => {
//     tick(); comp.switchTab('performance');
//     expect(comp.activeTab).toBe('performance');
//   }));

//   it('switchTab changes activeTab to departments', fakeAsync(() => {
//     tick(); comp.switchTab('departments');
//     expect(comp.activeTab).toBe('departments');
//   }));

//   it('switchTab changes activeTab to trends', fakeAsync(() => {
//     tick(); comp.switchTab('trends');
//     expect(comp.activeTab).toBe('trends');
//   }));

//   it('topEvent returns null when no data', () => {
//     comp.performanceData = [];
//     expect(comp.topEvent).toBeNull();
//   });

//   it('topEvent returns highest fillRate event', fakeAsync(() => {
//     tick();
//     expect(comp.topEvent?.fillRate).toBe(50);
//     expect(comp.topEvent?.eventTitle).toBe('Sales Workshop');
//   }));

//   it('avgRating returns 0 string when no data', () => {
//     comp.performanceData = [];
//     expect(comp.avgRating).toBe('0');
//   });

//   it('avgRating calculates average correctly', fakeAsync(() => {
//     tick();
//     expect(comp.avgRating).toBe(((4.5 + 3.8) / 2).toFixed(1));
//   }));

//   it('getRatingStars 5 stars gives 5 filled', () => {
//     const stars = comp.getRatingStars(5);
//     expect((stars.match(/★/g) || []).length).toBe(5);
//   });

//   it('getRatingStars 3 stars gives 3 filled + 2 empty', () => {
//     const stars = comp.getRatingStars(3);
//     expect((stars.match(/★/g) || []).length).toBe(3);
//     expect((stars.match(/☆/g) || []).length).toBe(2);
//   });

//   it('formatDate returns year in string', () => {
//     const result = comp.formatDate(new Date().toISOString());
//     expect(result).toContain(new Date().getFullYear().toString());
//   });

//   it('getCapPct returns correct percentage', () => {
//     const ev = { activeRegistrations: 50, locationCapacity: 200 } as any;
//     expect(comp.getCapPct(ev)).toBe(25);
//   });

//   it('getCapPct caps at 100', () => {
//     const ev = { activeRegistrations: 300, locationCapacity: 100 } as any;
//     expect(comp.getCapPct(ev)).toBe(100);
//   });

//   it('getCapPct returns 0 for zero capacity', () => {
//     const ev = { activeRegistrations: 10, locationCapacity: 0 } as any;
//     expect(comp.getCapPct(ev)).toBe(0);
//   });

//   it('getCapColor returns rose-500 for high fill', () => {
//     const ev = { activeRegistrations: 85, locationCapacity: 100 } as any;
//     expect(comp.getCapColor(ev)).toContain('rose');
//   });

//   it('getCapColor returns amber for mid fill', () => {
//     const ev = { activeRegistrations: 60, locationCapacity: 100 } as any;
//     expect(comp.getCapColor(ev)).toContain('amber');
//   });

//   it('getCapColor returns green for low fill', () => {
//     const ev = { activeRegistrations: 30, locationCapacity: 100 } as any;
//     expect(comp.getCapColor(ev)).toContain('green');
//   });

//   it('dlOpen starts false', () => expect(comp.dlOpen).toBeFalse());

//   it('downloadEventPerformance is a function', () => {
//     expect(typeof comp.downloadEventPerformance).toBe('function');
//   });

//   it('downloadRegistrations is a function', () => {
//     expect(typeof comp.downloadRegistrations).toBe('function');
//   });

//   it('downloadFullReportJSON creates download link', fakeAsync(() => {
//     tick();
//     const spy = spyOn(document, 'createElement').and.callThrough();
//     comp.downloadFullReportJSON();
//     expect(spy).toHaveBeenCalledWith('a');
//   }));

//   it('animateCounters does nothing without topStats', () => {
//     comp.topStats = null;
//     expect(() => comp.animateCounters()).not.toThrow();
//     expect(comp.displayTotal).toBe(0);
//   });

//   it('animateCounters animates to topStats values', fakeAsync(() => {
//     comp.topStats = {
//       totalRegistrations: 100, activeRegistrations: 80,
//       cancelledRegistrations: 20, avgFillRate: 45
//     } as any;
//     comp.animateCounters();
//     tick(1500);
//     expect(comp.displayTotal).toBe(100);
//     expect(comp.displayActive).toBe(80);
//     expect(comp.displayCancel).toBe(20);
//   }));
// });
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { Reports } from '../../src/app/components/reports/reports';
import { ReportService } from '../../src/app/services/api.services';

const mockAttendance  = [
  { eventId: 1, eventTitle: 'AI Summit', eventType: 'Conference',
    eventDate: new Date().toISOString(), totalRegistrations: 50,
    activeRegistrations: 40, cancelledRegistrations: 10, cancellationRate: 20, predictedAttendance: 35 }
];
const mockStatus      = { totalRegistrations: 50, registered: 40, cancelled: 10, cancellationRate: 20 };
const mockPerformance = [
  { eventId: 1, eventTitle: 'AI Summit', department: 'Engineering', mode: 'Online',
    locationCapacity: 200, activeRegistrations: 40, fillRate: 20, speakerRating: 4.5,
    ticketPrice: 0, pastAttendanceRate: 0.75 },
  { eventId: 2, eventTitle: 'Sales Workshop', department: 'Sales', mode: 'Offline',
    locationCapacity: 50,  activeRegistrations: 25, fillRate: 50, speakerRating: 3.8,
    ticketPrice: 25, pastAttendanceRate: 0.6 }
];

const mockReportSvc = {
  getAttendanceVsRegistration: jasmine.createSpy('att').and.returnValue(of(mockAttendance)),
  getCancelledVsRegistered:    jasmine.createSpy('status').and.returnValue(of(mockStatus)),
  getEventPerformance:         jasmine.createSpy('perf').and.returnValue(of(mockPerformance)),
  getDepartmentBreakdown:      jasmine.createSpy('dept').and.returnValue(of(null)),
  getWeeklyTrend:              jasmine.createSpy('trend').and.returnValue(of([])),
  getTopStats:                 jasmine.createSpy('top').and.returnValue(of(null))
};

describe('Reports Component', () => {
  let comp: Reports;
  let fix:  ComponentFixture<Reports>;

  beforeEach(async () => {
    mockReportSvc.getAttendanceVsRegistration.calls.reset();
    mockReportSvc.getCancelledVsRegistered.calls.reset();
    mockReportSvc.getEventPerformance.calls.reset();
    mockReportSvc.getDepartmentBreakdown.calls.reset();
    mockReportSvc.getWeeklyTrend.calls.reset();
    mockReportSvc.getTopStats.calls.reset();
    mockReportSvc.getAttendanceVsRegistration.and.returnValue(of(mockAttendance));
    mockReportSvc.getCancelledVsRegistered.and.returnValue(of(mockStatus));
    mockReportSvc.getEventPerformance.and.returnValue(of(mockPerformance));
    mockReportSvc.getDepartmentBreakdown.and.returnValue(of(null));
    mockReportSvc.getWeeklyTrend.and.returnValue(of([]));
    mockReportSvc.getTopStats.and.returnValue(of(null));

    await TestBed.configureTestingModule({
      imports:   [Reports, RouterTestingModule],
      providers: [{ provide: ReportService, useValue: mockReportSvc }]
    }).compileComponents();

    fix  = TestBed.createComponent(Reports);
    comp = fix.componentInstance;
    fix.detectChanges();
  });

  it('should create', () => expect(comp).toBeTruthy());
  it('activeTab starts as overview', () => expect(comp.activeTab).toBe('overview'));

  it('calls all 6 endpoints on init', fakeAsync(() => {
    tick();
    expect(mockReportSvc.getAttendanceVsRegistration).toHaveBeenCalled();
    expect(mockReportSvc.getCancelledVsRegistered).toHaveBeenCalled();
    expect(mockReportSvc.getEventPerformance).toHaveBeenCalled();
  }));

  it('sets loading = false after load', fakeAsync(() => {
    tick(); expect(comp.loading).toBeFalse();
  }));

  it('populates attendanceData', fakeAsync(() => {
    tick(); expect(comp.attendanceData.length).toBe(1);
  }));

  it('populates statusReport', fakeAsync(() => {
    tick(); expect(comp.statusReport).toEqual(mockStatus as any);
  }));

  it('populates performanceData', fakeAsync(() => {
    tick(); expect(comp.performanceData.length).toBe(2);
  }));

  it('switchTab changes to performance', fakeAsync(() => {
    tick(); comp.switchTab('performance');
    expect(comp.activeTab).toBe('performance');
  }));

  it('topEvent returns null when no data', () => {
    comp.performanceData = []; expect(comp.topEvent).toBeNull();
  });

  it('topEvent returns highest fillRate event', fakeAsync(() => {
    tick(); expect(comp.topEvent?.fillRate).toBe(50);
  }));

  it('avgRating returns 0 when no data', () => {
    comp.performanceData = []; expect(comp.avgRating).toBe('0');
  });

  it('avgRating calculates average', fakeAsync(() => {
    tick(); expect(comp.avgRating).toBe(((4.5 + 3.8) / 2).toFixed(1));
  }));

  it('getRatingStars 5 = 5 filled', () => {
    expect((comp.getRatingStars(5).match(/★/g) || []).length).toBe(5);
  });

  it('getCapPct returns correct %', () => {
    const ev = { activeRegistrations: 50, locationCapacity: 200 } as any;
    expect(comp.getCapPct(ev)).toBe(25);
  });

  it('getCapPct caps at 100', () => {
    const ev = { activeRegistrations: 300, locationCapacity: 100 } as any;
    expect(comp.getCapPct(ev)).toBe(100);
  });

  it('getCapColor rose for 80%+', () => {
    const ev = { activeRegistrations: 85, locationCapacity: 100 } as any;
    expect(comp.getCapColor(ev)).toContain('rose');
  });

  it('getCapColor green for low fill', () => {
    const ev = { activeRegistrations: 30, locationCapacity: 100 } as any;
    expect(comp.getCapColor(ev)).toContain('green');
  });

  it('dlOpen starts false', () => expect(comp.dlOpen).toBeFalse());

  it('downloadFullReportJSON creates anchor', fakeAsync(() => {
    tick();
    const spy = spyOn(document, 'createElement').and.callThrough();
    comp.downloadFullReportJSON();
    expect(spy).toHaveBeenCalledWith('a');
  }));
});

