import { Component, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StudentService } from '../../core/student.service';

const NAV = [
  { id: 'home',       label: 'Início',            icon: 'home' },
  { id: 'simulado',   label: 'Simulados',          icon: 'play' },
  { id: 'desempenho', label: 'Desempenho',         icon: 'chart' },
  { id: 'plano',      label: 'Plano de Estudos',   icon: 'book' },
  { id: 'questoes',   label: 'Banco de Questões',  icon: 'list' },
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="sidebar">
      <!-- Logo -->
      <div style="padding:4px 8px 18px">
        <div style="display:flex;align-items:center;gap:10px">
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
            <rect x="2" y="2" width="36" height="36" rx="10" fill="#0F1B3D"/>
            <path d="M11 26 L11 14 L17 14 L17 26 Z" fill="#F26B3A"/>
            <path d="M20 26 L20 18 L26 18 L26 26 Z" fill="#FFD166"/>
            <path d="M29 26 L29 10 L31 10 L31 26 Z" fill="#8DD5C0"/>
          </svg>
          <div style="line-height:1">
            <div style="font-weight:700;letter-spacing:-0.02em;font-size:17px;color:#0F1B3D">StudyENEM</div>
            <div style="font-size:10.5px;color:#7B8597;letter-spacing:.04em;text-transform:uppercase;margin-top:2px">Learning Analytics</div>
          </div>
        </div>
      </div>

      <!-- Nav -->
      <nav style="display:flex;flex-direction:column;gap:2px">
        @for (n of nav; track n.id) {
          <button [class]="activeRoute === n.id ? 'nav-btn nav-btn-active' : 'nav-btn nav-btn-idle'"
                  (click)="go(n.id)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              @switch (n.icon) {
                @case ('home') {
                  <path d="M3 11 L12 4 L21 11 V20 a1 1 0 0 1 -1 1 H4 a1 1 0 0 1 -1 -1 Z"/>
                  <path d="M9 21 V13 H15 V21"/>
                }
                @case ('play') {
                  <circle cx="12" cy="12" r="9"/>
                  <path d="M10 9 L16 12 L10 15 Z" fill="currentColor"/>
                }
                @case ('chart') {
                  <path d="M3 21 H21"/>
                  <rect x="5" y="11" width="3" height="8"/>
                  <rect x="10.5" y="6" width="3" height="13"/>
                  <rect x="16" y="14" width="3" height="5"/>
                }
                @case ('book') {
                  <path d="M4 4 H10 a3 3 0 0 1 3 3 V20 a2 2 0 0 0 -2 -2 H4 Z"/>
                  <path d="M20 4 H14 a3 3 0 0 0 -3 3 V20 a2 2 0 0 1 2 -2 H20 Z"/>
                }
                @case ('list') {
                  <path d="M8 6 H20 M8 12 H20 M8 18 H20"/>
                  <circle cx="4" cy="6" r="1" fill="currentColor"/>
                  <circle cx="4" cy="12" r="1" fill="currentColor"/>
                  <circle cx="4" cy="18" r="1" fill="currentColor"/>
                }
              }
            </svg>
            <span>{{ n.label }}</span>
          </button>
        }
      </nav>

      <div style="flex:1"></div>

      <!-- Countdown -->
      <div style="padding:14px;border-radius:12px;background:linear-gradient(140deg,#0F1B3D 0%,#1E2D5C 100%);color:#fff">
        <div style="font-size:11px;opacity:.7;text-transform:uppercase;letter-spacing:.06em">Próximo ENEM</div>
        <div style="font-size:22px;font-weight:700;margin-top:6px;letter-spacing:-.02em">{{ daysLeft }} dias</div>
        <div style="font-size:11.5px;opacity:.7;margin-top:4px">1º dia · 8 nov 2026</div>
      </div>

      <!-- User -->
      <div style="display:flex;align-items:center;gap:10px;margin-top:14px;padding:10px;border-radius:10px;background:#F5F6FA">
        <div style="width:34px;height:34px;border-radius:50%;background:#0F1B3D;color:#FFD166;display:grid;place-items:center;font-weight:600;font-size:13px;flex-shrink:0">
          {{ initials }}
        </div>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:600;color:#0F1B3D;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{{ studentName }}</div>
          <div style="font-size:11px;color:#7B8597">Estudante ENEM</div>
        </div>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  @Input() activeRoute = 'home';
  private router = inject(Router);
  private studentService = inject(StudentService);
  readonly nav = NAV;

  get studentName() { return this.studentService.name ?? 'Estudante'; }
  get initials() {
    const n = this.studentName.trim().split(' ');
    return (n[0]?.[0] ?? '') + (n[1]?.[0] ?? '');
  }
  get daysLeft() {
    const target = new Date('2026-11-08');
    const now = new Date();
    return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86400000));
  }

  go(route: string) { this.router.navigate(['/' + route]); }
}
