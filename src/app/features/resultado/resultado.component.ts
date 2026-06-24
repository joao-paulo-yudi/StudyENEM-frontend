import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService, AttemptResultDto } from '../../core/api.service';
import { getAreaByName } from '../../core/areas.config';

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
  tab = signal<'gabarito' | 'areas' | 'sugestoes'>('gabarito');

  readonly circ = 2 * Math.PI * 62;
  readonly tabs = [
    { id: 'gabarito' as const, label: 'Gabarito' },
    { id: 'areas' as const, label: 'Por área' },
    { id: 'sugestoes' as const, label: 'Sugestões' },
  ];

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.router.navigate(['/home']); return; }
    this.api.getAttemptResult(id).subscribe({
      next: r => this.result.set(r),
      error: () => this.router.navigate(['/home']),
    });
  }

  ringOffset(score: number) { return this.circ - (score / 100) * this.circ; }

  byArea(r: AttemptResultDto) {
    const map = new Map<string, { area: string; correct: number; total: number }>();
    for (const a of r.answerDetails) {
      const e = map.get(a.area) ?? { area: a.area, correct: 0, total: 0 };
      e.total++;
      if (a.isCorrect) e.correct++;
      map.set(a.area, e);
    }
    return [...map.values()].map(e => ({ ...e, pct: Math.round((e.correct / e.total) * 100) }))
      .sort((a, b) => b.pct - a.pct);
  }

  topicSuggestions(r: AttemptResultDto) {
    const map = new Map<string, { topic: string; area: string; wrong: number }>();
    for (const a of r.answerDetails) {
      if (!a.isCorrect) {
        const key = a.topic;
        const e = map.get(key) ?? { topic: a.topic, area: a.area, wrong: 0 };
        e.wrong++;
        map.set(key, e);
      }
    }
    return [...map.values()].sort((a, b) => b.wrong - a.wrong).slice(0, 6);
  }

  areaShort(name: string) { return getAreaByName(name)?.short ?? name; }
  areaColor(name: string) { return getAreaByName(name)?.color ?? '#888'; }
  areaSoft(name: string) { return getAreaByName(name)?.soft ?? '#F5F6FA'; }
  fmtDate(s: string) { return new Date(s).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }); }

  goSimulado() { this.router.navigate(['/simulado']); }
  goHome() { this.router.navigate(['/home']); }
  goDesempenho() { this.router.navigate(['/desempenho']); }
}
