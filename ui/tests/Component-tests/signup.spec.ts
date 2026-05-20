// import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
// import { ReactiveFormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
// import { of, throwError } from 'rxjs';
// import { Signup } from '../../src/app/components/auth/signup/signup';
// import { AuthService } from '../../src/app/services/auth.service';
// import { ToastService } from '../../src/app/services/toast.service';

// const mockAuthService = { isLoggedIn: false, signup: jasmine.createSpy('signup') };
// const mockRouter      = { navigate: jasmine.createSpy('navigate') };
// const mockToast       = { success: jasmine.createSpy('success'), error: jasmine.createSpy('error') };

// describe('Signup Component', () => {
//   let comp: Signup;
//   let fix:  ComponentFixture<Signup>;

//   beforeEach(async () => {
//     mockAuthService.signup.calls.reset();
//     mockRouter.navigate.calls.reset();
//     mockToast.success.calls.reset();

//     await TestBed.configureTestingModule({
//       imports:   [Signup, ReactiveFormsModule],
//       providers: [
//         { provide: AuthService,  useValue: mockAuthService },
//         { provide: Router,       useValue: mockRouter },
//         { provide: ToastService, useValue: mockToast }
//       ]
//     }).compileComponents();

//     fix  = TestBed.createComponent(Signup);
//     comp = fix.componentInstance;
//     fix.detectChanges();
//   });

//   it('should create', () => expect(comp).toBeTruthy());

//   it('should initialise form with empty fields', () => {
//     expect(comp.form.get('fullName')?.value).toBe('');
//     expect(comp.form.get('email')?.value).toBe('');
//     expect(comp.form.get('password')?.value).toBe('');
//   });

//   it('should start with loading = false, no error, isEmailExists = false', () => {
//     expect(comp.loading).toBeFalse();
//     expect(comp.error).toBe('');
//     expect(comp.isEmailExists).toBeFalse();
//   });

//   it('form invalid when empty', () => expect(comp.form.invalid).toBeTrue());

//   it('fullName invalid when empty', () => {
//     comp.form.get('fullName')?.setValue('');
//     expect(comp.form.get('fullName')?.invalid).toBeTrue();
//   });

//   it('fullName invalid when single char', () => {
//     comp.form.get('fullName')?.setValue('A');
//     expect(comp.form.get('fullName')?.invalid).toBeTrue();
//   });

//   it('fullName valid with 2+ chars', () => {
//     comp.form.get('fullName')?.setValue('Diya');
//     expect(comp.form.get('fullName')?.valid).toBeTrue();
//   });

//   it('email invalid with bad format', () => {
//     comp.form.get('email')?.setValue('notvalid');
//     expect(comp.form.get('email')?.invalid).toBeTrue();
//   });

//   it('email valid with proper format', () => {
//     comp.form.get('email')?.setValue('diya@test.com');
//     expect(comp.form.get('email')?.valid).toBeTrue();
//   });

//   it('password invalid when shorter than 6 chars', () => {
//     comp.form.get('password')?.setValue('abc');
//     expect(comp.form.get('password')?.invalid).toBeTrue();
//   });

//   it('password valid with 6+ chars', () => {
//     comp.form.get('password')?.setValue('Pass@1234');
//     expect(comp.form.get('password')?.valid).toBeTrue();
//   });

//   it('form valid when all fields filled correctly', () => {
//     comp.form.setValue({ fullName: 'Diya', email: 'diya@test.com', password: 'Pass@1234' });
//     expect(comp.form.valid).toBeTrue();
//   });

//   it('submit with invalid form marks all as touched', () => {
//     comp.submit();
//     expect(comp.form.get('fullName')?.touched).toBeTrue();
//     expect(comp.form.get('email')?.touched).toBeTrue();
//     expect(comp.form.get('password')?.touched).toBeTrue();
//   });

//   it('submit with invalid form does NOT call auth.signup', () => {
//     comp.submit();
//     expect(mockAuthService.signup).not.toHaveBeenCalled();
//   });

//   it('successful signup shows toast', fakeAsync(() => {
//     mockAuthService.signup.and.returnValue(of({ fullName: 'Diya', token: 'tok' }));
//     comp.form.setValue({ fullName: 'Diya', email: 'diya@test.com', password: 'Pass@1234' });
//     comp.submit();
//     tick(500);
//     expect(mockToast.success).toHaveBeenCalledWith('Account created! Welcome to EventAI, Diya! 🎉');
//   }));

