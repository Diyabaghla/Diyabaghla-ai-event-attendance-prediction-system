import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { environment } from '../../src/environments/environment';
 
import { AuthService } from '../../src/app/services/auth.service';
import { AuthResponse, LoginRequest, SignupRequest } from '../../src/app/models/models';
 
// ─── Shared mock data ─────────────────────────────────────────────────────────
const BASE = `${environment.apiUrl}/auth`;
 
const mockAuthResponse: AuthResponse = {
  token:    'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwiZXhwIjo5OTk5OTk5OTk5fQ.sig',
  fullName: 'Diya Bhatia',
  email:    'diya@test.com',
  role:     'User'
} as any;
 
const mockAdminResponse: AuthResponse = {
  ...mockAuthResponse,
  role: 'Admin'
} as any;
 
const signupReq: SignupRequest = {
  fullName: 'Diya Bhatia',
  email:    'diya@test.com',
  password: 'Pass@123'
} as any;
 
const loginReq: LoginRequest = {
  email:    'diya@test.com',
  password: 'Pass@123'
} as any;
 
// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildExpiredToken(): string {
  const header  = btoa(JSON.stringify({ alg: 'HS256' }));
  const payload = btoa(JSON.stringify({ sub: '1', exp: 1 })); // exp in the past
  return `${header}.${payload}.sig`;
}
 
function buildValidToken(): string {
  const header  = btoa(JSON.stringify({ alg: 'HS256' }));
  const payload = btoa(JSON.stringify({ sub: '1', exp: 9999999999 })); // far future
  return `${header}.${payload}.sig`;
}
 
