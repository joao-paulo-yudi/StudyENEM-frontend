import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface QuestionDto {
  id: number; year: number; area: string; subject: string;
  topic: string; difficulty: string;
  statement: string; optionA: string; optionB: string; optionC: string; optionD: string; optionE: string;
}

export interface StartAttemptDto { studentName: string; mode: string; count?: number; year?: number; area?: string; }
export interface SubmitAnswerDto { questionId: number; selectedOption: string; }
export interface SubmitAttemptDto { attemptId: number; timeTakenSeconds?: number; answers: SubmitAnswerDto[]; }

export interface AnswerResultDto {
  questionId: number; subject: string; topic: string; area: string;
  selectedOption: string; correctOption: string; isCorrect: boolean;
}
export interface AttemptResultDto {
  attemptId: number; studentName: string; startedAt: string; finishedAt: string;
  totalQuestions: number; correctAnswers: number; score: number;
  answerDetails: AnswerResultDto[];
}

export interface AreaPerformanceDto { area: string; total: number; correct: number; percentage: number; }
export interface SubjectPerformanceDto { subject: string; area: string; total: number; correct: number; percentage: number; }
export interface AttemptSummaryDto {
  attemptId: number; date: string; total: number; correct: number; score: number;
  area?: string; mode?: string; timeTakenSeconds?: number;
}
export interface StudyPlanItemDto { topic: string; area: string; priority: string; mastery: number; attempts: number; reason: string; }

export interface PerformanceSummaryDto {
  studentName: string; totalAttempts: number;
  totalQuestions: number; totalCorrect: number; totalTimeSeconds: number;
  byArea: AreaPerformanceDto[]; bySubject: SubjectPerformanceDto[];
  recentAttempts: AttemptSummaryDto[]; studyPlan: StudyPlanItemDto[];
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  getYears() { return this.http.get<number[]>(`${this.base}/questions/years`); }
  getAreas() { return this.http.get<string[]>(`${this.base}/questions/areas`); }

  getQuestions(params: { year?: number; area?: string; count?: number } = {}) {
    const p: Record<string, string> = {};
    if (params.year) p['year'] = params.year.toString();
    if (params.area) p['area'] = params.area;
    if (params.count) p['count'] = params.count.toString();
    return this.http.get<QuestionDto[]>(`${this.base}/questions`, { params: p });
  }

  startAttempt(dto: StartAttemptDto) {
    return this.http.post<{ attemptId: number }>(`${this.base}/attempts/start`, dto);
  }
  submitAttempt(dto: SubmitAttemptDto) {
    return this.http.post<AttemptResultDto>(`${this.base}/attempts/submit`, dto);
  }
  getAttemptResult(id: number) {
    return this.http.get<AttemptResultDto>(`${this.base}/attempts/${id}/result`);
  }
  getPerformance(studentName: string) {
    return this.http.get<PerformanceSummaryDto>(`${this.base}/dashboard/performance/${encodeURIComponent(studentName)}`);
  }
}
