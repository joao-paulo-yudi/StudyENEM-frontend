import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService, AttemptSummaryDto, PerformanceSummaryDto, TopicPerformanceDto } from '../../core/api.service';
import { areaColor, areaShort } from '../../core/areas.config';
import { attemptLabel, formatDate, formatDuration, formatNumber, scoreColor } from '../../core/format';
import { EvolutionMetric, buildAreaEvolutionChart, buildAreaRadarChart, buildEvolutionChart } from '../../core/charts';
import { ChartComponent } from '../../shared/chart/chart.component';

@Component({
  selector: 'app-desempenho',
  standalone: true,
  imports: [CommonModule, ChartComponent],
  templateUrl: './desempenho.component.html',
  styleUrl: './desempenho.component.css',
})
export class DesempenhoComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);

  data = signal<PerformanceSummaryDto | null>(null);
  loadError = signal(false);
  areaMetric = signal<EvolutionMetric>('percentage');
  showAllTopics = signal(false);

  /** Últimos 10 simulados em ordem cronológica. */
  evoAttempts = computed(() => [...(this.data()?.history ?? [])].slice(0, 10).reverse());
  evoChart = computed(() => buildEvolutionChart(this.evoAttempts()));
  areaEvoChart = computed(() => buildAreaEvolutionChart(this.evoAttempts(), this.areaMetric()));
  radarChart = computed(() => buildAreaRadarChart(this.data()?.byArea ?? []));

  overallPct = computed(() => {
    const d = this.data();
    return d && d.totalQuestions > 0 ? Math.round((d.totalCorrect / d.totalQuestions) * 100) : 0;
  });

  topics = computed<TopicPerformanceDto[]>(() => {
    const list = this.data()?.byTopic ?? [];
    return this.showAllTopics() ? list : list.slice(0, 10);
  });

  ngOnInit() {
    this.api.getPerformance().subscribe({
      next: d => this.data.set(d),
      error: () => this.loadError.set(true),
    });
  }

  openResult(a: AttemptSummaryDto) { this.router.navigate(['/resultado', a.attemptId]); }

  readonly areaShort = areaShort;
  readonly areaColor = areaColor;
  readonly attemptLabel = attemptLabel;
  readonly scoreColor = scoreColor;
  readonly duration = formatDuration;
  fmt(value: number, digits = 0) { return formatNumber(value, digits); }
  fmtDate(iso: string) { return formatDate(iso); }
  indexColor(index: number) { return scoreColor(100 - index * 100); }
}
