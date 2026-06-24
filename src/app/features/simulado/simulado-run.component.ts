import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService, SubmitAttemptDto } from '../../core/api.service';
import { StudentService } from '../../core/student.service';
import { ExamStateService } from '../../core/exam-state.service';
import { getAreaByName } from '../../core/areas.config';

@Component({
  selector: 'app-simulado-run',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './simulado-run.component.html',
  styleUrl: './simulado-run.component.css',
})
export class SimuladoRunComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private router = inject(Router);
  private student = inject(StudentService);
  examState = inject(ExamStateService);

  questions = this.examState.questions;
  answers = this.examState.answers;
  config = this.examState.config;

  current = signal(0);
  submitting = signal(false);
  showQuitModal = signal(false);
  elapsed = signal(0);

  private timerInterval: any;
  private startTime = Date.now();

  readonly options = [
    { key: 'A', field: 'optionA' as const },
    { key: 'B', field: 'optionB' as const },
    { key: 'C', field: 'optionC' as const },
    { key: 'D', field: 'optionD' as const },
    { key: 'E', field: 'optionE' as const },
  ];

  total = computed(() => this.questions().length);
  currentQ = computed(() => this.questions()[this.current()]);
  answeredCount = computed(() => Object.keys(this.answers()).length);
  progressPct = computed(() => this.total() > 0 ? (this.answeredCount() / this.total()) * 100 : 0);
  timerDisplay = computed(() => {
    const s = this.elapsed();
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  });
  areaShort = computed(() => {
    const name = this.config()?.areaName;
    return name ? (getAreaByName(name)?.short ?? name) : '';
  });

  ngOnInit() {
    if (!this.student.name || !this.questions().length) {
      this.router.navigate(['/simulado']);
      return;
    }
    if (this.config()?.timed) {
      this.timerInterval = setInterval(() => this.elapsed.update(e => e + 1), 1000);
    }
  }

  ngOnDestroy() { if (this.timerInterval) clearInterval(this.timerInterval); }

  select(opt: string) { this.examState.setAnswer(this.current(), opt); }
  prev() { if (this.current() > 0) this.current.update(c => c - 1); }
  next() { if (this.current() < this.total() - 1) this.current.update(c => c + 1); }
  goTo(idx: number) { this.current.set(idx); }
  confirmQuit() { this.showQuitModal.set(true); }
  quit() { this.examState.reset(); this.router.navigate(['/home']); }

  areaSoft(name: string) { return getAreaByName(name)?.soft ?? '#F5F6FA'; }
  areaColor(name: string) { return getAreaByName(name)?.color ?? '#888'; }
  areaShortByName(name: string) { return getAreaByName(name)?.short ?? name; }

  submit() {
    if (this.submitting()) return;
    this.submitting.set(true);
    if (this.timerInterval) clearInterval(this.timerInterval);

    const dto: SubmitAttemptDto = {
      attemptId: this.examState.attemptId(),
      timeTakenSeconds: this.config()?.timed ? this.elapsed() : undefined,
      answers: this.questions().map((q, idx) => ({
        questionId: q.id,
        selectedOption: this.answers()[idx] ?? 'A',
      })),
    };

    this.api.submitAttempt(dto).subscribe({
      next: result => {
        this.examState.reset();
        this.router.navigate(['/resultado', result.attemptId]);
      },
      error: () => { this.submitting.set(false); },
    });
  }
}
