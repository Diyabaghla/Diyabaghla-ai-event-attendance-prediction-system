import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { RegistrationService, EventService } from '../../services/api.services';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { Registration, Event } from '../../models/models';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-registrations',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './registrations.html',
  styleUrls: ['./registrations.scss']
})
export class Registrations implements OnInit {
  registrations: Registration[] = [];
  filtered: Registration[]      = [];
  events: Event[]               = [];
  loading      = true;
  error        = '';
  filterStatus = 'All';
  searchQuery  = '';
  sortBy: 'date' | 'event' | 'status' = 'date';
  sortDir: 'asc' | 'desc' = 'desc';
  viewMode: 'table' | 'cards' = 'table';

  showRegisterModal = false;
  selectedEventId: number | null = null;
  pastRate    = 0.7;
  registering = false;
  regError    = '';

  cancellingId: number | null = null;

  constructor(
    private regSvc:   RegistrationService,
    private eventSvc: EventService,
    public  auth:     AuthService,
    private toast:    ToastService,
    private notifSvc:NotificationService,
    private cdr: ChangeDetectorRef  
  ) {}

  ngOnInit(): void {
    this.load();
    this.eventSvc.getAll().subscribe({ next: evs => this.events = evs || [], error: () => {} });
  }

  load(): void {
  this.loading = true;
  this.error = '';

  const obs = this.auth.isAdmin
    ? this.regSvc.getAllRegistrations()
    : this.regSvc.getMyRegistrations();

  obs.subscribe({
    next: regs => {
      this.registrations = regs || [];
      this.applyFilter();
      this.loading = false;

      this.cdr.detectChanges();   // ✅ FIX
    },
    error: () => {
      this.error = 'Failed to load registrations.';
      this.loading = false;
      this.registrations = [];
      this.filtered = [];

      this.cdr.detectChanges();   // ✅ FIX
    }
  });
}

  applyFilter(): void {
    let list = [...this.registrations];
    if (this.filterStatus !== 'All') list = list.filter(r => r.status === this.filterStatus);
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(r =>
        r.eventTitle?.toLowerCase().includes(q) ||
        r.userName?.toLowerCase().includes(q)   ||
        r.userEmail?.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      let va: any, vb: any;
      if (this.sortBy === 'date')   { va = new Date(a.registrationDate || '').getTime(); vb = new Date(b.registrationDate || '').getTime(); }
      if (this.sortBy === 'event')  { va = a.eventTitle || ''; vb = b.eventTitle || ''; }
      if (this.sortBy === 'status') { va = a.status || ''; vb = b.status || ''; }
      if (va < vb) return this.sortDir === 'asc' ? -1 :  1;
      if (va > vb) return this.sortDir === 'asc' ?  1 : -1;
      return 0;
    });
    this.filtered = list;
  }
get upcomingEvents(): Event[] {
  return this.events.filter(e => new Date(e.eventDate) >= new Date());
}
  setSort(col: 'date' | 'event' | 'status'): void {
    if (this.sortBy === col) this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    else { this.sortBy = col; this.sortDir = 'desc'; }
    this.applyFilter();
  }

  sortIcon(col: string): string {
    if (this.sortBy !== col) return '↕';
    return this.sortDir === 'asc' ? '↑' : '↓';
  }
private getEventDate(eventId: number): string | undefined {
  return this.events.find(e => e.id === eventId)?.eventDate;
}

isUpcoming(eventId: number): boolean {
  const dateStr = this.getEventDate(eventId);
  if (!dateStr) return true; // default to upcoming if unknown — fail safe, not fail open on cancel
  return new Date(dateStr) >= new Date();
}

