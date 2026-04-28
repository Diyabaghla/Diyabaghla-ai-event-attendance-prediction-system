import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { AuthResponse, LoginRequest, SignupRequest, User } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = `${environment.apiUrl}/auth`;
  private userSubject = new BehaviorSubject<User | null>(this.loadUser());
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Re-sync user from localStorage on every construction (handles page refresh)
    const user = this.loadUser();
    if (user) this.userSubject.next(user);
  }

  signup(req: SignupRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/signup`, req).pipe(
      tap(res => this.storeAuth(res))
    );
  }

  login(req: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/login`, req).pipe(
      tap(res => this.storeAuth(res))
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  get token(): string | null {
    return localStorage.getItem('token');
  }

  get isLoggedIn(): boolean {
    const token = this.token;
    if (!token) return false;
    // Check token is not expired
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000;
      if (Date.now() > expiry) {
        this.logout();
        return false;
      }
      return true;
    } catch {
      return !!token;
    }
  }

  get currentUser(): User | null { return this.userSubject.value; }
  get isAdmin(): boolean { return this.currentUser?.role === 'Admin'; }

  private storeAuth(res: AuthResponse): void {
    localStorage.setItem('token', res.token);
    const user: User = { fullName: res.fullName, email: res.email, role: res.role };
    localStorage.setItem('user', JSON.stringify(user));
    this.userSubject.next(user);
  }

  private loadUser(): User | null {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}