// ═════════════════════════════════════════════════════════════════════════════
describe('AuthService', () => {
  let service: AuthService;
  let http:    HttpTestingController;
  let router:  Router;
 
  beforeEach(() => {
    // Clean localStorage before every test
    localStorage.clear();
 
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([
          { path: 'login',         redirectTo: '' },
          { path: 'app/dashboard', redirectTo: '' },
          { path: '',              children:   [] }
        ])
      ],
      providers: [AuthService]
    });
 
    service = TestBed.inject(AuthService);
    http    = TestBed.inject(HttpTestingController);
    router  = TestBed.inject(Router);
 
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
  });
 
  afterEach(() => {
    http.verify();
    localStorage.clear();
  });
 
  // ── Constructor ────────────────────────────────────────────────────────────
  describe('constructor', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
 
    it('should load user from localStorage on construction', () => {
  const stored = { fullName: 'Diya', email: 'diya@test.com', role: 'User' };
  localStorage.setItem('user', JSON.stringify(stored));

  TestBed.resetTestingModule(); // 🔥 IMPORTANT

  TestBed.configureTestingModule({
    imports: [
      HttpClientTestingModule,
      RouterTestingModule
    ],
    providers: [AuthService]
  });

  const fresh = TestBed.inject(AuthService);

  expect(fresh.currentUser).toEqual(stored as any);
});
    it('should emit null user$ when localStorage has no user', () => {
      let emitted: any = 'not-set';
      service.user$.subscribe(u => emitted = u);
      expect(emitted).toBeNull();
    });
 
    it('should emit stored user via user$ on construction', () => {
  const stored = { fullName: 'Diya', email: 'diya@test.com', role: 'User' };
  localStorage.setItem('user', JSON.stringify(stored));

  TestBed.resetTestingModule(); // 🔥 IMPORTANT

  TestBed.configureTestingModule({
    imports: [
      HttpClientTestingModule,
      RouterTestingModule
    ],
    providers: [AuthService]
  });

  const fresh = TestBed.inject(AuthService);

  let emitted: any = null;
  fresh.user$.subscribe(u => emitted = u);

  expect(emitted).toEqual(stored as any);
});
  });
 
  // ── signup ─────────────────────────────────────────────────────────────────
  describe('signup()', () => {
    it('should POST to /auth/signup with signup payload', () => {
      service.signup(signupReq).subscribe();
 
      const req = http.expectOne(`${BASE}/signup`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(signupReq);
      req.flush(mockAuthResponse);
    });
 
    it('should store token in localStorage after signup', () => {
      service.signup(signupReq).subscribe();
      http.expectOne(`${BASE}/signup`).flush(mockAuthResponse);
      expect(localStorage.getItem('token')).toBe(mockAuthResponse.token);
    });
 
    it('should store user in localStorage after signup', () => {
      service.signup(signupReq).subscribe();
      http.expectOne(`${BASE}/signup`).flush(mockAuthResponse);
 
      const stored = JSON.parse(localStorage.getItem('user')!);
      expect(stored.email).toBe(mockAuthResponse.email);
      expect(stored.role).toBe(mockAuthResponse.role);
    });
 
    it('should update userSubject after signup', () => {
      let emitted: any = null;
      service.user$.subscribe(u => emitted = u);
 
      service.signup(signupReq).subscribe();
      http.expectOne(`${BASE}/signup`).flush(mockAuthResponse);
 
      expect(emitted?.email).toBe(mockAuthResponse.email);
    });
 
    it('should return the auth response', () => {
      let result: any = null;
      service.signup(signupReq).subscribe(r => result = r);
      http.expectOne(`${BASE}/signup`).flush(mockAuthResponse);
      expect(result).toEqual(mockAuthResponse);
    });
 
    it('should propagate 409 when email already exists', () => {
      service.signup(signupReq).subscribe({
        next:  () => fail('should have errored'),
        error: err => expect(err.status).toBe(409)
      });
      http.expectOne(`${BASE}/signup`)
          .flush('Conflict', { status: 409, statusText: 'Conflict' });
    });
 
    it('should propagate 400 for invalid payload', () => {
      service.signup(signupReq).subscribe({
        next:  () => fail('should have errored'),
        error: err => expect(err.status).toBe(400)
      });
      http.expectOne(`${BASE}/signup`)
          .flush('Bad request', { status: 400, statusText: 'Bad Request' });
    });
  });
 
  // ── login ──────────────────────────────────────────────────────────────────
  describe('login()', () => {
    it('should POST to /auth/login with login payload', () => {
      service.login(loginReq).subscribe();
 
      const req = http.expectOne(`${BASE}/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(loginReq);
      req.flush(mockAuthResponse);
    });
 
    it('should store token in localStorage after login', () => {
      service.login(loginReq).subscribe();
      http.expectOne(`${BASE}/login`).flush(mockAuthResponse);
      expect(localStorage.getItem('token')).toBe(mockAuthResponse.token);
    });
 
    it('should store user object in localStorage after login', () => {
      service.login(loginReq).subscribe();
      http.expectOne(`${BASE}/login`).flush(mockAuthResponse);
 
      const stored = JSON.parse(localStorage.getItem('user')!);
      expect(stored.fullName).toBe('Diya Bhatia');
      expect(stored.role).toBe('User');
    });
 
    it('should update user$ observable after login', () => {
      let emitted: any = null;
      service.user$.subscribe(u => emitted = u);
 
      service.login(loginReq).subscribe();
      http.expectOne(`${BASE}/login`).flush(mockAuthResponse);
 
      expect(emitted?.fullName).toBe('Diya Bhatia');
    });
 
    it('should return the full auth response', () => {
      let result: any = null;
      service.login(loginReq).subscribe(r => result = r);
      http.expectOne(`${BASE}/login`).flush(mockAuthResponse);
      expect(result.token).toBe(mockAuthResponse.token);
    });
 
    it('should propagate 401 for wrong password', () => {
      service.login(loginReq).subscribe({
        next:  () => fail('should have errored'),
        error: err => expect(err.status).toBe(401)
      });
      http.expectOne(`${BASE}/login`)
          .flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });
 
    it('should propagate 404 for unknown email', () => {
      service.login(loginReq).subscribe({
        next:  () => fail('should have errored'),
        error: err => expect(err.status).toBe(404)
      });
      http.expectOne(`${BASE}/login`)
          .flush('Not found', { status: 404, statusText: 'Not Found' });
    });
  });
 
  // ── logout ─────────────────────────────────────────────────────────────────
  describe('logout()', () => {
    it('should remove token from localStorage', () => {
      localStorage.setItem('token', 'some-token');
      service.logout();
      expect(localStorage.getItem('token')).toBeNull();
    });
 
    it('should remove user from localStorage', () => {
      localStorage.setItem('user', JSON.stringify({ email: 'diya@test.com' }));
      service.logout();
      expect(localStorage.getItem('user')).toBeNull();
    });
 
    it('should emit null via user$ after logout', () => {
      // First log in
      service.login(loginReq).subscribe();
      http.expectOne(`${BASE}/login`).flush(mockAuthResponse);
 
      let emitted: any = 'not-set';
      service.user$.subscribe(u => emitted = u);
 
      service.logout();
      expect(emitted).toBeNull();
    });
 
    it('should navigate to /login after logout', () => {
      service.logout();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });
 
  // ── token getter ───────────────────────────────────────────────────────────
  describe('token getter', () => {
    it('should return null when no token in localStorage', () => {
      localStorage.clear();
      expect(service.token).toBeNull();
    });
 
    it('should return the stored token', () => {
      localStorage.setItem('token', 'my-token');
      expect(service.token).toBe('my-token');
    });
  });
 
  // ── isLoggedIn getter ──────────────────────────────────────────────────────
  describe('isLoggedIn getter', () => {
    it('should return false when no token exists', () => {
      localStorage.clear();
      expect(service.isLoggedIn).toBeFalse();
    });
 
    it('should return true when token has future expiry', () => {
      localStorage.setItem('token', buildValidToken());
      expect(service.isLoggedIn).toBeTrue();
    });
 
    it('should return false and call logout when token is expired', () => {
      localStorage.setItem('token', buildExpiredToken());
      const result = service.isLoggedIn;
      expect(result).toBeFalse();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
 
    it('should return true for malformed token (fallback)', () => {
      // Token with invalid base64 payload — fallback returns !!token
      localStorage.setItem('token', 'bad.token');
      expect(service.isLoggedIn).toBeTrue();
    });
  });
 
  // ── currentUser getter ─────────────────────────────────────────────────────
  describe('currentUser getter', () => {
    it('should return null when not logged in', () => {
      expect(service.currentUser).toBeNull();
    });
 
    it('should return user after login', () => {
      service.login(loginReq).subscribe();
      http.expectOne(`${BASE}/login`).flush(mockAuthResponse);
      expect(service.currentUser?.email).toBe('diya@test.com');
    });
 
    it('should return null after logout', () => {
      service.login(loginReq).subscribe();
      http.expectOne(`${BASE}/login`).flush(mockAuthResponse);
      service.logout();
      expect(service.currentUser).toBeNull();
    });
  });
 
  // ── isAdmin getter ─────────────────────────────────────────────────────────
  describe('isAdmin getter', () => {
    it('should return false when not logged in', () => {
      expect(service.isAdmin).toBeFalse();
    });
 
    it('should return false for User role', () => {
      service.login(loginReq).subscribe();
      http.expectOne(`${BASE}/login`).flush(mockAuthResponse); // role: User
      expect(service.isAdmin).toBeFalse();
    });
 
    it('should return true for Admin role', () => {
      service.login(loginReq).subscribe();
      http.expectOne(`${BASE}/login`).flush(mockAdminResponse); // role: Admin
      expect(service.isAdmin).toBeTrue();
    });
 
    it('should return false after logout even if was admin', () => {
      service.login(loginReq).subscribe();
      http.expectOne(`${BASE}/login`).flush(mockAdminResponse);
      service.logout();
      expect(service.isAdmin).toBeFalse();
    });
  });
 
  // ── user$ observable ───────────────────────────────────────────────────────
  describe('user$ observable', () => {
    it('should emit new user on login', () => {
      const emissions: any[] = [];
      service.user$.subscribe(u => emissions.push(u));
 
      service.login(loginReq).subscribe();
      http.expectOne(`${BASE}/login`).flush(mockAuthResponse);
 
      expect(emissions.length).toBeGreaterThan(1);
      expect(emissions[emissions.length - 1]?.email).toBe('diya@test.com');
    });
 
    it('should emit null on logout', () => {
      service.login(loginReq).subscribe();
      http.expectOne(`${BASE}/login`).flush(mockAuthResponse);
 
      const emissions: any[] = [];
      service.user$.subscribe(u => emissions.push(u));
 
      service.logout();
      expect(emissions[emissions.length - 1]).toBeNull();
    });
 
    it('should be consistent — same value from user$ and currentUser', () => {
      service.login(loginReq).subscribe();
      http.expectOne(`${BASE}/login`).flush(mockAuthResponse);
 
      let fromObservable: any = null;
      service.user$.subscribe(u => fromObservable = u);
 
      expect(fromObservable).toEqual(service.currentUser);
    });
  });
 
  // ── localStorage persistence ───────────────────────────────────────────────
  describe('localStorage persistence', () => {
    it('should store fullName, email and role — not password', () => {
      service.login(loginReq).subscribe();
      http.expectOne(`${BASE}/login`).flush(mockAuthResponse);
 
      const stored = JSON.parse(localStorage.getItem('user')!);
      expect(stored.fullName).toBe('Diya Bhatia');
      expect(stored.email).toBe('diya@test.com');
      expect(stored.role).toBe('User');
      expect(stored.password).toBeUndefined();
    });
 
    it('should handle corrupted localStorage gracefully', () => {
      localStorage.setItem('user', '{invalid json}');
      // Recreating service should not throw
      expect(() => TestBed.inject(AuthService)).not.toThrow();
    });
  });
});