cancel(reg: Registration): void {
  if (!this.isUpcoming(reg.eventId)) {
    this.toast.error("This event has already ended — registration can't be cancelled.");
    return;
  }
  this.cancellingId = reg.id!;
  this.regSvc.cancel(reg.id!).subscribe({
    next: () => {
      this.cancellingId = null;
      this.toast.info(`Registration for "${reg.eventTitle}" cancelled.`);
      this.load();
    },
    error: err => {
      this.cancellingId = null;
      this.toast.error(err.error?.message || 'Failed to cancel.');
    }
  });
}

  openRegister(): void {
    this.selectedEventId = this.events[0]?.id ?? null;
    this.pastRate = 0.7; this.regError = '';
    this.showRegisterModal = true;
  }

  submitRegister(): void {
    if (!this.selectedEventId) return;
    this.registering = true; this.regError = '';
    this.regSvc.register({ eventId: this.selectedEventId, pastUserAttendanceRate: this.pastRate }).subscribe({
      next: () => {
        this.registering = false; this.showRegisterModal = false;
        const title = this.events.find(e => e.id === this.selectedEventId)?.title || '';
        this.toast.success(`Successfully registered for "${title}"!`);

        // ✅ Push notification
      this.notifSvc.push(
        'registration_success',
        '🎫 Registration Confirmed!',
        `You have successfully registered for "${title}". See you there!`,
        this.selectedEventId ?? undefined,
        title
      );
        this.load();
      },
      error: err => { this.regError = err.error?.message || 'Registration failed.'; this.registering = false; }
    });
  }

  get totalCount()     { return this.registrations.length; }
  get activeCount()    { return this.registrations.filter(r => r.status === 'Registered').length; }
  get cancelledCount() { return this.registrations.filter(r => r.status === 'Cancelled').length; }
  get activeRate()     { if (!this.totalCount) return 0; return Math.round((this.activeCount / this.totalCount) * 100); }

  getInitials(name?: string): string {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getAvatarColor(name?: string): string {
    const colors = ['#00a8a8','#8b5cf6','#f59e0b','#10b981','#f43f5e','#6366f1'];
    return colors[(name || '').charCodeAt(0) % colors.length];
  }

  formatDate(d?: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  formatDateFull(d?: string): string {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  }

  getDaysLabel(days?: number): string {
    if (days === undefined || days === null) return '—';
    if (days === 0) return 'Same day';
    if (days === 1) return '1 day before';
    return `${days} days before`;
  }
}
// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { RouterModule } from '@angular/router';
// import { RegistrationService, EventService } from '../../services/api.services';
// import { AuthService } from '../../services/auth.service';
// import { ToastService } from '../../services/toast.service';
// import { NotificationService } from '../../services/notification.service';
// import { Registration, Event } from '../../models/models';

// @Component({
//   selector: 'app-registrations',
//   standalone: true,
//   imports: [CommonModule, FormsModule, RouterModule],
//   templateUrl: './registrations.html',
//   styleUrls: ['./registrations.scss']
// })
// export class Registrations implements OnInit {
//   registrations: Registration[] = [];
//   filtered:       Registration[] = [];
//   events:         Event[]        = [];

//   loading       = true;
//   error         = '';
//   filterStatus  = 'All';
//   searchQuery   = '';
//   sortBy: 'date' | 'event' | 'status' = 'date';
//   sortDir: 'asc' | 'desc' = 'desc';
//   viewMode: 'table' | 'cards' = 'table';

//   showRegisterModal = false;
//   selectedEventId: number | null = null;
//   pastRate    = 0.7;
//   registering = false;
//   regError    = '';

//   cancellingId: number | null = null;

//   constructor(
//     private regSvc:   RegistrationService,
//     private eventSvc: EventService,
//     public  auth:     AuthService,
//     private toast:    ToastService,
//     private notifSvc: NotificationService
//   ) {}

//   ngOnInit(): void {
//     this.load();
//     this.eventSvc.getAll().subscribe({
//       next: evs => this.events = evs || [],
//       error: () => {}
//     });
//   }

//   load(): void {
//     this.loading = true; this.error = '';
//     const obs = this.auth.isAdmin
//       ? this.regSvc.getAllRegistrations()
//       : this.regSvc.getMyRegistrations();
//     obs.subscribe({
//       next: regs => {
//         this.registrations = regs || [];
//         this.applyFilter();
//         this.loading = false;
//       },
//       error: () => {
//         this.error = 'Failed to load registrations.';
//         this.loading = false;
//         this.registrations = [];
//         this.filtered = [];
//       }
//     });
//   }

//   applyFilter(): void {
//     let list = [...this.registrations];

//     if (this.filterStatus !== 'All')
//       list = list.filter(r => r.status === this.filterStatus);

//     if (this.searchQuery.trim()) {
//       const q = this.searchQuery.toLowerCase();
//       list = list.filter(r =>
//         r.eventTitle?.toLowerCase().includes(q) ||
//         r.userName?.toLowerCase().includes(q)   ||
//         r.userEmail?.toLowerCase().includes(q)
//       );
//     }

//     list.sort((a, b) => {
//       let va: any, vb: any;
//       if (this.sortBy === 'date')   { va = new Date(a.registrationDate || '').getTime(); vb = new Date(b.registrationDate || '').getTime(); }
//       if (this.sortBy === 'event')  { va = a.eventTitle || ''; vb = b.eventTitle || ''; }
//       if (this.sortBy === 'status') { va = a.status || ''; vb = b.status || ''; }
//       if (va < vb) return this.sortDir === 'asc' ? -1 :  1;
//       if (va > vb) return this.sortDir === 'asc' ?  1 : -1;
//       return 0;
//     });

//     this.filtered = list;
//   }

//   // ── Split into upcoming vs ended ──────────────────────────
//   get upcomingFiltered(): Registration[] {
//     return this.filtered.filter(r => this.isUpcoming(r.eventDate));
//   }

//   get endedFiltered(): Registration[] {
//     return this.filtered.filter(r => !this.isUpcoming(r.eventDate));
//   }

//   private isUpcoming(dateStr?: string): boolean {
//     if (!dateStr) return false;
//     return new Date(dateStr) >= new Date();
//   }

//   // ── Sort ─────────────────────────────────────────────────
//   setSort(col: 'date' | 'event' | 'status'): void {
//     if (this.sortBy === col) this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
//     else { this.sortBy = col; this.sortDir = 'desc'; }
//     this.applyFilter();
//   }

//   sortIcon(col: string): string {
//     if (this.sortBy !== col) return '↕';
//     return this.sortDir === 'asc' ? '↑' : '↓';
//   }

//   // ── Cancel ───────────────────────────────────────────────
//   cancel(reg: Registration): void {
//     if (!this.isUpcoming(reg.eventDate)) return; // guard — no cancel on ended
//     this.cancellingId = reg.id!;
//     this.regSvc.cancel(reg.id!).subscribe({
//       next: () => {
//         this.cancellingId = null;
//         this.toast.info(`Registration for "${reg.eventTitle}" cancelled.`);
//         this.load();
//       },
//       error: err => {
//         this.cancellingId = null;
//         this.toast.error(err.error?.message || 'Failed to cancel.');
//       }
//     });
//   }

//   // ── Register modal ────────────────────────────────────────
//   openRegister(): void {
//     this.selectedEventId = this.events[0]?.id ?? null;
//     this.pastRate = 0.7;
//     this.regError = '';
//     this.showRegisterModal = true;
//   }

//   submitRegister(): void {
//     if (!this.selectedEventId) return;
//     this.registering = true; this.regError = '';
//     this.regSvc.register({ eventId: this.selectedEventId, pastUserAttendanceRate: this.pastRate }).subscribe({
//       next: () => {
//         this.registering = false;
//         this.showRegisterModal = false;
//         const title = this.events.find(e => e.id === this.selectedEventId)?.title || '';
//         this.toast.success(`Successfully registered for "${title}"!`);
//         this.notifSvc.push(
//           'registration_success',
//           '🎫 Registration Confirmed!',
//           `You have successfully registered for "${title}". See you there!`,
//           this.selectedEventId ?? undefined,
//           title
//         );
//         this.load();
//       },
//       error: err => {
//         this.regError = err.error?.message || 'Registration failed.';
//         this.registering = false;
//       }
//     });
//   }

//   // ── Getters ──────────────────────────────────────────────
//   get totalCount()     { return this.registrations.length; }
//   get activeCount()    { return this.registrations.filter(r => r.status === 'Registered').length; }
//   get cancelledCount() { return this.registrations.filter(r => r.status === 'Cancelled').length; }
//   get upcomingCount()  { return this.registrations.filter(r => this.isUpcoming(r.eventDate) && r.status === 'Registered').length; }

//   // ── Formatters ───────────────────────────────────────────
//   getInitials(name?: string): string {
//     if (!name) return '?';
//     return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
//   }

//   getAvatarColor(name?: string): string {
//     const colors = ['#00a8a8','#8b5cf6','#f59e0b','#10b981','#f43f5e','#6366f1'];
//     return colors[(name || '').charCodeAt(0) % colors.length];
//   }

//   formatDate(d?: string): string {
//     if (!d) return '—';
//     return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
//   }

//   getDaysLabel(days?: number): string {
//     if (days === undefined || days === null) return '—';
//     if (days === 0) return 'Same day';
//     if (days === 1) return '1 day before';
//     return `${days} days before`;
//   }

//   getEventDaysLabel(dateStr?: string): string {
//     if (!dateStr) return '';
//     const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
//     if (diff === 0) return 'Today!';
//     if (diff === 1) return 'Tomorrow';
//     if (diff > 1)  return `In ${diff} days`;
//     return '';
//   }
// }
