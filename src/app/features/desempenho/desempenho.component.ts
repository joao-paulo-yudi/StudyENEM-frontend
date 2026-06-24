import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService, PerformanceSummaryDto } from '../../core/api.service';
import { StudentService } from '../../core/student.service';
import { AREA_LIST, getAreaByName } from '../../core/areas.config';

@Component({
  selector: 'app-desempenho',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './desempenho.component.html',
  styleUrl: './desempenho.component.css',
})
export class DesempenhoComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private student = inject(StudentService);

  data = signal<PerformanceSummaryDto | null>(null);
  readonly gridLines = [25, 50, 75, 100];

  ngOnInit() {
    if (!this.student.name) { this.router.navigate(['/home']); return; }
    this.api.getPerformance(this.student.name!).subscribe({ next: d => this.data.set(d) });
  }

  overallPct(d: PerformanceSummaryDto) {
    return d.totalQuestions > 0 ? Math.round((d.totalCorrect / d.totalQuestions) * 100) : 0;
  }
  studyHours(d: PerformanceSummaryDto) { return Math.round(d.totalTimeSeconds / 3600); }

  evoData(d: PerformanceSummaryDto) { return [...d.recentAttempts].reverse().slice(0, 8); }
  evoPoints(d: PerformanceSummaryDto) {
    const data = this.evoData(d);
    if (data.length < 2) return [];
    return data.map((e, i) => ({
      x: 10 + (i / (data.length - 1)) * 200,
      y: 10 + (1 - e.score / 100) * 80,
    }));
  }
  evoPath(d: PerformanceSummaryDto) {
    return this.evoPoints(d).map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  }
  evoArea(d: PerformanceSummaryDto) {
    const pts = this.evoPoints(d);
    if (!pts.length) return '';
    return this.evoPath(d) + ` L ${pts[pts.length - 1].x} 90 L ${pts[0].x} 90 Z`;
  }

  sortedByArea(d: PerformanceSummaryDto) {
    return d.byArea.map(a => ({ ...a, pct: Math.round(a.percentage) })).sort((a, b) => b.pct - a.pct);
  }

  radarAxes() {
    const areas = AREA_LIST;
    const n = areas.length;
    const R = 72; const cx = 100; const cy = 100; const labelR = 88;
    return areas.map((a, i) => {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      return {
        x2: cx + R * Math.cos(angle),
        y2: cy + R * Math.sin(angle),
        lx: cx + labelR * Math.cos(angle),
        ly: cy + labelR * Math.sin(angle) + 3,
        label: a.short.split(' ')[0],
        id: a.id,
      };
    });
  }

  radarGrid(pct: number) {
    const n = AREA_LIST.length; const R = 72 * pct / 100; const cx = 100; const cy = 100;
    return AREA_LIST.map((_, i) => {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      return `${cx + R * Math.cos(angle)},${cy + R * Math.sin(angle)}`;
    }).join(' ');
  }

  radarData(d: PerformanceSummaryDto) {
    if (!d.byArea.length) return null;
    const n = AREA_LIST.length; const R = 72; const cx = 100; const cy = 100;
    return AREA_LIST.map((a, i) => {
      const area = d.byArea.find(ba => getAreaByName(ba.area)?.id === a.id);
      const pct = area ? area.percentage / 100 : 0;
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      return `${cx + R * pct * Math.cos(angle)},${cy + R * pct * Math.sin(angle)}`;
    }).join(' ');
  }

  areaShort(name?: string) { return name ? (getAreaByName(name)?.short ?? name) : 'Geral'; }
  areaColor(name: string) { return getAreaByName(name)?.color ?? '#888'; }

  fmtShort(s: string) { return new Date(s).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }); }
  fmtDate(s: string) { return new Date(s).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: '2-digit' }); }
  fmtMin(sec: number) { return `${Math.round(sec / 60)}min`; }
}
