// import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
// import { ReactiveFormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
// import { of, throwError } from 'rxjs';
// import { Login } from '../../src/app/components/auth/login/login';
// import { AuthService } from '../../src/app/services/auth.service';
// import { ToastService } from '../../src/app/services/toast.service';

// const mockAuthService = {
//   isLoggedIn: false,
//   login: jasmine.createSpy('login')
// };
// const mockRouter   = { navigate: jasmine.createSpy('navigate') };
// const mockToast    = { success: jasmine.createSpy('success'), error: jasmine.createSpy('error') };

// describe('Login Component', () => {
//   let comp: Login;
//   let fix:  ComponentFixture<Login>;

//   beforeEach(async () => {
//     mockAuthService.login.calls.reset();
//     mockRouter.navigate.calls.reset();
//     mockToast.success.calls.reset();

//     await TestBed.configureTestingModule({
//       imports:   [Login, ReactiveFormsModule],
//       providers: [
//         { provide: AuthService,  useValue: mockAuthService },
//         { provide: Router,       useValue: mockRouter },
//         { provide: ToastService, useValue: mockToast }
//       ]
//     }).compileComponents();

//     fix  = TestBed.createComponent(Login);
//     comp = fix.componentInstance;
//     fix.detectChanges();
//   });

//   // ── Creation ──────────────────────────────────────────────
//   it('should create', () => expect(comp).toBeTruthy());

//   it('should initialise form with empty fields', () => {
//     expect(comp.form.get('email')?.value).toBe('');
//     expect(comp.form.get('password')?.value).toBe('');
//   });

//   it('should start with loading = false and no error', () => {
//     expect(comp.loading).toBeFalse();
//     expect(comp.error).toBe('');
//   });

//   it('should have 4 feature items', () => {
//     expect(comp.features.length).toBe(4);
//   });

//   // ── Validation ────────────────────────────────────────────
//   it('form invalid when empty', () => expect(comp.form.invalid).toBeTrue());

//   it('email field invalid without value', () => {
//     comp.form.get('email')?.setValue('');
//     expect(comp.form.get('email')?.invalid).toBeTrue();
//   });

//   it('email field invalid with bad format', () => {
//     comp.form.get('email')?.setValue('notanemail');
//     expect(comp.form.get('email')?.invalid).toBeTrue();
//   });

//   it('email field valid with proper email', () => {
//     comp.form.get('email')?.setValue('user@test.com');
//     expect(comp.form.get('email')?.valid).toBeTrue();
//   });

//   it('password field invalid when shorter than 6 chars', () => {
//     comp.form.get('password')?.setValue('abc');
//     expect(comp.form.get('password')?.invalid).toBeTrue();
//   });

//   it('password field valid with 6+ chars', () => {
//     comp.form.get('password')?.setValue('Pass@1234');
//     expect(comp.form.get('password')?.valid).toBeTrue();
//   });

//   it('form valid when both fields are filled correctly', () => {
//     comp.form.get('email')?.setValue('user@test.com');
//     comp.form.get('password')?.setValue('Pass@1234');
//     expect(comp.form.valid).toBeTrue();
//   });

//   // ── Submit — invalid form ─────────────────────────────────
//   it('submit with invalid form does NOT call auth.login', () => {
//     comp.submit();
//     expect(mockAuthService.login).not.toHaveBeenCalled();
//   });

//   it('submit with invalid form marks all controls as touched', () => {
//     comp.submit();
//     expect(comp.form.get('email')?.touched).toBeTrue();
//     expect(comp.form.get('password')?.touched).toBeTrue();
//   });

//   // ── Submit — success ──────────────────────────────────────
//   it('submit with valid form calls auth.login', () => {
//     mockAuthService.login.and.returnValue(of({ fullName: 'Diya', token: 'tok' }));
//     comp.form.setValue({ email: 'user@test.com', password: 'Pass@1234' });
//     comp.submit();
//     expect(mockAuthService.login).toHaveBeenCalledWith({ email: 'user@test.com', password: 'Pass@1234' });
//   });

//   it('successful login shows toast', fakeAsync(() => {
//     mockAuthService.login.and.returnValue(of({ fullName: 'Diya', token: 'tok' }));
//     comp.form.setValue({ email: 'user@test.com', password: 'Pass@1234' });
//     comp.submit();
//     tick(500);
//     expect(mockToast.success).toHaveBeenCalledWith('Welcome back, Diya! 👋');
//   }));

//   it('successful login navigates to dashboard', fakeAsync(() => {
//     mockAuthService.login.and.returnValue(of({ fullName: 'Diya', token: 'tok' }));
//     comp.form.setValue({ email: 'user@test.com', password: 'Pass@1234' });
//     comp.submit();
//     tick(500);
//     expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/dashboard']);
//   }));

//   // ── Submit — error ────────────────────────────────────────
//   it('401 error sets correct error message', () => {
//     mockAuthService.login.and.returnValue(throwError(() => ({ status: 401, error: {} })));
//     comp.form.setValue({ email: 'bad@test.com', password: 'WrongPass' });
//     comp.submit();
//     expect(comp.error).toBe('Incorrect email or password. Please try again.');
//   });