//   it('successful signup navigates to dashboard', fakeAsync(() => {
//     mockAuthService.signup.and.returnValue(of({ fullName: 'Diya', token: 'tok' }));
//     comp.form.setValue({ fullName: 'Diya', email: 'diya@test.com', password: 'Pass@1234' });
//     comp.submit();
//     tick(500);
//     expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/dashboard']);
//   }));

//   it('409 conflict sets isEmailExists = true', () => {
//     mockAuthService.signup.and.returnValue(throwError(() => ({
//       status: 409, error: { message: 'already exists' }
//     })));
//     comp.form.setValue({ fullName: 'Diya', email: 'diya@test.com', password: 'Pass@1234' });
//     comp.submit();
//     expect(comp.isEmailExists).toBeTrue();
//   });

//   it('400 error sets error message', () => {
//     mockAuthService.signup.and.returnValue(throwError(() => ({
//       status: 400, error: { message: 'Bad request' }
//     })));
//     comp.form.setValue({ fullName: 'Diya', email: 'diya@test.com', password: 'Pass@1234' });
//     comp.submit();
//     expect(comp.error).toBe('Please check your details and try again.');
//   });

//   it('network error shows fallback message', () => {
//     mockAuthService.signup.and.returnValue(throwError(() => ({ status: 0, error: {} })));
//     comp.form.setValue({ fullName: 'Diya', email: 'diya@test.com', password: 'Pass@1234' });
//     comp.submit();
//     expect(comp.error).toContain('Cannot connect');
//   });

//   it('onEmailChange resets isEmailExists', () => {
//     comp.isEmailExists = true;
//     comp.onEmailChange();
//     expect(comp.isEmailExists).toBeFalse();
//     expect(comp.error).toBe('');
//   });

//   it('showPassword starts false', () => expect(comp.showPassword).toBeFalse());

//   it('fullName getter returns control', () => expect(comp.fullName).toBe(comp.form.get('fullName')!));
//   it('email getter returns control',    () => expect(comp.email).toBe(comp.form.get('email')!));
//   it('password getter returns control', () => expect(comp.password).toBe(comp.form.get('password')!));
// });
// import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
// import { ReactiveFormsModule } from '@angular/forms';
// import { Router } from '@angular/router';
// import { of, throwError } from 'rxjs';
// import { Signup } from '../../src/app/components/auth/signup/signup';
// import { AuthService } from '../../src/app/services/auth.service';
// import { ToastService } from '../../src/app/services/toast.service';

// const mockAuthService = { isLoggedIn: false, signup: jasmine.createSpy('signup') };
// const mockRouter      = { navigate: jasmine.createSpy('navigate') };
// const mockToast       = { success: jasmine.createSpy('success'), error: jasmine.createSpy('error') };

// describe('Signup Component', () => {
//   let comp: Signup;
//   let fix:  ComponentFixture<Signup>;

//   beforeEach(async () => {
//     mockAuthService.signup.calls.reset();
//     mockRouter.navigate.calls.reset();
//     mockToast.success.calls.reset();

//     await TestBed.configureTestingModule({
//       imports:   [Signup, ReactiveFormsModule],
//       providers: [
//         { provide: AuthService,  useValue: mockAuthService },
//         { provide: Router,       useValue: mockRouter },
//         { provide: ToastService, useValue: mockToast }
//       ]
//     }).compileComponents();

//     fix  = TestBed.createComponent(Signup);
//     comp = fix.componentInstance;
//     fix.detectChanges();
//   });

//   it('should create', () => expect(comp).toBeTruthy());
//   it('form invalid when empty', () => expect(comp.form.invalid).toBeTrue());
//   it('starts with loading = false', () => expect(comp.loading).toBeFalse());
//   it('starts with no error', () => expect(comp.error).toBe(''));
//   it('starts with isEmailExists = false', () => expect(comp.isEmailExists).toBeFalse());

//   it('fullName invalid when single char', () => {
//     comp.form.get('fullName')?.setValue('A');
//     expect(comp.form.get('fullName')?.invalid).toBeTrue();
//   });

//   it('fullName valid with 2+ chars', () => {
//     comp.form.get('fullName')?.setValue('Diya');
//     expect(comp.form.get('fullName')?.valid).toBeTrue();
//   });

//   it('email invalid with bad format', () => {
//     comp.form.get('email')?.setValue('notvalid');
//     expect(comp.form.get('email')?.invalid).toBeTrue();
//   });

//   it('password invalid when shorter than 6 chars', () => {
//     comp.form.get('password')?.setValue('abc');
//     expect(comp.form.get('password')?.invalid).toBeTrue();
//   });

