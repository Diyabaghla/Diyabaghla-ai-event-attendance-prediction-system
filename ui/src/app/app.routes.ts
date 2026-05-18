import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/landing/landing').then(m => m.Landing)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login/login').then(m => m.Login)
  },
  {
    path: 'signup',
    loadComponent: () => import('./components/auth/signup/signup').then(m => m.Signup)
  },
  {
    path: 'app',
    loadComponent: () => import('./components/shared/shell/shell').then(m => m.Shell),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./components/dashboard/dashboard').then(m => m.Dashboard) },
      { path: 'events', loadComponent: () => import('./components/events/events').then(m => m.Events) },
      { path: 'registrations', loadComponent: () => import('./components/registrations/registrations').then(m => m.Registrations) },
      { path: 'predictions/attendance', loadComponent: () => import('./components/predictions/attendance-prediction/attendance-prediction').then(m => m.AttendancePrediction) },
      { path: 'predictions/no-show', loadComponent: () => import('./components/predictions/no-show-prediction/no-show-prediction').then(m => m.NoShowPrediction) },
      { path: 'predictions/user-attendance', loadComponent: () => import('./components/predictions/user-attendance-prediction/user-attendance-prediction').then(m => m.UserAttendancePrediction) },
      { path: 'resource-planning', loadComponent: () => import('./components/resource-planning/resource-planning').then(m => m.ResourcePlanning) },
      { path: 'reports', loadComponent: () => import('./components/reports/reports').then(m => m.Reports) },
    ]
  },
  { path: '**', redirectTo: '' }
];

