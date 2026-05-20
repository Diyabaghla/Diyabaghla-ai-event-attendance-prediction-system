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