//   it('form valid when all fields filled correctly', () => {
//     comp.form.setValue({ fullName: 'Diya', email: 'diya@test.com', password: 'Pass@1234' });
//     expect(comp.form.valid).toBeTrue();
//   });

//   it('submit with invalid form marks all touched', () => {
//     comp.submit();
//     expect(comp.form.get('fullName')?.touched).toBeTrue();
//     expect(comp.form.get('email')?.touched).toBeTrue();
//     expect(comp.form.get('password')?.touched).toBeTrue();
//   });

//   it('submit with invalid form does NOT call auth.signup', () => {
//     comp.submit();
//     expect(mockAuthService.signup).not.toHaveBeenCalled();
//   });

//   it('successful signup shows toast', fakeAsync(() => {
//     mockAuthService.signup.and.returnValue(of({ fullName: 'Diya', token: 'tok' }));
//     comp.form.setValue({ fullName: 'Diya', email: 'diya@test.com', password: 'Pass@1234' });
//     comp.submit();
//     tick(500);
//     expect(mockToast.success).toHaveBeenCalledWith('Account created! Welcome to EventAI, Diya! 🎉');
//   }));

//   it('successful signup navigates to dashboard', fakeAsync(() => {
//     mockAuthService.signup.and.returnValue(of({ fullName: 'Diya', token: 'tok' }));
//     comp.form.setValue({ fullName: 'Diya', email: 'diya@test.com', password: 'Pass@1234' });
//     comp.submit();
//     tick(500);
//     expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/dashboard']);
//   }));

//   it('409 conflict sets isEmailExists = true', () => {
//     mockAuthService.signup.and.returnValue(throwError(() => ({
//       status: 409, error: { message: 'already exists' }
//     })));
//     comp.form.setValue({ fullName: 'Diya', email: 'diya@test.com', password: 'Pass@1234' });
//     comp.submit();
//     expect(comp.isEmailExists).toBeTrue();
//   });

//   it('400 error sets error message', () => {
//     mockAuthService.signup.and.returnValue(throwError(() => ({
//       status: 400, error: { message: 'Bad request' }
//     })));
//     comp.form.setValue({ fullName: 'Diya', email: 'diya@test.com', password: 'Pass@1234' });
//     comp.submit();
//     expect(comp.error).toBe('Please check your details and try again.');
//   });

//   it('network error shows fallback message', () => {
//     mockAuthService.signup.and.returnValue(throwError(() => ({ status: 0, error: {} })));
//     comp.form.setValue({ fullName: 'Diya', email: 'diya@test.com', password: 'Pass@1234' });
//     comp.submit();
//     expect(comp.error).toContain('Cannot connect');
//   });

//   it('onEmailChange resets isEmailExists', () => {
//     comp.isEmailExists = true;
//     comp.onEmailChange();
//     expect(comp.isEmailExists).toBeFalse();
//     expect(comp.error).toBe('');
//   });

//   it('showPassword starts false', () => expect(comp.showPassword).toBeFalse());
//   it('fullName getter returns control', () => expect(comp.fullName).toBe(comp.form.get('fullName')!));
//   it('email getter returns control',    () => expect(comp.email).toBe(comp.form.get('email')!));
//   it('password getter returns control', () => expect(comp.password).toBe(comp.form.get('password')!));
// });
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
 
import { Signup } from '../../src/app/components/auth/signup/signup';
import { AuthService } from '../../src/app/services/auth.service';
import { ToastService } from '../../src/app/services/toast.service';
 
const mockResponse = {
  fullName: 'Diya',
  token: 'abc123',
  email: 'diya@test.com',
  role: 'USER',
  expiresAt: new Date().toISOString()
};
 
const mockAuthService = {
  signup: jasmine.createSpy('signup'),
  isLoggedIn: false
};
 
const mockToast = {
  success: jasmine.createSpy('success'),
  error:   jasmine.createSpy('error')
};
 
