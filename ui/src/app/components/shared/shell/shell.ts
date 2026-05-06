import { Component, HostListener, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
// import { NotificationService } from '../../../services/notification.service';

import { NotificationBell } from '../notification-bell/notification-bell';
import { NotificationService } from '../../../services/notification.service';

interface NavItem { label: string; icon: string; route: string; }

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, NotificationBell],
  templateUrl: './shell.html',
  styleUrls:   ['./shell.scss']
})
export class Shell implements OnInit, OnDestroy {
  sidebarOpen  = true;
  profileOpen  = false;

  navItems: NavItem[] = [
    { label: 'Dashboard',             icon: '⬡',  route: '/app/dashboard' },
    { label: 'Events',                icon: '📅', route: '/app/events' },
    { label: 'Registrations',         icon: '🎫', route: '/app/registrations' },
    { label: 'Attendance Prediction', icon: '📈', route: '/app/predictions/attendance' },
    { label: 'No-Show Prediction',    icon: '🚫', route: '/app/predictions/no-show' },
    { label: 'User Attendance',       icon: '👤', route: '/app/predictions/user-attendance' },
    { label: 'Resource Planning',     icon: '📦', route: '/app/resource-planning' },
    { label: 'Reports',               icon: '📊', route: '/app/reports' },
  ];

  constructor(
    public  auth:      AuthService,
    public  notifSvc:  NotificationService,
    private router:    Router,
    private elRef:     ElementRef
  ) {}

  ngOnInit(): void {
    // Start notification polling when shell loads (user is logged in)
    this.notifSvc.startPolling();
  }

  ngOnDestroy(): void {
    this.notifSvc.stopPolling();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const profileWrapper = this.elRef.nativeElement.querySelector('.profile-wrapper');
    if (profileWrapper && !profileWrapper.contains(event.target)) {
      this.profileOpen = false;
    }
  }

  toggleSidebar():  void { this.sidebarOpen = !this.sidebarOpen; }
  toggleProfile(e: Event): void { e.stopPropagation(); this.profileOpen = !this.profileOpen; }
  closeProfile():   void { this.profileOpen = false; }

  logout(): void {
    this.notifSvc.stopPolling();
    this.auth.logout();
    this.profileOpen = false;
  }

  getInitials(): string {
    const name = this.auth.currentUser?.fullName || '?';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  }
}

