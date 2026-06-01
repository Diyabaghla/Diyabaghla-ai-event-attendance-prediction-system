import {
  Component, OnInit, AfterViewInit, ViewChild,
  ElementRef, ChangeDetectorRef
} from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { ReportService } from '../../services/api.services';
import {
  AttendanceReportItem, RegistrationStatusReport,
  EventPerformanceReport, DepartmentBreakdownReport,
  WeeklyTrendItem, TopStatsReport
} from '../../models/models';
import { NgZone } from '@angular/core';

 
@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.html',
  styleUrls: ['./reports.scss']
})
export class Reports implements OnInit, AfterViewInit {
  @ViewChild('barCanvas')       barCanvas!:       ElementRef<HTMLCanvasElement>;
  @ViewChild('donutCanvas')     donutCanvas!:     ElementRef<HTMLCanvasElement>;
  @ViewChild('lineCanvas')      lineCanvas!:      ElementRef<HTMLCanvasElement>;
  @ViewChild('deptCanvas')      deptCanvas!:      ElementRef<HTMLCanvasElement>;
  @ViewChild('modeCanvas')      modeCanvas!:      ElementRef<HTMLCanvasElement>;
  @ViewChild('trendCanvas')     trendCanvas!:     ElementRef<HTMLCanvasElement>;
  @ViewChild('eventTypeCanvas') eventTypeCanvas!: ElementRef<HTMLCanvasElement>;
 
  attendanceData:  AttendanceReportItem[]         = [];
  statusReport:    RegistrationStatusReport|null  = null;
  performanceData: EventPerformanceReport[]       = [];
  deptReport:      DepartmentBreakdownReport|null = null;
  weeklyTrend:     WeeklyTrendItem[]              = [];
  topStats:        TopStatsReport|null            = null;
 
  loading   = true;
  error     = '';
  activeTab: 'overview'|'performance'|'departments'|'trends' = 'overview';
  dlOpen    = false;
 
  displayTotal  = 0;
  displayActive = 0;
  displayCancel = 0;
  displayFill   = '0%';
 
  constructor(private reportSvc: ReportService, private cdr: ChangeDetectorRef,
     private ngZone: NgZone
  ) {}
 
  ngOnInit(): void {
  forkJoin({
    att:    this.reportSvc.getAttendanceVsRegistration().pipe(catchError(() => of([]))),
    status: this.reportSvc.getCancelledVsRegistered().pipe(catchError(() => of(null))),
    perf:   this.reportSvc.getEventPerformance().pipe(catchError(() => of([]))),
    dept:   this.reportSvc.getDepartmentBreakdown().pipe(catchError(() => of(null))),
    trend:  this.reportSvc.getWeeklyTrend().pipe(catchError(() => of([]))),
    top:    this.reportSvc.getTopStats().pipe(catchError(() => of(null)))
  }).subscribe({
    next: ({ att, status, perf, dept, trend, top }) => {

      // ✅ Assign data safely
      this.attendanceData  = att || [];
      this.statusReport    = status || null;
      this.performanceData = perf || [];
      this.deptReport      = dept || null;
      this.weeklyTrend     = trend || [];
     this.topStats = top && Object.keys(top).length ? top : null;

      // ✅ Stop loader FIRST
      this.loading = false;

      // 🔥 CRITICAL FIX: Force Angular render BEFORE charts/counters
      this.ngZone.run(() => {

        // Step 1: trigger UI render
        this.cdr.detectChanges();

        // Step 2: wait for DOM to be ready
        setTimeout(() => {

          // Step 3: run animations + charts AFTER DOM exists
          this.animateCounters();
          this.drawAllCharts();

          // 🔥 Step 4: safety redraw (handles slow DOM / canvas sizing)
          setTimeout(() => {
            this.drawAllCharts();
          }, 200);

        }, 0);

      });
    },

    error: () => {
      this.error = 'Failed to load report data.';
      this.loading = false;
    }
  });
}
  ngAfterViewInit(): void {}
 
