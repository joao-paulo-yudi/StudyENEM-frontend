import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService, AttemptResultDto } from '../../core/api.service';
import { getAreaByName } from '../../core/areas.config';

@Component({
  selector: 'app-resultado',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page" style="max-width:860px">
      @if (!result()) {
        <div style="text-align:center;padding:80px 0;color:#7B8597">Carregando resultado...</div>
      }
      @if (result(); as r) {
        <!-- Header -->
        <div style="margin-bottom:28px;text-align:center">
          <div style="font-size:12px;color:#7B8597;text-transform:uppercase;letter-spacing:.08em;font-weight:600;margin-bottom:8px">Simulado finalizado</div>
          <h1 style="margin:0;font-size:28px;font-weight:700;color:#0F1B3D;letter-spacing:-.025em">
            @if (r.score >= 70) { Excelente resultado! }
            @else if (r.score >= 50) { Bom trabalho! Continue assim. }
            @else { Continue praticando! }
          </h1>
          <p style="color:#7B8597;font-size:14px;margin:6px 0 0">{{fmtDate(r.finishedAt)}} · {{r.totalQuestions}} questões</p>
        </div>

        <!-- Score ring + stats -->
        <div class="card" style="margin-bottom:18px;display:flex;align-items:center;gap:32px;flex-wrap:wrap">
          <div style="position:relative;width:150px;height:150px;flex-shrink:0">
            <svg width="150" height="150">
              <circle cx="75" cy="75" r="62" stroke="#F0F2F7" stroke-width="14" fill="none"/>
              <circle cx="75" cy="75" r="62" stroke="#F26B3A" stroke-width="14" fill="none"
                stroke-linecap="round"
                [attr.stroke-dasharray]="circ"
                [attr.stroke-dashoffset]="ringOffset(r.score)"
                transform="rotate(-90 75 75)"
                style="transition:stroke-dashoffset 800ms cubic-bezier(.5,.1,.2,1)"/>
            </svg>
            <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">
              <div style="font-size:32px;font-weight:700;color:#0F1B3D;letter-spacing:-.03em;line-height:1">{{r.score | number:'1.0-0'}}%</div>
              <div style="font-size:12px;color:#7B8597;margin-top:4px">aproveitamento</div>
            </div>
          </div>

          <div style="flex:1;display:grid;grid-template-columns:repeat(3,1fr);gap:16px;min-width:260px">
            <div style="text-align:center">
              <div style="font-size:28px;font-weight:700;color:#059669;letter-spacing:-.03em">{{r.correctAnswers}}</div>
              <div style="font-size:12px;color:#7B8597;margin-top:4px">acertos</div>
            </div>
            <div style="text-align:center">
              <div style="font-size:28px;font-weight:700;color:#C73A1E;letter-spacing:-.03em">{{r.totalQuestions - r.correctAnswers}}</div>
              <div style="font-size:12px;color:#7B8597;margin-top:4px">erros</div>
            </div>
            <div style="text-align:center">
              <div style="font-size:28px;font-weight:700;color:#0F1B3D;letter-spacing:-.03em">{{r.totalQuestions}}</div>
              <div style="font-size:12px;color:#7B8597;margin-top:4px">questões</div>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div style="display:flex;gap:2px;background:#F2F4F8;border-radius:10px;padding:4px;margin-bottom:18px">
          @for (t of tabs; track t.id) {
            <button (click)="tab.set(t.id)"
              [style.background]="tab() === t.id ? '#fff' : 'transparent'"
              [style.color]="tab() === t.id ? '#0F1B3D' : '#7B8597'"
              [style.font-weight]="tab() === t.id ? '600' : '400'"
              style="flex:1;padding:9px 12px;border:none;border-radius:8px;cursor:pointer;font-size:14px;transition:all .15s;box-shadow:none">
              {{t.label}}
            </button>
          }
        </div>

        <!-- Tab: Gabarito -->
        @if (tab() === 'gabarito') {
          <div style="display:flex;flex-direction:column;gap:12px">
            @for (ans of r.answerDetails; track ans.questionId; let i = $index) {
              <div class="card" style="padding:16px 18px;display:flex;align-items:center;gap:16px;border-left:4px solid"
                [style.border-left-color]="ans.isCorrect ? '#059669' : '#C73A1E'">
                <div style="width:32px;height:32px;border-radius:50%;display:grid;place-items:center;flex-shrink:0"
                  [style.background]="ans.isCorrect ? '#DCF5EB' : '#FEE2E2'">
                  @if (ans.isCorrect) {
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20,6 9,17 4,12"/></svg>
                  } @else {
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C73A1E" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  }
                </div>
                <div style="flex:1;min-width:0">
                  <div style="font-size:13.5px;font-weight:500;color:#0F1B3D">Questão {{i + 1}} · {{ans.topic}}</div>
                  <div style="font-size:12px;color:#7B8597;margin-top:2px">
                    Sua resposta: <strong [style.color]="ans.isCorrect ? '#059669' : '#C73A1E'">{{ans.selectedOption}}</strong>
                    @if (!ans.isCorrect) { &nbsp;· Correta: <strong style="color:#059669">{{ans.correctOption}}</strong> }
                  </div>
                </div>
                <div style="display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:600;flex-shrink:0"
                  [style.background]="areaSoft(ans.area)" [style.color]="areaColor(ans.area)">
                  {{areaShort(ans.area)}}
                </div>
              </div>
            }
          </div>
        }

        <!-- Tab: Por área -->
        @if (tab() === 'areas') {
          <div style="display:flex;flex-direction:column;gap:14px">
            @for (a of byArea(r); track a.area) {
              <div class="card" style="padding:18px 20px">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
                  <div style="display:flex;align-items:center;gap:10px">
                    <span style="width:10px;height:10px;border-radius:50%" [style.background]="areaColor(a.area)"></span>
                    <span style="font-size:15px;font-weight:600;color:#0F1B3D">{{areaShort(a.area)}}</span>
                  </div>
                  <div style="display:flex;align-items:baseline;gap:4px">
                    <span style="font-size:20px;font-weight:700" [style.color]="a.pct >= 60 ? '#059669' : a.pct >= 40 ? '#B8841C' : '#C73A1E'">{{a.pct}}%</span>
                    <span style="font-size:12px;color:#7B8597">{{a.correct}}/{{a.total}}</span>
                  </div>
                </div>
                <div style="height:8px;background:#F2F4F8;border-radius:999px;overflow:hidden">
                  <div [style.width.%]="a.pct" style="height:100%;border-radius:999px;transition:width 700ms"
                    [style.background]="areaColor(a.area)"></div>
                </div>
              </div>
            }
          </div>
        }

        <!-- Tab: Sugestões -->
        @if (tab() === 'sugestoes') {
          <div style="display:flex;flex-direction:column;gap:12px">
            @for (t of topicSuggestions(r); track t.topic) {
              <div class="card" style="padding:16px 18px;display:flex;align-items:center;gap:14px">
                <div style="width:4px;height:40px;border-radius:2px;flex-shrink:0" [style.background]="areaColor(t.area)"></div>
                <div style="flex:1">
                  <div style="font-size:14px;font-weight:600;color:#0F1B3D">{{t.topic}}</div>
                  <div style="font-size:12px;color:#7B8597;margin-top:3px">{{t.wrong}} {{t.wrong === 1 ? 'erro' : 'erros'}} · {{areaShort(t.area)}}</div>
                </div>
                <div style="font-size:12px;padding:4px 10px;border-radius:999px;font-weight:600"
                  [style.background]="areaSoft(t.area)" [style.color]="areaColor(t.area)">
                  Revisar
                </div>
              </div>
            }
            @if (topicSuggestions(r).length === 0) {
              <div class="card" style="text-align:center;padding:32px;color:#7B8597">Parabéns! Nenhum tópico crítico identificado.</div>
            }
          </div>
        }

        <!-- Actions -->
        <div style="display:flex;gap:12px;margin-top:24px;flex-wrap:wrap">
          <button class="btn btn-primary btn-lg" (click)="goSimulado()">
            Novo simulado
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 12H19M13 6l6 6-6 6"/></svg>
          </button>
          <button class="btn btn-secondary btn-lg" (click)="goHome()">Voltar ao início</button>
          <button class="btn btn-secondary btn-lg" (click)="goDesempenho()">Ver desempenho</button>
        </div>
      }
    </div>
  `,
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
