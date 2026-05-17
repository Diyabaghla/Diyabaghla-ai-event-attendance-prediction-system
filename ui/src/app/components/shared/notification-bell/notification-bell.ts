import {
  Component, HostListener, ElementRef, signal, computed
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AppNotification } from '../../../models/models';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './notification-bell.html',
  styleUrls:  ['./notification-bell.scss']
})
export class NotificationBell {
  isOpen = signal(false);

  constructor(
    public notifSvc: NotificationService,
    private elRef:   ElementRef
  ) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }

  toggle(event: Event): void {
    event.stopPropagation();
    this.isOpen.update(v => !v);
  }

  markRead(notif: AppNotification, event: Event): void {
    event.stopPropagation();
    this.notifSvc.markRead(notif.id);
  }

  markAllRead(event: Event): void {
    event.stopPropagation();
    this.notifSvc.markAllRead();
  }

  remove(notif: AppNotification, event: Event): void {
    event.stopPropagation();
    this.notifSvc.remove(notif.id);
  }

  clearAll(event: Event): void {
    event.stopPropagation();
    this.notifSvc.clearAll();
  }

  navigate(notif: AppNotification): void {
    this.notifSvc.markRead(notif.id);
    this.isOpen.set(false);
  }

  trackById(_: number, n: AppNotification): number { return n.id; }
}