  switchTab(tab: typeof this.activeTab): void {
  this.activeTab = tab;

  this.ngZone.run(() => {
    this.cdr.detectChanges();

    setTimeout(() => {
      this.drawAllCharts();

      // extra safety
      setTimeout(() => this.drawAllCharts(), 150);
    }, 50);
  });
}
 
  animateCounters(): void {
  if (!this.topStats) return;

  const t = this.topStats.totalRegistrations || 0;
  const a = this.topStats.activeRegistrations || 0;
  const c = this.topStats.cancelledRegistrations || 0;
  const f = this.topStats.avgFillRate || 0;

  // 🔥 If all values are 0 → don't animate fake data
if (!this.topStats || t === 0) {
  this.displayTotal = t;
  this.displayActive = a;
  this.displayCancel = c;
  this.displayFill = f + '%';
  return;
}

  const steps = 40;
  let step = 0;

  const timer = setInterval(() => {
    step++;
    const ease = 1 - Math.pow(1 - step / steps, 3);

    this.displayTotal  = Math.round(t * ease);
    this.displayActive = Math.round(a * ease);
    this.displayCancel = Math.round(c * ease);
    this.displayFill   = Math.round(f * ease) + '%';

    if (step >= steps) clearInterval(timer);
  }, 1200 / steps);
}
 
drawAllCharts(): void {
  if (this.loading) return;

  if (this.attendanceData?.length) this.drawBarChart();
  if (this.statusReport) this.drawDonutChart();
  if (this.performanceData?.length) this.drawLineChart();
  if (this.deptReport?.byDepartment?.length) this.drawDeptChart();
  if (this.deptReport?.byMode?.length) this.drawModeChart();
  if (this.weeklyTrend?.length) this.drawTrendChart();
  if (this.deptReport?.byEventType?.length) this.drawEventTypeChart();
}
 
