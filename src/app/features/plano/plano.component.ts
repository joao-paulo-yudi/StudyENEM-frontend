import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService, PerformanceSummaryDto, StudyPlanItemDto } from '../../core/api.service';
import { StudentService } from '../../core/student.service';
import { getAreaByName } from '../../core/areas.config';

@Component({
  selector: 'app-plano',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:28px;flex-wrap:wrap;gap:12px">
        <div>
          <h1 style="margin:0;font-size:26px;font-weight:700;color:#0F1B3D;letter-spacing:-.025em">Plano de Estudos</h1>
          <p style="margin:6px 0 0;color:#7B8597;font-size:14px">Tópicos priorizados com base no seu desempenho</p>
        </div>
        <button class="btn btn-primary btn-md" (click)="go('simulado')">
          Praticar agora
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 12H19M13 6l6 6-6 6"/></svg>
        </button>
      </div>

      @if (!data()) {
        <div style="text-align:center;padding:80px 0;color:#7B8597">Carregando...</div>
      }

      @if (data(); as d) {
        @if (d.studyPlan.length === 0) {
          <div class="card" style="text-align:center;padding:48px 24px">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ECEEF3" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto 16px;display:block">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            <div style="font-size:16px;font-weight:600;color:#0F1B3D;margin-bottom:8px">Plano vazio</div>
            <div style="font-size:14px;color:#7B8597;margin-bottom:20px">Faça simulados para receber sugestões personalizadas.</div>
            <button class="btn btn-primary btn-md" (click)="go('simulado')">Fazer meu primeiro simulado</button>
          </div>
        } @else {
          <!-- Progress overview -->
          <div class="grid-4" style="margin-bottom:22px">
            <div class="card" style="padding:18px">
              <div style="font-size:11px;color:#7B8597;text-transform:uppercase;letter-spacing:.07em;font-weight:600">Tópicos no plano</div>
              <div style="font-size:30px;font-weight:700;color:#0F1B3D;margin-top:8px;line-height:1">{{d.studyPlan.length}}</div>
            </div>
            <div class="card" style="padding:18px">
              <div style="font-size:11px;color:#7B8597;text-transform:uppercase;letter-spacing:.07em;font-weight:600">Prioridade alta</div>
              <div style="font-size:30px;font-weight:700;color:#C73A1E;margin-top:8px;line-height:1">{{highCount()}}</div>
            </div>
            <div class="card" style="padding:18px">
              <div style="font-size:11px;color:#7B8597;text-transform:uppercase;letter-spacing:.07em;font-weight:600">Prioridade média</div>
              <div style="font-size:30px;font-weight:700;color:#B8841C;margin-top:8px;line-height:1">{{medCount()}}</div>
            </div>
            <div class="card" style="padding:18px">
              <div style="font-size:11px;color:#7B8597;text-transform:uppercase;letter-spacing:.07em;font-weight:600">Dominando</div>
              <div style="font-size:30px;font-weight:700;color:#059669;margin-top:8px;line-height:1">{{lowCount()}}</div>
            </div>
          </div>

          <!-- Filter chips -->
          <div style="display:flex;gap:8px;margin-bottom:18px;flex-wrap:wrap">
            @for (f of filters; track f.id) {
              <button (click)="filter.set(f.id)"
                [class.filter-chip-active]="filter() === f.id"
                class="filter-chip">
                {{f.label}}
              </button>
            }
          </div>

          <!-- Plan items -->
          <div style="display:flex;flex-direction:column;gap:10px">
            @for (item of filtered(); track item.topic) {
              <div class="card" style="padding:0;overflow:hidden">
                <div style="display:flex;align-items:stretch;gap:0">
                  <div style="width:4px;flex-shrink:0" [style.background]="areaColor(item.area)"></div>
                  <div style="flex:1;padding:16px 18px;display:flex;align-items:center;gap:16px;flex-wrap:wrap">
                    <div style="flex:1;min-width:180px">
                      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
                        <span style="font-size:14.5px;font-weight:600;color:#0F1B3D">{{item.topic}}</span>
                        <span [style.background]="priorityBg(item.priority)"
                          [style.color]="priorityColor(item.priority)"
                          style="padding:2px 8px;border-radius:999px;font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.05em">
                          {{item.priority}}
                        </span>
                      </div>
                      <div style="font-size:12px;color:#7B8597">{{item.reason}}</div>
                    </div>

                    <div style="display:flex;align-items:center;gap:14px;flex-shrink:0">
                      <div style="text-align:center">
                        <div style="font-size:18px;font-weight:700" [style.color]="masteryColor(item.mastery)">{{item.mastery}}%</div>
                        <div style="font-size:10.5px;color:#7B8597;margin-top:2px">domínio</div>
                      </div>
                      <div style="width:80px">
                        <div style="height:6px;background:#F2F4F8;border-radius:999px;overflow:hidden">
                          <div [style.width.%]="item.mastery" style="height:100%;border-radius:999px;transition:width 700ms"
                            [style.background]="masteryColor(item.mastery)"></div>
                        </div>
                        <div style="font-size:10.5px;color:#9AA3B5;margin-top:3px">{{item.attempts}} tentativas</div>
                      </div>
                      <div style="display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:600"
                        [style.background]="areaSoft(item.area)" [style.color]="areaColor(item.area)">
                        <span style="width:6px;height:6px;border-radius:50%" [style.background]="areaColor(item.area)"></span>
                        {{areaShort(item.area)}}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      }
    </div>
  `,
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
