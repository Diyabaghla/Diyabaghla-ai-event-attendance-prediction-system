import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.scss']
})
export class Signup implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('bgCanvas') bgCanvas!: ElementRef<HTMLCanvasElement>;

  form: FormGroup;
  loading       = false;
  error         = '';
  showPassword  = false;
  isEmailExists = false;
  private animId = 0;

  steps = [
    { icon: '✍️', label: 'Create account' },
    { icon: '🎫', label: 'Register for events' },
    { icon: '🤖', label: 'Get AI predictions' },
    { icon: '📦', label: 'Plan resources' },
  ];

  constructor(
    private fb:     FormBuilder,
    private auth:   AuthService,
    private router: Router,
    private toast:  ToastService
  ) {
    this.form = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
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
            ctx.strokeStyle = `rgba(139,92,246,${0.05 * (1 - d / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }
      pts.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139,92,246,${p.o})`; ctx.fill();
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
    this.loading = true;
    this.error = '';
    this.isEmailExists = false;

    this.auth.signup(this.form.value).subscribe({
      next: (res) => {
        this.toast.success(`Account created! Welcome to EventAI, ${res.fullName}! 🎉`);
        setTimeout(() => this.router.navigate(['/app/dashboard']), 400);
      },
      error: err => {
        const msg: string = (err.error?.message || err.error?.title || '').toString().toLowerCase();
        const status = err.status;

        if (
          status === 409 ||
          msg.includes('already') ||
          msg.includes('exists') ||
          msg.includes('duplicate') ||
          msg.includes('email') ||
          msg.includes('registered') ||
          msg.includes('taken')
        ) {
          this.isEmailExists = true;
          this.error = '';
          this.form.get('email')?.setErrors({ emailExists: true });
        } else if (status === 400) {
          this.error = 'Please check your details and try again.';
        } else if (status === 0 || status === 503) {
          this.error = 'Cannot connect to server. Make sure the backend is running.';
        } else {
          this.error = err.error?.message || 'Signup failed. Please try again.';
        }
        this.loading = false;
      }
    });
  }

  onEmailChange(): void {
    if (this.isEmailExists) {
      this.isEmailExists = false;
      this.error = '';
      const ctrl = this.form.get('email')!;
      const val = ctrl.value;
      ctrl.setErrors(null);
      ctrl.setValue(val);
      ctrl.updateValueAndValidity();
    }
  }

  get fullName() { return this.form.get('fullName')!; }
  get email()    { return this.form.get('email')!; }
  get password() { return this.form.get('password')!; }
}

