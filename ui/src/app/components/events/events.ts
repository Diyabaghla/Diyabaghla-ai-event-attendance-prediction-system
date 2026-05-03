import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EventService, RegistrationService } from '../../services/api.services';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { Event } from '../../models/models';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './events.html',
  styleUrls: ['./events.scss']
})
export class Events implements OnInit {
  events: Event[] = [];
  filteredEvents: Event[] = [];
  loading = true;
  saving  = false;
  error   = '';
  searchQuery = '';
  filterMode  = 'All';
  filterType  = 'All';
  viewMode: 'grid' | 'list' = 'grid';

  showModal        = false;
  editMode         = false;
  editId: number | null = null;
  deleteConfirmId: number | null = null;
  deleteEventTitle = '';

  form: FormGroup;
  modes          = ['Online', 'Offline', 'Hybrid'];
  eventTypes     = ['Conference','Workshop','Seminar','Webinar','Meetup','Training','Summit','Sports','Cultural'];
  weatherOptions = ['Clear','Cloudy','Rainy','Snowy','Stormy'];
  departments    = ['Engineering','Marketing','HR','Sales','Finance','Operations','Design','Leadership'];

  constructor(
    private fb: FormBuilder,
    private eventSvc: EventService,
    private regSvc: RegistrationService,
    public  auth: AuthService,
    private toast: ToastService,
    private notifSvc:NotificationService
  ) {
    this.form = this.fb.group({
      title:              ['', Validators.required],
      description:        [''],
      eventType:          ['Conference', Validators.required],
      mode:               ['Online',     Validators.required],
      department:         ['Engineering',Validators.required],
      eventDate:          ['', Validators.required],
      durationHours:      [2,   [Validators.required, Validators.min(0.5), Validators.max(24)]],
      speakerRating:      [4,   [Validators.required, Validators.min(0),   Validators.max(5)]],
      reminderSent:       [false],
      pastAttendanceRate: [0.7, [Validators.required, Validators.min(0),   Validators.max(1)]],
      weather:            ['Clear'],
      ticketPrice:        [0,   Validators.min(0)],
      locationCapacity:   [100, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void { this.loadEvents(); }

  loadEvents(): void {
    this.loading = true; this.error = '';
    this.eventSvc.getAll().subscribe({
      next: evs => { this.events = evs || []; this.applyFilter(); this.loading = false; },
      error: () => { this.error = 'Failed to load events.'; this.loading = false; this.events = []; this.filteredEvents = []; }
    });
  }

  applyFilter(): void {
    let list = [...this.events];
    if (this.filterMode !== 'All') list = list.filter(e => e.mode === this.filterMode);
    if (this.filterType !== 'All') list = list.filter(e => e.eventType === this.filterType);
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q) ||
        e.eventType.toLowerCase().includes(q)
      );
    }
    this.filteredEvents = list;
  }

  openCreate(): void {
    this.editMode = false; this.editId = null;
    this.form.reset({ eventType:'Conference', mode:'Online', department:'Engineering',
      durationHours:2, speakerRating:4, reminderSent:false,
      pastAttendanceRate:0.7, weather:'Clear', ticketPrice:0, locationCapacity:100 });
    this.error = ''; this.showModal = true;
  }

  openEdit(ev: Event): void {
    this.editMode = true; this.editId = ev.id!;
    const d = new Date(ev.eventDate);
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0,16);
    this.form.patchValue({ ...ev, eventDate: local });
    this.error = ''; this.showModal = true;
  }

  closeModal(): void { this.showModal = false; this.error = ''; }

  save(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving = true; this.error = '';
    const payload = this.form.value as Event;
    const op = this.editMode ? this.eventSvc.update(this.editId!, payload) : this.eventSvc.create(payload);
    op.subscribe({
      next: (saved) => {
        this.saving = false; this.closeModal(); this.loadEvents();
       
      if (!this.editMode) {
        this.toast.success(`Event "${saved.title}" created successfully! 🎉`);

        // ✅ Push notification for new event
        this.notifSvc.push(
          'event_added',
          '📅 New Event Added',
          `"${saved.title}" is now open for registration. Check it out!`,
          saved.id,
          saved.title
        );
      } else {
        this.toast.success(`Event "${saved.title}" updated successfully.`);
      }
    },

      error: err => { this.error = err.error?.message || 'Failed to save event.'; this.saving = false; }
    });
  }