  private setup(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.offsetWidth, h = canvas.offsetHeight;
    if (!w || !h) return null;
    canvas.width  = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);
    return ctx;
  }
 
  drawBarChart(): void {
    const canvas = this.barCanvas?.nativeElement;
    if (!canvas || !this.attendanceData.length) return;
    const ctx = this.setup(canvas); if (!ctx) return;
    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    const data = this.attendanceData.slice(0, 8);
    const pad  = { t:28, r:20, b:72, l:44 };
    const cW = W-pad.l-pad.r, cH = H-pad.t-pad.b;
    const maxV = Math.max(...data.map(d => Math.max(d.activeRegistrations, d.predictedAttendance)), 5) * 1.2;
    const groupW = cW / data.length;
    const bW = Math.min(groupW * 0.30, 22);
    for (let i = 0; i <= 4; i++) {
      const y = pad.t + cH - (i/4)*cH;
      ctx.strokeStyle='rgba(0,168,168,0.07)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(pad.l,y); ctx.lineTo(pad.l+cW,y); ctx.stroke();
      ctx.fillStyle='rgba(138,180,196,0.55)'; ctx.font='10px sans-serif'; ctx.textAlign='right';
      ctx.fillText(Math.round(maxV*i/4)+'', pad.l-5, y+4);
    }
    data.forEach((d, i) => {
      const cx = pad.l + i*groupW + groupW/2;
      const rh = Math.max((d.activeRegistrations/maxV)*cH, 1);
      const g1 = ctx.createLinearGradient(0, pad.t+cH-rh, 0, pad.t+cH);
      g1.addColorStop(0,'#00c5c5'); g1.addColorStop(1,'#004444');
      ctx.fillStyle=g1; ctx.beginPath(); ctx.roundRect(cx-bW-2, pad.t+cH-rh, bW, rh, [4,4,0,0]); ctx.fill();
      const ph = Math.max((d.predictedAttendance/maxV)*cH, 1);
      const g2 = ctx.createLinearGradient(0, pad.t+cH-ph, 0, pad.t+cH);
      g2.addColorStop(0,'#fbbf24'); g2.addColorStop(1,'#78350f');
      ctx.fillStyle=g2; ctx.beginPath(); ctx.roundRect(cx+2, pad.t+cH-ph, bW, ph, [4,4,0,0]); ctx.fill();
      const lbl = d.eventTitle.length>9 ? d.eventTitle.slice(0,8)+'…' : d.eventTitle;
      ctx.fillStyle='rgba(138,180,196,0.7)'; ctx.font='10px sans-serif'; ctx.textAlign='center';
      ctx.save(); ctx.translate(cx, pad.t+cH+14); ctx.rotate(-0.42); ctx.fillText(lbl,0,0); ctx.restore();
    });
    ctx.fillStyle='#00c5c5'; ctx.fillRect(W-180,10,10,8);
    ctx.fillStyle='#fbbf24'; ctx.fillRect(W-90,10,10,8);
    ctx.fillStyle='rgba(138,180,196,0.7)'; ctx.font='10px sans-serif'; ctx.textAlign='left';
    ctx.fillText('Registered',W-166,18); ctx.fillText('AI Predicted',W-76,18);
  }
 
  drawDonutChart(): void {
    const canvas = this.donutCanvas?.nativeElement;
    if (!canvas || !this.statusReport) return;
    const ctx = this.setup(canvas); if (!ctx) return;
    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    const cx = W/2, cy = H/2-10, r = Math.min(W,H)*0.28;
    const total = this.statusReport.totalRegistrations || 1;
    const slices = [
      { val: this.statusReport.registered, color:'#00a8a8', label:'Registered' },
      { val: this.statusReport.cancelled,  color:'#f43f5e', label:'Cancelled'  }
    ];
    let start = -Math.PI/2;
    slices.forEach(s => {
      if (!s.val) return;
      const angle = (s.val/total)*Math.PI*2;
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,r,start,start+angle); ctx.closePath();
      ctx.fillStyle=s.color; ctx.fill();
      const mid = start+angle/2;
      ctx.fillStyle='white'; ctx.font='bold 12px sans-serif'; ctx.textAlign='center';
      ctx.fillText(Math.round(s.val/total*100)+'%', cx+Math.cos(mid)*r*0.65, cy+Math.sin(mid)*r*0.65+4);
      start += angle;
    });
    ctx.beginPath(); ctx.arc(cx,cy,r*0.52,0,Math.PI*2); ctx.fillStyle='#0e1620'; ctx.fill();
    ctx.fillStyle='#e8f4f4'; ctx.font='bold 20px sans-serif'; ctx.textAlign='center';
    ctx.fillText(total+'',cx,cy+6);
    ctx.fillStyle='rgba(138,180,196,0.7)'; ctx.font='11px sans-serif'; ctx.fillText('Total',cx,cy+22);
    const ly = H-22;
    slices.forEach((s,i) => {
      const lx = W/2-80+i*100;
      ctx.beginPath(); ctx.arc(lx,ly,5,0,Math.PI*2); ctx.fillStyle=s.color; ctx.fill();
      ctx.fillStyle='rgba(138,180,196,0.8)'; ctx.font='11px sans-serif'; ctx.textAlign='left';
      ctx.fillText(`${s.label} (${s.val})`, lx+10, ly+4);
    });
  }
 
  drawLineChart(): void {
    const canvas = this.lineCanvas?.nativeElement;
    if (!canvas || !this.performanceData.length) return;
    const ctx = this.setup(canvas); if (!ctx) return;
    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    const data = this.performanceData.slice(0,10);
    const pad  = { t:24, r:20, b:72, l:46 };
    const cW = W-pad.l-pad.r, cH = H-pad.t-pad.b;
    const step = data.length>1 ? cW/(data.length-1) : cW;
    for (let i=0;i<=4;i++) {
      const y=pad.t+cH-(i/4)*cH;
      ctx.strokeStyle='rgba(0,168,168,0.07)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(pad.l,y); ctx.lineTo(pad.l+cW,y); ctx.stroke();
      ctx.fillStyle='rgba(138,180,196,0.55)'; ctx.font='10px sans-serif'; ctx.textAlign='right';
      ctx.fillText(`${i*25}%`,pad.l-5,y+4);
    }
    const pts = data.map((d,i) => ({ x:pad.l+i*step, y:pad.t+cH-Math.min(d.fillRate,100)/100*cH }));
    if (pts.length>1) {
      const grad=ctx.createLinearGradient(0,pad.t,0,pad.t+cH);
      grad.addColorStop(0,'rgba(0,168,168,0.2)'); grad.addColorStop(1,'rgba(0,168,168,0)');
      ctx.beginPath(); ctx.moveTo(pts[0].x,pts[0].y);
      for (let i=1;i<pts.length;i++) { const cp=(pts[i-1].x+pts[i].x)/2; ctx.bezierCurveTo(cp,pts[i-1].y,cp,pts[i].y,pts[i].x,pts[i].y); }
      ctx.lineTo(pts[pts.length-1].x,pad.t+cH); ctx.lineTo(pts[0].x,pad.t+cH); ctx.closePath(); ctx.fillStyle=grad; ctx.fill();
      ctx.beginPath(); ctx.strokeStyle='#00c5c5'; ctx.lineWidth=2.5; ctx.moveTo(pts[0].x,pts[0].y);
      for (let i=1;i<pts.length;i++) { const cp=(pts[i-1].x+pts[i].x)/2; ctx.bezierCurveTo(cp,pts[i-1].y,cp,pts[i].y,pts[i].x,pts[i].y); }
      ctx.stroke();
    }
    pts.forEach((p,i) => {
      ctx.beginPath(); ctx.arc(p.x,p.y,5,0,Math.PI*2); ctx.fillStyle='#00c5c5'; ctx.fill();
      ctx.strokeStyle='#0e1620'; ctx.lineWidth=2; ctx.stroke();
      ctx.fillStyle='rgba(251,191,36,0.9)'; ctx.font='bold 10px sans-serif'; ctx.textAlign='center';
      ctx.fillText(`${data[i].fillRate.toFixed(0)}%`,p.x,p.y-10);
      const lbl=data[i].eventTitle.length>9?data[i].eventTitle.slice(0,8)+'…':data[i].eventTitle;
      ctx.fillStyle='rgba(138,180,196,0.7)'; ctx.font='10px sans-serif';
      ctx.save(); ctx.translate(p.x,pad.t+cH+14); ctx.rotate(-0.42); ctx.fillText(lbl,0,0); ctx.restore();
    });
  }
 
  drawDeptChart(): void {
    const canvas = this.deptCanvas?.nativeElement;
    if (!canvas || !this.deptReport?.byDepartment?.length) return;
    const ctx = this.setup(canvas); if (!ctx) return;
    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    const data = this.deptReport.byDepartment.slice(0,7);
    const maxV = Math.max(...data.map(d=>d.totalRegistrations), 1);
    const rowH = H / data.length;
    const colors = ['#00a8a8','#8b5cf6','#f59e0b','#10b981','#f43f5e','#6366f1','#0ea5e9'];
    const chartLeft = 120, chartW = W - chartLeft - 10;
    data.forEach((d,i) => {
      const y = i*rowH+rowH*0.2, bH = rowH*0.5;
      const barW = (d.totalRegistrations/maxV)*chartW;
      ctx.fillStyle='rgba(255,255,255,0.04)'; ctx.beginPath(); ctx.roundRect(chartLeft,y,chartW,bH,4); ctx.fill();
      const grad=ctx.createLinearGradient(chartLeft,0,chartLeft+barW,0);
      grad.addColorStop(0,colors[i%colors.length]); grad.addColorStop(1,colors[i%colors.length]+'55');
      ctx.fillStyle=grad; ctx.beginPath(); ctx.roundRect(chartLeft,y,Math.max(barW,4),bH,4); ctx.fill();
      ctx.fillStyle='rgba(138,180,196,0.85)'; ctx.font='12px sans-serif'; ctx.textAlign='right';
      ctx.fillText(d.department, chartLeft-6, y+bH/2+4);
      const label = `${d.totalRegistrations} reg · ${d.totalEvents} events`;
      ctx.font='bold 10px sans-serif';
      const labelW = ctx.measureText(label).width;
      const spaceInside = barW - 10;
      if (spaceInside > labelW + 8) {
        ctx.fillStyle='rgba(255,255,255,0.9)'; ctx.textAlign='right';
        ctx.fillText(label, chartLeft + barW - 6, y+bH/2+4);
      } else {
        const outsideX = chartLeft + barW + 6;
        const maxX = W - 4;
        if (outsideX + labelW <= maxX) {
          ctx.fillStyle=colors[i%colors.length]; ctx.textAlign='left';
          ctx.fillText(label, outsideX, y+bH/2+4);
        } else {
          ctx.fillStyle='rgba(255,255,255,0.9)'; ctx.textAlign='center';
          ctx.fillText(`${d.totalRegistrations}`, chartLeft + Math.max(barW/2,14), y+bH/2+4);
        }
      }
    });
  }
 
  drawModeChart(): void {
    const canvas = this.modeCanvas?.nativeElement;
    if (!canvas || !this.deptReport?.byMode?.length) return;
    const ctx = this.setup(canvas); if (!ctx) return;
    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    const cx=W/2, cy=H/2-14, r=Math.min(W,H)*0.30;
    const colors: Record<string,string> = { Online:'#00a8a8', Offline:'#f59e0b', Hybrid:'#10b981' };
    const total = this.deptReport.byMode.reduce((s,m)=>s+m.eventCount,0)||1;
    let start = -Math.PI/2;
    this.deptReport.byMode.forEach(m => {
      const angle=(m.eventCount/total)*Math.PI*2, color=colors[m.mode]||'#8b5cf6';
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,r,start,start+angle); ctx.closePath(); ctx.fillStyle=color; ctx.fill();
      if (angle>0.2) { const mid=start+angle/2; ctx.fillStyle='white'; ctx.font='bold 11px sans-serif'; ctx.textAlign='center'; ctx.fillText(m.percentage+'%',cx+Math.cos(mid)*r*0.65,cy+Math.sin(mid)*r*0.65+4); }
      start+=angle;
    });
    ctx.beginPath(); ctx.arc(cx,cy,r*0.5,0,Math.PI*2); ctx.fillStyle='#0e1620'; ctx.fill();
    ctx.fillStyle='#e8f4f4'; ctx.font='bold 14px sans-serif'; ctx.textAlign='center'; ctx.fillText('Mode',cx,cy+5);
    const ly=H-18;
    this.deptReport.byMode.forEach((m,i) => {
      const lx=10+i*90, c=colors[m.mode]||'#8b5cf6';
      ctx.beginPath(); ctx.arc(lx+5,ly,5,0,Math.PI*2); ctx.fillStyle=c; ctx.fill();
      ctx.fillStyle='rgba(138,180,196,0.8)'; ctx.font='10px sans-serif'; ctx.textAlign='left';
      ctx.fillText(`${m.mode} (${m.eventCount})`,lx+14,ly+4);
    });
  }
 
  drawTrendChart(): void {
    const canvas = this.trendCanvas?.nativeElement;
    if (!canvas || !this.weeklyTrend.length) return;
    const ctx = this.setup(canvas); if (!ctx) return;
    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    const data = this.weeklyTrend;
    const pad  = { t:28, r:20, b:52, l:44 };
    const cW = W-pad.l-pad.r, cH = H-pad.t-pad.b;
    const maxV = Math.max(...data.map(d=>d.registrations+d.cancellations), 1) * 1.2;
    const groupW = cW / data.length;
    const bW = Math.min(groupW*0.35, 24);
    for (let i=0;i<=4;i++) {
      const y=pad.t+cH-(i/4)*cH;
      ctx.strokeStyle='rgba(0,168,168,0.07)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(pad.l,y); ctx.lineTo(pad.l+cW,y); ctx.stroke();
      ctx.fillStyle='rgba(138,180,196,0.5)'; ctx.font='10px sans-serif'; ctx.textAlign='right';
      ctx.fillText(Math.round(maxV*i/4)+'',pad.l-5,y+4);
    }
    data.forEach((d,i) => {
      const cx = pad.l+i*groupW+groupW/2;
      const rh = Math.max((d.registrations/maxV)*cH,1);
      const g1=ctx.createLinearGradient(0,pad.t+cH-rh,0,pad.t+cH);
      g1.addColorStop(0,'#00c5c5'); g1.addColorStop(1,'#004444');
      ctx.fillStyle=g1; ctx.beginPath(); ctx.roundRect(cx-bW-1,pad.t+cH-rh,bW,rh,[3,3,0,0]); ctx.fill();
      if (d.cancellations>0) {
        const ch=Math.max((d.cancellations/maxV)*cH,1);
        const g2=ctx.createLinearGradient(0,pad.t+cH-ch,0,pad.t+cH);
        g2.addColorStop(0,'rgba(244,63,94,0.8)'); g2.addColorStop(1,'rgba(244,63,94,0.2)');
        ctx.fillStyle=g2; ctx.beginPath(); ctx.roundRect(cx+1,pad.t+cH-ch,bW,ch,[3,3,0,0]); ctx.fill();
      }
      const weekLabel = (d as any).weekLabel || new Date(d.weekStart).toLocaleDateString('en-US',{month:'short',day:'numeric'});
      ctx.fillStyle='rgba(138,180,196,0.65)'; ctx.font='9px sans-serif'; ctx.textAlign='center';
      ctx.fillText(weekLabel, cx, pad.t+cH+16);
    });
    ctx.fillStyle='#00c5c5'; ctx.fillRect(W-160,8,10,8);
    ctx.fillStyle='rgba(244,63,94,0.8)'; ctx.fillRect(W-80,8,10,8);
    ctx.fillStyle='rgba(138,180,196,0.7)'; ctx.font='10px sans-serif'; ctx.textAlign='left';
    ctx.fillText('Registrations',W-146,16); ctx.fillText('Cancellations',W-66,16);
  }
 
  drawEventTypeChart(): void {
    const canvas = this.eventTypeCanvas?.nativeElement;
    if (!canvas || !this.deptReport?.byEventType?.length) return;
    const ctx = this.setup(canvas); if (!ctx) return;
    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    const data   = this.deptReport.byEventType;
    const pad    = { t:32, r:20, b:40, l:36 };
    const cW     = W-pad.l-pad.r, cH = H-pad.t-pad.b;
    const groupW = cW / data.length;
    const bW     = Math.min(groupW*0.55, 28);
    const maxCount = Math.max(...data.map(d=>d.eventCount), 1);
    const colors   = ['#00a8a8','#8b5cf6','#f59e0b','#10b981','#f43f5e','#6366f1','#0ea5e9','#ec4899','#14b8a6'];
    for (let i=0;i<=4;i++) {
      const y=pad.t+cH-(i/4)*cH;
      ctx.strokeStyle='rgba(0,168,168,0.07)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(pad.l,y); ctx.lineTo(pad.l+cW,y); ctx.stroke();
      ctx.fillStyle='rgba(138,180,196,0.5)'; ctx.font='9px sans-serif'; ctx.textAlign='right';
      ctx.fillText(Math.round(maxCount*i/4)+'', pad.l-4, y+4);
    }
    for (let i=0;i<=5;i++) {
      const y=pad.t+cH-(i/5)*cH;
      ctx.fillStyle='rgba(245,158,11,0.4)'; ctx.font='9px sans-serif'; ctx.textAlign='left';
      ctx.fillText(i+'★', pad.l+cW+4, y+4);
    }
    const ratingPts: { x:number; y:number }[] = [];
    data.forEach((d,i) => {
      const cx  = pad.l + i*groupW + groupW/2;
      const bH  = Math.max((d.eventCount/maxCount)*cH, 2);
      const col = colors[i % colors.length];
      const grad = ctx.createLinearGradient(0, pad.t+cH-bH, 0, pad.t+cH);
      grad.addColorStop(0, col); grad.addColorStop(1, col+'33');
      ctx.fillStyle=grad; ctx.beginPath(); ctx.roundRect(cx-bW/2, pad.t+cH-bH, bW, bH, [4,4,0,0]); ctx.fill();
      ctx.fillStyle='rgba(255,255,255,0.8)'; ctx.font='bold 10px sans-serif'; ctx.textAlign='center';
      ctx.fillText(d.eventCount+'', cx, pad.t+cH-bH-5);
      const lbl = d.eventType.length>8 ? d.eventType.slice(0,7)+'…' : d.eventType;
      ctx.fillStyle='rgba(138,180,196,0.7)'; ctx.font='9px sans-serif'; ctx.textAlign='center';
      ctx.save(); ctx.translate(cx, pad.t+cH+12); ctx.rotate(-0.35); ctx.fillText(lbl,0,0); ctx.restore();
      const avgRating = (d as any).avgRating ?? 0;
      ratingPts.push({ x: cx, y: pad.t+cH-(avgRating/5)*cH });
    });
    if (ratingPts.length > 1) {
      ctx.beginPath(); ctx.strokeStyle='rgba(245,158,11,0.85)'; ctx.lineWidth=2;
      ctx.moveTo(ratingPts[0].x, ratingPts[0].y);
      for (let i=1; i<ratingPts.length; i++) {
        const cp = (ratingPts[i-1].x + ratingPts[i].x)/2;
        ctx.bezierCurveTo(cp, ratingPts[i-1].y, cp, ratingPts[i].y, ratingPts[i].x, ratingPts[i].y);
      }
      ctx.stroke();
    }
    ratingPts.forEach(p => {
      ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI*2); ctx.fillStyle='#f59e0b'; ctx.fill();
      ctx.strokeStyle='#0e1620'; ctx.lineWidth=1.5; ctx.stroke();
    });
    ctx.fillStyle=colors[0]; ctx.fillRect(pad.l, 10, 10, 8);
    ctx.fillStyle='rgba(138,180,196,0.7)'; ctx.font='10px sans-serif'; ctx.textAlign='left';
    ctx.fillText('Event Count', pad.l+14, 18);
    ctx.beginPath(); ctx.arc(pad.l+90, 14, 4, 0, Math.PI*2); ctx.fillStyle='#f59e0b'; ctx.fill();
    ctx.fillStyle='rgba(138,180,196,0.7)'; ctx.fillText('Avg Rating', pad.l+98, 18);
  }
 
  get topEvent(): EventPerformanceReport | null {
    if (!this.performanceData.length) return null;
    return this.performanceData.reduce((b,c) => c.fillRate > b.fillRate ? c : b, this.performanceData[0]);
  }
  get avgRating(): string {
    if (!this.performanceData.length) return '0';
    return (this.performanceData.reduce((s,e)=>s+e.speakerRating,0)/this.performanceData.length).toFixed(1);
  }
  getRatingStars(r: number): string {
    const full = Math.floor(r); const half = r % 1 >= 0.5 ? 1 : 0;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - half);
  }
  formatDate(d: string | Date): string {
    return new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
  }
  getCapPct(e: EventPerformanceReport): number {
    return e.locationCapacity > 0 ? Math.min(100, Math.round((e.activeRegistrations/e.locationCapacity)*100)) : 0;
  }
  getCapColor(e: EventPerformanceReport): string {
    const p = this.getCapPct(e);
    return p>=80 ? 'var(--rose-500)' : p>=50 ? 'var(--amber-400)' : 'var(--green-500)';
  }
  private getToken(): string { return localStorage.getItem('token') || ''; }
  downloadCSV(endpoint: string, filename: string): void {
    fetch(`http://localhost:5000/api/reports/download/${endpoint}`, {
      headers: { Authorization: `Bearer ${this.getToken()}` }
    }).then(r => r.blob()).then(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href=url; a.download=filename; a.click();
      URL.revokeObjectURL(url);
    });
  }
  downloadEventPerformance(): void { this.downloadCSV('event-performance-csv', `event-performance-${this.today()}.csv`); }
  downloadRegistrations():    void { this.downloadCSV('registrations-csv',      `registrations-${this.today()}.csv`); }
  downloadDepartment():       void { this.downloadCSV('department-csv',         `department-report-${this.today()}.csv`); }
  downloadFullReportJSON(): void {
    const report = {
      generatedAt: new Date().toISOString(), topStats: this.topStats,
      statusSummary: this.statusReport, attendanceData: this.attendanceData,
      performance: this.performanceData, departments: this.deptReport, weeklyTrend: this.weeklyTrend
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a'); a.href=url; a.download=`full-report-${this.today()}.json`; a.click();
    URL.revokeObjectURL(url);
  }
  private today(): string { return new Date().toISOString().slice(0,10); }
}