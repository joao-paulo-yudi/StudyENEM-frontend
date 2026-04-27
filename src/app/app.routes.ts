import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'exam',
    loadComponent: () => import('./features/exam/exam.component').then(m => m.ExamComponent)
  },
  {
    path: 'result/:id',
    loadComponent: () => import('./features/result/result.component').then(m => m.ResultComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/components/dashboard.component').then(m => m.DashboardComponent)
  },
  { path: '**', redirectTo: 'home' }
];