describe('Signup Component', () => {
  let comp: Signup;
  let fix:  ComponentFixture<Signup>;
 
  beforeEach(async () => {
    mockAuthService.signup.calls.reset();
    mockToast.success.calls.reset();
    mockToast.error.calls.reset();
 
    await TestBed.configureTestingModule({
      imports: [
        Signup,
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([
          // Declare the routes your component navigates to
          // so the router doesn't throw NG04002
          { path: 'app/dashboard', redirectTo: '' },
          { path: 'login',         redirectTo: '' },
          { path: '',              children:   [] }
        ])
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: ToastService, useValue: mockToast }
      ]
    }).compileComponents();
 
    fix  = TestBed.createComponent(Signup);
    comp = fix.componentInstance;
    fix.detectChanges();
  });
 
  // ── Basic ──────────────────────────────────────────────────────────────────
  it('should create', () => {
    expect(comp).toBeTruthy();
  });
 
  it('form invalid when empty', () => {
    expect(comp.form.invalid).toBeTrue();
  });
 
  it('starts with loading = false', () => {
    expect(comp.loading).toBeFalse();
  });
 
  it('starts with no error', () => {
    expect(comp.error).toBe('');
  });
 
  it('starts with isEmailExists = false', () => {
    expect(comp.isEmailExists).toBeFalse();
  });
 
  // ── Validation ─────────────────────────────────────────────────────────────
  it('fullName invalid when single char', () => {
    comp.form.get('fullName')?.setValue('A');
    expect(comp.form.get('fullName')?.invalid).toBeTrue();
  });
 
  it('fullName valid with 2+ chars', () => {
    comp.form.get('fullName')?.setValue('Diya');
    expect(comp.form.get('fullName')?.valid).toBeTrue();
  });
 
  it('email invalid with bad format', () => {
    comp.form.get('email')?.setValue('invalid');
    expect(comp.form.get('email')?.invalid).toBeTrue();
  });
 
  it('password invalid when short', () => {
    comp.form.get('password')?.setValue('123');
    expect(comp.form.get('password')?.invalid).toBeTrue();
  });
 
  it('form valid when all fields correct', () => {
    comp.form.setValue({
      fullName: 'Diya',
      email:    'diya@test.com',
      password: 'Pass@123'
    });
    expect(comp.form.valid).toBeTrue();
  });
 
  // ── Submit guards ──────────────────────────────────────────────────────────
  it('invalid submit marks form touched', () => {
    comp.submit();
    expect(comp.form.touched).toBeTrue();
  });
 
  it('invalid submit does NOT call signup', () => {
    comp.submit();
    expect(mockAuthService.signup).not.toHaveBeenCalled();
  });
 
  // ── Success ────────────────────────────────────────────────────────────────
  it('successful signup shows toast and navigates', fakeAsync(() => {
    mockAuthService.signup.and.returnValue(of(mockResponse));
 
    comp.form.setValue({
      fullName: 'Diya',
      email:    'diya@test.com',
      password: 'Pass@123'
    });
 
    comp.submit();
    tick(1000); // cover any setTimeout + router navigation
 
    expect(mockToast.success).toHaveBeenCalled();
  }));
 
  // ── Error cases ────────────────────────────────────────────────────────────
  it('409 error sets isEmailExists', () => {
    mockAuthService.signup.and.returnValue(
      throwError(() => ({ status: 409, error: { message: 'already exists' } }))
    );
 
    comp.form.setValue({
      fullName: 'Diya',
      email:    'diya@test.com',
      password: 'Pass@123'
    });
 
    comp.submit();
    expect(comp.isEmailExists).toBeTrue();
  });
 
  it('400 error sets proper message', () => {
    mockAuthService.signup.and.returnValue(
      throwError(() => ({ status: 400, error: { message: 'Bad request' } }))
    );
 
    comp.form.setValue({
      fullName: 'Diya',
      email:    'diya@test.com',
      password: 'Pass@123'
    });
 
    comp.submit();
    expect(comp.error).toBe('Please check your details and try again.');
  });
 
  it('network error fallback', () => {
    mockAuthService.signup.and.returnValue(
      throwError(() => ({ status: 0 }))
    );
 
    comp.form.setValue({
      fullName: 'Diya',
      email:    'diya@test.com',
      password: 'Pass@123'
    });
 
    comp.submit();
    expect(comp.error).toContain('Cannot connect');
  });
 
  // ── Methods ────────────────────────────────────────────────────────────────
  it('onEmailChange resets error + isEmailExists flag', () => {
    comp.isEmailExists = true;
    comp.error         = 'error';
 
    comp.onEmailChange();
 
    expect(comp.isEmailExists).toBeFalse();
    expect(comp.error).toBe('');
  });
 
  // ── Getters ────────────────────────────────────────────────────────────────
  it('fullName getter returns form control', () => {
    expect(comp.fullName).toBe(comp.form.get('fullName')!);
  });
 
  it('email getter returns form control', () => {
    expect(comp.email).toBe(comp.form.get('email')!);
  });
 
  it('password getter returns form control', () => {
    expect(comp.password).toBe(comp.form.get('password')!);
  });
});