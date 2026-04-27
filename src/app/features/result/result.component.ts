import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService, AttemptResultDto } from '../../core/api.service';

@Component({
  selector: 'app-result',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <ng-container *ngIf="result; else loading">
        <div class="result-header card mt-4">
          <div class="score-circle" [class]="scoreClass">
            <span class="score-num">{{ result.score | number:'1.0-1' }}%</span>
            <span class="score-label">Acertos</span>
          </div>
          <div class="result-info">
            <h2>Resultado do Simulado</h2>
            <p class="text-muted">{{ result.studentName }}</p>
            <div class="stats mt-4">
              <div class="stat">
                <span class="stat-val">{{ result.correctAnswers }}</span>
                <span class="stat-label">Acertos</span>
              </div>
              <div class="stat">
                <span class="stat-val">{{ result.totalQuestions - result.correctAnswers }}</span>
                <span class="stat-label">Erros</span>
              </div>
              <div class="stat">
                <span class="stat-val">{{ result.totalQuestions }}</span>
                <span class="stat-label">Total</span>
              </div>
            </div>
          </div>
        </div>

        <h3 class="mt-8 mb-4">Desempenho por área</h3>
        <div class="grid-2">
          <div *ngFor="let area of byArea" class="card area-card">
            <div class="flex justify-between items-center mb-2">
              <span class="font-semibold text-sm">{{ area.area }}</span>
              <span class="badge" [class]="getBadgeClass(area.pct)">{{ area.pct | number:'1.0-1' }}%</span>
            </div>
            <div class="mini-bar-wrap">
              <div class="mini-bar" [style.width.%]="area.pct" [class]="getBarClass(area.pct)"></div>
            </div>
            <p class="text-xs text-muted mt-1">{{ area.correct }}/{{ area.total }} corretas</p>
          </div>
        </div>

        <h3 class="mt-8 mb-4">Detalhes por questão</h3>
        <div class="answers-list">
          <div *ngFor="let a of result.answerDetails; let i = index" class="answer-row card">
            <div class="answer-num" [class.correct]="a.isCorrect" [class.wrong]="!a.isCorrect">
              {{ i + 1 }}
            </div>
            <div class="answer-info">
              <p class="text-sm font-semibold">{{ a.subject }} <span class="text-muted font-normal">— {{ a.area }}</span></p>
              <p class="text-xs text-muted mt-1">
                Sua resposta: <strong>{{ a.selectedOption }}</strong> &nbsp;|&nbsp;
                Correta: <strong>{{ a.correctOption }}</strong>
              </p>
            </div>
            <span class="result-icon">{{ a.isCorrect ? '✓' : '✗' }}</span>
          </div>
        </div>

        <div class="action-btns mt-8">
          <a routerLink="/exam" class="btn btn-primary">Novo Simulado</a>
          <a routerLink="/dashboard" class="btn btn-secondary">Ver Dashboard</a>
        </div>
      </ng-container>

      <ng-template #loading>
        <div class="card mt-8" style="text-align:center;padding:3rem">
          <p>Carregando resultado...</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .result-header { display: flex; gap: 2rem; align-items: center; padding: 2rem; }
    .score-circle {
      width: 120px; height: 120px; border-radius: 50%;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .score-circle.great { background: #dcfce7; color: var(--success); }
    .score-circle.good { background: #dbeafe; color: var(--primary); }
    .score-circle.bad { background: #fee2e2; color: var(--danger); }
    .score-num { font-size: 1.875rem; font-weight: 800; }
    .score-label { font-size: .75rem; font-weight: 500; }
    h2 { font-size: 1.5rem; font-weight: 700; }
    .stats { display: flex; gap: 2rem; }
    .stat { display: flex; flex-direction: column; }
    .stat-val { font-size: 1.5rem; font-weight: 700; }
    .stat-label { font-size: .75rem; color: var(--text-muted); }
    .area-card { padding: 1rem 1.25rem; }
    .mini-bar-wrap { height: 6px; background: var(--border); border-radius: 999px; overflow: hidden; }
    .mini-bar { height: 100%; border-radius: 999px; transition: width .5s; }
    .mini-bar.great { background: var(--success); }
    .mini-bar.good { background: var(--primary); }
    .mini-bar.bad { background: var(--danger); }
    .answers-list { display: flex; flex-direction: column; gap: .625rem; }
    .answer-row { display: flex; align-items: center; gap: 1rem; padding: .875rem 1rem; }
    .answer-num {
      width: 32px; height: 32px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: .8rem; flex-shrink: 0;
    }
    .answer-num.correct { background: #dcfce7; color: var(--success); }
    .answer-num.wrong { background: #fee2e2; color: var(--danger); }
    .answer-info { flex: 1; }
    .result-icon { font-size: 1.25rem; font-weight: 700; }
    .action-btns { display: flex; gap: 1rem; padding-bottom: 2rem; }
    h3 { font-size: 1.125rem; font-weight: 700; }
    @media (max-width: 640px) {
      .result-header { flex-direction: column; text-align: center; }
      .stats { justify-content: center; }
    }
  `]
})
export class ResultComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  result: AttemptResultDto | null = null;

  get byArea() {
    if (!this.result) return [];
    const map = new Map<string, { area: string; total: number; correct: number; pct: number }>();
    for (const a of this.result.answerDetails) {
      const entry = map.get(a.area) ?? { area: a.area, total: 0, correct: 0, pct: 0 };
      entry.total++;
      if (a.isCorrect) entry.correct++;
      map.set(a.area, entry);
    }
    return Array.from(map.values()).map(e => ({ ...e, pct: e.total ? e.correct / e.total * 100 : 0 }));
  }

  get scoreClass() {
    const s = this.result?.score ?? 0;
    return s >= 70 ? 'great' : s >= 50 ? 'good' : 'bad';
  }

  getBadgeClass(pct: number) { return pct >= 70 ? 'badge badge-green' : pct >= 50 ? 'badge badge-blue' : 'badge badge-red'; }
  getBarClass(pct: number) { return pct >= 70 ? 'great' : pct >= 50 ? 'good' : 'bad'; }

  ngOnInit() {
    const id = +this.route.snapshot.paramMap.get('id')!;
    this.api.getAttemptResult(id).subscribe(r => this.result = r);
  }
}
