import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService, PerformanceSummaryDto } from '../../core/api.service';
import { StudentService } from '../../core/student.service';
import { AREA_LIST, getAreaByName } from '../../core/areas.config';

@Component({
  selector: 'app-desempenho',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div style="margin-bottom:28px">
        <h1 style="margin:0;font-size:26px;font-weight:700;color:#0F1B3D;letter-spacing:-.025em">Desempenho</h1>
        <p style="margin:6px 0 0;color:#7B8597;font-size:14px">Análise detalhada da sua evolução nos estudos</p>
      </div>

      @if (!data()) {
        <div style="text-align:center;padding:80px 0;color:#7B8597">Carregando...</div>
      }

      @if (data(); as d) {
        <!-- KPIs -->
        <div class="grid-4" style="margin-bottom:22px">
          <div class="card" style="padding:18px">
            <div style="font-size:11px;color:#7B8597;text-transform:uppercase;letter-spacing:.07em;font-weight:600">Simulados</div>
            <div style="font-size:30px;font-weight:700;color:#0F1B3D;margin-top:8px;line-height:1">{{d.totalAttempts}}</div>
            <div style="font-size:11.5px;color:#7B8597;margin-top:6px">total realizados</div>
          </div>
          <div class="card" style="padding:18px">
            <div style="font-size:11px;color:#7B8597;text-transform:uppercase;letter-spacing:.07em;font-weight:600">Questões</div>
            <div style="font-size:30px;font-weight:700;color:#0F1B3D;margin-top:8px;line-height:1">{{d.totalQuestions}}</div>
            <div style="font-size:11.5px;color:#7B8597;margin-top:6px">{{d.totalCorrect}} acertos</div>
          </div>
          <div class="card" style="padding:18px">
            <div style="font-size:11px;color:#7B8597;text-transform:uppercase;letter-spacing:.07em;font-weight:600">Aproveitamento</div>
            <div style="font-size:30px;font-weight:700;margin-top:8px;line-height:1"
              [style.color]="overallPct(d) >= 60 ? '#059669' : overallPct(d) >= 40 ? '#B8841C' : '#C73A1E'">
              {{overallPct(d)}}%
            </div>
            <div style="font-size:11.5px;color:#7B8597;margin-top:6px">média geral</div>
          </div>
          <div class="card" style="padding:18px">
            <div style="font-size:11px;color:#7B8597;text-transform:uppercase;letter-spacing:.07em;font-weight:600">Horas estudadas</div>
            <div style="font-size:30px;font-weight:700;color:#0F1B3D;margin-top:8px;line-height:1">{{studyHours(d)}}h</div>
            <div style="font-size:11.5px;color:#7B8597;margin-top:6px">tempo total</div>
          </div>
        </div>

        <div class="grid-2" style="margin-bottom:22px">
          <!-- Evolution chart -->
          <div class="card">
            <div style="margin-bottom:16px">
              <h3 style="margin:0;font-size:15px;font-weight:600;color:#0F1B3D">Evolução do aproveitamento</h3>
              <div style="font-size:12px;color:#7B8597;margin-top:3px">Últimos {{evoData(d).length}} simulados</div>
            </div>
            @if (evoData(d).length >= 2) {
              <svg viewBox="0 0 220 100" preserveAspectRatio="none" style="width:100%;height:140px">
                <defs>
                  <linearGradient id="dGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#F26B3A" stop-opacity="0.18"/>
                    <stop offset="100%" stop-color="#F26B3A" stop-opacity="0"/>
                  </linearGradient>
                </defs>
                @for (g of gridLines; track g) {
                  <line x1="10" x2="210" [attr.y1]="10+(1-g/100)*80" [attr.y2]="10+(1-g/100)*80"
                    stroke="#F0F2F7" stroke-width="0.5"/>
                  <text [attr.x]="6" [attr.y]="14+(1-g/100)*80" font-size="7" fill="#BABDCC" text-anchor="end">{{g}}%</text>
                }
                <path [attr.d]="evoArea(d)" fill="url(#dGrad)"/>
                <path [attr.d]="evoPath(d)" stroke="#F26B3A" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                @for (pt of evoPoints(d); track $index) {
                  <circle [attr.cx]="pt.x" [attr.cy]="pt.y" r="2.5" fill="#fff" stroke="#F26B3A" stroke-width="1.2"/>
                }
              </svg>
              <div style="display:flex;justify-content:space-between;font-size:10px;color:#9AA3B5;margin-top:4px;padding:0 10px">
                @for (e of evoData(d); track $index) {
                  <span>{{fmtShort(e.date)}}</span>
                }
              </div>
            } @else {
              <div style="text-align:center;padding:40px 0;color:#7B8597;font-size:13px">
                Faça mais simulados para visualizar a evolução
              </div>
            }
          </div>

          <!-- Radar chart -->
          <div class="card">
            <div style="margin-bottom:16px">
              <h3 style="margin:0;font-size:15px;font-weight:600;color:#0F1B3D">Radar por área</h3>
              <div style="font-size:12px;color:#7B8597;margin-top:3px">Desempenho comparativo</div>
            </div>
            @if (d.byArea.length > 0) {
              <div style="display:flex;align-items:center;justify-content:center">
                <svg viewBox="0 0 200 200" style="width:180px;height:180px">
                  <!-- Grid circles -->
                  @for (r of [25,50,75,100]; track r) {
                    <polygon [attr.points]="radarGrid(r)" fill="none" stroke="#F0F2F7" stroke-width="0.8"/>
                  }
                  <!-- Axes -->
                  @for (a of radarAxes(); track $index) {
                    <line x1="100" y1="100" [attr.x2]="a.x2" [attr.y2]="a.y2" stroke="#E5E7EB" stroke-width="0.8"/>
                    <text [attr.x]="a.lx" [attr.y]="a.ly" font-size="8.5" fill="#7B8597" text-anchor="middle">{{a.label}}</text>
                  }
                  <!-- Data polygon -->
                  @if (radarData(d)) {
                    <polygon [attr.points]="radarData(d)" fill="#F26B3A" fill-opacity="0.15" stroke="#F26B3A" stroke-width="1.5"/>
                  }
                </svg>
              </div>
            } @else {
              <div style="text-align:center;padding:40px 0;color:#7B8597;font-size:13px">Sem dados de área ainda</div>
            }
          </div>
        </div>

        <!-- By area table -->
        <div class="card" style="margin-bottom:22px">
          <div style="margin-bottom:16px">
            <h3 style="margin:0;font-size:15px;font-weight:600;color:#0F1B3D">Desempenho por área</h3>
          </div>
          @if (d.byArea.length === 0) {
            <div style="color:#7B8597;font-size:13px;text-align:center;padding:20px 0">Faça simulados para ver dados por área</div>
          }
          <div style="display:flex;flex-direction:column;gap:14px">
            @for (a of sortedByArea(d); track a.area) {
              <div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:7px">
                  <div style="display:flex;align-items:center;gap:9px">
                    <span style="width:10px;height:10px;border-radius:50%" [style.background]="areaColor(a.area)"></span>
                    <span style="font-size:14px;font-weight:500;color:#0F1B3D">{{areaShort(a.area)}}</span>
                  </div>
                  <div style="display:flex;align-items:baseline;gap:8px">
                    <span style="font-size:16px;font-weight:700" [style.color]="a.pct >= 60 ? '#059669' : a.pct >= 40 ? '#B8841C' : '#C73A1E'">{{a.pct}}%</span>
                    <span style="font-size:12px;color:#7B8597">{{a.correct}}/{{a.total}} acertos</span>
                  </div>
                </div>
                <div style="height:8px;background:#F2F4F8;border-radius:999px;overflow:hidden">
                  <div [style.width.%]="a.pct" style="height:100%;border-radius:999px;transition:width 700ms"
                    [style.background]="areaColor(a.area)"></div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- History table -->
        <div class="card">
          <div style="margin-bottom:16px">
            <h3 style="margin:0;font-size:15px;font-weight:600;color:#0F1B3D">Histórico de simulados</h3>
          </div>
          @if (d.recentAttempts.length === 0) {
            <div style="color:#7B8597;font-size:13px;text-align:center;padding:24px 0">Nenhum simulado realizado ainda</div>
          }
          <table class="data-table" style="width:100%">
            <thead>
              <tr>
                <th>Data</th><th>Modo</th><th>Questões</th><th>Acertos</th><th>Aproveitamento</th><th>Tempo</th>
              </tr>
            </thead>
            <tbody>
              @for (h of d.recentAttempts; track h.attemptId) {
                <tr>
                  <td>{{fmtDate(h.date)}}</td>
                  <td>
                    <span style="padding:3px 8px;border-radius:6px;background:#F2F4F8;color:#5A6478;font-weight:500;font-size:12px">
                      {{h.mode === 'foco' ? 'Foco · ' + areaShort(h.area) : 'Geral'}}
                    </span>
                  </td>
                  <td>{{h.total}}</td>
                  <td style="color:#059669;font-weight:600">{{h.correct}}</td>
                  <td>
                    <span style="font-weight:700"
                      [style.color]="h.score >= 60 ? '#059669' : h.score >= 40 ? '#B8841C' : '#C73A1E'">
                      {{h.score | number:'1.0-0'}}%
                    </span>
                  </td>
                  <td style="color:#7B8597">{{h.timeTakenSeconds ? fmtMin(h.timeTakenSeconds) : '–'}}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
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
