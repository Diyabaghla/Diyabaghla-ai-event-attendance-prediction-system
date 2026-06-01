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
  eventDate?: string;
}

export interface RegisterRequest {
  eventId: number;
  pastUserAttendanceRate: number;
}

// ─── Predictions ─────────────────────────────────
export interface AttendancePredictionResult {
  predictedAttendance: number;
  activeRegistrations: number;
}
export interface NoShowPredictionResult {
  prediction: string;
  probability: number;
}
export interface UserAttendancePredictionResult {
  probability: number;
  prediction: 'Attend' | 'NoShow';
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
export interface DepartmentItem {
  department:         string;
  totalEvents:        number;
  totalRegistrations: number;
  avgFillRate:        number;
  avgSpeakerRating:   number;
}

// export interface ModeItem {
//   mode:       string;
//   eventCount: number;
//   percentage: number;
// }

export interface EventTypeItem {
  eventType:  string;
  eventCount: number;
  avgRating:  number;
}

export interface DepartmentReport {
  byDepartment: DepartmentItem[];
  byMode:       ModeItem[];
  byEventType:  EventTypeItem[];
}



export interface TopStatsReport {
  topRatedEvent: any;
  topEventByRegistrations: any;
  avgSpeakerRating(avgSpeakerRating: any): unknown;
  totalRegistrations:     number;
  activeRegistrations:    number;
  cancelledRegistrations: number;
  avgFillRate:            number;
  topEventId?:            number;
  topEventTitle:          string;
  topEventDepartment:     string;
  topEventMode:           string;
  topEventFillRate:       number;
  topEventAttendees:      number;
  topEventRating:         number;
}

export interface DepartmentItem {
  department:          string;
  totalEvents:         number;
  totalRegistrations:  number;
  activeRegistrations: number;
  avgSpeakerRating:    number;
}

export interface ModeItem {
  mode:       string;
  eventCount: number;
  percentage: number;
}

export interface DepartmentBreakdownReport {
  byDepartment: DepartmentItem[];
  byMode:       ModeItem[];
  byEventType:  EventTypeItem[];
}

export interface WeeklyTrendItem {
  weekStart:        string;
  weekLabel:        string;
  registrations:    number;
  cancellations:    number;
  netRegistrations: number;
}

//notifications
export type NotificationType =
  | 'event_added'
  | 'registration_success'
  | 'reminder_2days'
  | 'reminder_1day'
  | 'reminder_today'
  | 'event_cancelled'
  | 'general';

export interface AppNotification {
  id:        number;
  type:      NotificationType;
  title:     string;
  message:   string;
  createdAt: string;   // ISO string
  isRead:    boolean;
  eventId?:  number;
  eventTitle?: string;
}

