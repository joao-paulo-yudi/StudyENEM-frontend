import { Component, ElementRef, Input, ViewChild, computed, effect, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StudentService } from '../../core/student.service';
import { LayoutService } from '../../core/layout.service';

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
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  @Input() activeRoute = 'home';
  private router = inject(Router);
  private studentService = inject(StudentService);
  readonly layout = inject(LayoutService);
  readonly nav = NAV;

  @ViewChild('toggleBtn') private toggleBtn?: ElementRef<HTMLButtonElement>;

  constructor() {
    // Ao abrir a gaveta, leva o foco para dentro dela (teclado / leitor de tela).
    effect(() => {
      if (this.layout.drawerOpen()) setTimeout(() => this.toggleBtn?.nativeElement.focus());
    });
  }

  /** O trilho reduzido só existe no desktop; no mobile a gaveta abre sempre completa. */
  readonly collapsed = computed(() => this.layout.collapsed() && !this.layout.isMobile());
  /** Fora da tela e sem foco quando a gaveta está fechada no mobile. */
  readonly hidden = computed(() => this.layout.isMobile() && !this.layout.drawerOpen());

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

  get toggleLabel() {
    if (this.layout.isMobile()) return 'Fechar menu';
    return this.collapsed() ? 'Expandir barra lateral' : 'Recolher barra lateral';
  }

  go(route: string) {
    this.router.navigate(['/' + route]);
    this.layout.closeDrawer();
  }

  logout() {
    this.studentService.clear();
    this.router.navigate(['/login']);
    this.layout.closeDrawer();
  }
}
