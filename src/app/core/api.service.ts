import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export type AreaCode = 'LC' | 'CH' | 'CN' | 'MT';
export type ForeignLanguage = 'ingles' | 'espanhol';
export type Priority = 'alta' | 'média' | 'baixa';

// ── Autenticação ────────────────────────────────────────────────────────────
export interface AuthUserDto { id: number; name: string; email: string; }
export interface AuthResponseDto { token: string; expiresAt: string; user: AuthUserDto; }
export interface LoginDto { identifier: string; password: string; }
export interface RegisterDto { name: string; email: string; password: string; }

// ── Banco de questões ───────────────────────────────────────────────────────
export interface TopicDto { id: number; name: string; questionCount: number; }
export interface SubjectDto { id: number; name: string; topics: TopicDto[]; }
export interface AreaCatalogDto { id: number; code: AreaCode; name: string; questionCount: number; subjects: SubjectDto[]; }
export interface QuestionCatalogDto { years: number[]; areas: AreaCatalogDto[]; }

export interface AlternativeDto { letter: string; text: string; }

export interface QuestionBankItemDto {
  id: number; year: number; number: number; day: number;
  areaCode: AreaCode; areaName: string;
  subjectId: number; subject: string; topicId: number; topic: string;
  foreignLanguage: ForeignLanguage | null;
  skill: number; skillDescription: string;
  statement: string; alternatives: AlternativeDto[];
  correctOption: string | null;
  /** Dificuldade do item (parâmetro b do INEP) na escala do ENEM. */
  triDifficulty: number | null;
  triExclusionReason: string | null;
}

// ── Simulados ───────────────────────────────────────────────────────────────
export interface StartAttemptDto {
  mode: 'geral' | 'foco'; count: number;
  areaCode?: AreaCode; topicId?: number;
  foreignLanguage: ForeignLanguage; timed: boolean;
}
export interface ExamQuestionDto {
  id: number; year: number; number: number;
  areaCode: AreaCode; areaName: string; subject: string; topic: string;
  foreignLanguage: ForeignLanguage | null;
  statement: string; alternatives: AlternativeDto[];
}
export interface StartAttemptResponseDto { attemptId: number; timeLimitSeconds: number | null; questions: ExamQuestionDto[]; }

export interface SubmitAnswerDto { questionId: number; selectedOption: string | null; timeSpentSeconds: number | null; }
export interface SubmitAttemptDto { timeTakenSeconds: number | null; answers: SubmitAnswerDto[]; }

/** Nota estimada pela TRI na escala do ENEM, erro-padrão e número de itens usados. */
export interface TriScoreDto { score: number; standardError: number; items: number; }

export interface AreaResultDto {
  areaCode: AreaCode; areaName: string; total: number; correct: number; percentage: number;
  tri: TriScoreDto | null; averageTimeSeconds: number | null;
}
export interface TopicResultDto { topicId: number; topic: string; subject: string; areaCode: AreaCode; total: number; correct: number; percentage: number; }
export interface AnswerResultDto {
  questionId: number; order: number; year: number; number: number;
  areaCode: AreaCode; subject: string; topic: string;
  selectedOption: string | null; correctOption: string | null; isCorrect: boolean; timeSpentSeconds: number | null;
}
export interface AttemptResultDto {
  attemptId: number; mode: string; areaCode: AreaCode | null; topic: string | null;
  startedAt: string; finishedAt: string; timeTakenSeconds: number | null;
  totalQuestions: number; correctAnswers: number; percentage: number; triAverage: number | null;
  byArea: AreaResultDto[]; byTopic: TopicResultDto[]; answers: AnswerResultDto[];
}
export interface AttemptSummaryDto {
  attemptId: number; date: string; mode: string; areaCode: AreaCode | null; topic: string | null;
  total: number; correct: number; percentage: number; triAverage: number | null;
  timeTakenSeconds: number | null; byArea: AreaResultDto[];
}

// ── Dashboard ───────────────────────────────────────────────────────────────
export interface AreaPerformanceDto {
  areaCode: AreaCode; areaName: string; total: number; correct: number; percentage: number;
  tri: TriScoreDto | null; averageTimeSeconds: number | null;
}
export interface SubjectPerformanceDto { subject: string; areaCode: AreaCode; total: number; correct: number; percentage: number; }
export interface TopicPerformanceDto {
  topicId: number; topic: string; subject: string; areaCode: AreaCode;
  total: number; correct: number; percentage: number;
  /** Erros / questões respondidas no conteúdo (0 a 1). */
  difficultyIndex: number; averageTimeSeconds: number | null;
}
export interface ComparisonDto { currentPercentage: number; previousPercentage: number; percentageDelta: number; triAverageDelta: number | null; }
export interface StudyPlanItemDto {
  topicId: number; topic: string; subject: string; areaCode: AreaCode;
  priority: Priority; difficultyIndex: number; mastery: number; attempts: number; reason: string;
}
export interface PerformanceSummaryDto {
  studentName: string; totalAttempts: number; totalQuestions: number; totalCorrect: number;
  totalTimeSeconds: number; averageTimePerQuestion: number | null; triAverage: number | null;
  byArea: AreaPerformanceDto[]; bySubject: SubjectPerformanceDto[]; byTopic: TopicPerformanceDto[];
  history: AttemptSummaryDto[]; lastComparison: ComparisonDto | null; studyPlan: StudyPlanItemDto[];
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  login(dto: LoginDto) { return this.http.post<AuthResponseDto>(`${this.base}/auth/login`, dto); }
  register(dto: RegisterDto) { return this.http.post<AuthResponseDto>(`${this.base}/auth/register`, dto); }

  getCatalog() { return this.http.get<QuestionCatalogDto>(`${this.base}/questions/catalog`); }
  getQuestionBank() { return this.http.get<QuestionBankItemDto[]>(`${this.base}/questions`); }

  startAttempt(dto: StartAttemptDto) { return this.http.post<StartAttemptResponseDto>(`${this.base}/attempts`, dto); }
  submitAttempt(attemptId: number, dto: SubmitAttemptDto) {
    return this.http.post<AttemptResultDto>(`${this.base}/attempts/${attemptId}/submit`, dto);
  }
  getAttemptResult(id: number) { return this.http.get<AttemptResultDto>(`${this.base}/attempts/${id}`); }
  getHistory() { return this.http.get<AttemptSummaryDto[]>(`${this.base}/attempts`); }
  getPerformance() { return this.http.get<PerformanceSummaryDto>(`${this.base}/dashboard`); }
}
