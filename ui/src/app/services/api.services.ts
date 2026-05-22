import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Event, Registration, RegisterRequest,
  AttendancePredictionResult, NoShowPredictionResult, UserAttendancePredictionResult,
  AttendanceReportItem, RegistrationStatusReport, EventPerformanceReport,
  WeeklyTrendItem,
  DepartmentBreakdownReport,
  TopStatsReport
} from '../models/models';
import { environment } from '../../environments/environment';

// ─── Events ──────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class EventService {
  private API = `${environment.apiUrl}/events`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<Event[]> { return this.http.get<Event[]>(this.API); }
  getById(id: number): Observable<Event> { return this.http.get<Event>(`${this.API}/${id}`); }
  create(ev: Event): Observable<Event> { return this.http.post<Event>(this.API, ev); }
  update(id: number, ev: Event): Observable<Event> { return this.http.put<Event>(`${this.API}/${id}`, ev); }
  delete(id: number): Observable<void> { return this.http.delete<void>(`${this.API}/${id}`); }
}

// ─── Registrations ───────────────────────────────
@Injectable({ providedIn: 'root' })
export class RegistrationService {
  private API = `${environment.apiUrl}/registrations`;
  constructor(private http: HttpClient) {}

  register(req: RegisterRequest): Observable<Registration> {
    return this.http.post<Registration>(this.API, req);
  }
  cancel(id: number): Observable<Registration> {
    return this.http.patch<Registration>(`${this.API}/${id}/cancel`, {});
  }
  getMyRegistrations(): Observable<Registration[]> {
    return this.http.get<Registration[]>(`${this.API}/my`);
  }
  getAllRegistrations(): Observable<Registration[]> {
    return this.http.get<Registration[]>(this.API);
  }
  getByEvent(eventId: number): Observable<Registration[]> {
    return this.http.get<Registration[]>(`${this.API}/event/${eventId}`);
  }
}

// ─── Predictions ─────────────────────────────────
@Injectable({ providedIn: 'root' })
export class PredictionService {
  private API = `${environment.apiUrl}/predictions`;
  constructor(private http: HttpClient) {}

  predictAttendance(eventId: number): Observable<AttendancePredictionResult> {
    return this.http.get<AttendancePredictionResult>(`${this.API}/attendance/${eventId}`);
  }
  predictNoShow(eventId: number): Observable<NoShowPredictionResult> {
    return this.http.get<NoShowPredictionResult>(`${this.API}/no-show/${eventId}`);
  }
  predictUserAttendance(eventId: number): Observable<UserAttendancePredictionResult> {
    return this.http.get<UserAttendancePredictionResult>(`${this.API}/user-attendance/${eventId}`);
  }
}

//─── Reports ─────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class ReportService {
  private API = `${environment.apiUrl}/reports`;
  constructor(private http: HttpClient) {}

  getAttendanceVsRegistration(): Observable<AttendanceReportItem[]> {
    return this.http.get<AttendanceReportItem[]>(`${this.API}/attendance-vs-registration`);
  }
  getCancelledVsRegistered(): Observable<RegistrationStatusReport> {
    return this.http.get<RegistrationStatusReport>(`${this.API}/cancelled-vs-registered`);
  }
  getEventPerformance(): Observable<EventPerformanceReport[]> {
    return this.http.get<EventPerformanceReport[]>(`${this.API}/event-performance`);
  }
   getTopStats(): Observable<TopStatsReport> {
  return this.http.get<TopStatsReport>(`${this.API}/top-stats`);
}

getDepartmentBreakdown(): Observable<DepartmentBreakdownReport> {
  return this.http.get<DepartmentBreakdownReport>(`${this.API}/department-breakdown`);
}

getWeeklyTrend(): Observable<WeeklyTrendItem[]> {
  return this.http.get<WeeklyTrendItem[]>(`${this.API}/weekly-trend`);
}

}