  confirmDelete(id: number): void {
    this.deleteConfirmId = id;
    this.deleteEventTitle = this.events.find(e => e.id === id)?.title || '';
  }
  cancelDelete(): void { this.deleteConfirmId = null; this.deleteEventTitle = ''; }

  deleteEvent(): void {
    if (!this.deleteConfirmId) return;
    const title = this.deleteEventTitle;
    this.eventSvc.delete(this.deleteConfirmId).subscribe({
      next: () => { this.deleteConfirmId = null; this.loadEvents(); this.toast.info(`Event "${title}" has been deleted.`); },
      error: () => { this.deleteConfirmId = null; this.toast.error('Failed to delete event.'); }
    });
  }

  
  registerForEvent(ev: Event): void {
  if (new Date(ev.eventDate) < new Date()) {
    this.toast.error('This event has already ended. Registration is closed.');
    return;
  }
  this.regSvc.register({ eventId: ev.id!, pastUserAttendanceRate: 0.7 }).subscribe({
    next: () => { this.toast.success(`You are now registered for "${ev.title}"!`); this.loadEvents(); },
      error: err => this.toast.error(err.error?.message || 'Registration failed.')
    });
  }
isEventEnded(ev: Event): boolean {
  return new Date(ev.eventDate) < new Date();
}
  getTypeIcon(type: string): string {
    const map: Record<string,string> = {
      Conference:'🏛️', Workshop:'🔧', Seminar:'📖', Webinar:'💻',
      Meetup:'🤝', Training:'🎓', Summit:'🏔️', Sports:'⚽', Cultural:'🎭'
    };
    return map[type] ?? '📅';
  }
  getModeIcon(mode: string): string { return ({ Online:'💻', Offline:'🏢', Hybrid:'🔀' } as any)[mode] ?? '📅'; }
  getModeClass(mode: string): string { return ({ Online:'badge-info', Offline:'badge-warning', Hybrid:'badge-success' } as any)[mode] || 'badge-info'; }
  getCapacityPct(ev: Event): number { return Math.min(100, Math.round(((ev.activeRegistrations || 0) / ev.locationCapacity) * 100)); }
  getCapacityColor(ev: Event): string {
    const p = this.getCapacityPct(ev);
    if (p >= 90) return 'var(--rose-500)';
    if (p >= 70) return 'var(--amber-400)';
    return 'var(--teal-500)';
  }
  getDaysUntil(d: string): string {
    const diff = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
    if (diff < 0) return 'Ended'; if (diff === 0) return 'Today'; if (diff === 1) return 'Tomorrow';
    return `${diff}d`;
  }
  getDaysClass(d: string): string {
    const diff = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
    if (diff < 0) return 'tag-past'; if (diff <= 3) return 'tag-soon'; return 'tag-upcoming';
  }
  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-US',{ month:'short', day:'numeric', year:'numeric', hour:'2-digit', minute:'2-digit' });
  }
  formatDateShort(d: string): string {
    return new Date(d).toLocaleDateString('en-US',{ month:'short', day:'numeric', year:'numeric' });
  }
  getRatingStars(r: number): string {
    const full = Math.floor(r); const half = r % 1 >= 0.5 ? 1 : 0;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - half);
  }

  get totalEvents()   { return this.events.length; }
  get upcomingCount() { return this.events.filter(e => new Date(e.eventDate) >= new Date()).length; }
  get onlineCount()   { return this.events.filter(e => e.mode === 'Online').length; }
  get avgRating()     { return this.events.length ? (this.events.reduce((s,e) => s + (e.speakerRating||0), 0) / this.events.length).toFixed(1) : '—'; }
  get f() { return this.form.controls; }
}
