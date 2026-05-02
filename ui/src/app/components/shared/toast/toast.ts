import { Component } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { ToastService,Toastt } from '../../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, AsyncPipe],
  templateUrl: './toast.html',
  styleUrls: ['./toast.scss']
})
export class Toast {
  constructor(public toastSvc: ToastService) {}
  dismiss(id: number): void { this.toastSvc.dismiss(id); }
  trackById(_: number, t: Toastt): number { return t.id; }
}
