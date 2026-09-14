import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService, PerformanceSummaryDto, Priority, StudyPlanItemDto } from '../../core/api.service';
import { areaColor, areaShort, areaSoft } from '../../core/areas.config';
import { formatNumber, scoreColor } from '../../core/format';

@Component({
  selector: 'app-plano',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './plano.component.html',
  styleUrl: './plano.component.css',
})
export class PlanoComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);

  data = signal<PerformanceSummaryDto | null>(null);
  loadError = signal(false);
  filter = signal<'todos' | Priority>('todos');

  readonly filters = [
    { id: 'todos' as const, label: 'Todos' },
    { id: 'alta' as const, label: 'Alta prioridade' },
    { id: 'média' as const, label: 'Média prioridade' },
    { id: 'baixa' as const, label: 'Baixa prioridade' },
  ];

  private count(p: Priority) { return this.data()?.studyPlan.filter(i => i.priority === p).length ?? 0; }
  highCount = computed(() => this.count('alta'));
  medCount = computed(() => this.count('média'));
  lowCount = computed(() => this.count('baixa'));

  filtered = computed(() => {
    const plan = this.data()?.studyPlan ?? [];
    return this.filter() === 'todos' ? plan : plan.filter(p => p.priority === this.filter());
  });

  ngOnInit() {
    this.api.getPerformance().subscribe({
      next: d => this.data.set(d),
      error: () => this.loadError.set(true),
    });
  }

  go(route: string) { this.router.navigate(['/' + route]); }
  train(item: StudyPlanItemDto) {
    this.router.navigate(['/simulado'], { queryParams: { topic: item.topicId, topicName: item.topic } });
  }

  readonly areaColor = areaColor;
  readonly areaSoft = areaSoft;
  readonly areaShort = areaShort;
  fmt(value: number, digits = 0) { return formatNumber(value, digits); }
  priorityBg(p: string) { return p === 'alta' ? '#FEE2E2' : p === 'média' ? '#FEF3E2' : '#DCF5EB'; }
  priorityColor(p: string) { return p === 'alta' ? '#C73A1E' : p === 'média' ? '#B8841C' : '#059669'; }
  masteryColor(m: number) { return scoreColor(m); }
}
