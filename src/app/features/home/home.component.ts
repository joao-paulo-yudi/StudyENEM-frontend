import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService, PerformanceSummaryDto } from '../../core/api.service';
import { StudentService } from '../../core/student.service';
import { getAreaByName } from '../../core/areas.config';
import { ExamStateService } from '../../core/exam-state.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (!hasStudent) {
      <div style="display:flex;align-items:center;justify-content:center;min-height:100vh;padding:32px">
        <div class="card" style="max-width:440px;width:100%;padding:40px;text-align:center">
          <div style="display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:24px">
            <svg width="34" height="34" viewBox="0 0 40 40" fill="none">
              <rect x="2" y="2" width="36" height="36" rx="10" fill="#0F1B3D"/>
              <path d="M11 26 L11 14 L17 14 L17 26 Z" fill="#F26B3A"/>
              <path d="M20 26 L20 18 L26 18 L26 26 Z" fill="#FFD166"/>
              <path d="M29 26 L29 10 L31 10 L31 26 Z" fill="#8DD5C0"/>
            </svg>
            <span style="font-size:22px;font-weight:700;color:#0F1B3D;letter-spacing:-.02em">StudyENEM</span>
          </div>
          <h2 style="font-size:24px;font-weight:700;color:#0F1B3D;margin-bottom:8px;letter-spacing:-.025em">Bem-vindo</h2>
          <p style="color:#7B8597;font-size:14px;margin-bottom:28px">Informe seu nome para acompanhar seu desempenho personalizado</p>
          <input [(ngModel)]="nameInput" placeholder="Seu nome completo" style="width:100%;margin-bottom:14px"
                 (keyup.enter)="saveName()" />
          <button class="btn btn-primary btn-md" style="width:100%" (click)="saveName()" [disabled]="!nameInput.trim()">
            Começar agora
          </button>
        </div>
      </div>
    }

    @if (hasStudent) {
      <div class="page">
        <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:28px">
          <div>
            <div style="font-size:12px;color:#7B8597;text-transform:uppercase;letter-spacing:.08em;font-weight:600">Bom dia, {{firstName}}</div>
            <h1 style="margin:6px 0 0;font-size:28px;font-weight:700;color:#0F1B3D;letter-spacing:-.025em">
              @if (!data) { Carregando seu desempenho... }
              @else if (data.totalAttempts === 0) { Faça seu primeiro simulado! }
              @else { {{data.totalAttempts}} simulado{{data.totalAttempts !== 1 ? 's' : ''}} realizados. Continue evoluindo! }
            </h1>
          </div>
          <button class="btn btn-primary btn-lg" (click)="go('simulado')">
            Iniciar simulado
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 12 H19 M13 6 L19 12 L13 18"/></svg>
          </button>
        </div>

        @if (data) {
          <div class="grid-4" style="margin-bottom:22px">
            <div class="card" style="padding:18px">
              <div style="font-size:11.5px;color:#7B8597;text-transform:uppercase;letter-spacing:.06em;font-weight:600">Simulados realizados</div>
              <div style="font-size:30px;font-weight:700;color:#0F1B3D;margin-top:8px;letter-spacing:-.03em;line-height:1">{{data.totalAttempts}}</div>
              <div style="font-size:11.5px;color:#7B8597;margin-top:6px">histórico total</div>
            </div>
            <div class="card" style="padding:18px">
              <div style="font-size:11.5px;color:#7B8597;text-transform:uppercase;letter-spacing:.06em;font-weight:600">Questões respondidas</div>
              <div style="font-size:30px;font-weight:700;color:#0F1B3D;margin-top:8px;letter-spacing:-.03em;line-height:1">{{data.totalQuestions}}</div>
              <div style="font-size:11.5px;color:#7B8597;margin-top:6px">{{data.totalCorrect}} acertos</div>
            </div>
            <div class="card" style="padding:18px">
              <div style="font-size:11.5px;color:#7B8597;text-transform:uppercase;letter-spacing:.06em;font-weight:600">Aproveitamento geral</div>
              <div style="font-size:30px;font-weight:700;color:#0F1B3D;margin-top:8px;letter-spacing:-.03em;line-height:1">{{overallPct}}%</div>
              <div [style.color]="overallPct >= 60 ? '#059669' : '#C73A1E'" style="font-size:11.5px;margin-top:6px">
                {{data.totalCorrect}} de {{data.totalQuestions}} questões
              </div>
            </div>
            <div class="card" style="padding:18px">
              <div style="font-size:11.5px;color:#7B8597;text-transform:uppercase;letter-spacing:.06em;font-weight:600">Horas estudadas</div>
              <div style="font-size:30px;font-weight:700;color:#0F1B3D;margin-top:8px;letter-spacing:-.03em;line-height:1">{{studyHours}}h</div>
              <div style="font-size:11.5px;color:#7B8597;margin-top:6px">tempo total</div>
            </div>
          </div>

          <div class="grid-2-1" style="margin-bottom:18px">
            <div class="card">
              <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:16px">
                <div>
                  <h3 style="margin:0;font-size:15px;font-weight:600;color:#0F1B3D">Evolução do desempenho</h3>
                  <div style="font-size:12px;color:#7B8597;margin-top:3px">Aproveitamento dos últimos simulados</div>
                </div>
              </div>
              <div style="display:flex;gap:24px;align-items:center">
                <div style="position:relative;width:130px;height:130px;flex-shrink:0">
                  <svg width="130" height="130">
                    <circle cx="65" cy="65" r="54" stroke="#F0F2F7" stroke-width="12" fill="none"/>
                    <circle cx="65" cy="65" r="54" stroke="#F26B3A" stroke-width="12" fill="none"
                      stroke-linecap="round"
                      [attr.stroke-dasharray]="circumference"
                      [attr.stroke-dashoffset]="ringOffset"
                      transform="rotate(-90 65 65)"
                      style="transition:stroke-dashoffset 700ms cubic-bezier(.5,.1,.2,1)"/>
                  </svg>
                  <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
                    <div style="font-size:26px;font-weight:700;color:#0F1B3D;letter-spacing:-.03em;line-height:1">{{overallPct}}%</div>
                    <div style="font-size:11px;color:#7B8597;margin-top:4px">{{data.totalCorrect}}/{{data.totalQuestions}}</div>
                  </div>
                </div>
                <div style="flex:1;min-width:0">
                  @if (evolution.length >= 2) {
                    <svg viewBox="0 0 100 70" preserveAspectRatio="none" style="width:100%;height:110px">
                      <defs>
                        <linearGradient id="evGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stop-color="#F26B3A" stop-opacity="0.15"/>
                          <stop offset="100%" stop-color="#F26B3A" stop-opacity="0"/>
                        </linearGradient>
                      </defs>
                      @for (g of gridLines; track g) {
                        <line [attr.x1]="6" [attr.x2]="94" [attr.y1]="6+(1-g/100)*56" [attr.y2]="6+(1-g/100)*56" stroke="#F0F2F7" stroke-width="0.4"/>
                      }
                      <path [attr.d]="evoArea" fill="url(#evGrad)"/>
                      <path [attr.d]="evoPath" stroke="#F26B3A" stroke-width="1" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                      @for (pt of evoPoints; track $index) {
                        <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="1.5" fill="#fff" stroke="#F26B3A" stroke-width="0.8"/>
                      }
                    </svg>
                    <div style="display:flex;justify-content:space-between;font-size:10px;color:#9AA3B5;padding:0 4px;margin-top:-2px">
                      @for (e of evolution; track $index) {
                        <span>{{fmtShort(e.date)}}</span>
                      }
                    </div>
                  } @else {
                    <div style="color:#7B8597;font-size:13px;text-align:center;padding:30px 0">Faça mais simulados para ver a evolução</div>
                  }
                </div>
              </div>
            </div>

            <div class="card">
              <div style="margin-bottom:16px">
                <h3 style="margin:0;font-size:15px;font-weight:600;color:#0F1B3D">Desempenho por área</h3>
                <div style="font-size:12px;color:#7B8597;margin-top:3px">Acertos agregados</div>
              </div>
              @if (areaPerf.length === 0) {
                <div style="color:#7B8597;font-size:13px;padding:20px 0">Faça simulados para ver</div>
              }
              <div style="display:flex;flex-direction:column;gap:14px">
                @for (a of areaPerf; track a.id) {
                  <div>
                    <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px">
                      <div style="display:flex;align-items:center;gap:8px">
                        <span style="width:8px;height:8px;border-radius:50%;display:inline-block" [style.background]="a.color"></span>
                        <span style="font-size:13px;font-weight:500;color:#0F1B3D">{{a.short}}</span>
                      </div>
                      <div style="font-size:12px;color:#7B8597">
                        <span style="color:#0F1B3D;font-weight:600;font-size:13px">{{a.pct}}%</span>
                        <span style="margin-left:6px">{{a.correct}}/{{a.total}}</span>
                      </div>
                    </div>
                    <div style="height:8px;background:#F2F4F8;border-radius:999px;overflow:hidden">
                      <div [style.width.%]="a.pct" style="height:100%;border-radius:999px;transition:width 700ms"
                           [style.background]="a.color"></div>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>

          @if (weakest) {
            <div class="card" style="background:#0F1B3D;color:#fff;border:none;margin-bottom:18px">
              <div style="display:flex;align-items:center;gap:22px">
                <div style="width:56px;height:56px;border-radius:14px;display:grid;place-items:center;flex-shrink:0"
                     [style.background]="weakest.color">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2 L15 9 L22 10 L17 15 L18 22 L12 19 L6 22 L7 15 L2 10 L9 9 Z"/>
                  </svg>
                </div>
                <div style="flex:1">
                  <div style="font-size:11.5px;opacity:.6;text-transform:uppercase;letter-spacing:.08em;font-weight:600">Recomendação inteligente</div>
                  <div style="font-size:18px;font-weight:600;margin-top:4px;letter-spacing:-.015em">
                    Foque em <span style="color:#FFD166">{{weakest.short}}</span> — só {{weakest.pct}}% de aproveitamento
                  </div>
                  <div style="font-size:13px;opacity:.7;margin-top:4px">Um simulado focado pode melhorar sua média geral.</div>
                </div>
                <button class="btn btn-primary btn-md" (click)="goFoco(weakest.id)">Treinar área</button>
              </div>
            </div>
          }

          <div class="grid-2">
            <div class="card">
              <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:16px">
                <h3 style="margin:0;font-size:15px;font-weight:600;color:#0F1B3D">Simulados recentes</h3>
                <button class="btn-link" (click)="go('desempenho')">Ver tudo →</button>
              </div>
              @if (data.recentAttempts.length === 0) {
                <div style="color:#7B8597;font-size:13px;text-align:center;padding:20px 0">Nenhum simulado ainda</div>
              }
              <div style="display:flex;flex-direction:column;gap:2px">
                @for (h of data.recentAttempts.slice(0,4); track h.attemptId) {
                  <div style="display:flex;align-items:center;gap:14px;padding:12px 4px;border-bottom:1px solid #F2F4F8">
                    <div style="width:42px;height:42px;border-radius:10px;background:#F2F4F8;display:grid;place-items:center;flex-shrink:0">
                      <div style="font-size:14px;font-weight:700;color:#0F1B3D">{{getDay(h.date)}}</div>
                    </div>
                    <div style="flex:1;min-width:0">
                      <div style="font-size:13.5px;font-weight:500;color:#0F1B3D">
                        {{h.mode === 'foco' ? 'Foco · ' + areaShort(h.area) : 'Simulado Geral'}} · {{h.total}}q
                      </div>
                      <div style="font-size:12px;color:#7B8597;margin-top:2px">
                        {{fmtLong(h.date)}}{{h.timeTakenSeconds ? ' · ' + fmtMin(h.timeTakenSeconds) : ''}}
                      </div>
                    </div>
                    <div style="text-align:right">
                      <div style="font-size:15px;font-weight:700"
                           [style.color]="h.score >= 60 ? '#059669' : h.score >= 40 ? '#B8841C' : '#C73A1E'">
                        {{h.score | number:'1.0-0'}}%
                      </div>
                      <div style="font-size:11px;color:#7B8597">{{h.correct}}/{{h.total}}</div>
                    </div>
                  </div>
                }
              </div>
            </div>

            <div class="card">
              <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:16px">
                <h3 style="margin:0;font-size:15px;font-weight:600;color:#0F1B3D">Conteúdos sugeridos</h3>
                <button class="btn-link" (click)="go('plano')">Ver plano →</button>
              </div>
              @if (topPlan.length === 0) {
                <div style="color:#7B8597;font-size:13px;text-align:center;padding:20px 0">Faça simulados para receber sugestões</div>
              }
              <div style="display:flex;flex-direction:column;gap:10px">
                @for (p of topPlan; track p.topic) {
                  <div style="padding:14px;border:1px solid #ECEEF3;border-radius:11px;display:flex;align-items:center;gap:12px">
                    <div style="width:4px;height:38px;border-radius:2px;flex-shrink:0" [style.background]="areaColor(p.area)"></div>
                    <div style="flex:1;min-width:0">
                      <div style="font-size:13.5px;font-weight:600;color:#0F1B3D">{{p.topic}}</div>
                      <div style="font-size:11.5px;color:#7B8597;margin-top:3px">{{p.reason}}</div>
                    </div>
                    <div style="display:inline-flex;align-items:center;gap:6px;padding:3px 8px;border-radius:999px;font-size:10.5px;font-weight:600;flex-shrink:0"
                         [style.background]="areaSoft(p.area)" [style.color]="areaColor(p.area)">
                      <span style="width:6px;height:6px;border-radius:50%;display:inline-block" [style.background]="areaColor(p.area)"></span>
                      {{areaShort(p.area)}}
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        } @else {
          <div style="color:#7B8597;text-align:center;padding:60px 0">Carregando...</div>
        }
      </div>
    }
  `,
})
export class HomeComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private student = inject(StudentService);
  private examState = inject(ExamStateService);

  data: PerformanceSummaryDto | null = null;
  nameInput = '';
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

  saveName() {
    if (this.nameInput.trim()) { this.student.name = this.nameInput.trim(); this.load(); }
  }

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
