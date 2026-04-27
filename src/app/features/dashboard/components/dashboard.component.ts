import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService, PerformanceSummaryDto } from '../../../core/api.service';
import { StudentService } from '../../../core/student.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container-lg">
      <div class="dash-header">
        <div>
          <h2>Dashboard de Desempenho</h2>
          <p class="text-muted" *ngIf="data">{{ data.totalAttempts }} simulado(s) realizados</p>
        </div>
        <div class="search-wrap">
          <input type="text" [(ngModel)]="searchName" placeholder="Buscar por nome..." style="width:220px" (keyup.enter)="load()" />
          <button class="btn btn-primary" (click)="load()">Buscar</button>
        </div>
      </div>

      <ng-container *ngIf="data; else empty">
        <!-- Overview cards -->
        <div class="grid-3 mt-6">
          <div class="card stat-card">
            <p class="stat-label">Total de simulados</p>
            <p class="stat-big">{{ data.totalAttempts }}</p>
          </div>
          <div class="card stat-card">
            <p class="stat-label">Questões respondidas</p>
            <p class="stat-big">{{ totalAnswered }}</p>
          </div>
          <div class="card stat-card">
            <p class="stat-label">Taxa média de acerto</p>
            <p class="stat-big" [class]="avgClass">{{ avgScore | number:'1.0-1' }}%</p>
          </div>
        </div>

        <!-- By area -->
        <h3 class="section-title mt-8">Desempenho por Área</h3>
        <div class="areas-grid mt-4">
          <div *ngFor="let area of data.byArea" class="card area-card">
            <div class="flex justify-between items-center">
              <h4>{{ area.area }}</h4>
              <span class="badge" [class]="getBadge(area.percentage)">{{ area.percentage | number:'1.0-1' }}%</span>
            </div>
            <div class="bar-wrap mt-2">
              <div class="bar" [style.width.%]="area.percentage" [class]="getBarCls(area.percentage)"></div>
            </div>
            <p class="text-xs text-muted mt-1">{{ area.correct }}/{{ area.total }} corretas</p>
          </div>
        </div>

        <!-- Weak subjects -->
        <h3 class="section-title mt-8">Matérias com Maior Dificuldade</h3>
        <div class="table-wrap card mt-4">
          <table>
            <thead>
              <tr>
                <th>Matéria</th><th>Área</th><th>Questões</th><th>Acertos</th><th>%</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of data.bySubject">
                <td>{{ s.subject }}</td>
                <td class="text-muted text-sm">{{ s.area }}</td>
                <td>{{ s.total }}</td>
                <td>{{ s.correct }}</td>
                <td>
                  <span class="badge" [class]="getBadge(s.percentage)">{{ s.percentage | number:'1.0-1' }}%</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- History -->
        <h3 class="section-title mt-8">Histórico de Simulados</h3>
        <div class="history-list mt-4">
          <div *ngFor="let a of data.recentAttempts" class="card history-row">
            <div class="history-score" [class]="getBarCls(a.score)">
              {{ a.score | number:'1.0-1' }}%
            </div>
            <div class="history-info">
              <p class="text-sm font-semibold">{{ a.area || 'Geral' }}</p>
              <p class="text-xs text-muted">{{ a.date | date:'dd/MM/yyyy HH:mm' }} &nbsp;|&nbsp; {{ a.correct }}/{{ a.total }} corretas</p>
            </div>
            <a [routerLink]="['/result', a.attemptId]" class="btn btn-secondary" style="font-size:.8rem;padding:.4rem .875rem">Ver</a>
          </div>
        </div>
      </ng-container>

      <ng-template #empty>
        <div class="card mt-8" style="text-align:center;padding:3rem">
          <p style="font-size:1.25rem;margin-bottom:1rem">Nenhum dado encontrado</p>
          <p class="text-muted">Faça um simulado ou busque por outro nome.</p>
          <a routerLink="/exam" class="btn btn-primary mt-4">Fazer Simulado</a>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .dash-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; }
    h2 { font-size: 1.5rem; font-weight: 700; }
    .search-wrap { display: flex; gap: .5rem; }
    .stat-card { padding: 1.5rem; }
    .stat-label { font-size: .875rem; color: var(--text-muted); margin-bottom: .375rem; }
    .stat-big { font-size: 2rem; font-weight: 800; }
    .stat-big.great { color: var(--success); }
    .stat-big.good { color: var(--primary); }
    .stat-big.bad { color: var(--danger); }
    .section-title { font-size: 1.125rem; font-weight: 700; }
    .areas-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; }
    .area-card { padding: 1.25rem; }
    h4 { font-size: .9rem; font-weight: 600; }
    .bar-wrap { height: 6px; background: var(--border); border-radius: 999px; overflow: hidden; }
    .bar { height: 100%; border-radius: 999px; transition: width .5s; }
    .bar.great { background: var(--success); }
    .bar.good { background: var(--primary); }
    .bar.bad { background: var(--danger); }
    .table-wrap { padding: 0; overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; padding: .75rem 1rem; font-size: .75rem; font-weight: 600; text-transform: uppercase; letter-spacing: .05em; color: var(--text-muted); background: var(--bg); }
    td { padding: .75rem 1rem; border-top: 1px solid var(--border); font-size: .875rem; }
    tr:hover td { background: var(--bg); }
    .history-list { display: flex; flex-direction: column; gap: .625rem; padding-bottom: 2rem; }
    .history-row { display: flex; align-items: center; gap: 1rem; padding: 1rem 1.25rem; }
    .history-score {
      min-width: 64px; text-align: center; font-weight: 700; font-size: 1rem;
      padding: .5rem; border-radius: 8px;
    }
    .history-score.great { background: #dcfce7; color: var(--success); }
    .history-score.good { background: #dbeafe; color: var(--primary); }
    .history-score.bad { background: #fee2e2; color: var(--danger); }
    .history-info { flex: 1; }
    @media (max-width: 640px) {
      .dash-header { flex-direction: column; }
      .search-wrap { width: 100%; }
      .search-wrap input { flex: 1; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  private studentService = inject(StudentService);

  data: PerformanceSummaryDto | null = null;
  searchName = this.studentService.name ?? '';

  get totalAnswered() { return this.data?.recentAttempts.reduce((s, a) => s + a.total, 0) ?? 0; }
  get avgScore() {
    if (!this.data?.recentAttempts.length) return 0;
    return this.data.recentAttempts.reduce((s, a) => s + a.score, 0) / this.data.recentAttempts.length;
  }
  get avgClass() { return this.avgScore >= 70 ? 'great' : this.avgScore >= 50 ? 'good' : 'bad'; }

  getBadge(p: number) { return p >= 70 ? 'badge badge-green' : p >= 50 ? 'badge badge-blue' : 'badge badge-red'; }
  getBarCls(p: number) { return p >= 70 ? 'great' : p >= 50 ? 'good' : 'bad'; }

  ngOnInit() { if (this.searchName) this.load(); }

  load() {
    if (!this.searchName.trim()) return;
    this.api.getPerformance(this.searchName.trim()).subscribe({
      next: d => this.data = d,
      error: () => this.data = null
    });
  }
}
