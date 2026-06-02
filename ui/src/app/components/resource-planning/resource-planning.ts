import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventService, PredictionService } from '../../services/api.services';
import { Event, AttendancePredictionResult } from '../../models/models';

export interface ResourceItem {
  icon: string;
  label: string;
  value: number;
  display: number;
  color: string;
  unit: string;
  tip: string;
}

export interface ResourceCategory {
  id: string;
  icon: string;
  label: string;
  color: string;
  items: ResourceItem[];
}

@Component({
  selector: 'app-resource-planning',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resource-planning.html',
  styleUrls: ['./resource-planning.scss']
})
export class ResourcePlanning implements OnInit {
  attendanceValue = 0;
capacityFillValue = 0;
  events: Event[] = [];
  selectedEventId: number | null = null;
  prediction: AttendancePredictionResult | null = null;
  categories: ResourceCategory[] = [];
  loading = false;
  loadingEvents = true;
  error = '';
  manualOverride = false;
  manualAttendance = 100;
  activeCategory = 'seating';
  calculated = false;

  totalItems = 0;
  totalStaff = 0;
  bufferPercent = 8;

  constructor(private eventSvc: EventService, private predSvc: PredictionService,private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.eventSvc.getAll().subscribe({
      next: evs => { this.events = evs || []; this.loadingEvents = false; },
      error: () => { this.loadingEvents = false; }
    });
  }

  get selectedEvent(): Event | undefined {
    return this.events.find(e => e.id === Number(this.selectedEventId));
  }

  get activeCategory$(): ResourceCategory | undefined {
    return this.categories.find(c => c.id === this.activeCategory);
  }

onSelect(): void {
  this.prediction = null;
  this.categories = [];
  this.error = '';
  this.calculated = false;

  if (this.selectedEventId) {
    this.calculate(); // 🔥 auto trigger
  }
}

  setMode(manual: boolean): void {
    this.manualOverride = manual;
    this.categories = [];
    this.calculated = false;
    this.error = '';
  }
updateValues(attendance: number): void {
  const safeAttendance = Number(attendance) || 0;

  this.attendanceValue = safeAttendance;

  const capacity = Number(this.selectedEvent?.locationCapacity) || 1;

  this.capacityFillValue = Math.min(
    100,
    Math.round((safeAttendance / capacity) * 100)
  );
}
calculate(): void {
  if (!this.selectedEventId) return;

  this.loading = true;
  this.error = '';

  // ✅ MANUAL MODE FIX
  if (this.manualOverride) {
    const attendance = this.manualAttendance || 0;

    this.updateValues(attendance);
    this.buildCategories(attendance);

    this.loading = false;
    return; // ❗ STOP API
  }

  // ✅ AI MODE
  this.predSvc.predictAttendance(Number(this.selectedEventId)).subscribe({
    next: r => {
      const predicted =
        Number(r?.predictedAttendance) ||
        Number((r as any)?.predicted_attendance) ||
        0;

      this.prediction = {
        ...r,
        predictedAttendance: predicted
      };

      this.updateValues(predicted);
      this.buildCategories(predicted);

      this.loading = false;
      this.cdr.detectChanges();
    },

    error: err => {
      // ✅ FIX ERROR MESSAGE
      this.error = err?.error?.message || 'Prediction failed';
      this.loading = false;
      this.cdr.detectChanges();
    }
  });
}
  buildCategories(a: number): void {
    const buf = 1 + this.bufferPercent / 100;
    const chairs    = Math.ceil(a * buf);
    const extra     = Math.ceil(a * 0.05);
    const tables    = Math.ceil(a / 6);
    const meals     = Math.ceil(a * buf);
    const snacks    = Math.ceil(a * 1.15);
    const water     = Math.ceil(a * 2.5);
    const staff     = Math.max(4, Math.ceil(a / 25));
    const regDesk   = Math.max(2, Math.ceil(a / 80));
    const security  = Math.max(2, Math.ceil(a / 100));
    const tech      = Math.max(1, Math.ceil(a / 150));
    const projector = Math.max(1, Math.ceil(a / 200));
    const mics      = Math.max(2, Math.ceil(a / 100));

    this.categories = [
      {
        id: 'seating', icon: '🪑', label: 'Seating', color: '#00a8a8',
        items: [
          { icon: '🪑', label: 'Main Chairs',  value: chairs,    display: 0, color: '#00a8a8', unit: 'chairs', tip: `${buf.toFixed(0)}× attendees + ${this.bufferPercent}% buffer` },
          { icon: '➕', label: 'Extra Chairs', value: extra,     display: 0, color: '#00c5c5', unit: 'chairs', tip: '5% overflow buffer' },
          { icon: '🪵', label: 'Tables',       value: tables,    display: 0, color: '#5DCAA5', unit: 'tables', tip: 'Ratio: 1 table per 6 attendees' },
        ]
      },
      {
        id: 'catering', icon: '🍽️', label: 'Catering', color: '#f59e0b',
        items: [
          { icon: '🍽️', label: 'Full Meals',    value: meals,  display: 0, color: '#f59e0b', unit: 'meals',   tip: `${this.bufferPercent}% buffer above attendance` },
          { icon: '🍪', label: 'Snack Packs',   value: snacks, display: 0, color: '#fbbf24', unit: 'packs',   tip: '15% more than attendance' },
          { icon: '💧', label: 'Water Bottles', value: water,  display: 0, color: '#60a5fa', unit: 'bottles', tip: '2.5 bottles per person' },
        ]
      },
      {
        id: 'staff', icon: '👥', label: 'Staff', color: '#8b5cf6',
        items: [
          { icon: '👷', label: 'Total Staff',  value: staff,    display: 0, color: '#8b5cf6', unit: 'people', tip: '1 staff per 25 attendees (min 4)' },
          { icon: '📋', label: 'Registration', value: regDesk,  display: 0, color: '#a78bfa', unit: 'people', tip: '1 desk per 80 attendees (min 2)' },
          { icon: '🛡️', label: 'Security',     value: security, display: 0, color: '#7c3aed', unit: 'guards', tip: '1 guard per 100 attendees (min 2)' },
          { icon: '💻', label: 'Tech Support', value: tech,     display: 0, color: '#6d28d9', unit: 'people', tip: '1 tech per 150 attendees (min 1)' },
        ]
      },
      {
        id: 'equipment', icon: '🔧', label: 'Equipment', color: '#f43f5e',
        items: [
          { icon: '📽️', label: 'Projectors',  value: projector, display: 0, color: '#f43f5e', unit: 'units', tip: '1 per 200 attendees (min 1)' },
          { icon: '🎤', label: 'Microphones', value: mics,      display: 0, color: '#fb7185', unit: 'units', tip: '1 per 100 attendees (min 2)' },
        ]
      }
    ];

    this.totalItems = chairs + extra + tables + meals + snacks;
    this.totalStaff = staff + regDesk + security + tech;
    this.calculated = true;
    this.activeCategory = 'seating';
    this.animateCounters();
  }

