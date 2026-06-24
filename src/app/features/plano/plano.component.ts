import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService, PerformanceSummaryDto } from '../../core/api.service';
import { StudentService } from '../../core/student.service';
import { getAreaByName } from '../../core/areas.config';

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
  private student = inject(StudentService);

  data = signal<PerformanceSummaryDto | null>(null);
  filter = signal<'todos' | 'alta' | 'média' | 'baixa'>('todos');

  readonly filters = [
    { id: 'todos' as const, label: 'Todos' },
    { id: 'alta' as const, label: 'Alta prioridade' },
    { id: 'média' as const, label: 'Média prioridade' },
    { id: 'baixa' as const, label: 'Baixa prioridade' },
  ];

  highCount = computed(() => this.data()?.studyPlan.filter(p => p.priority === 'alta').length ?? 0);
  medCount = computed(() => this.data()?.studyPlan.filter(p => p.priority === 'média').length ?? 0);
  lowCount = computed(() => this.data()?.studyPlan.filter(p => p.priority === 'baixa').length ?? 0);

  filtered = computed(() => {
    const plan = this.data()?.studyPlan ?? [];
    return this.filter() === 'todos' ? plan : plan.filter(p => p.priority === this.filter());
  });

  ngOnInit() {
    if (!this.student.name) { this.router.navigate(['/home']); return; }
    this.api.getPerformance(this.student.name!).subscribe({ next: d => this.data.set(d) });
  }

  go(r: string) { this.router.navigate(['/' + r]); }

  areaColor(name: string) { return getAreaByName(name)?.color ?? '#888'; }
  areaSoft(name: string) { return getAreaByName(name)?.soft ?? '#F5F6FA'; }
  areaShort(name: string) { return getAreaByName(name)?.short ?? name; }

  priorityBg(p: string) { return p === 'alta' ? '#FEE2E2' : p === 'média' ? '#FEF3E2' : '#DCF5EB'; }
  priorityColor(p: string) { return p === 'alta' ? '#C73A1E' : p === 'média' ? '#B8841C' : '#059669'; }
  masteryColor(m: number) { return m >= 60 ? '#059669' : m >= 40 ? '#B8841C' : '#C73A1E'; }
}
