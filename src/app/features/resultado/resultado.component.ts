import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, AttemptResultDto, TopicResultDto } from '../../core/api.service';
import { areaColor, areaShort, areaSoft } from '../../core/areas.config';
import { attemptLabel, formatDate, formatDuration, formatNumber, scoreColor } from '../../core/format';

type Tab = 'areas' | 'conteudos' | 'gabarito' | 'sugestoes';

@Component({
  selector: 'app-resultado',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resultado.component.html',
  styleUrl: './resultado.component.css',
})
export class ResultadoComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  result = signal<AttemptResultDto | null>(null);
  loadError = signal(false);
  tab = signal<Tab>('areas');

  readonly circ = 2 * Math.PI * 62;
  readonly tabs: { id: Tab; label: string }[] = [
    { id: 'areas', label: 'Por área' },
    { id: 'conteudos', label: 'Por conteúdo' },
    { id: 'gabarito', label: 'Gabarito' },
    { id: 'sugestoes', label: 'Sugestões' },
  ];

  wrong = computed(() => {
    const r = this.result();
    return r ? r.totalQuestions - r.correctAnswers : 0;
  });
  blank = computed(() => this.result()?.answers.filter(a => a.selectedOption == null && a.correctOption != null).length ?? 0);
  label = computed(() => {
    const r = this.result();
    return r ? attemptLabel({ mode: r.mode, areaCode: r.areaCode, topic: r.topic, total: r.totalQuestions }) : '';
  });
  suggestions = computed(() => (this.result()?.byTopic ?? [])
    .filter(t => t.correct < t.total)
    .map(t => ({ ...t, wrong: t.total - t.correct }))
    .sort((a, b) => b.wrong - a.wrong || a.percentage - b.percentage)
    .slice(0, 8));

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.router.navigate(['/home']); return; }
    this.api.getAttemptResult(id).subscribe({
      next: r => this.result.set(r),
      error: () => this.loadError.set(true),
    });
  }

  ringOffset(percentage: number) { return this.circ - (percentage / 100) * this.circ; }

  train(t: TopicResultDto) {
    this.router.navigate(['/simulado'], { queryParams: { topic: t.topicId, topicName: t.topic } });
  }
  go(route: string) { this.router.navigate(['/' + route]); }

  readonly areaShort = areaShort;
  readonly areaColor = areaColor;
  readonly areaSoft = areaSoft;
  readonly scoreColor = scoreColor;
  readonly duration = formatDuration;
  fmt(value: number, digits = 0) { return formatNumber(value, digits); }
  fmtDate(iso: string) { return formatDate(iso, 'long'); }
}
