import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('bgCanvas') bgCanvas!: ElementRef<HTMLCanvasElement>;

  form: FormGroup;
  loading      = false;
  error        = '';
  showPassword = false;
  private animId = 0;

  features = [
    { icon: '🤖', text: '3 AI prediction models' },
    { icon: '📊', text: 'Live analytics dashboard' },
    { icon: '📦', text: 'Auto resource planning' },
    { icon: '🎫', text: 'Smart registration tracking' },
  ];

  constructor(
    private fb:     FormBuilder,
    private auth:   AuthService,
    private router: Router,
    private toast:  ToastService
  ) {
    this.form = this.fb.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    if (this.auth.isLoggedIn) this.router.navigate(['/app/dashboard']);
  }

  ngOnInit(): void {}
  ngAfterViewInit(): void { this.startCanvas(); }
  ngOnDestroy(): void { cancelAnimationFrame(this.animId); }

  private startCanvas(): void {
    const canvas = this.bgCanvas?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);
    const pts = Array.from({ length: 35 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.6 + 0.3,
      dx: (Math.random() - 0.5) * 0.3, dy: (Math.random() - 0.5) * 0.3,
      o: Math.random() * 0.4 + 0.05
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
          if (d < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0,168,168,${0.06 * (1 - d / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }
      pts.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,168,168,${p.o})`; ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width)  p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      this.animId = requestAnimationFrame(draw);
    };
    draw();
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading = true; this.error = '';
    this.auth.login(this.form.value).subscribe({
      next: (res) => {
        this.toast.success(`Welcome back, ${res.fullName}! 👋`);
        setTimeout(() => this.router.navigate(['/app/dashboard']), 300);
      },
      error: err => {
        const msg = err.error?.message || '';
        this.error = (err.status === 401 || msg.toLowerCase().includes('invalid'))
          ? 'Incorrect email or password. Please try again.'
          : msg || 'Login failed. Please try again.';
        this.loading = false;
      }
    });
  }

  get email()    { return this.form.get('email')!; }
  get password() { return this.form.get('password')!; }
}