//   it('error resets loading to false', () => {
//     mockAuthService.login.and.returnValue(throwError(() => ({ status: 500, error: { message: 'Server error' } })));
//     comp.form.setValue({ email: 'user@test.com', password: 'Pass@1234' });
//     comp.submit();
//     expect(comp.loading).toBeFalse();
//   });

//   it('sets loading = true while submitting', () => {
//     mockAuthService.login.and.returnValue(of({ fullName: 'Diya', token: 'tok' }));
//     comp.form.setValue({ email: 'user@test.com', password: 'Pass@1234' });
//     comp.loading = false;
//     comp.submit();
//     // loading was set true before subscribe resolved
//     expect(mockAuthService.login).toHaveBeenCalled();
//   });

//   // ── Show/hide password ────────────────────────────────────
//   it('showPassword starts false', () => expect(comp.showPassword).toBeFalse());

//   it('toggling showPassword changes value', () => {
//     comp.showPassword = !comp.showPassword;
//     expect(comp.showPassword).toBeTrue();
//   });

//   // ── Getters ───────────────────────────────────────────────
//   it('email getter returns email control', () => {
//     expect(comp.email).toBe(comp.form.get('email')!);
//   });

//   it('password getter returns password control', () => {
//     expect(comp.password).toBe(comp.form.get('password')!);
//   });

//   // ── Already logged in redirect ────────────────────────────
//   it('redirects if already logged in', () => {
//     const mockAuthLoggedIn = { ...mockAuthService, isLoggedIn: true };
//     TestBed.resetTestingModule();
//     TestBed.configureTestingModule({
//       imports:   [Login, ReactiveFormsModule],
//       providers: [
//         { provide: AuthService,  useValue: mockAuthLoggedIn },
//         { provide: Router,       useValue: mockRouter },
//         { provide: ToastService, useValue: mockToast }
//       ]
//     });
//     const f2   = TestBed.createComponent(Login);
//     f2.detectChanges();
//     expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/dashboard']);
//   });
// });
// import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
// import { ReactiveFormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
// import { of, throwError } from 'rxjs';
// import { Login } from '../../src/app/components/auth/login/login';
// import { AuthService } from '../../src/app/services/auth.service';
// import { ToastService } from '../../src/app/services/toast.service';

// const mockAuthService = { isLoggedIn: false, login: jasmine.createSpy('login') };
// const mockRouter      = { navigate: jasmine.createSpy('navigate') };
// const mockToast       = { success: jasmine.createSpy('success'), error: jasmine.createSpy('error') };

// describe('Login Component', () => {
//   let comp: Login;
//   let fix:  ComponentFixture<Login>;

//   beforeEach(async () => {
//     mockAuthService.login.calls.reset();
//     mockRouter.navigate.calls.reset();
//     mockToast.success.calls.reset();

//     await TestBed.configureTestingModule({
//       imports:   [Login, ReactiveFormsModule],
//       providers: [
//         { provide: AuthService,  useValue: mockAuthService },
//         { provide: Router,       useValue: mockRouter },
//         { provide: ToastService, useValue: mockToast }
//       ]
//     }).compileComponents();

//     fix  = TestBed.createComponent(Login);
//     comp = fix.componentInstance;
//     fix.detectChanges();
//   });

//   it('should create', () => expect(comp).toBeTruthy());
//   it('form invalid when empty', () => expect(comp.form.invalid).toBeTrue());
//   it('starts with loading = false', () => expect(comp.loading).toBeFalse());
//   it('starts with no error', () => expect(comp.error).toBe(''));
//   it('has 4 feature items', () => expect(comp.features.length).toBe(4));

//   it('email valid with proper email', () => {
//     comp.form.get('email')?.setValue('user@test.com');
//     expect(comp.form.get('email')?.valid).toBeTrue();
//   });

//   it('email invalid with bad format', () => {
//     comp.form.get('email')?.setValue('notanemail');
//     expect(comp.form.get('email')?.invalid).toBeTrue();
//   });

//   it('password invalid when shorter than 6 chars', () => {
//     comp.form.get('password')?.setValue('abc');
//     expect(comp.form.get('password')?.invalid).toBeTrue();
//   });

//   it('form valid when both fields filled correctly', () => {
//     comp.form.get('email')?.setValue('user@test.com');
//     comp.form.get('password')?.setValue('Pass@1234');
//     expect(comp.form.valid).toBeTrue();
//   });

//   it('submit with invalid form does NOT call auth.login', () => {
//     comp.submit();
//     expect(mockAuthService.login).not.toHaveBeenCalled();
//   });

//   it('submit with invalid form marks all touched', () => {
//     comp.submit();
//     expect(comp.form.get('email')?.touched).toBeTrue();
//     expect(comp.form.get('password')?.touched).toBeTrue();
//   });

