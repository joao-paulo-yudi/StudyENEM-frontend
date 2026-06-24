import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService, PerformanceSummaryDto } from '../../core/api.service';
import { StudentService } from '../../core/student.service';
import { getAreaByName } from '../../core/areas.config';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private student = inject(StudentService);

  data: PerformanceSummaryDto | null = null;
  readonly circumference = 2 * Math.PI * 54;
  readonly gridLines = [0, 25, 50, 75, 100];

  get hasStudent() { return !!this.student.name; }
  get firstName() { return (this.student.name ?? '').split(' ')[0]; }

  get overallPct() {
    if (!this.data || !this.data.totalQuestions) return 0;
    return Math.round((this.data.totalCorrect / this.data.totalQuestions) * 100);
  }
  get ringOffset() { return this.circumference - (this.overallPct / 100) * this.circumference; }
  get studyHours() { return this.data ? Math.round(this.data.totalTimeSeconds / 3600) : 0; }

  get evolution() {
    return (this.data?.recentAttempts ?? []).slice().reverse().slice(0, 6);
  }
  get evoPoints() {
    const d = this.evolution;
    if (d.length < 2) return [];
    return d.map((e, i) => ({
      x: 6 + (i / (d.length - 1)) * 88,
      y: 6 + (1 - e.score / 100) * 56,
    }));
  }
  get evoPath() { return this.evoPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' '); }
  get evoArea() {
    const pts = this.evoPoints;
    if (!pts.length) return '';
    return this.evoPath + ` L ${pts[pts.length - 1].x} 62 L ${pts[0].x} 62 Z`;
  }

  get areaPerf() {
    return (this.data?.byArea ?? []).map(a => {
      const cfg = getAreaByName(a.area);
      return { id: cfg?.id ?? a.area, short: cfg?.short ?? a.area, color: cfg?.color ?? '#888', pct: Math.round(a.percentage), correct: a.correct, total: a.total };
    }).sort((a, b) => b.pct - a.pct);
  }

  get weakest() {
    const sorted = [...this.areaPerf].sort((a, b) => a.pct - b.pct);
    const w = sorted[0];
    if (!w || !this.data?.totalAttempts) return null;
    const soft = getAreaByName(this.data.byArea.find(a => getAreaByName(a.area)?.id === w.id)?.area ?? '')?.soft ?? '#F5F6FA';
    return { ...w, soft };
  }

  get topPlan() {
    return (this.data?.studyPlan ?? []).filter(p => p.priority === 'alta').slice(0, 3);
  }

  ngOnInit() { if (this.student.name) this.load(); }

  load() {
    this.api.getPerformance(this.student.name!).subscribe({
      next: d => this.data = d,
      error: () => this.data = { studentName: '', totalAttempts: 0, totalQuestions: 0, totalCorrect: 0, totalTimeSeconds: 0, byArea: [], bySubject: [], recentAttempts: [], studyPlan: [] },
    });
  }

  go(r: string) { this.router.navigate(['/' + r]); }
  goFoco(areaId: string) {
    this.router.navigate(['/simulado'], { queryParams: { area: areaId } });
  }

  fmtShort(s: string) { return new Date(s).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }); }
  fmtLong(s: string) { return new Date(s).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' }); }
  fmtMin(sec: number) { return `${Math.round(sec / 60)}min`; }
  getDay(s: string) { return new Date(s).getDate(); }
  areaShort(name?: string) { return name ? (getAreaByName(name)?.short ?? name) : 'Geral'; }
  areaColor(name: string) { return getAreaByName(name)?.color ?? '#888'; }
  areaSoft(name: string) { return getAreaByName(name)?.soft ?? '#F5F6FA'; }
}
