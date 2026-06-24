import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { StudentService } from '../../core/student.service';
import { ExamStateService } from '../../core/exam-state.service';
import { AREA_LIST, getAreaById } from '../../core/areas.config';

@Component({
  selector: 'app-simulado-config',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './simulado-config.component.html',
  styleUrl: './simulado-config.component.css',
})
export class SimuladoConfigComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private student = inject(StudentService);
  private examState = inject(ExamStateService);

  readonly areas = AREA_LIST;
  readonly countOptions = [
    { value: 5, min: 8 },
    { value: 10, min: 15 },
    { value: 20, min: 30 },
    { value: 45, min: 60 },
  ];

  mode = signal<'geral' | 'foco'>('geral');
  selectedArea = signal<string>('');
  count = signal(10);
  timer = signal(true);
  loading = signal(false);
  error = signal('');

  areaConfig = computed(() => getAreaById(this.selectedArea()));
  estimatedMin = computed(() => Math.round(this.count() * 1.5));
  canStart = computed(() => {
    if (this.loading()) return false;
    if (this.mode() === 'foco' && !this.selectedArea()) return false;
    return true;
  });

  ngOnInit() {
    if (!this.student.name) { this.router.navigate(['/home']); return; }
    const area = this.route.snapshot.queryParamMap.get('area');
    if (area) { this.mode.set('foco'); this.setArea(area); }
  }

  setMode(m: 'geral' | 'foco') { this.mode.set(m); if (m === 'geral') this.selectedArea.set(''); }
  setArea(id: string) { this.selectedArea.set(id); }
  setCount(n: number) { this.count.set(n); }
  toggleTimer() { this.timer.set(!this.timer()); }

  start() {
    if (!this.canStart()) return;
    this.loading.set(true);
    this.error.set('');

    const areaConfig = this.areaConfig();
    const areaName = areaConfig?.name;

    this.api.startAttempt({
      studentName: this.student.name!,
      mode: this.mode(),
      count: this.count(),
      area: areaName,
    }).subscribe({
      next: ({ attemptId }) => {
        const params: { year?: number; area?: string; count?: number } = { count: this.count() };
        if (areaName) params.area = areaName;

        this.api.getQuestions(params).subscribe({
          next: questions => {
            this.examState.setExam(attemptId, questions);
            this.examState.setConfig({
              mode: this.mode(),
              areaId: this.selectedArea() || undefined,
              areaName: areaName,
              count: this.count(),
              timed: this.timer(),
            });
            this.router.navigate(['/simulado/run']);
          },
          error: () => { this.loading.set(false); this.error.set('Erro ao carregar questões. Tente novamente.'); },
        });
      },
      error: () => { this.loading.set(false); this.error.set('Erro ao iniciar simulado. Tente novamente.'); },
    });
  }
}
