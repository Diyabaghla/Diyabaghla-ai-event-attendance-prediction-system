import { Component, OnInit,ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventService, PredictionService } from '../../../services/api.services';
import { Event, UserAttendancePredictionResult } from '../../../models/models';

@Component({
  selector: 'app-user-attendance-prediction',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-attendance-prediction.html',
  styleUrls: ['./user-attendance-prediction.scss']
})
export class UserAttendancePrediction implements OnInit {
  events: Event[] = [];
  selectedEventId: number | null = null;
  result: UserAttendancePredictionResult | null = null;
  loading = false;
  loadingEvents = true;
  error = '';

  constructor(private eventSvc: EventService, private predSvc: PredictionService,private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.eventSvc.getAll().subscribe({
      next: evs => { this.events = evs; this.loadingEvents = false; },
      error: () => { this.loadingEvents = false; }
    });
  }

  onSelect(): void { this.result = null; this.error = ''; }

  predict(): void {
  if (!this.selectedEventId) return;

  this.loading = true;
  this.error = '';
  this.result = null;

  this.predSvc.predictUserAttendance(Number(this.selectedEventId)).subscribe({
    next: r => {
      console.log('USER PREDICTION:', r);

      this.result = {
        ...r,
        probability: Number(r.probability) || 0
      };

      this.loading = false;
      this.cdr.detectChanges();

      // 🔥 Force UI update (VERY IMPORTANT)
      setTimeout(() => {
        // trigger Angular refresh
      }, 0);
    },
    error: err => {
      console.error(err);
      this.error = err.error?.message || 'Prediction failed.';
      this.loading = false;
    }
  });
}

  get probabilityPct(): number {
  return Math.round((this.result?.probability || 0) * 100);
}
  get probabilityLevel(): string {
    const p = this.probabilityPct;
    if (p >= 80) return 'High'; if (p >= 50) return 'Medium'; return 'Low';
  }
  get levelColor(): string {
    const p = this.probabilityPct;
    if (p >= 80) return 'var(--green-500)'; if (p >= 50) return 'var(--amber-400)'; return 'var(--rose-500)';
  }
  get levelEmoji(): string {
    const p = this.probabilityPct;
    if (p >= 80) return '🟢'; if (p >= 50) return '🟡'; return '🔴';
  }
  get circumference(): number { return 2 * Math.PI * 54; }
  get dashoffset(): number {
  return this.circumference * (1 - (this.result?.probability || 0));
}
  get selectedEvent(): Event | null {
  return this.events.find(e => e.id === Number(this.selectedEventId)) || null;
}
}
