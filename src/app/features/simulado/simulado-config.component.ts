import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, AreaCode, ForeignLanguage } from '../../core/api.service';
import { ExamConfig, ExamStateService } from '../../core/exam-state.service';
import { AREA_LIST, getAreaByCode } from '../../core/areas.config';
import { SECONDS_PER_QUESTION, formatDuration } from '../../core/format';

@Component({
  selector: 'app-simulado-config',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './simulado-config.component.html',
  styleUrl: './simulado-config.component.css',
})
export class SimuladoConfigComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private examState = inject(ExamStateService);

  readonly areas = AREA_LIST;
  readonly languages: { id: ForeignLanguage; label: string }[] = [
    { id: 'ingles', label: 'Inglês' },
    { id: 'espanhol', label: 'Espanhol' },
  ];

  mode = signal<'geral' | 'foco'>('geral');
  areaCode = signal<AreaCode | ''>('');
  topic = signal<{ id: number; name: string } | null>(null);
  count = signal(10);
  language = signal<ForeignLanguage>('ingles');
  timer = signal(true);
  loading = signal(false);
  error = signal('');

  /** Geral: até a prova completa (180). Foco em área: até 45. Treino de conteúdo: até 20. */
  countOptions = computed(() => {
    if (this.mode() === 'geral') return [5, 10, 20, 45, 90, 180];
    return this.topic() ? [5, 10, 20] : [5, 10, 20, 45];
  });
  areaConfig = computed(() => getAreaByCode(this.areaCode()));
  showLanguage = computed(() => this.mode() === 'geral' || this.areaCode() === 'LC');
  timeLimit = computed(() => formatDuration(this.count() * SECONDS_PER_QUESTION));
  canStart = computed(() => !this.loading() && (this.mode() === 'geral' || !!this.areaCode() || !!this.topic()));

  ngOnInit() {
    const params = this.route.snapshot.queryParamMap;
    const topicId = Number(params.get('topic'));
    const area = params.get('area');
    if (topicId) {
      this.mode.set('foco');
      this.topic.set({ id: topicId, name: params.get('topicName') ?? 'Conteúdo selecionado' });
    } else if (area && getAreaByCode(area)) {
      this.mode.set('foco');
      this.areaCode.set(area as AreaCode);
    }
  }

  setMode(m: 'geral' | 'foco') {
    this.mode.set(m);
    if (m === 'geral') { this.areaCode.set(''); this.topic.set(null); }
    this.keepCountAvailable();
  }

  setArea(code: AreaCode) {
    this.areaCode.set(code);
    this.topic.set(null);
    this.keepCountAvailable();
  }

  clearTopic() {
    this.topic.set(null);
    this.keepCountAvailable();
  }

  private keepCountAvailable() {
    if (!this.countOptions().includes(this.count())) this.count.set(10);
  }

  countHint(n: number): string {
    if (n === 180) return 'prova completa';
    if (n === 90) return '1 dia de prova';
    return '~' + formatDuration(n * SECONDS_PER_QUESTION);
  }

  start() {
    if (!this.canStart()) return;
    this.loading.set(true);
    this.error.set('');

    const topic = this.topic();
    const config: ExamConfig = {
      mode: this.mode(),
      areaCode: this.mode() === 'foco' && !topic ? (this.areaCode() || undefined) : undefined,
      topicId: topic?.id,
      topicName: topic?.name,
      count: this.count(),
      foreignLanguage: this.language(),
      timed: this.timer(),
    };

    this.api.startAttempt({
      mode: config.mode,
      count: config.count,
      areaCode: config.areaCode,
      topicId: config.topicId,
      foreignLanguage: config.foreignLanguage,
      timed: config.timed,
    }).subscribe({
      next: response => {
        this.examState.start(config, response);
        this.router.navigate(['/simulado/run']);
      },
      error: err => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'Erro ao iniciar o simulado. Tente novamente.');
      },
    });
  }
}
