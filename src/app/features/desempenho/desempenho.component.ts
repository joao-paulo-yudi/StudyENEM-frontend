import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService, PerformanceSummaryDto } from '../../core/api.service';
import { StudentService } from '../../core/student.service';
import { getAreaByName } from '../../core/areas.config';
import { buildEvolutionChart, buildAreaRadarChart } from '../../core/charts';
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
  private student = inject(StudentService);

  data = signal<PerformanceSummaryDto | null>(null);

  /** Últimos 8 simulados em ordem cronológica (mais antigo → mais recente). */
  evoAttempts = computed(() => {
    const d = this.data();
    return d ? [...d.recentAttempts].slice(0, 8).reverse() : [];
  });

  /** Configurações memoizadas dos gráficos (referência estável até os dados mudarem). */
  evoChart = computed(() => buildEvolutionChart(this.evoAttempts()));
  radarChart = computed(() => buildAreaRadarChart(this.data()?.byArea ?? []));

  ngOnInit() {
    if (!this.student.name) { this.router.navigate(['/home']); return; }
    this.api.getPerformance(this.student.name!).subscribe({ next: d => this.data.set(d) });
  }

  overallPct(d: PerformanceSummaryDto) {
    return d.totalQuestions > 0 ? Math.round((d.totalCorrect / d.totalQuestions) * 100) : 0;
  }
  studyHours(d: PerformanceSummaryDto) { return Math.round(d.totalTimeSeconds / 3600); }

  sortedByArea(d: PerformanceSummaryDto) {
    return d.byArea.map(a => ({ ...a, pct: Math.round(a.percentage) })).sort((a, b) => b.pct - a.pct);
  }

  areaShort(name?: string) { return name ? (getAreaByName(name)?.short ?? name) : 'Geral'; }
  areaColor(name: string) { return getAreaByName(name)?.color ?? '#888'; }

  fmtDate(s: string) { return new Date(s).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' }); }
  fmtMin(sec: number) { return `${Math.round(sec / 60)}min`; }
}
