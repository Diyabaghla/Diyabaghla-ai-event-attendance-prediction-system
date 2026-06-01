import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { NgZone } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { EventService, RegistrationService, ReportService } from '../../services/api.services';
import { Event, Registration, RegistrationStatusReport } from '../../models/models';
import { ChangeDetectorRef } from '@angular/core';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class Dashboard implements OnInit, OnDestroy {

  events: Event[] = [];
  myRegistrations: Registration[] = [];
  statusReport: RegistrationStatusReport | null = null;

  loading = true;
  error = '';

  private eventsLoaded = false;
  private regsLoaded = false;

  displayTotalEvents = 0;
  displayUpcoming = 0;
  displayActive = 0;
  displayCancelled = 0;

  currentTime = '';
  currentDate = '';
  private clockSub?: Subscription;

  sparklinePoints = '';
  regSparklinePoints = '';

  constructor(
    public auth: AuthService,
    private eventSvc: EventService,
    private regSvc: RegistrationService,
    private reportSvc: ReportService,
    private zone: NgZone   ,
    private cd: ChangeDetectorRef 
  ) {}

  ngOnInit(): void {
    this.startClock();
    this.loadData();
  }

  ngOnDestroy(): void {
    this.clockSub?.unsubscribe();
  }

  // ⏰ CLOCK
  private startClock(): void {
    this.updateClock();
    this.clockSub = interval(1000).subscribe(() => this.updateClock());
  }

  private updateClock(): void {
    const now = new Date();

    this.currentTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    this.currentDate = now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }

  loadData(): void {
  this.loading = true;
  this.error = '';

  this.eventsLoaded = false;
  this.regsLoaded = false;

  // EVENTS
  this.eventSvc.getAll().subscribe({
    next: (events) => {
      this.events = events || [];
      this.eventsLoaded = true;
      this.checkLoadingComplete();
    },
    error: () => {
      this.events = [];
      this.eventsLoaded = true;   // ✅ IMPORTANT FIX
      this.checkLoadingComplete();
    }
  });

  // REGISTRATIONS
  this.regSvc.getMyRegistrations().subscribe({
    next: (regs) => {
      this.myRegistrations = regs || [];
      this.regsLoaded = true;
      this.checkLoadingComplete();
    },
    error: () => {
      this.myRegistrations = [];
      this.regsLoaded = true;   // ✅ IMPORTANT FIX
      this.checkLoadingComplete();
    }
  });

  // ADMIN REPORT (non-blocking)
  if (this.auth.isAdmin) {
    this.reportSvc.getCancelledVsRegistered().subscribe({
      next: (r) => this.statusReport = r,
      error: () => {}
    });
  }
}
private checkLoadingComplete(): void {
  if (this.eventsLoaded && this.regsLoaded) {
    this.loading = false;

    this.animateCounters();
    this.generateSparklines();

    this.cd.detectChanges();   // 🔥 FINAL FIX
  }
}
  // ✅ CONTROL LOADER PROPERLY
  private onDataReady(): void {
    if (this.eventsLoaded && this.regsLoaded) {
      this.loading = false;

      this.animateCounters();
      this.generateSparklines();
    }
  }

  // 🎯 ANIMATION
  private animateCounters(): void {
  const targets = {
    totalEvents: this.events.length,
    upcoming: this.upcomingEvents,
    active: this.activeRegistrations,
    cancelled: this.cancelledRegistrations
  };

  const duration = 1200;
  const steps = 40;
  let step = 0;

  this.zone.runOutsideAngular(() => {
    const timer = setInterval(() => {
      step++;

      const ease = 1 - Math.pow(1 - step / steps, 3);

      this.zone.run(() => {   // 🔥 IMPORTANT
        this.displayTotalEvents = Math.round(targets.totalEvents * ease);
        this.displayUpcoming = Math.round(targets.upcoming * ease);
        this.displayActive = Math.round(targets.active * ease);
        this.displayCancelled = Math.round(targets.cancelled * ease);

        this.cd.detectChanges(); // 🔥 FORCE UI UPDATE
      });

      if (step >= steps) {
        clearInterval(timer);

        this.zone.run(() => {
          this.displayTotalEvents = targets.totalEvents;
          this.displayUpcoming = targets.upcoming;
          this.displayActive = targets.active;
          this.displayCancelled = targets.cancelled;
        });
      }

    }, duration / steps);
  });
}

  // 📈 SPARKLINES
  private generateSparklines(): void {
    const w = 120, h = 40;

    const vals = this.events.slice(0, 7)
      .map(e => e.activeRegistrations ?? e.locationCapacity * 0.5);

    if (vals.length < 2) {
      this.sparklinePoints = '';
      return;
    }

    const max = Math.max(...vals, 1);

    this.sparklinePoints = vals.map((v, i) =>
      `${(i / (vals.length - 1)) * w},${h - (v / max) * h}`
    ).join(' ');

    const regVals = this.myRegistrations.slice(0, 7).map((_, i) => i + 1);

    if (regVals.length < 2) {
      this.regSparklinePoints = '';
      return;
    }

    const rMax = Math.max(...regVals, 1);

    this.regSparklinePoints = regVals.map((v, i) =>
      `${(i / (regVals.length - 1)) * w},${h - (v / rMax) * h}`
    ).join(' ');
  }

  // 📊 GETTERS
  get activeRegistrations() {
    return this.myRegistrations.filter(r => r.status === 'Registered').length;
  }

  get cancelledRegistrations() {
    return this.myRegistrations.filter(r => r.status === 'Cancelled').length;
  }

  get upcomingEvents() {
    return this.events.filter(e => new Date(e.eventDate) >= new Date()).length;
  }

  get recentEvents() {
    return this.events.slice(0, 5);
  }

  get attendanceRingDash(): number {
    return this.events.length
      ? (this.upcomingEvents / this.events.length) * 251
      : 0;
  }

  get registrationRingDash(): number {
    return this.myRegistrations.length
      ? (this.activeRegistrations / this.myRegistrations.length) * 251
      : 0;
  }

  // 🎨 UI HELPERS
  getModeIcon(mode: string): string {
    return ({ Online: '💻', Offline: '🏢', Hybrid: '🔀' } as any)[mode] ?? '📅';
  }

  getModeClass(mode: string): string {
    return ({ Online: 'badge-info', Offline: 'badge-warning', Hybrid: 'badge-success' } as any)[mode] || 'badge-info';
  }

  getStatusColor(status: string): string {
    return status === 'Registered' ? 'var(--green-500)' : 'var(--rose-500)';
  }

  getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }

  getGreetingEmoji(): string {
    const h = new Date().getHours();
    if (h < 12) return '☀️';
    if (h < 18) return '👋';
    return '🌙';
  }

  getFirstName(): string {
    return this.auth.currentUser?.fullName?.split(' ')?.[0] ?? 'there';
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  formatDateShort(d: string): string {
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  getDaysUntil(d: string): string {
    const diff = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);

    if (diff < 0) return 'Past';
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';

    return `${diff}d away`;
  }

  getDaysUntilClass(d: string): string {
    const diff = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);

    if (diff < 0) return 'past';
    if (diff <= 3) return 'soon';

    return 'upcoming';
  }
}