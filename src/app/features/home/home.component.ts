import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService, AttemptSummaryDto, PerformanceSummaryDto, StudyPlanItemDto } from '../../core/api.service';
import { StudentService } from '../../core/student.service';
import { areaColor, areaShort, areaSoft, getAreaByCode } from '../../core/areas.config';
import { attemptLabel, formatDate, formatDuration, formatNumber, scoreColor } from '../../core/format';
import { buildEvolutionChart } from '../../core/charts';
import { ChartComponent } from '../../shared/chart/chart.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ChartComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private student = inject(StudentService);

  data = signal<PerformanceSummaryDto | null>(null);
  loadError = signal(false);
  readonly circumference = 2 * Math.PI * 54;
  readonly firstName = (this.student.name ?? '').split(' ')[0];

  overallPct = computed(() => {
    const d = this.data();
    return d && d.totalQuestions ? Math.round((d.totalCorrect / d.totalQuestions) * 100) : 0;
  });
  ringOffset = computed(() => this.circumference - (this.overallPct() / 100) * this.circumference);
  studyHours = computed(() => Math.round((this.data()?.totalTimeSeconds ?? 0) / 3600));
  comparison = computed(() => this.data()?.lastComparison ?? null);

  /** Últimos 6 simulados em ordem cronológica. */
  evoAttempts = computed(() => [...(this.data()?.history ?? [])].slice(0, 6).reverse());
  evoChart = computed(() => buildEvolutionChart(this.evoAttempts()));

  areaPerf = computed(() => (this.data()?.byArea ?? [])
    .map(a => ({ ...a, pct: Math.round(a.percentage), short: areaShort(a.areaCode), color: areaColor(a.areaCode) }))
    .sort((x, y) => y.pct - x.pct));

  weakest = computed(() => {
    const list = this.areaPerf();
    if (!list.length) return null;
    const w = [...list].sort((a, b) => a.pct - b.pct)[0];
    return { ...w, soft: getAreaByCode(w.areaCode)?.soft ?? '#F5F6FA' };
  });

  topPlan = computed(() => (this.data()?.studyPlan ?? []).filter(p => p.priority === 'alta').slice(0, 3));

  ngOnInit() {
    this.api.getPerformance().subscribe({
      next: d => this.data.set(d),
      error: () => this.loadError.set(true),
    });
  }

  go(route: string) { this.router.navigate(['/' + route]); }
  openResult(a: AttemptSummaryDto) { this.router.navigate(['/resultado', a.attemptId]); }
  trainArea(code: string) { this.router.navigate(['/simulado'], { queryParams: { area: code } }); }
  trainTopic(p: StudyPlanItemDto) {
    this.router.navigate(['/simulado'], { queryParams: { topic: p.topicId, topicName: p.topic } });
  }

  readonly areaShort = areaShort;
  readonly areaColor = areaColor;
  readonly areaSoft = areaSoft;
  readonly attemptLabel = attemptLabel;
  readonly scoreColor = scoreColor;
  readonly duration = formatDuration;
  fmt(value: number, digits = 0) { return formatNumber(value, digits); }
  fmtDate(iso: string) { return formatDate(iso, 'long'); }
  day(iso: string) { return new Date(iso).getDate(); }
}
