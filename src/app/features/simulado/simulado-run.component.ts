import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ExamStateService } from '../../core/exam-state.service';
import { areaColor, areaShort, areaSoft } from '../../core/areas.config';
import { formatClock, formatDuration } from '../../core/format';
import { MarkdownPipe } from '../../shared/markdown/markdown.pipe';

@Component({
  selector: 'app-simulado-run',
  standalone: true,
  imports: [CommonModule, MarkdownPipe],
  templateUrl: './simulado-run.component.html',
  styleUrl: './simulado-run.component.css',
})
export class SimuladoRunComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private router = inject(Router);
  private examState = inject(ExamStateService);

  readonly questions = this.examState.questions;
  readonly answers = this.examState.answers;
  readonly config = this.examState.config;
  readonly timeLimit = this.examState.timeLimitSeconds;

  current = signal(0);
  elapsed = signal(0);
  submitting = signal(false);
  submitError = signal('');
  showQuitModal = signal(false);
  showSubmitModal = signal(false);
  alertDismissed = signal(false);
  timeUp = signal(false);

  private timer?: ReturnType<typeof setInterval>;
  private shownAt = Date.now();

  total = computed(() => this.questions().length);
  currentQ = computed(() => this.questions()[this.current()] ?? null);
  answeredCount = computed(() => Object.keys(this.answers()).length);
  blankCount = computed(() => this.total() - this.answeredCount());
  progressPct = computed(() => (this.total() > 0 ? (this.answeredCount() / this.total()) * 100 : 0));

  timed = computed(() => this.timeLimit() != null);
  remaining = computed(() => {
    const limit = this.timeLimit();
    return limit == null ? null : Math.max(0, limit - this.elapsed());
  });
  /** RF10: alerta nos 5 minutos finais (ou nos últimos 20% do tempo em simulados curtos). */
  nearLimit = computed(() => {
    const limit = this.timeLimit();
    const remaining = this.remaining();
    return limit != null && remaining != null && remaining <= Math.min(300, Math.round(limit * 0.2));
  });
  clock = computed(() => formatClock(this.remaining() ?? this.elapsed()));

  modeLabel = computed(() => {
    const c = this.config();
    if (!c) return '';
    if (c.topicName) return `Treino · ${c.topicName}`;
    if (c.mode === 'foco') return `Foco · ${areaShort(c.areaCode)}`;
    return this.total() === 180 ? 'Prova completa' : 'Simulado Geral';
  });

  ngOnInit() {
    if (!this.questions().length) {
      this.router.navigate(['/simulado']);
      return;
    }
    this.shownAt = Date.now();
    this.timer = setInterval(() => this.tick(), 1000);
  }

  ngOnDestroy() { this.stopTimer(); }

  private tick() {
    this.elapsed.update(e => e + 1);
    if (this.remaining() === 0 && !this.submitting()) {
      this.timeUp.set(true);
      this.submit();
    }
  }

  private stopTimer() {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
  }

  /** Soma à questão atual o tempo desde que ela foi exibida (métrica de tempo médio por questão). */
  private recordTime() {
    const now = Date.now();
    const seconds = Math.round((now - this.shownAt) / 1000);
    if (seconds > 0) this.examState.addTime(this.current(), seconds);
    this.shownAt = now;
  }

  goTo(index: number) {
    if (index === this.current() || index < 0 || index >= this.total()) return;
    this.recordTime();
    this.current.set(index);
  }
  prev() { this.goTo(this.current() - 1); }
  next() { this.goTo(this.current() + 1); }

  /** Clicar de novo na alternativa marcada deixa a questão em branco. */
  select(letter: string) {
    const index = this.current();
    if (this.answers()[index] === letter) this.examState.clearAnswer(index);
    else this.examState.setAnswer(index, letter);
  }

  requestSubmit() {
    if (this.blankCount() > 0) this.showSubmitModal.set(true);
    else this.submit();
  }

  submit() {
    if (this.submitting()) return;
    this.submitting.set(true);
    this.submitError.set('');
    this.showSubmitModal.set(false);
    this.recordTime();
    this.stopTimer();

    const answers = this.answers();
    const times = this.examState.timeSpent();
    this.api.submitAttempt(this.examState.attemptId(), {
      timeTakenSeconds: this.elapsed(),
      answers: this.questions().map((q, i) => ({
        questionId: q.id,
        selectedOption: answers[i] ?? null,
        timeSpentSeconds: times[i] ?? 0,
      })),
    }).subscribe({
      next: result => {
        this.examState.reset();
        this.router.navigate(['/resultado', result.attemptId]);
      },
      error: err => {
        this.submitting.set(false);
        this.submitError.set(err?.error?.message ?? 'Não foi possível enviar o simulado. Verifique a conexão e tente novamente.');
      },
    });
  }

  quit() {
    this.stopTimer();
    this.examState.reset();
    this.router.navigate(['/home']);
  }

  readonly areaColor = areaColor;
  readonly areaSoft = areaSoft;
  readonly areaShort = areaShort;
  readonly duration = formatDuration;
}
