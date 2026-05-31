import { Component, HostListener, ElementRef, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

import { AuthService } from '../../../services/auth.service';
import { NotificationBell } from '../notification-bell/notification-bell';
import { NotificationService } from '../../../services/notification.service';

interface NavItem { label: string; icon: string; route: string; }

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, NotificationBell],
  templateUrl: './shell.html',
  styleUrls: ['./shell.scss']
})
export class Shell implements OnInit, OnDestroy {

  sidebarOpen = true;
  mobileOpen = false;
  profileOpen = false;

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: '⬡', route: '/app/dashboard' },
    { label: 'Events', icon: '📅', route: '/app/events' },
    { label: 'Registrations', icon: '🎫', route: '/app/registrations' },
    { label: 'Attendance Prediction', icon: '📈', route: '/app/predictions/attendance' },
    { label: 'No-Show Prediction', icon: '🚫', route: '/app/predictions/no-show' },
    { label: 'User Attendance', icon: '👤', route: '/app/predictions/user-attendance' },
    { label: 'Resource Planning', icon: '📦', route: '/app/resource-planning' },
    { label: 'Reports', icon: '📊', route: '/app/reports' },
  ];

  constructor(
    public auth: AuthService,
    public notifSvc: NotificationService,
    private router: Router,
    private elRef: ElementRef,
    private cd: ChangeDetectorRef   // ✅ FIX: Added
  ) {}

  ngOnInit(): void {
  this.notifSvc.startPolling();

  this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe(() => {

      // ✅ CLOSE SIDEBAR AFTER CLICK (THIS WAS MISSING)
      this.mobileOpen = false;

     

      this.cd.detectChanges();
    });
}

  ngOnDestroy(): void {
    this.notifSvc.stopPolling();
  }

  // ✅ CLICK OUTSIDE FIX (replaces broken clickOutside directive)
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const profileWrapper = this.elRef.nativeElement.querySelector('.profile-wrapper');
    if (profileWrapper && !profileWrapper.contains(event.target)) {
      this.profileOpen = false;
    }
  }

  // ✅ SIDEBAR TOGGLE (mobile + desktop)
  toggleSidebar(): void {
    if (window.innerWidth <= 768) {
      this.mobileOpen = !this.mobileOpen;
    } else {
      this.sidebarOpen = !this.sidebarOpen;
    }
  }

  toggleProfile(e: Event): void {
    e.stopPropagation();
    this.profileOpen = !this.profileOpen;
  }

  closeProfile(): void {
    this.profileOpen = false;
  }

  logout(): void {
    this.mobileOpen = false;
    this.notifSvc.stopPolling();
    this.auth.logout();
    this.profileOpen = false;
  }

  getInitials(): string {
    const name = this.auth.currentUser?.fullName || '?';
    return name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}