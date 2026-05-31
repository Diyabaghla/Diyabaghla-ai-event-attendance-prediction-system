import {
  Component, OnInit, OnDestroy, AfterViewInit,
  ViewChild, ElementRef, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { forkJoin, interval, Subscription } from 'rxjs';
import { EventService, PredictionService } from '../../../services/api.services';
import { Event, AttendancePredictionResult } from '../../../models/models';

interface FactorCard {
  icon: string; label: string; value: string;
  impact: 'high' | 'medium' | 'low' | 'negative'; desc: string;
}

@Component({
  selector: 'app-attendance-prediction',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './attendance-prediction.html',
  styleUrls: ['./attendance-prediction.scss']
})
export class AttendancePrediction implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('gaugeCanvas')   gaugeCanvas!:   ElementRef<HTMLCanvasElement>;
  @ViewChild('factorCanvas')  factorCanvas!:  ElementRef<HTMLCanvasElement>;
  @ViewChild('compareCanvas') compareCanvas!: ElementRef<HTMLCanvasElement>;

  events:          Event[]                         = [];
  selectedEventId: number | null                   = null;
  selectedEvent:   Event | null                    = null;
  result:          AttendancePredictionResult|null = null;

  loading       = false;
  loadingEvents = true;
  error         = '';
  predicted     = false;

  displayAttendance = 0;
  displayFillRate   = 0;
  displayNoShows    = 0;
  displayEmpty      = 0;

  currentTime = '';
  private clockSub?: Subscription;
  private animId    = 0;

  tips = [
    { icon: '📅', text: 'Weekend events tend to have higher attendance for cultural and sports events.' },
    { icon: '⭐', text: 'Speaker ratings above 4.0 correlate with better turnout.' },
    { icon: '🎫', text: 'Free events tend to have higher no-show rates than paid ones.' },
    { icon: '💻', text: 'Online events have broader reach and tend to fill up faster.' },
    { icon: '📊', text: 'Past attendance rate is the strongest predictor of future attendance.' },
  ];
  currentTip    = 0;
  private tipSub?: Subscription;

  constructor(
    private eventSvc: EventService,
    private predSvc:  PredictionService,
    private cdr:      ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.updateClock();
    this.clockSub = interval(1000).subscribe(() => this.updateClock());
    this.tipSub   = interval(4000).subscribe(() => {
      this.currentTip = (this.currentTip + 1) % this.tips.length;
    });
    this.eventSvc.getAll().subscribe({
      next: evs => {
        this.events = evs || [];
        this.loadingEvents = false;
      },
      error: () => { this.loadingEvents = false; this.error = 'Failed to load events.'; }
    });
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    this.clockSub?.unsubscribe();
    this.tipSub?.unsubscribe();
    cancelAnimationFrame(this.animId);
  }

  private updateClock(): void {
    this.currentTime = new Date().toLocaleTimeString('en-US',
      { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

onEventSelect(): void {
  this.selectedEvent =
    this.events.find(e => e.id === Number(this.selectedEventId)) ?? null;

  console.log('Selected Event:', this.selectedEvent);

  this.result = null;
  this.predicted = false;
  this.error = '';

  // Reset UI safely
  this.displayAttendance = 0;
  this.displayFillRate = 0;
  this.displayNoShows = 0;
  this.displayEmpty = 0;

  this.cdr.detectChanges();
}

  predict(): void {
  if (!this.selectedEventId) return;

  this.loading = true;
  this.error = '';
  this.result = null;
  this.predicted = false;

  forkJoin({
    events: this.eventSvc.getAll(),
    prediction: this.predSvc.predictAttendance(Number(this.selectedEventId))
  }).subscribe({
    next: ({ events, prediction }) => {
  this.events = events || [];

  this.selectedEvent =
    this.events.find(e => e.id === Number(this.selectedEventId)) ?? null;

  const predicted =
    prediction.predictedAttendance ||
    (prediction as any).predicted_attendance ||
    0;

  this.result = {
  ...prediction,
  predictedAttendance: predicted
};

// ✅ SET values immediately (prevents 0 flash)
this.displayAttendance = predicted;
this.displayFillRate = this.fillRate;
this.displayNoShows = this.noShowCount;
this.displayEmpty =
  (this.selectedEvent?.locationCapacity || 0) - predicted;

this.loading = false;
this.predicted = true;

this.cdr.detectChanges();

// THEN animate (optional)
setTimeout(() => {
  this.animateCounters();
  requestAnimationFrame(() => {
    this.drawGauge();
    this.drawFactorChart();
    this.drawCompareChart();
  });
}, 100);
},
    error: err => {
      console.error(err);
      this.error = 'Prediction failed';
      this.loading = false;
    }
  });
}
private animateCounters(): void {
  if (!this.result || !this.selectedEvent) return;

  const tA = Number(this.result.predictedAttendance) || 0;
const capacity = Number(this.selectedEvent.locationCapacity) || 0;
const registered = Number(this.selectedEvent.activeRegistrations) || 0;

  const tF = capacity ? Math.round((tA / capacity) * 100) : 0;
  const tN = Math.max(0, registered - tA);
  const tE = Math.max(0, capacity - tA);

  const steps = 50;
  let step = 0;

  const timer = setInterval(() => {
    step++;
    const ease = 1 - Math.pow(1 - step / steps, 3);

    this.displayAttendance = Math.round(tA * ease);
    this.displayFillRate = Math.round(tF * ease);
    this.displayNoShows = Math.round(tN * ease);
    this.displayEmpty = Math.round(tE * ease);

    if (step >= steps) clearInterval(timer);
  }, 1400 / steps);
}

  drawGauge(): void {
    const canvas = this.gaugeCanvas?.nativeElement;
    if (!canvas || !this.result || !this.selectedEvent) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.offsetWidth, cssH = canvas.offsetHeight;
    if (!cssW || !cssH) return;
    canvas.width = cssW * dpr; canvas.height = cssH * dpr;
    ctx.setTransform(1,0,0,1,0,0); ctx.scale(dpr,dpr); ctx.clearRect(0,0,cssW,cssH);
    const cx = cssW/2, cy = cssH*0.72, r = Math.min(cssW,cssH)*0.38;
    const start = Math.PI, end = 2*Math.PI;
    const pct = Math.min(this.fillRate/100, 1);
    const fillAngle = start + pct*Math.PI;
    const color = pct>=0.9 ? '#f43f5e' : pct>=0.6 ? '#f59e0b' : '#00a8a8';
    ctx.beginPath(); ctx.arc(cx,cy,r,start,end);
    ctx.strokeStyle='rgba(255,255,255,0.06)'; ctx.lineWidth=18; ctx.lineCap='round'; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx,cy,r,start,fillAngle);
    const grad=ctx.createLinearGradient(cx-r,cy,cx+r,cy);
    grad.addColorStop(0,'#00c5c5'); grad.addColorStop(0.6,color); grad.addColorStop(1,color);
    ctx.strokeStyle=grad; ctx.lineWidth=18; ctx.lineCap='round'; ctx.stroke();
    const nx=cx+Math.cos(start+pct*Math.PI)*(r-10), ny=cy+Math.sin(start+pct*Math.PI)*(r-10);
    ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(nx,ny);
    ctx.strokeStyle='white'; ctx.lineWidth=2; ctx.lineCap='round'; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx,cy,5,0,Math.PI*2); ctx.fillStyle='white'; ctx.fill();
    ctx.fillStyle='rgba(138,180,196,0.6)'; ctx.font='11px sans-serif';
    ctx.textAlign='left';  ctx.fillText('0%',   cx-r-10, cy+18);
    ctx.textAlign='right'; ctx.fillText('100%', cx+r+10, cy+18);
    ctx.fillStyle=color; ctx.font=`bold ${Math.round(r*0.4)}px sans-serif`; ctx.textAlign='center';
    ctx.fillText(`${this.fillRate}%`, cx, cy-r*0.05);
    ctx.fillStyle='rgba(138,180,196,0.7)'; ctx.font='12px sans-serif';
    ctx.fillText('Venue Fill Rate', cx, cy+18);
  }

  drawFactorChart(): void {
    const canvas = this.factorCanvas?.nativeElement;
    if (!canvas || !this.selectedEvent) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.offsetWidth, cssH = canvas.offsetHeight;
    if (!cssW || !cssH) return;
    canvas.width = cssW*dpr; canvas.height = cssH*dpr;
    ctx.setTransform(1,0,0,1,0,0); ctx.scale(dpr,dpr); ctx.clearRect(0,0,cssW,cssH);
    const ev = this.selectedEvent;
    const factors = [
      { label:'Past Rate', val:ev.pastAttendanceRate*100,              color:'#00a8a8' },
      { label:'Speaker',   val:ev.speakerRating*20,                    color:'#8b5cf6' },
      { label:'Mode',      val:ev.mode==='Online'?75:ev.mode==='Hybrid'?65:55, color:'#f59e0b' },
      { label:'Price',     val:ev.ticketPrice===0?60:ev.ticketPrice>50?30:55,  color:'#10b981' },
      { label:'Dept.',     val:60,                                     color:'#6366f1' },
    ];
    const rowH = cssH/factors.length;
    factors.forEach((f,i) => {
      const y=i*rowH+rowH*0.18, bH=rowH*0.55, barW=(f.val/100)*(cssW-90);
      ctx.fillStyle='rgba(255,255,255,0.04)'; ctx.beginPath(); ctx.roundRect(75,y,cssW-90,bH,3); ctx.fill();
      const grad=ctx.createLinearGradient(75,0,75+barW,0);
      grad.addColorStop(0,f.color); grad.addColorStop(1,f.color+'55');
      ctx.fillStyle=grad; ctx.beginPath(); ctx.roundRect(75,y,Math.max(barW,3),bH,3); ctx.fill();
      ctx.fillStyle='rgba(138,180,196,0.8)'; ctx.font='11px sans-serif'; ctx.textAlign='right';
      ctx.fillText(f.label,70,y+bH/2+4);
      ctx.fillStyle=f.color; ctx.font='bold 11px sans-serif'; ctx.textAlign='left';
      ctx.fillText(`${Math.round(f.val)}%`,82+barW,y+bH/2+4);
    });
  }

  drawCompareChart(): void {
    const canvas = this.compareCanvas?.nativeElement;
    if (!canvas || !this.result || !this.selectedEvent) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.offsetWidth, cssH = canvas.offsetHeight;
    if (!cssW || !cssH) return;
    canvas.width = cssW*dpr; canvas.height = cssH*dpr;
    ctx.setTransform(1,0,0,1,0,0); ctx.scale(dpr,dpr); ctx.clearRect(0,0,cssW,cssH);
    const ev = this.selectedEvent;
    const bars = [
      { label:'Capacity',    val:ev.locationCapacity,               color:'rgba(138,180,196,0.25)' },
      { label:'Registered',  val:ev.activeRegistrations??0,         color:'#8b5cf6' },
      { label:'AI Predicted',val:this.result.predictedAttendance,   color:'#00a8a8' },
    ];
    const maxV=Math.max(...bars.map(b=>b.val),1)*1.15;
    const bW=Math.min((cssW-60)/bars.length*0.55,60);
    const gap=(cssW-60)/bars.length;
    const pad={t:20,b:50,l:30}, cH=cssH-pad.t-pad.b;
    for (let i=0;i<=4;i++) {
      const y=pad.t+cH-(i/4)*cH;
      ctx.strokeStyle='rgba(138,180,196,0.07)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(pad.l,y); ctx.lineTo(cssW-10,y); ctx.stroke();
    }
    bars.forEach((b,i) => {
      const cx=pad.l+i*gap+gap/2, bH=(b.val/maxV)*cH;
      if (b.color.startsWith('rgba')) {
        ctx.fillStyle=b.color; ctx.beginPath(); ctx.roundRect(cx-bW/2,pad.t+cH-bH,bW,bH,[4,4,0,0]); ctx.fill();
      } else {
        const g=ctx.createLinearGradient(0,pad.t+cH-bH,0,pad.t+cH);
        g.addColorStop(0,b.color); g.addColorStop(1,b.color+'44');
        ctx.fillStyle=g; ctx.beginPath(); ctx.roundRect(cx-bW/2,pad.t+cH-bH,bW,bH,[4,4,0,0]); ctx.fill();
      }
      ctx.fillStyle=b.color; ctx.font='bold 11px sans-serif'; ctx.textAlign='center';
      ctx.fillText(b.val+'',cx,pad.t+cH-bH-6);
      ctx.fillStyle='rgba(138,180,196,0.7)'; ctx.font='10px sans-serif';
      ctx.fillText(b.label,cx,pad.t+cH+18);
    });
  }

get fillRate(): number {
  if (!this.result || !this.selectedEvent) return 0;

  const capacity = Number(this.selectedEvent.locationCapacity) || 1;
  const predicted = Number(this.result.predictedAttendance) || 0;

  return Math.min(100, Math.round((predicted / capacity) * 100));
}
get noShowCount(): number {
  if (!this.result || !this.selectedEvent) return 0;

  const registered = Number(this.selectedEvent.activeRegistrations) || 0;
  const predicted = Number(this.result.predictedAttendance) || 0;

  return Math.max(0, registered - predicted);
}
  get fillColor(): string {
    const p=this.fillRate; return p>=90?'var(--rose-500)':p>=60?'var(--amber-400)':'var(--green-500)';
  }
  get fillLabel(): string {
    const p=this.fillRate; return p>=90?'Near Capacity':p>=60?'Filling Up':'Good Availability';
  }
  get confidenceLevel(): string {
    if (!this.selectedEvent) return '—';
    const r=this.selectedEvent.pastAttendanceRate;
    return r>=0.8?'High':r>=0.5?'Medium':'Low';
  }
  get confidenceColor(): string {
    const c=this.confidenceLevel;
    return c==='High'?'var(--green-500)':c==='Medium'?'var(--amber-400)':'var(--rose-500)';
  }
  get factorCards(): FactorCard[] {
    if (!this.selectedEvent) return [];
    const ev=this.selectedEvent;
    return [
      { icon:'📊', label:'Past Attendance Rate', value:`${Math.round(ev.pastAttendanceRate*100)}%`,
        impact:ev.pastAttendanceRate>=0.7?'high':ev.pastAttendanceRate>=0.5?'medium':'low',
        desc:'Historical attendance rate for this type of event' },
      { icon:'⭐', label:'Speaker Rating', value:`${ev.speakerRating}/5`,
        impact:ev.speakerRating>=4?'high':ev.speakerRating>=3?'medium':'negative',
        desc:ev.speakerRating>=4?'High rating boosts attendance by ~5%':'Below average rating may reduce turnout' },
      { icon:'💻', label:'Event Mode', value:ev.mode,
        impact:ev.mode==='Online'?'high':ev.mode==='Hybrid'?'medium':'low',
        desc:ev.mode==='Online'?'Online events have broader reach':ev.mode==='Hybrid'?'Hybrid offers flexibility':'Offline events limited to local attendees' },
      { icon:'💰', label:'Ticket Price', value:ev.ticketPrice===0?'Free':`$${ev.ticketPrice}`,
        impact:ev.ticketPrice===0?'medium':ev.ticketPrice>50?'negative':'medium',
        desc:ev.ticketPrice===0?'Free events attract more registrations but higher no-shows':'Paid events tend to have better attendance rate' },
      { icon:'🏢', label:'Department', value:ev.department, impact:'medium',
        desc:'Department context influences expected attendance patterns' },
      { icon:'📅', label:'Day of Week', value:new Date(ev.eventDate).toLocaleDateString('en-US',{weekday:'long'}),
        impact:[0,6].includes(new Date(ev.eventDate).getDay())?'high':'medium',
        desc:[0,6].includes(new Date(ev.eventDate).getDay())?'Weekend events see higher attendance for most types':'Weekday events vary by department and type' },
    ];
  }
  get upcomingDays(): number {
    if (!this.selectedEvent) return 0;
    return Math.max(0,Math.ceil((new Date(this.selectedEvent.eventDate).getTime()-Date.now())/86400000));
  }
  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});
  }
  formatDateShort(d: string): string {
    return new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
  }
}


