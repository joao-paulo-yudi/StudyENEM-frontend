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
  template: `
    <div class="page" style="max-width:780px">
      <div style="margin-bottom:28px">
        <h1 style="margin:0;font-size:26px;font-weight:700;color:#0F1B3D;letter-spacing:-.025em">Novo Simulado</h1>
        <p style="margin:6px 0 0;color:#7B8597;font-size:14px">Configure seu simulado para uma prática mais eficiente</p>
      </div>

      <!-- Mode -->
      <div class="card" style="margin-bottom:16px">
        <h3 style="margin:0 0 16px;font-size:14px;font-weight:600;color:#7B8597;text-transform:uppercase;letter-spacing:.06em">Modo</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <button (click)="setMode('geral')"
            [style.border]="mode()==='geral' ? '2px solid #F26B3A' : '2px solid #ECEEF3'"
            [style.background]="mode()==='geral' ? '#FFF5F0' : '#fff'"
            style="padding:18px 20px;border-radius:12px;text-align:left;cursor:pointer;transition:all .15s">
            <div style="display:flex;align-items:center;gap:12px">
              <div style="width:40px;height:40px;border-radius:10px;background:#FEF3E2;display:grid;place-items:center;flex-shrink:0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F26B3A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
              </div>
              <div>
                <div style="font-size:15px;font-weight:600;color:#0F1B3D">Simulado Geral</div>
                <div style="font-size:12px;color:#7B8597;margin-top:2px">Questões de todas as áreas</div>
              </div>
            </div>
          </button>
          <button (click)="setMode('foco')"
            [style.border]="mode()==='foco' ? '2px solid #F26B3A' : '2px solid #ECEEF3'"
            [style.background]="mode()==='foco' ? '#FFF5F0' : '#fff'"
            style="padding:18px 20px;border-radius:12px;text-align:left;cursor:pointer;transition:all .15s">
            <div style="display:flex;align-items:center;gap:12px">
              <div style="width:40px;height:40px;border-radius:10px;background:#FEF3E2;display:grid;place-items:center;flex-shrink:0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F26B3A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
                </svg>
              </div>
              <div>
                <div style="font-size:15px;font-weight:600;color:#0F1B3D">Foco por Área</div>
                <div style="font-size:12px;color:#7B8597;margin-top:2px">Pratique uma área específica</div>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Area (only for foco) -->
      @if (mode() === 'foco') {
        <div class="card" style="margin-bottom:16px">
          <h3 style="margin:0 0 16px;font-size:14px;font-weight:600;color:#7B8597;text-transform:uppercase;letter-spacing:.06em">Área de conhecimento</h3>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            @for (a of areas; track a.id) {
              <button (click)="setArea(a.id)"
                [style.border]="selectedArea() === a.id ? '2px solid ' + a.color : '2px solid #ECEEF3'"
                [style.background]="selectedArea() === a.id ? a.soft : '#fff'"
                style="padding:14px 16px;border-radius:12px;text-align:left;cursor:pointer;transition:all .15s;display:flex;align-items:center;gap:12px">
                <span style="width:10px;height:10px;border-radius:50%;flex-shrink:0" [style.background]="a.color"></span>
                <span style="font-size:14px;font-weight:500" [style.color]="selectedArea() === a.id ? a.color : '#0F1B3D'">{{a.short}}</span>
              </button>
            }
          </div>
        </div>
      }

      <!-- Quantity -->
      <div class="card" style="margin-bottom:16px">
        <h3 style="margin:0 0 16px;font-size:14px;font-weight:600;color:#7B8597;text-transform:uppercase;letter-spacing:.06em">Quantidade de questões</h3>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">
          @for (opt of countOptions; track opt.value) {
            <button (click)="setCount(opt.value)"
              [style.border]="count() === opt.value ? '2px solid #F26B3A' : '2px solid #ECEEF3'"
              [style.background]="count() === opt.value ? '#FFF5F0' : '#fff'"
              style="padding:14px 10px;border-radius:12px;text-align:center;cursor:pointer;transition:all .15s">
              <div style="font-size:20px;font-weight:700" [style.color]="count() === opt.value ? '#F26B3A' : '#0F1B3D'">{{opt.value}}</div>
              <div style="font-size:11px;margin-top:4px" [style.color]="count() === opt.value ? '#F26B3A' : '#7B8597'">~{{opt.min}}min</div>
            </button>
          }
        </div>
      </div>

      <!-- Timer -->
      <div class="card" style="margin-bottom:24px">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div>
            <div style="font-size:15px;font-weight:600;color:#0F1B3D">Cronômetro</div>
            <div style="font-size:12px;color:#7B8597;margin-top:2px">Mede o tempo total do simulado</div>
          </div>
          <button (click)="toggleTimer()"
            [style.background]="timer() ? '#F26B3A' : '#ECEEF3'"
            style="width:48px;height:28px;border-radius:999px;border:none;cursor:pointer;transition:background .15s;position:relative">
            <span [style.left]="timer() ? '22px' : '4px'"
              style="position:absolute;top:4px;width:20px;height:20px;border-radius:50%;background:#fff;transition:left .15s;box-shadow:0 1px 3px rgba(0,0,0,.2)"></span>
          </button>
        </div>
      </div>

      <!-- Summary bar -->
      <div class="card" style="background:#0F1B3D;border:none;display:flex;align-items:center;justify-content:space-between;gap:16px">
        <div style="display:flex;gap:24px">
          <div>
            <div style="font-size:11px;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:.07em">Modo</div>
            <div style="font-size:14px;font-weight:600;color:#fff;margin-top:3px">{{mode() === 'foco' ? 'Foco' : 'Geral'}}</div>
          </div>
          @if (mode() === 'foco' && selectedArea()) {
            <div>
              <div style="font-size:11px;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:.07em">Área</div>
              <div style="font-size:14px;font-weight:600;margin-top:3px" [style.color]="areaConfig()?.color ?? '#fff'">{{areaConfig()?.short}}</div>
            </div>
          }
          <div>
            <div style="font-size:11px;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:.07em">Questões</div>
            <div style="font-size:14px;font-weight:600;color:#fff;margin-top:3px">{{count()}}</div>
          </div>
          <div>
            <div style="font-size:11px;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:.07em">Tempo est.</div>
            <div style="font-size:14px;font-weight:600;color:#fff;margin-top:3px">~{{estimatedMin()}}min</div>
          </div>
        </div>
        <button class="btn btn-primary btn-lg" [disabled]="!canStart()" (click)="start()"
          style="flex-shrink:0;white-space:nowrap">
          @if (loading()) { Carregando... }
          @else { Começar simulado
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 12H19M13 6l6 6-6 6"/></svg>
          }
        </button>
      </div>

      @if (error()) {
        <div style="margin-top:12px;padding:12px 16px;background:#FEE2E2;border-radius:10px;color:#C73A1E;font-size:13px">
          {{error()}}
        </div>
      }
    </div>
  `,
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
