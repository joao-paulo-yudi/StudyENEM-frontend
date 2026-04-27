import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="header">
      <div class="container-lg flex items-center justify-between" style="height:100%">
        <a routerLink="/home" class="logo">
          <span class="logo-icon">S</span>
          <span>StudyENEM</span>
        </a>
        <nav class="nav">
          <a routerLink="/home" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Início</a>
          <a routerLink="/exam" routerLinkActive="active">Simulado</a>
          <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
        </nav>
      </div>
    </header>
    <main class="main-content">
      <router-outlet />
    </main>
  `,
  styles: [`
    .header {
      background: #fff; border-bottom: 1px solid var(--border);
      height: 60px; position: sticky; top: 0; z-index: 100;
      box-shadow: 0 1px 3px rgba(0,0,0,.06);
    }
    .logo { display: flex; align-items: center; gap: .625rem; font-weight: 700; font-size: 1.125rem; color: var(--primary); }
    .logo-icon {
      width: 32px; height: 32px; background: var(--primary); color: #fff;
      border-radius: 8px; display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 1rem;
    }
    .nav { display: flex; gap: .25rem; }
    .nav a {
      padding: .5rem .875rem; border-radius: 8px; font-size: .875rem; font-weight: 500;
      color: var(--text-muted); transition: all .15s;
    }
    .nav a:hover { background: var(--bg); color: var(--text); }
    .nav a.active { background: #dbeafe; color: var(--primary); }
    .main-content { padding: 2rem 0; min-height: calc(100vh - 60px); }
  `]
})
export class AppComponent {}
