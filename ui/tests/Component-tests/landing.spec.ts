// import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
// import { RouterTestingModule } from '@angular/router/testing';
// import { Router } from '@angular/router';
// import { Landing } from '../../src/app/components/landing/landing';
// import { AuthService } from '../../src/app/services/auth.service';

// const mockAuth   = { isLoggedIn: false };
// const mockRouter = { navigate: jasmine.createSpy('navigate') };

// describe('Landing', () => {
//   let comp: Landing;
//   let fix:  ComponentFixture<Landing>;

//   beforeEach(async () => {
//     mockRouter.navigate.calls.reset();

//     await TestBed.configureTestingModule({
//       imports:   [Landing, RouterTestingModule],
//       providers: [
//         { provide: AuthService, useValue: mockAuth },
//         { provide: Router,      useValue: mockRouter }
//       ]
//     }).compileComponents();

//     fix  = TestBed.createComponent(Landing);
//     comp = fix.componentInstance;
//     fix.detectChanges();
//   });

//   it('should create',                    () => expect(comp).toBeTruthy());
//   it('scrolled starts false',            () => expect(comp.scrolled).toBeFalse());
//   it('has 6 features',                   () => expect(comp.features.length).toBe(6));
//   it('has 4 steps',                      () => expect(comp.steps.length).toBe(4));
//   it('has 3 testimonials',               () => expect(comp.testimonials.length).toBe(3));
//   it('has 4 stats',                      () => expect(comp.stats.length).toBe(4));
//   it('displayStats has 4 items',         () => expect(comp.displayStats.length).toBe(4));

//   it('goToDashboard navigates to /signup when not logged in', () => {
//     comp.goToDashboard();
//     expect(mockRouter.navigate).toHaveBeenCalledWith(['/signup']);
//   });

//   it('goToDashboard navigates to /app/dashboard when logged in', () => {
//     const loggedInAuth = { isLoggedIn: true };
//     TestBed.resetTestingModule();
//     TestBed.configureTestingModule({
//       imports:   [Landing, RouterTestingModule],
//       providers: [
//         { provide: AuthService, useValue: loggedInAuth },
//         { provide: Router,      useValue: mockRouter }
//       ]
//     });
//     const f2 = TestBed.createComponent(Landing);
//     f2.detectChanges();
//     f2.componentInstance.goToDashboard();
//     expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/dashboard']);
//   });

//   it('onScroll sets scrolled = true when scrollY > 40', () => {
//     spyOnProperty(window, 'scrollY', 'get').and.returnValue(100);
//     comp.onScroll();
//     expect(comp.scrolled).toBeTrue();
//   });

//   it('onScroll sets scrolled = false when scrollY <= 40', () => {
//     comp.scrolled = true;
//     spyOnProperty(window, 'scrollY', 'get').and.returnValue(10);
//     comp.onScroll();
//     expect(comp.scrolled).toBeFalse();
//   });

//   it('each feature has icon, title, color, desc', () => {
//     comp.features.forEach(f => {
//       expect(f.icon).toBeTruthy();
//       expect(f.title).toBeTruthy();
//       expect(f.color).toMatch(/^#/);
//       expect(f.desc).toBeTruthy();
//     });
//   });

//   it('each step has num, icon, title, desc', () => {
//     comp.steps.forEach(s => {
//       expect(s.num).toBeTruthy();
//       expect(s.icon).toBeTruthy();
//       expect(s.title).toBeTruthy();
//       expect(s.desc).toBeTruthy();
//     });
//   });

//   it('each testimonial has name, role, text, avatar, color', () => {
//     comp.testimonials.forEach(t => {
//       expect(t.name).toBeTruthy();
//       expect(t.role).toBeTruthy();
//       expect(t.text).toBeTruthy();
//       expect(t.avatar).toBeTruthy();
//       expect(t.color).toMatch(/^#/);
//     });
//   });

//   it('animateStats updates displayStats after tick', fakeAsync(() => {
//     comp['animateStats']();
//     tick(2000);
//     expect(comp.displayStats[0]).toContain('%');
//     expect(comp.displayStats[1]).toContain('x');
//     expect(comp.displayStats[2]).toContain('%');
//   }));
// });
// import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
// import { RouterTestingModule } from '@angular/router/testing';
// import { Router } from '@angular/router';
// import { Landing } from '../../src/app/components/landing/landing';
// import { AuthService } from '../../src/app/services/auth.service';

// const mockAuth   = { isLoggedIn: false };
// const mockRouter = { navigate: jasmine.createSpy('navigate') };

// describe('Landing Component', () => {
//   let comp: Landing;
//   let fix:  ComponentFixture<Landing>;

//   beforeEach(async () => {
//     mockRouter.navigate.calls.reset();
//     await TestBed.configureTestingModule({
//       imports:   [Landing, RouterTestingModule],
//       providers: [
//         { provide: AuthService, useValue: mockAuth },
//         { provide: Router,      useValue: mockRouter }
//       ]
//     }).compileComponents();
//     fix  = TestBed.createComponent(Landing);
//     comp = fix.componentInstance;
//     fix.detectChanges();
//   });

//   it('should create',            () => expect(comp).toBeTruthy());
//   it('scrolled starts false',    () => expect(comp.scrolled).toBeFalse());
//   it('has 6 features',           () => expect(comp.features.length).toBe(6));
//   it('has 4 steps',              () => expect(comp.steps.length).toBe(4));
//   it('has 3 testimonials',       () => expect(comp.testimonials.length).toBe(3));
//   it('has 4 stats',              () => expect(comp.stats.length).toBe(4));

