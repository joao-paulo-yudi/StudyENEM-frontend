import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home',        loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  { path: 'simulado',    loadComponent: () => import('./features/simulado/simulado-config.component').then(m => m.SimuladoConfigComponent) },
  { path: 'simulado/run',loadComponent: () => import('./features/simulado/simulado-run.component').then(m => m.SimuladoRunComponent) },
  { path: 'resultado/:id',loadComponent: () => import('./features/resultado/resultado.component').then(m => m.ResultadoComponent) },
  { path: 'plano',       loadComponent: () => import('./features/plano/plano.component').then(m => m.PlanoComponent) },
  { path: 'desempenho',  loadComponent: () => import('./features/desempenho/desempenho.component').then(m => m.DesempenhoComponent) },
  { path: 'questoes',    loadComponent: () => import('./features/questoes/questoes.component').then(m => m.QuestoesComponent) },
  { path: '**', redirectTo: 'home' }
];
