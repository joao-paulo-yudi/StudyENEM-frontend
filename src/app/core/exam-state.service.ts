import { Injectable, signal } from '@angular/core';
import { QuestionDto } from './api.service';

export interface ExamConfig {
  mode: 'geral' | 'foco';
  areaId?: string;
  areaName?: string;
  count: number;
  timed: boolean;
}

@Injectable({ providedIn: 'root' })
export class ExamStateService {
  config = signal<ExamConfig | null>(null);
  questions = signal<QuestionDto[]>([]);
  attemptId = signal<number>(0);
  answers = signal<Record<number, string>>({});

  setConfig(c: ExamConfig) { this.config.set(c); }

  setExam(attemptId: number, questions: QuestionDto[]) {
    this.attemptId.set(attemptId);
    this.questions.set(questions);
    this.answers.set({});
  }

  setAnswer(idx: number, opt: string) {
    this.answers.update(a => ({ ...a, [idx]: opt }));
  }

  reset() {
    this.config.set(null);
    this.questions.set([]);
    this.attemptId.set(0);
    this.answers.set({});
  }
}
