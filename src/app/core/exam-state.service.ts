import { Injectable, signal } from '@angular/core';
import { AreaCode, ExamQuestionDto, ForeignLanguage, StartAttemptResponseDto } from './api.service';

export interface ExamConfig {
  mode: 'geral' | 'foco';
  areaCode?: AreaCode;
  topicId?: number;
  topicName?: string;
  count: number;
  foreignLanguage: ForeignLanguage;
  timed: boolean;
}

/** Estado do simulado em andamento (questões, respostas e tempo por questão). */
@Injectable({ providedIn: 'root' })
export class ExamStateService {
  config = signal<ExamConfig | null>(null);
  attemptId = signal(0);
  questions = signal<ExamQuestionDto[]>([]);
  timeLimitSeconds = signal<number | null>(null);
  /** Alternativa marcada por índice da questão no simulado. */
  answers = signal<Record<number, string>>({});
  /** Tempo acumulado (s) em que cada questão ficou aberta na tela. */
  timeSpent = signal<Record<number, number>>({});

  start(config: ExamConfig, response: StartAttemptResponseDto) {
    this.config.set(config);
    this.attemptId.set(response.attemptId);
    this.questions.set(response.questions);
    this.timeLimitSeconds.set(response.timeLimitSeconds);
    this.answers.set({});
    this.timeSpent.set({});
  }

  setAnswer(index: number, letter: string) {
    this.answers.update(a => ({ ...a, [index]: letter }));
  }

  clearAnswer(index: number) {
    this.answers.update(a => {
      const next = { ...a };
      delete next[index];
      return next;
    });
  }

  addTime(index: number, seconds: number) {
    this.timeSpent.update(t => ({ ...t, [index]: (t[index] ?? 0) + seconds }));
  }

  reset() {
    this.config.set(null);
    this.attemptId.set(0);
    this.questions.set([]);
    this.timeLimitSeconds.set(null);
    this.answers.set({});
    this.timeSpent.set({});
  }
}
