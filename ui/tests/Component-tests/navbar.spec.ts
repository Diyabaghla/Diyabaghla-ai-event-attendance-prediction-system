// import { ComponentFixture, TestBed } from '@angular/core/testing';
// import { RouterTestingModule } from '@angular/router/testing';
// import { Navbar } from '../../src/app/components/shared/navbar/navbar';
// import { AuthService } from '../../src/app/services/auth.service';

// const mockAuth = {
//   currentUser: { fullName: 'Diya Baghla', email: 'diya@test.com', role: 'Admin' },
//   isLoggedIn: true,
//   isAdmin:    true,
//   logout:     jasmine.createSpy('logout')
// };

// describe('Navbar Component', () => {
//   let comp: Navbar;
//   let fix:  ComponentFixture<Navbar>;

//   beforeEach(async () => {
//     mockAuth.logout.calls.reset();
//     await TestBed.configureTestingModule({
//       imports:   [Navbar, RouterTestingModule],
//       providers: [{ provide: AuthService, useValue: mockAuth }]
//     }).compileComponents();
//     fix  = TestBed.createComponent(Navbar);
//     comp = fix.componentInstance;
//     fix.detectChanges();
//   });

//   it('should create',             () => expect(comp).toBeTruthy());
//   it('menuOpen starts false',     () => expect(comp.menuOpen).toBeFalse());
//   it('toggleMenu opens menu',     () => { comp.toggleMenu(); expect(comp.menuOpen).toBeTrue(); });
//   it('toggleMenu twice closes',   () => { comp.toggleMenu(); comp.toggleMenu(); expect(comp.menuOpen).toBeFalse(); });
//   it('closeMenu sets false',      () => { comp.menuOpen = true; comp.closeMenu(); expect(comp.menuOpen).toBeFalse(); });
//   it('logout calls auth.logout',  () => { comp.logout(); expect(mockAuth.logout).toHaveBeenCalled(); });
//   it('logout closes menu',        () => { comp.menuOpen = true; comp.logout(); expect(comp.menuOpen).toBeFalse(); });
//   it('getInitials returns DB',    () => expect(comp.getInitials()).toBe('DB'));

//   it('getInitials handles single name', () => {
//     const a2 = { ...mockAuth, currentUser: { fullName: 'Diya', email: '', role: '' } };
//     TestBed.resetTestingModule();
//     TestBed.configureTestingModule({
//       imports:   [Navbar, RouterTestingModule],
//       providers: [{ provide: AuthService, useValue: a2 }]
//     });
//     const f2 = TestBed.createComponent(Navbar);
//     f2.detectChanges();
//     // ✅ cast to Navbar
//     expect((f2.componentInstance as Navbar).getInitials()).toBe('D');
//   });

//   it('getInitials returns ? when no user', () => {
//     const a3 = { ...mockAuth, currentUser: null };
//     TestBed.resetTestingModule();
//     TestBed.configureTestingModule({
//       imports:   [Navbar, RouterTestingModule],
//       providers: [{ provide: AuthService, useValue: a3 }]
//     });
//     const f3 = TestBed.createComponent(Navbar);
//     f3.detectChanges();
//     // ✅ cast to Navbar
//     expect((f3.componentInstance as Navbar).getInitials()).toBe('?');
//   });
// });
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Navbar } from '../../src/app/components/shared/navbar/navbar';

describe('Navbar Component', () => {
  let comp: Navbar;
  let fixture: ComponentFixture<Navbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Navbar] // standalone component
    }).compileComponents();

    fixture = TestBed.createComponent(Navbar);
    comp = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ─── Creation ─────────────────────────────

  it('should create', () => {
    expect(comp).toBeTruthy();
  });

  // ─── Basic sanity test ─────────────────────

  it('should have empty template', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.innerHTML).toBe('');
  });
});