//   it('goToDashboard navigates to /signup when not logged in', () => {
//     comp.goToDashboard();
//     expect(mockRouter.navigate).toHaveBeenCalledWith(['/signup']);
//   });

//   it('onScroll sets scrolled = true when scrollY > 40', () => {
//     spyOnProperty(window, 'scrollY', 'get').and.returnValue(100);
//     comp.onScroll();
//     expect(comp.scrolled).toBeTrue();
//   });

//   it('onScroll sets scrolled = false when scrollY <= 40', () => {
//     comp.scrolled = true;
//     spyOnProperty(window, 'scrollY', 'get').and.returnValue(10);
//     comp.onScroll();
//     expect(comp.scrolled).toBeFalse();
//   });

//   it('each feature has icon, title, color, desc', () => {
//     comp.features.forEach((f: any) => {
//       expect(f.icon).toBeTruthy(); expect(f.title).toBeTruthy();
//       expect(f.color).toMatch(/^#/); expect(f.desc).toBeTruthy();
//     });
//   });
// });
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';   // ← KEY FIX
import { Landing } from '../../src/app/components/landing/landing';
import { AuthService } from '../../src/app/services/auth.service';
import { Router } from '@angular/router';
 
describe('Landing Component', () => {
  let component: Landing;
  let fixture: ComponentFixture<Landing>;
  let router: Router;
  let authService: jasmine.SpyObj<AuthService>;
 
  beforeEach(async () => {
    authService = jasmine.createSpyObj(
      'AuthService',
      [],
      { isLoggedIn: false }
    );
 
    await TestBed.configureTestingModule({
      imports: [
        Landing,
        RouterTestingModule   // ← replaces provideRouter([]) — fully satisfies router deps
      ],
      providers: [
        { provide: AuthService, useValue: authService }
        // Do NOT provide Router manually — RouterTestingModule provides it
      ]
    }).compileComponents();
 
    // Get the real Router instance from TestBed so spying works correctly
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
 
    fixture = TestBed.createComponent(Landing);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
 
  // ── Basic ──────────────────────────────────────────────────────────────────
  it('should create', () => {
    expect(component).toBeTruthy();
  });
 
  it('should initialize default values', () => {
    expect(component.scrolled).toBeFalse();
    expect(component.displayStats.length).toBe(4);
  });
 
  it('should have features defined', () => {
    expect(component.features.length).toBeGreaterThan(0);
  });
 
  it('should have steps defined', () => {
    expect(component.steps.length).toBeGreaterThan(0);
  });
 
  it('should have testimonials defined', () => {
    expect(component.testimonials.length).toBeGreaterThan(0);
  });
 
  it('should have stats defined', () => {
    expect(component.stats.length).toBe(4);
  });
 
  // ── Scroll ─────────────────────────────────────────────────────────────────
  it('should update scrolled to true on window scroll past threshold', () => {
    spyOnProperty(window, 'scrollY').and.returnValue(100);
    component.onScroll();
    expect(component.scrolled).toBeTrue();
  });
 
  it('should set scrolled to false when scrollY is 0', () => {
    component.scrolled = true;
    spyOnProperty(window, 'scrollY').and.returnValue(0);
    component.onScroll();
    expect(component.scrolled).toBeFalse();
  });
 
  // ── Navigation ─────────────────────────────────────────────────────────────
  it('should navigate to /signup when not logged in', () => {
    Object.defineProperty(authService, 'isLoggedIn', { get: () => false, configurable: true });
    component.goToDashboard();
    expect(router.navigate).toHaveBeenCalledWith(['/signup']);
  });
 
  it('should navigate to /app/dashboard when logged in', () => {
    Object.defineProperty(authService, 'isLoggedIn', { get: () => true, configurable: true });
    component.goToDashboard();
    expect(router.navigate).toHaveBeenCalledWith(['/app/dashboard']);
  });
 
  // ── Lifecycle ──────────────────────────────────────────────────────────────
  it('should call startCanvas and animateStats on ngAfterViewInit', fakeAsync(() => {
    spyOn<any>(component, 'startCanvas');
    spyOn<any>(component, 'animateStats');
 
    component.ngAfterViewInit();
    tick(800);
 
    expect((component as any).startCanvas).toHaveBeenCalled();
    expect((component as any).animateStats).toHaveBeenCalled();
  }));
 
  // ── Animation ──────────────────────────────────────────────────────────────
  it('should animate stats over time', fakeAsync(() => {
    (component as any).animateStats();
    tick(2000);
 
    expect(component.displayStats[0]).toContain('%');
    expect(component.displayStats[1]).toContain('x');
  }));
 
  // ── Canvas safety ──────────────────────────────────────────────────────────
  it('should not crash if heroCanvas is undefined', () => {
    component.heroCanvas = undefined as any;
    expect(() => (component as any).startCanvas()).not.toThrow();
  });
 
  it('should initialize canvas safely when context is available', () => {
    const canvas = document.createElement('canvas');
    component.heroCanvas = { nativeElement: canvas } as any;
 
    spyOn(canvas, 'getContext').and.returnValue({
      clearRect: () => {},
      beginPath: () => {},
      stroke:    () => {},
      moveTo:    () => {},
      lineTo:    () => {},
      arc:       () => {},
      fill:      () => {}
    } as any);
 
    expect(() => (component as any).startCanvas()).not.toThrow();
  });
 
  // ── Destroy ────────────────────────────────────────────────────────────────
  it('should cancel animation frame on destroy', () => {
    spyOn(window, 'cancelAnimationFrame');
    component.animFrameId = 123;
    component.ngOnDestroy();
    expect(window.cancelAnimationFrame).toHaveBeenCalledWith(123);
  });
});