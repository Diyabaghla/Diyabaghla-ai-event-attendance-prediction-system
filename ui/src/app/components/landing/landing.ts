import { Component, OnInit, OnDestroy, HostListener, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.html',
  styleUrls: ['./landing.scss']
})
export class Landing implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('heroCanvas') heroCanvas!: ElementRef<HTMLCanvasElement>;

  scrolled    = false;
  animFrameId = 0;

  stat0 = '0%'; stat1 = '0x'; stat2 = '0%'; stat3 = '0';

  features = [
    { icon: '🤖', title: 'AI Predictions',      color: '#00a8a8',
      desc: 'Three Random Forest models predict attendance, no-shows, and individual probability with up to 98% accuracy.' },
    { icon: '📅', title: 'Event Management',     color: '#f59e0b',
      desc: 'Full CRUD for events — type, mode, department, capacity, speaker rating, weather conditions and more.' },
    { icon: '🎫', title: 'Smart Registration',   color: '#10b981',
      desc: 'One-click registration with real-time status tracking, cancellation flow, and past attendance analytics.' },
    { icon: '📦', title: 'Resource Planning',    color: '#8b5cf6',
      desc: 'Auto-calculate chairs, catering, beverages, staff, and equipment from AI-predicted attendance.' },
    { icon: '📊', title: 'Reports & Analytics',  color: '#f43f5e',
      desc: 'Live bar charts, donut charts, and fill-rate trend lines reveal event performance at a glance.' },
    { icon: '🛡️', title: 'Role-Based Access',    color: '#6366f1',
      desc: 'JWT-secured endpoints with Admin and User roles — admins manage everything, users manage themselves.' },
  ];

  steps = [
    { num: '01', icon: '📅', title: 'Create Your Event',
      desc: 'Define event type, department, capacity, speaker details, weather and schedule.' },
    { num: '02', icon: '🎫', title: 'Collect Registrations',
      desc: 'Attendees register and the system records behavioral data for AI training.' },
    { num: '03', icon: '🤖', title: 'Run AI Predictions',
      desc: 'ML models instantly predict attendance count, no-show risk, and individual probability.' },
    { num: '04', icon: '📦', title: 'Plan Resources',
      desc: 'Auto-generate a full logistics plan — chairs, meals, staff — from the AI prediction.' },
  ];

  testimonials = [
    { name: 'Arjun Singh',  role: 'Engineering Lead',   text: 'We cut event waste by 35% in the first month. The resource calculator alone is worth it.', avatar: 'AS', color: '#00a8a8' },
    { name: 'Priya Sharma', role: 'HR Manager',          text: 'The no-show prediction helped us plan follow-up sessions before the event even happened.', avatar: 'PS', color: '#8b5cf6' },
    { name: 'Ravi Nair',    role: 'Marketing Director',  text: 'Attendance predictions are scary accurate. Our last webinar was within 3 of the forecast.', avatar: 'RN', color: '#f59e0b' },
  ];

  stats = [
    { value: '98.5', suffix: '%', label: 'Prediction Accuracy', icon: '🎯' },
    { value: '3',    suffix: 'x', label: 'Faster Planning',     icon: '⚡' },
    { value: '40',   suffix: '%', label: 'Reduced No-Shows',    icon: '📉' },
    { value: '∞',    suffix: '',  label: 'Events Supported',    icon: '🚀' },
  ];

  displayStats = ['0%','0x','0%','∞'];

  constructor(private router: Router, public auth: AuthService) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.startCanvas();
    setTimeout(() => this.animateStats(), 800);
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animFrameId);
  }

  @HostListener('window:scroll')
  onScroll(): void { this.scrolled = window.scrollY > 40; }

  goToDashboard(): void {
    this.auth.isLoggedIn
      ? this.router.navigate(['/app/dashboard'])
      : this.router.navigate(['/signup']);
  }

  private animateStats(): void {
    const duration = 1800, steps = 60, interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const ease = 1 - Math.pow(1 - step / steps, 3);
      this.displayStats[0] = Math.round(98.5 * ease) + '%';
      this.displayStats[1] = Math.round(3    * ease) + 'x';
      this.displayStats[2] = Math.round(40   * ease) + '%';
      this.displayStats[3] = '∞';
      if (step >= steps) clearInterval(timer);
    }, interval);
  }

  private startCanvas(): void {
    const canvas = this.heroCanvas?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.4,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.45 + 0.08
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const d = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
          if (d < 110) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0,168,168,${0.07 * (1 - d / 110)})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,168,168,${p.opacity})`;
        ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width)  p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      this.animFrameId = requestAnimationFrame(draw);
    };
    draw();
  }
}
