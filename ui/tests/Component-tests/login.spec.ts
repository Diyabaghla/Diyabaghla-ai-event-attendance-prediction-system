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