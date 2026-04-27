import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, Question } from '../../core/api.service';
import { StudentService } from '../../core/student.service';

type Phase = 'setup' | 'questions' | 'submitting';

@Component({
  selector: 'app-exam',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <!-- Setup -->
      <ng-container *ngIf="phase === 'setup'">
        <div class="page-header">
          <h2>Configurar Simulado</h2>
          <p class="text-muted">Escolha o ano e/ou área para personalizar seu simulado</p>
        </div>

        <div class="card mt-6" style="max-width:480px">
          <div class="form-group">
            <label>Ano da prova (opcional)</label>
            <select [(ngModel)]="selectedYear">
              <option [ngValue]="null">Todos os anos</option>
              <option *ngFor="let y of years" [ngValue]="y">{{ y }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>Área do conhecimento (opcional)</label>
            <select [(ngModel)]="selectedArea">
              <option value="">Todas as áreas</option>
              <option *ngFor="let a of areas" [value]="a">{{ a }}</option>
            </select>
          </div>
          <button class="btn btn-primary btn-lg" style="width:100%" (click)="startExam()" [disabled]="loading">
            {{ loading ? 'Carregando...' : 'Iniciar Simulado' }}
          </button>
          <p *ngIf="error" style="color:var(--danger);margin-top:.75rem;font-size:.875rem">{{ error }}</p>
        </div>
      </ng-container>

      <!-- Questions -->
      <ng-container *ngIf="phase === 'questions'">
        <div class="exam-header">
          <div>
            <h2>Simulado</h2>
            <p class="text-muted text-sm">Questão {{ current + 1 }} de {{ questions.length }}</p>
          </div>
          <div class="progress-info">
            <span class="badge badge-blue">{{ answered }} respondidas</span>
          </div>
        </div>

        <div class="progress-bar-wrap">
          <div class="progress-bar" [style.width.%]="(current + 1) / questions.length * 100"></div>
        </div>

        <div *ngIf="q" class="card question-card mt-4">
          <div class="question-meta">
            <span class="badge badge-blue">{{ q.area }}</span>
            <span class="badge badge-amber">{{ q.subject }}</span>
            <span class="text-xs text-muted">ENEM {{ q.year }}</span>
          </div>
          <p class="statement mt-4">{{ q.statement }}</p>
          <div class="options mt-4">
            <button
              *ngFor="let opt of optionKeys"
              class="option-btn"
              [class.selected]="answers[q.id] === opt"
              (click)="select(opt)"
            >
              <span class="opt-letter">{{ opt }}</span>
              <span>{{ getOption(q, opt) }}</span>
            </button>
          </div>
        </div>

        <div class="nav-btns mt-6">
          <button class="btn btn-secondary" (click)="prev()" [disabled]="current === 0">Anterior</button>
          <div style="display:flex;gap:.75rem">
            <button *ngIf="current < questions.length - 1" class="btn btn-primary" (click)="next()">Próxima</button>
            <button *ngIf="current === questions.length - 1" class="btn btn-success" (click)="submit()" [disabled]="answered < questions.length">
              Finalizar ({{ answered }}/{{ questions.length }})
            </button>
          </div>
        </div>

        <div class="question-nav mt-6">
          <button
            *ngFor="let _ of questions; let i = index"
            class="q-dot"
            [class.answered]="answers[questions[i].id]"
            [class.active]="i === current"
            (click)="goTo(i)"
          >{{ i + 1 }}</button>
        </div>
      </ng-container>

      <ng-container *ngIf="phase === 'submitting'">
        <div class="card mt-8" style="text-align:center;padding:3rem">
          <p style="font-size:1.5rem">Enviando respostas...</p>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: .5rem; }
    h2 { font-size: 1.5rem; font-weight: 700; }
    .exam-header { display: flex; justify-content: space-between; align-items: center; }
    .progress-bar-wrap { height: 6px; background: var(--border); border-radius: 999px; margin-top: .75rem; overflow: hidden; }
    .progress-bar { height: 100%; background: var(--primary); border-radius: 999px; transition: width .3s; }
    .question-meta { display: flex; flex-wrap: wrap; gap: .5rem; align-items: center; }
    .statement { font-size: 1rem; line-height: 1.75; }
    .options { display: flex; flex-direction: column; gap: .625rem; }
    .option-btn {
      display: flex; align-items: flex-start; gap: .875rem;
      padding: .875rem 1rem; border: 2px solid var(--border);
      border-radius: 10px; background: var(--surface); cursor: pointer;
      text-align: left; font-family: inherit; font-size: .9rem;
      transition: all .15s; line-height: 1.5;
    }
    .option-btn:hover { border-color: var(--primary); background: #eff6ff; }
    .option-btn.selected { border-color: var(--primary); background: #dbeafe; }
    .opt-letter {
      min-width: 28px; height: 28px; border-radius: 50%;
      background: var(--border); display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: .8rem; flex-shrink: 0; margin-top: 1px;
    }
    .option-btn.selected .opt-letter { background: var(--primary); color: #fff; }
    .nav-btns { display: flex; justify-content: space-between; }
    .question-nav { display: flex; flex-wrap: wrap; gap: .5rem; }
    .q-dot {
      width: 36px; height: 36px; border-radius: 8px; border: 1px solid var(--border);
      background: var(--surface); cursor: pointer; font-size: .8rem; font-weight: 600;
      transition: all .15s;
    }
    .q-dot.answered { background: #dcfce7; border-color: var(--success); color: var(--success); }
    .q-dot.active { background: var(--primary); color: #fff; border-color: var(--primary); }
  `]
})
export class ExamComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private studentService = inject(StudentService);

  phase: Phase = 'setup';
  years: number[] = [];
  areas: string[] = [];
  selectedYear: number | null = null;
  selectedArea = '';
  questions: Question[] = [];
  current = 0;
  answers: Record<number, string> = {};
  loading = false;
  error = '';
  attemptId = 0;

  readonly optionKeys = ['A', 'B', 'C', 'D', 'E'];

  get q() { return this.questions[this.current]; }
  get answered() { return Object.keys(this.answers).length; }

  ngOnInit() {
    if (!this.studentService.name) { this.router.navigate(['/home']); return; }
    this.api.getYears().subscribe(y => this.years = y);
    this.api.getAreas().subscribe(a => this.areas = a);
  }

  getOption(q: Question, key: string): string {
    const map: Record<string, keyof Question> = {
      A: 'optionA', B: 'optionB', C: 'optionC', D: 'optionD', E: 'optionE'
    };
    return q[map[key]] as string;
  }

  startExam() {
    this.loading = true; this.error = '';
    const year = this.selectedYear ?? undefined;
    const area = this.selectedArea || undefined;

    this.api.startAttempt({ studentName: this.studentService.name!, year, area }).subscribe({
      next: ({ attemptId }) => {
        this.attemptId = attemptId;
        this.api.getQuestions(year, area).subscribe({
          next: qs => {
            if (!qs.length) { this.error = 'Nenhuma questão encontrada para os filtros selecionados.'; this.loading = false; return; }
            this.questions = qs;
            this.phase = 'questions';
            this.loading = false;
          },
          error: () => { this.error = 'Erro ao carregar questões.'; this.loading = false; }
        });
      },
      error: () => { this.error = 'Erro ao iniciar simulado.'; this.loading = false; }
    });
  }

  select(opt: string) { if (this.q) this.answers[this.q.id] = opt; }
  next() { if (this.current < this.questions.length - 1) this.current++; }
  prev() { if (this.current > 0) this.current--; }
  goTo(i: number) { this.current = i; }

  submit() {
    this.phase = 'submitting';
    const answers = Object.entries(this.answers).map(([qId, opt]) => ({
      questionId: +qId, selectedOption: opt
    }));
    this.api.submitAttempt({ attemptId: this.attemptId, answers }).subscribe({
      next: result => this.router.navigate(['/result', result.attemptId]),
      error: () => { this.phase = 'questions'; this.error = 'Erro ao enviar.'; }
    });
  }
}
