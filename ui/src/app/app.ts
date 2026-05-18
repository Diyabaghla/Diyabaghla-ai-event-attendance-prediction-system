
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
// import { Toast } from '../components/shared/toast/toast';
import { Toast } from './components/shared/toast/toast';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Toast],
  template: `
    <router-outlet></router-outlet>
    <app-toast></app-toast>
  `
})
export class App {}

