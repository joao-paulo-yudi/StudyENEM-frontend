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
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
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

  logout() {
    this.studentService.clear();
    this.router.navigate(['/login']);
  }
}