//   it('submit with valid form calls auth.login', () => {
//     mockAuthService.login.and.returnValue(of({ fullName: 'Diya', token: 'tok' }));
//     comp.form.setValue({ email: 'user@test.com', password: 'Pass@1234' });
//     comp.submit();
//     expect(mockAuthService.login).toHaveBeenCalled();
//   });

//   it('successful login shows toast', fakeAsync(() => {
//     mockAuthService.login.and.returnValue(of({ fullName: 'Diya', token: 'tok' }));
//     comp.form.setValue({ email: 'user@test.com', password: 'Pass@1234' });
//     comp.submit();
//     tick(500);
//     expect(mockToast.success).toHaveBeenCalledWith('Welcome back, Diya! 👋');
//   }));

//   it('successful login navigates to dashboard', fakeAsync(() => {
//     mockAuthService.login.and.returnValue(of({ fullName: 'Diya', token: 'tok' }));
//     comp.form.setValue({ email: 'user@test.com', password: 'Pass@1234' });
//     comp.submit();
//     tick(500);
//     expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/dashboard']);
//   }));

//   it('401 error sets correct message', () => {
//     mockAuthService.login.and.returnValue(throwError(() => ({ status: 401, error: {} })));
//     comp.form.setValue({ email: 'bad@test.com', password: 'WrongPass' });
//     comp.submit();
//     expect(comp.error).toBe('Incorrect email or password. Please try again.');
//   });

//   it('error resets loading to false', () => {
//     mockAuthService.login.and.returnValue(throwError(() => ({ status: 500, error: {} })));
//     comp.form.setValue({ email: 'user@test.com', password: 'Pass@1234' });
//     comp.submit();
//     expect(comp.loading).toBeFalse();
//   });

//   it('showPassword starts false', () => expect(comp.showPassword).toBeFalse());
//   it('email getter returns control', () => expect(comp.email).toBe(comp.form.get('email')!));
//   it('password getter returns control', () => expect(comp.password).toBe(comp.form.get('password')!));
// });
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Login } from '../../src/app/components/auth/login/login';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { AuthService } from '../../src/app/services/auth.service';
import { ToastService } from '../../src/app/services/toast.service';

describe('Login Component', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let toastSpy: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    authSpy = jasmine.createSpyObj('AuthService', ['login'], {
      isLoggedIn: false
    });

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    toastSpy = jasmine.createSpyObj('ToastService', ['success']);

    await TestBed.configureTestingModule({
      imports: [Login, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ToastService, useValue: toastSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {},
            params: of({}),
            queryParams: of({})
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ✅ Component creation
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ✅ Form initialization
  it('should initialize form with email and password', () => {
    expect(component.form.contains('email')).toBeTrue();
    expect(component.form.contains('password')).toBeTrue();
  });

  // ✅ Invalid form
  it('should mark form as touched if invalid on submit', () => {
    spyOn(component.form, 'markAllAsTouched');

    component.submit();

    expect(component.form.markAllAsTouched).toHaveBeenCalled();
    expect(authSpy.login).not.toHaveBeenCalled();
  });

  // ✅ SUCCESS LOGIN (FIXED)
  it('should call login API and navigate on success', fakeAsync(() => {
    const mockAuthResponse = {
      token: 'dummy-token',
      email: 'test@example.com',
      role: 'USER',
      fullName: 'Diya',
      expiresAt: '2026-12-31T00:00:00Z'
    };

    authSpy.login.and.returnValue(of(mockAuthResponse));

    component.form.setValue({
      email: 'test@test.com',
      password: '123456'
    });

    component.submit();

    expect(authSpy.login).toHaveBeenCalled();
    expect(toastSpy.success).toHaveBeenCalledWith('Welcome back, Diya! 👋');

    tick(300); // ⬅️ simulate timeout

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/app/dashboard']);
  }));

  // ✅ Login error (401)
  it('should show error message for invalid credentials', () => {
    authSpy.login.and.returnValue(
      throwError(() => ({
        status: 401,
        error: { message: 'Invalid credentials' }
      }))
    );

    component.form.setValue({
      email: 'test@test.com',
      password: 'wrongpass'
    });

    component.submit();

    expect(component.error).toBe('Incorrect email or password. Please try again.');
    expect(component.loading).toBeFalse();
  });

  // ✅ Generic error
  it('should show generic error message', () => {
    authSpy.login.and.returnValue(
      throwError(() => ({
        status: 500,
        error: { message: 'Server error' }
      }))
    );

    component.form.setValue({
      email: 'test@test.com',
      password: '123456'
    });

    component.submit();

    expect(component.error).toBe('Server error');
    expect(component.loading).toBeFalse();
  });

  // ✅ Already logged in (FIXED)
  it('should redirect if already logged in', () => {
    Object.defineProperty(authSpy, 'isLoggedIn', {
      get: () => true
    });

    const newFixture = TestBed.createComponent(Login);
    newFixture.detectChanges();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/app/dashboard']);
  });

  // ✅ Getter tests
  it('should return email and password controls', () => {
    expect(component.email).toBeTruthy();
    expect(component.password).toBeTruthy();
  });
});