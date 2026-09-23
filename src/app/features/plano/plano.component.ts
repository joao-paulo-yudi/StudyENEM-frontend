import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService, Priority, ResourceKind, StudyPlanDto, StudyPlanItemDto, StudyPlanTaskDto, StudyResourceDto } from '../../core/api.service';
import { areaColor, areaShort, areaSoft } from '../../core/areas.config';
import { formatNumber, scoreColor } from '../../core/format';

interface ResourceGroup { kind: ResourceKind; label: string; resources: StudyResourceDto[]; }

/** Rótulo e ícone de cada tipo de fonte de estudo. */
const RESOURCE_GROUPS: { kind: ResourceKind; label: string }[] = [
  { kind: 'video', label: 'Videoaulas' },
  { kind: 'exercicio', label: 'Exercícios' },
  { kind: 'material', label: 'Materiais de apoio' },
];

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

  data = signal<StudyPlanDto | null>(null);
  loadError = signal(false);
  tab = signal<'conteudos' | 'cronograma'>('conteudos');
  filter = signal<'todos' | Priority>('todos');
  /** Conteúdos com as recomendações abertas. */
  private expanded = signal<ReadonlySet<number>>(new Set());

  readonly filters = [
    { id: 'todos' as const, label: 'Todos' },
    { id: 'alta' as const, label: 'Alta prioridade' },
    { id: 'média' as const, label: 'Média prioridade' },
    { id: 'baixa' as const, label: 'Baixa prioridade' },
  ];

  filtered = computed(() => {
    const items = this.data()?.items ?? [];
    return this.filter() === 'todos' ? items : items.filter(i => i.priority === this.filter());
  });

  /** Horas de estudo sugeridas pelo cronograma da semana. */
  weekHours = computed(() => {
    const minutes = (this.data()?.schedule ?? []).reduce((total, day) => total + day.totalMinutes, 0);
    return Math.round(minutes / 60);
  });

  /** Conteúdos que couberam na semana — o simulado e a revisão de domingo não contam. */
  scheduledTopics = computed(() => (this.data()?.schedule ?? [])
    .reduce((total, day) => total + day.tasks.filter(t => t.topicId !== null).length, 0));

  ngOnInit() {
    this.api.getStudyPlan().subscribe({
      next: d => {
        this.data.set(d);
        // O primeiro conteúdo já abre com as recomendações à vista.
        if (d.items.length) this.expanded.set(new Set([d.items[0].topicId]));
      },
      error: () => this.loadError.set(true),
    });
  }

  isExpanded(item: StudyPlanItemDto) { return this.expanded().has(item.topicId); }

  toggle(item: StudyPlanItemDto) {
    const open = new Set(this.expanded());
    open.has(item.topicId) ? open.delete(item.topicId) : open.add(item.topicId);
    this.expanded.set(open);
  }

  /** Recomendações do conteúdo agrupadas por tipo, na ordem em que aparecem na tela. */
  groups(item: StudyPlanItemDto): ResourceGroup[] {
    return RESOURCE_GROUPS
      .map(g => ({ ...g, resources: item.resources.filter(r => r.kind === g.kind) }))
      .filter(g => g.resources.length > 0);
  }

  videoCount(item: StudyPlanItemDto) { return item.resources.filter(r => r.kind === 'video').length; }
  exerciseCount(item: StudyPlanItemDto) { return item.resources.filter(r => r.kind !== 'video').length; }

  go(route: string) { this.router.navigate(['/' + route]); }

  train(item: { topicId: number; topic: string }) {
    this.router.navigate(['/simulado'], { queryParams: { topic: item.topicId, topicName: item.topic } });
  }

  readonly taskLabels: Record<StudyPlanTaskDto['action'], string> = {
    treinar: 'Treinar', simulado: 'Simulado', revisar: 'Ver erros',
  };

  /** Cada tarefa do cronograma leva ao lugar onde ela é feita. */
  openTask(task: StudyPlanTaskDto) {
    if (task.action === 'treinar' && task.topicId !== null) { this.train({ ...task, topicId: task.topicId }); return; }
    this.go(task.action === 'revisar' ? 'desempenho' : 'simulado');
  }

  readonly areaColor = areaColor;
  readonly areaSoft = areaSoft;
  readonly areaShort = areaShort;
  fmt(value: number, digits = 0) { return formatNumber(value, digits); }
  /** 45min · 1h20 */
  duration(minutes: number) {
    if (minutes < 60) return `${minutes}min`;
    const rest = minutes % 60;
    return rest === 0 ? `${minutes / 60}h` : `${Math.floor(minutes / 60)}h${rest.toString().padStart(2, '0')}`;
  }
  priorityBg(p: string) { return p === 'alta' ? '#FEE2E2' : p === 'média' ? '#FEF3E2' : '#DCF5EB'; }
  priorityColor(p: string) { return p === 'alta' ? '#C73A1E' : p === 'média' ? '#B8841C' : '#059669'; }
  masteryColor(m: number) { return scoreColor(m); }
}
