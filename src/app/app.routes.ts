import { Routes } from '@angular/router';
import { authGuard, loginGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login',       canActivate: [loginGuard], loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent) },
  { path: 'home',        canActivate: [authGuard], loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  { path: 'simulado',    canActivate: [authGuard], loadComponent: () => import('./features/simulado/simulado-config.component').then(m => m.SimuladoConfigComponent) },
  { path: 'simulado/run',canActivate: [authGuard], loadComponent: () => import('./features/simulado/simulado-run.component').then(m => m.SimuladoRunComponent) },
  { path: 'resultado/:id',canActivate: [authGuard], loadComponent: () => import('./features/resultado/resultado.component').then(m => m.ResultadoComponent) },
  { path: 'plano',       canActivate: [authGuard], loadComponent: () => import('./features/plano/plano.component').then(m => m.PlanoComponent) },
  { path: 'desempenho',  canActivate: [authGuard], loadComponent: () => import('./features/desempenho/desempenho.component').then(m => m.DesempenhoComponent) },
  { path: 'questoes',    canActivate: [authGuard], loadComponent: () => import('./features/questoes/questoes.component').then(m => m.QuestoesComponent) },
  { path: '**', redirectTo: 'home' }
];
