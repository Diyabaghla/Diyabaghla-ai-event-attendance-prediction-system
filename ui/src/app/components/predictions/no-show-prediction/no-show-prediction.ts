import {
  Component, OnInit, OnDestroy, AfterViewInit,
  ViewChild, ElementRef, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { EventService, PredictionService } from '../../../services/api.services';
import { Event, NoShowPredictionResult } from '../../../models/models';

@Component({
  selector: 'app-no-show-prediction',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './no-show-prediction.html',
  styleUrls: ['./no-show-prediction.scss']
})
export class NoShowPrediction implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('probCanvas')  probCanvas!:  ElementRef<HTMLCanvasElement>;
  @ViewChild('histCanvas')  histCanvas!:  ElementRef<HTMLCanvasElement>;
  @ViewChild('radarCanvas') radarCanvas!: ElementRef<HTMLCanvasElement>;

  events:          Event[]                      = [];
  selectedEventId: number | null                = null;
  selectedEvent:   Event | null                 = null;
  result:          NoShowPredictionResult | null = null;

  loading       = false;
  loadingEvents = true;
  error         = '';
  predicted     = false;
  displayProb   = 0;
  currentTime   = '';

  private clockSub?: Subscription;
  private tipSub?:   Subscription;

  tips = [
    { icon: '📅', text: 'Events registered 1–7 days before show better attendance than last-minute sign-ups.' },
    { icon: '💰', text: 'Paid events have significantly lower no-show rates than free events.' },
    { icon: '🤝', text: 'Hybrid events offer flexibility which increases actual attendance.' },
    { icon: '📊', text: 'Users with past attendance rate above 70% rarely become no-shows.' },
    { icon: '⭐', text: 'Higher speaker ratings correlate strongly with lower no-show rates.' },
  ];
  currentTip = 0;

  riskLevels = [
    { label: 'Very High Risk',  range: '0–30%',   color: '#f43f5e', desc: 'Very unlikely to attend' },
    { label: 'High Risk',       range: '30–50%',  color: '#fb923c', desc: 'More likely to skip' },
    { label: 'Moderate Risk',   range: '50–70%',  color: '#f59e0b', desc: 'Could go either way' },
    { label: 'Low Risk',        range: '70–85%',  color: '#34d399', desc: 'Likely to attend' },
    { label: 'Very Low Risk',   range: '85–100%', color: '#10b981', desc: 'Almost certain to attend' },
  ];

  constructor(
    private eventSvc: EventService,
    private predSvc:  PredictionService,
    private cdr:      ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.updateClock();
    this.clockSub = interval(1000).subscribe(() => this.updateClock());
    this.tipSub   = interval(4500).subscribe(() => {
      this.currentTip = (this.currentTip + 1) % this.tips.length;
    });
    this.eventSvc.getAll().subscribe({
      next: evs => { this.events = evs || []; this.loadingEvents = false; },
      error: () => { this.loadingEvents = false; this.error = 'Failed to load events.'; }
    });
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    this.clockSub?.unsubscribe();
    this.tipSub?.unsubscribe();
  }

  private updateClock(): void {
    this.currentTime = new Date().toLocaleTimeString('en-US',
      { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

 onEventSelect(): void {
  this.selectedEvent =
    this.events.find(e => e.id === Number(this.selectedEventId)) ?? null;

  this.result = null;
  this.predicted = false;
  this.error = '';

  this.displayProb = 0;

  this.cdr.detectChanges();
}

  predict(): void {
    if (!this.selectedEventId) return;
    this.loading = true; this.error = ''; this.result = null; this.predicted = false;
    this.predSvc.predictNoShow(Number(this.selectedEventId)).subscribe({
    next: r => {
  console.log('RAW RESPONSE:', r);

 const probability =
  r.probability !== undefined && r.probability !== null
    ? Number(r.probability)
    : (r as any).probability_pct !== undefined
    ? Number((r as any).probability_pct) / 100
    : 0;

  this.result = {
    ...r,
    probability: probability
  };

  this.loading = false;
  this.predicted = true;

  this.cdr.detectChanges();

  setTimeout(() => {
    this.animateCounter();

    requestAnimationFrame(() => {
      this.drawProbRing();
      this.drawHistogram();
      this.drawRadar();
    });
  }, 150);
},
      error: err => {
        this.error   = err.error?.message || 'Prediction failed. Make sure FastAPI is running on port 8000.';
        this.loading = false;
      }
    });
  }

  private animateCounter(): void {
  const target = this.probabilityPct;
  const steps = 40;
  let step = 0;

  const timer = setInterval(() => {
    step++;
    const ease = step / steps;

    this.displayProb = Math.round(target * ease);

    if (step >= steps) {
      this.displayProb = target; // ✅ force final value
      clearInterval(timer);
    }
  }, 1200 / steps);
}

  drawProbRing(): void {
    const canvas = this.probCanvas?.nativeElement;
    if (!canvas || !this.result) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const dpr = window.devicePixelRatio||1;
    const cssW = canvas.offsetWidth, cssH = canvas.offsetHeight;
    if (!cssW||!cssH) return;
    canvas.width=cssW*dpr; canvas.height=cssH*dpr;
    ctx.setTransform(1,0,0,1,0,0); ctx.scale(dpr,dpr); ctx.clearRect(0,0,cssW,cssH);
    const cx=cssW/2, cy=cssH/2, r=Math.min(cssW,cssH)*0.38;
    const pct=this.result.probability, col=this.getRingColor(pct);
    const glow=ctx.createRadialGradient(cx,cy,r*0.6,cx,cy,r*1.1);
    glow.addColorStop(0,col+'22'); glow.addColorStop(1,'transparent');
    ctx.beginPath(); ctx.arc(cx,cy,r*1.1,0,Math.PI*2); ctx.fillStyle=glow; ctx.fill();
    ctx.beginPath(); ctx.arc(cx,cy,r,-Math.PI/2,Math.PI*1.5);
    ctx.strokeStyle='rgba(255,255,255,0.05)'; ctx.lineWidth=16; ctx.lineCap='round'; ctx.stroke();
    const grad=ctx.createLinearGradient(cx-r,cy,cx+r,cy);
    grad.addColorStop(0,col); grad.addColorStop(1,col+'aa');
    ctx.beginPath(); ctx.arc(cx,cy,r,-Math.PI/2,-Math.PI/2+pct*Math.PI*2);
    ctx.strokeStyle=grad; ctx.lineWidth=16; ctx.lineCap='round'; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx,cy,r*0.62,0,Math.PI*2); ctx.fillStyle='#0e1620'; ctx.fill();
    ctx.fillStyle=col; ctx.font=`bold ${Math.round(r*0.45)}px sans-serif`; ctx.textAlign='center';
    ctx.fillText(`${this.probabilityPct}%`,cx,cy+8);
    ctx.fillStyle='rgba(138,180,196,0.7)'; ctx.font='11px sans-serif';
    ctx.fillText('Attend Probability',cx,cy+26);
    for (let i=0;i<=10;i++) {
      const a=-Math.PI/2+(i/10)*Math.PI*2;
      ctx.beginPath(); ctx.moveTo(cx+Math.cos(a)*(r+4),cy+Math.sin(a)*(r+4));
      ctx.lineTo(cx+Math.cos(a)*(r+9),cy+Math.sin(a)*(r+9));
      ctx.strokeStyle='rgba(138,180,196,0.2)'; ctx.lineWidth=1; ctx.stroke();
    }
  }

  drawHistogram(): void {
    const canvas = this.histCanvas?.nativeElement;
    if (!canvas||!this.result) return;
    const ctx=canvas.getContext('2d'); if (!ctx) return;
    const dpr=window.devicePixelRatio||1;
    const cssW=canvas.offsetWidth, cssH=canvas.offsetHeight;
    if (!cssW||!cssH) return;
    canvas.width=cssW*dpr; canvas.height=cssH*dpr;
    ctx.setTransform(1,0,0,1,0,0); ctx.scale(dpr,dpr); ctx.clearRect(0,0,cssW,cssH);
    const bars=[
      {label:'0–20%', height:0.15,color:'#f43f5e'},
      {label:'20–40%',height:0.25,color:'#fb923c'},
      {label:'40–60%',height:0.45,color:'#f59e0b'},
      {label:'60–80%',height:0.70,color:'#34d399'},
      {label:'80–100%',height:0.55,color:'#10b981'},
    ];
    const pad={t:16,b:40,l:10,r:10};
    const cW=cssW-pad.l-pad.r, cH=cssH-pad.t-pad.b;
    const bW=cW/bars.length*0.65, gap=cW/bars.length;
    const userBand=Math.min(Math.floor(this.result.probability*5),4);
    bars.forEach((b,i) => {
      const cx=pad.l+i*gap+gap/2, bH=b.height*cH, isUser=i===userBand;
      ctx.globalAlpha=isUser?1:0.35;
      const g=ctx.createLinearGradient(0,pad.t+cH-bH,0,pad.t+cH);
      g.addColorStop(0,b.color); g.addColorStop(1,b.color+'44');
      ctx.fillStyle=g; ctx.beginPath(); ctx.roundRect(cx-bW/2,pad.t+cH-bH,bW,bH,[4,4,0,0]); ctx.fill();
      if (isUser) {
        ctx.fillStyle='white'; ctx.font='bold 10px sans-serif'; ctx.textAlign='center';
        ctx.fillText('YOU',cx,pad.t+cH-bH-6);
      }
      ctx.globalAlpha=1; ctx.fillStyle='rgba(138,180,196,0.65)';
      ctx.font='9px sans-serif'; ctx.textAlign='center'; ctx.fillText(b.label,cx,pad.t+cH+14);
    });
    ctx.fillStyle='rgba(138,180,196,0.5)'; ctx.font='10px sans-serif'; ctx.textAlign='left';
    ctx.fillText('Attendance Probability Distribution',pad.l+2,12);
  }

  drawRadar(): void {
    const canvas=this.radarCanvas?.nativeElement;
    if (!canvas||!this.selectedEvent) return;
    const ctx=canvas.getContext('2d'); if (!ctx) return;
    const dpr=window.devicePixelRatio||1;
    const cssW=canvas.offsetWidth, cssH=canvas.offsetHeight;
    if (!cssW||!cssH) return;
    canvas.width=cssW*dpr; canvas.height=cssH*dpr;
    ctx.setTransform(1,0,0,1,0,0); ctx.scale(dpr,dpr); ctx.clearRect(0,0,cssW,cssH);
    const ev=this.selectedEvent;
    const cx=cssW/2, cy=cssH/2-10, r=Math.min(cssW,cssH)*0.33;
    // Removed weather & reminderSent — use ticket price & mode instead
    const axes=[
      { label:'Past Rate', val: ev.pastAttendanceRate },
      { label:'Speaker',   val: ev.speakerRating/5 },
      { label:'Ticket',    val: ev.ticketPrice===0?0.5:Math.max(0.2,1-(ev.ticketPrice/200)) },
      { label:'Mode',      val: ev.mode==='Online'?0.8:ev.mode==='Hybrid'?0.65:0.5 },
      { label:'Dept.',     val: 0.6 },
    ];
    const n=axes.length;
    [0.25,0.5,0.75,1].forEach(s => {
      ctx.beginPath();
      axes.forEach((_,i) => {
        const a=(i/n)*Math.PI*2-Math.PI/2;
        const x=cx+Math.cos(a)*r*s, y=cy+Math.sin(a)*r*s;
        i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      });
      ctx.closePath(); ctx.strokeStyle='rgba(138,180,196,0.1)'; ctx.lineWidth=1; ctx.stroke();
    });
    axes.forEach((_,i) => {
      const a=(i/n)*Math.PI*2-Math.PI/2;
      ctx.beginPath(); ctx.moveTo(cx,cy);
      ctx.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);
      ctx.strokeStyle='rgba(138,180,196,0.15)'; ctx.lineWidth=1; ctx.stroke();
    });
    const col=this.getRingColor(this.result?.probability??0.5);
    ctx.beginPath();
    axes.forEach((a,i) => {
      const angle=(i/n)*Math.PI*2-Math.PI/2;
      const x=cx+Math.cos(angle)*r*a.val, y=cy+Math.sin(angle)*r*a.val;
      i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
    });
    ctx.closePath(); ctx.fillStyle=col+'22'; ctx.fill();
    ctx.strokeStyle=col; ctx.lineWidth=2; ctx.stroke();
    axes.forEach((a,i) => {
      const angle=(i/n)*Math.PI*2-Math.PI/2;
      const dx=cx+Math.cos(angle)*r*a.val, dy=cy+Math.sin(angle)*r*a.val;
      ctx.beginPath(); ctx.arc(dx,dy,4,0,Math.PI*2); ctx.fillStyle=col; ctx.fill();
      const lx=cx+Math.cos(angle)*(r+18), ly=cy+Math.sin(angle)*(r+18);
      ctx.fillStyle='rgba(138,180,196,0.8)'; ctx.font='10px sans-serif'; ctx.textAlign='center';
      ctx.fillText(a.label,lx,ly+4);
    });
  }

  getRingColor(prob: number): string {
    if (prob>=0.85) return '#10b981'; if (prob>=0.70) return '#34d399';
    if (prob>=0.50) return '#f59e0b'; if (prob>=0.30) return '#fb923c';
    return '#f43f5e';
  }

  get probabilityPct(): number { return Math.round((this.result?.probability??0)*100); }
  get willAttend():     boolean { return this.result?.prediction==='Attend'; }

  get riskLabel(): string {
    const p=this.probabilityPct;
    if (p>=85) return 'Very Low Risk'; if (p>=70) return 'Low Risk';
    if (p>=50) return 'Moderate Risk'; if (p>=30) return 'High Risk';
    return 'Very High Risk';
  }
  get riskColor(): string { return this.getRingColor(this.result?.probability??0); }
  get riskDesc():  string {
    const p=this.probabilityPct;
    if (p>=85) return 'This event is almost certain to meet attendance expectations.';
    if (p>=70) return 'Attendance is likely. Minor no-show risk exists.';
    if (p>=50) return 'Attendance outcome is uncertain — consider sending a reminder.';
    if (p>=30) return 'High no-show probability. Engage attendees proactively.';
    return 'Very high no-show risk. Take action to improve attendance.';
  }

  get recommendations(): { icon: string; text: string }[] {
    if (!this.selectedEvent) return []; 
    const p=this.probabilityPct, ev=this.selectedEvent;
    const recs: {icon:string;text:string}[]=[];
    if (p<70) recs.push({icon:'🔔',text:'Send a reminder email to all registered attendees.'});
    if (ev?.speakerRating&&ev.speakerRating<3.5) recs.push({icon:'⭐',text:'Consider upgrading the speaker to improve appeal.'});
    if (ev?.mode==='Offline'&&p<60) recs.push({icon:'💻',text:'Adding a hybrid option could increase participation.'});
    if (p<50) recs.push({icon:'🎁',text:'Offer an incentive (certificate, gift) for attendees.'});
    if (p>=80) recs.push({icon:'✅',text:'Great outlook! Ensure logistics are ready for full attendance.'});
    if (!recs.length) recs.push({icon:'👍',text:'Attendance looks solid. Keep the current event setup.'});
    return recs.slice(0,4);
  }

  formatDateShort(d: string): string {
    return new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
  }
  get upcomingDays(): number {
    if (!this.selectedEvent) return 0;
    return Math.max(0,Math.ceil((new Date(this.selectedEvent.eventDate).getTime()-Date.now())/86400000));
  }
}
