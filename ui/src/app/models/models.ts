// ─── Auth ────────────────────────────────────────
export interface SignupRequest {
  fullName: string;
  email: string;
  password: string;
}
export interface LoginRequest {
  email: string;
  password: string;
}
export interface AuthResponse {
  token: string;
  fullName: string;
  email: string;
  role: string;
  expiresAt: string;
}
export interface User {
  id?: number;
  fullName: string;
  email: string;
  role: string;
}

// ─── Events ──────────────────────────────────────
export interface Event {
  id?: number;
  title: string;
  description?: string;
  eventType: string;
  mode: 'Online' | 'Offline' | 'Hybrid';
  department: string;
  eventDate: string;
  dayOfWeek?: string;
  durationHours: number;
  speakerRating: number;
  reminderSent: boolean;
  pastAttendanceRate: number;
  weather: string;
  ticketPrice: number;
  locationCapacity: number;
  totalRegistrations?: number;
  activeRegistrations?: number;
  createdAt?: string;
}

// ─── Registrations ───────────────────────────────
export interface Registration {
  id?: number;
  userId?: number;
  userName?: string;
  userEmail?: string;
  eventId: number;
  eventTitle?: string;
  registrationDate?: string;
  status: 'Registered' | 'Cancelled';
  daysBeforeRegistration?: number;
  pastUserAttendanceRate: number;
}

export interface RegisterRequest {
  eventId: number;
  pastUserAttendanceRate: number;
}

// ─── Predictions ─────────────────────────────────
export interface AttendancePredictionResult {
  predictedAttendance: number;
}
export interface NoShowPredictionResult {
  prediction: string;
  probability: number;
}
export interface UserAttendancePredictionResult {
  probability: number;
}

// ─── Reports ─────────────────────────────────────
export interface AttendanceReportItem {
  eventId: number;
  eventTitle: string;
  eventType: string;
  eventDate: string;
  totalRegistrations: number;
  activeRegistrations: number;
  cancelledRegistrations: number;
  cancellationRate: number;
  predictedAttendance: number;
}
export interface RegistrationStatusReport {
  totalRegistrations: number;
  registered: number;
  cancelled: number;
  cancellationRate: number;
}
export interface EventPerformanceReport {
  eventId: number;
  eventTitle: string;
  department: string;
  mode: string;
  locationCapacity: number;
  activeRegistrations: number;
  fillRate: number;
  speakerRating: number;
  ticketPrice: number;
  pastAttendanceRate: number;
}
