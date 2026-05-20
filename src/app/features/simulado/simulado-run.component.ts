import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService, SubmitAttemptDto } from '../../core/api.service';
import { StudentService } from '../../core/student.service';
import { ExamStateService } from '../../core/exam-state.service';
import { getAreaByName } from '../../core/areas.config';

@Component({
  selector: 'app-simulado-run',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    .opt-btn {
      display:flex;align-items:flex-start;gap:12px;width:100%;padding:14px 16px;border-radius:10px;
      border:2px solid #ECEEF3;background:#fff;text-align:left;cursor:pointer;transition:all .15s;font-size:14px;
    }
    .opt-btn:hover { border-color:#ccc; background:#FAFBFD; }
    .opt-btn.selected { border-color:#F26B3A; background:#FFF5F0; }
    .opt-letter {
      width:28px;height:28px;border-radius:50%;border:2px solid #ECEEF3;
      display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;
      color:#7B8597;flex-shrink:0;transition:all .15s;
    }
    .opt-btn.selected .opt-letter { background:#F26B3A;border-color:#F26B3A;color:#fff; }
    .q-dot { width:10px;height:10px;border-radius:50%;background:#ECEEF3;cursor:pointer;transition:background .15s; }
    .q-dot.answered { background:#059669; }
    .q-dot.current { background:#F26B3A; }
  `],
  template: `
    <div style="min-height:100vh;background:#F5F6FA;display:flex;flex-direction:column">
      <!-- Top bar -->
      <div style="background:#0F1B3D;padding:0 24px;height:60px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0">
        <div style="display:flex;align-items:center;gap:16px">
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
            <rect x="2" y="2" width="36" height="36" rx="10" fill="#F26B3A"/>
            <path d="M11 26 L11 14 L17 14 L17 26 Z" fill="#fff"/>
            <path d="M20 26 L20 18 L26 18 L26 26 Z" fill="#fff" opacity=".7"/>
            <path d="M29 26 L29 10 L31 10 L31 26 Z" fill="#fff" opacity=".4"/>
          </svg>
          <span style="color:#fff;font-size:15px;font-weight:600">
            {{config()?.mode === 'foco' ? 'Foco · ' + (areaShort()) : 'Simulado Geral'}}
          </span>
        </div>
        <div style="display:flex;align-items:center;gap:20px">
          @if (config()?.timed) {
            <div style="display:flex;align-items:center;gap:7px;color:#fff">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
              </svg>
              <span style="font-size:14px;font-weight:600;font-variant-numeric:tabular-nums">{{timerDisplay()}}</span>
            </div>
          }
          <div style="color:rgba(255,255,255,.6);font-size:13px">
            <span style="color:#fff;font-weight:600">{{current() + 1}}</span> / {{total()}}
          </div>
          <button (click)="confirmQuit()" style="color:rgba(255,255,255,.5);font-size:12px;border:1px solid rgba(255,255,255,.2);background:transparent;border-radius:6px;padding:5px 10px;cursor:pointer">
            Sair
          </button>
        </div>
      </div>

      <!-- Progress bar -->
      <div style="height:4px;background:rgba(255,255,255,.1);background-color:#E5E7EB">
        <div [style.width.%]="progressPct()" style="height:100%;background:#F26B3A;transition:width .3s"></div>
      </div>

      <div style="flex:1;display:grid;grid-template-columns:1fr 280px;max-width:1100px;margin:0 auto;width:100%;padding:24px;gap:20px;align-items:start">
        <!-- Main question -->
        <div>
          <div class="card" style="margin-bottom:16px">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
              <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#7B8597">
                Questão {{current() + 1}}
              </span>
              @if (currentQ()?.area) {
                <span style="padding:3px 9px;border-radius:999px;font-size:10.5px;font-weight:600"
                  [style.background]="areaSoft(currentQ()!.area)"
                  [style.color]="areaColor(currentQ()!.area)">
                  {{areaShortByName(currentQ()!.area)}}
                </span>
              }
              @if (currentQ()?.subject) {
                <span style="padding:3px 9px;border-radius:999px;font-size:10.5px;background:#F2F4F8;color:#7B8597">
                  {{currentQ()!.subject}}
                </span>
              }
            </div>
            <p style="font-size:15px;line-height:1.7;color:#1E2535;margin:0 0 22px;white-space:pre-line">{{currentQ()?.statement}}</p>
            <div style="display:flex;flex-direction:column;gap:8px">
              @for (opt of options; track opt.key) {
                <button class="opt-btn" [class.selected]="answers()[current()] === opt.key" (click)="select(opt.key)">
                  <div class="opt-letter">{{opt.key}}</div>
                  <span style="flex:1;line-height:1.55;color:#1E2535;padding-top:4px">{{currentQ()?.[opt.field]}}</span>
                </button>
              }
            </div>
          </div>

          <!-- Navigation -->
          <div style="display:flex;justify-content:space-between;align-items:center">
            <button class="btn btn-secondary btn-md" [disabled]="current() === 0" (click)="prev()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>
              Anterior
            </button>
            @if (current() < total() - 1) {
              <button class="btn btn-primary btn-md" (click)="next()">
                Próxima
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 12H19M13 6l6 6-6 6"/></svg>
              </button>
            } @else {
              <button class="btn btn-primary btn-md" (click)="submit()" [disabled]="submitting()">
                {{submitting() ? 'Enviando...' : 'Finalizar simulado'}}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20,6 9,17 4,12"/></svg>
              </button>
            }
          </div>
        </div>

        <!-- Sidebar -->
        <div style="position:sticky;top:24px">
          <div class="card" style="margin-bottom:14px">
            <div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:#7B8597;margin-bottom:12px">Progresso</div>
            <div style="display:flex;flex-wrap:wrap;gap:6px">
              @for (q of questions(); track $index) {
                <div class="q-dot"
                  [class.answered]="answers()[$index] && $index !== current()"
                  [class.current]="$index === current()"
                  (click)="goTo($index)"
                  [title]="'Questão ' + ($index + 1)"></div>
              }
            </div>
            <div style="margin-top:14px;display:flex;gap:12px;font-size:11px;color:#7B8597">
              <span style="display:flex;align-items:center;gap:5px">
                <span style="width:8px;height:8px;border-radius:50%;background:#059669;display:inline-block"></span> Respondida
              </span>
              <span style="display:flex;align-items:center;gap:5px">
                <span style="width:8px;height:8px;border-radius:50%;background:#F26B3A;display:inline-block"></span> Atual
              </span>
            </div>
          </div>

          <div class="card">
            <div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.07em;color:#7B8597;margin-bottom:10px">Resumo</div>
            <div style="display:flex;flex-direction:column;gap:6px;font-size:13px">
              <div style="display:flex;justify-content:space-between">
                <span style="color:#7B8597">Respondidas</span>
                <span style="font-weight:600;color:#0F1B3D">{{answeredCount()}} / {{total()}}</span>
              </div>
              <div style="height:6px;background:#F2F4F8;border-radius:999px;overflow:hidden;margin:4px 0">
                <div [style.width.%]="progressPct()" style="height:100%;background:#059669;border-radius:999px;transition:width .3s"></div>
              </div>
              @if (config()?.timed) {
                <div style="display:flex;justify-content:space-between;margin-top:2px">
                  <span style="color:#7B8597">Tempo</span>
                  <span style="font-weight:600;color:#0F1B3D;font-variant-numeric:tabular-nums">{{timerDisplay()}}</span>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>

    @if (showQuitModal()) {
      <div style="position:fixed;inset:0;background:rgba(0,0,0,.5);display:grid;place-items:center;z-index:999" (click)="showQuitModal.set(false)">
        <div class="card" style="max-width:380px;width:90%;padding:28px" (click)="$event.stopPropagation()">
          <h3 style="margin:0 0 8px;font-size:18px;font-weight:700;color:#0F1B3D">Sair do simulado?</h3>
          <p style="margin:0 0 20px;font-size:14px;color:#7B8597;line-height:1.6">Seu progresso será perdido. Tem certeza que deseja sair?</p>
          <div style="display:flex;gap:10px">
            <button class="btn btn-secondary btn-md" style="flex:1" (click)="showQuitModal.set(false)">Continuar</button>
            <button class="btn btn-primary btn-md" style="flex:1;background:#C73A1E;border-color:#C73A1E" (click)="quit()">Sair</button>
          </div>
        </div>
      </div>
    }
  `,
})
export class SimuladoRunComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private router = inject(Router);
  private student = inject(StudentService);
  examState = inject(ExamStateService);

  questions = this.examState.questions;
  answers = this.examState.answers;
  config = this.examState.config;

  current = signal(0);
  submitting = signal(false);
  showQuitModal = signal(false);
  elapsed = signal(0);

  private timerInterval: any;
  private startTime = Date.now();

  readonly options = [
    { key: 'A', field: 'optionA' as const },
    { key: 'B', field: 'optionB' as const },
    { key: 'C', field: 'optionC' as const },
    { key: 'D', field: 'optionD' as const },
    { key: 'E', field: 'optionE' as const },
  ];

  total = computed(() => this.questions().length);
  currentQ = computed(() => this.questions()[this.current()]);
  answeredCount = computed(() => Object.keys(this.answers()).length);
  progressPct = computed(() => this.total() > 0 ? (this.answeredCount() / this.total()) * 100 : 0);
  timerDisplay = computed(() => {
    const s = this.elapsed();
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  });
  areaShort = computed(() => {
    const name = this.config()?.areaName;
    return name ? (getAreaByName(name)?.short ?? name) : '';
  });

  ngOnInit() {
    if (!this.student.name || !this.questions().length) {
      this.router.navigate(['/simulado']);
      return;
    }
    if (this.config()?.timed) {
      this.timerInterval = setInterval(() => this.elapsed.update(e => e + 1), 1000);
    }
  }

  ngOnDestroy() { if (this.timerInterval) clearInterval(this.timerInterval); }

  select(opt: string) { this.examState.setAnswer(this.current(), opt); }
  prev() { if (this.current() > 0) this.current.update(c => c - 1); }
  next() { if (this.current() < this.total() - 1) this.current.update(c => c + 1); }
  goTo(idx: number) { this.current.set(idx); }
  confirmQuit() { this.showQuitModal.set(true); }
  quit() { this.examState.reset(); this.router.navigate(['/home']); }

  areaSoft(name: string) { return getAreaByName(name)?.soft ?? '#F5F6FA'; }
  areaColor(name: string) { return getAreaByName(name)?.color ?? '#888'; }
  areaShortByName(name: string) { return getAreaByName(name)?.short ?? name; }

  submit() {
    if (this.submitting()) return;
    this.submitting.set(true);
    if (this.timerInterval) clearInterval(this.timerInterval);

    const dto: SubmitAttemptDto = {
      attemptId: this.examState.attemptId(),
      timeTakenSeconds: this.config()?.timed ? this.elapsed() : undefined,
      answers: this.questions().map((q, idx) => ({
        questionId: q.id,
        selectedOption: this.answers()[idx] ?? 'A',
      })),
    };

    this.api.submitAttempt(dto).subscribe({
      next: result => {
        this.examState.reset();
        this.router.navigate(['/resultado', result.attemptId]);
      },
      error: () => { this.submitting.set(false); },
    });
  }
}