  animateCounters(): void {
    const duration = 1000;
    const steps = 35;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const ease = 1 - Math.pow(1 - step / steps, 3);
      this.categories.forEach(cat => {
        cat.items.forEach(item => { item.display = Math.round(item.value * ease); });
      });
      if (step >= steps) {
        clearInterval(timer);
        this.categories.forEach(cat => cat.items.forEach(item => item.display = item.value));
      }
    }, duration / steps);
  }

get attendanceCount(): number {
  if (this.manualOverride) return this.manualAttendance || 0;
  return this.prediction?.predictedAttendance || 0;
}

  get capacityFill(): number {
  const event = this.selectedEvent;
  const attendance = this.attendanceCount;

  if (!event?.locationCapacity || !attendance) return 0;

  return Math.min(
    100,
    Math.round((attendance / event.locationCapacity) * 100)
  );
}

  get capacityColor(): string {
    if (this.capacityFill >= 90) return '#f43f5e';
    if (this.capacityFill >= 70) return '#f59e0b';
    return '#10b981';
  }

  get donutCircumference(): number { return 2 * Math.PI * 54; }

  getCategoryDash(cat: ResourceCategory): number {
    const total = this.categories.reduce((s, c) => s + c.items.reduce((ss, i) => ss + i.value, 0), 0);
    if (!total) return 0;
    return (cat.items.reduce((s, i) => s + i.value, 0) / total) * this.donutCircumference;
  }

  getCategoryOffset(catIndex: number): number {
    const total = this.categories.reduce((s, c) => s + c.items.reduce((ss, i) => ss + i.value, 0), 0);
    if (!total) return 0;
    let offset = 0;
    for (let i = 0; i < catIndex; i++) {
      offset += (this.categories[i].items.reduce((s, item) => s + item.value, 0) / total) * this.donutCircumference;
    }
    return this.donutCircumference - offset;
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
