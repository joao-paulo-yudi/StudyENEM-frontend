import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, QuestionDto } from '../../core/api.service';
import { StudentService } from '../../core/student.service';
import { AREA_LIST, getAreaByName } from '../../core/areas.config';

@Component({
  selector: 'app-questoes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:28px;flex-wrap:wrap;gap:12px">
        <div>
          <h1 style="margin:0;font-size:26px;font-weight:700;color:#0F1B3D;letter-spacing:-.025em">Banco de Questões</h1>
          <p style="margin:6px 0 0;color:#7B8597;font-size:14px">Explore e filtre questões por área, assunto e dificuldade</p>
        </div>
      </div>

      <!-- Filters -->
      <div class="card" style="margin-bottom:20px;display:flex;gap:14px;flex-wrap:wrap;align-items:flex-end">
        <div style="flex:1;min-width:180px">
          <label style="font-size:11.5px;font-weight:600;color:#7B8597;display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:.06em">Buscar</label>
          <div style="position:relative">
            <svg style="position:absolute;left:10px;top:50%;transform:translateY(-50%);pointer-events:none" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9AA3B5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input [ngModel]="search()" (ngModelChange)="search.set($event); page.set(1)" placeholder="Buscar por conteúdo..." style="padding-left:34px;width:100%"/>
          </div>
        </div>
        <div style="min-width:160px">
          <label style="font-size:11.5px;font-weight:600;color:#7B8597;display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:.06em">Área</label>
          <select [ngModel]="selectedArea()" (ngModelChange)="selectedArea.set($event); page.set(1)" style="width:100%;padding:10px 12px">
            <option value="">Todas as áreas</option>
            @for (a of areas; track a.id) {
              <option [value]="a.name">{{a.short}}</option>
            }
          </select>
        </div>
        <div style="min-width:130px">
          <label style="font-size:11.5px;font-weight:600;color:#7B8597;display:block;margin-bottom:6px;text-transform:uppercase;letter-spacing:.06em">Dificuldade</label>
          <select [ngModel]="selectedDifficulty()" (ngModelChange)="selectedDifficulty.set($event); page.set(1)" style="width:100%;padding:10px 12px">
            <option value="">Todas</option>
            <option value="fácil">Fácil</option>
            <option value="média">Média</option>
            <option value="difícil">Difícil</option>
          </select>
        </div>
        <button class="btn btn-secondary btn-md" (click)="clearFilters()">Limpar</button>
      </div>

      <!-- Results count -->
      <div style="font-size:13px;color:#7B8597;margin-bottom:14px">
        @if (loading()) { Carregando questões... }
        @else { <strong style="color:#0F1B3D">{{filtered().length}}</strong> questões encontradas }
      </div>

      @if (loading()) {
        <div style="text-align:center;padding:60px;color:#7B8597">Carregando...</div>
      }

      <!-- Questions list -->
      @if (!loading()) {
        <div style="display:flex;flex-direction:column;gap:14px">
          @for (q of paginated(); track q.id) {
            <div class="card" style="padding:0;overflow:hidden">
              <div style="display:flex;align-items:stretch">
                <div style="width:4px;flex-shrink:0" [style.background]="areaColor(q.area)"></div>
                <div style="flex:1;padding:18px 20px">
                  <!-- Header -->
                  <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;flex-wrap:wrap">
                    <span style="font-size:11.5px;font-weight:700;color:#7B8597">Q.{{q.id}}</span>
                    <span style="width:4px;height:4px;border-radius:50%;background:#ECEEF3;display:inline-block"></span>
                    <span style="padding:3px 9px;border-radius:999px;font-size:10.5px;font-weight:600"
                      [style.background]="areaSoft(q.area)" [style.color]="areaColor(q.area)">
                      {{areaShort(q.area)}}
                    </span>
                    <span style="padding:3px 9px;border-radius:999px;font-size:10.5px;background:#F2F4F8;color:#7B8597">
                      {{q.subject}}
                    </span>
                    @if (q.topic) {
                      <span style="padding:3px 9px;border-radius:999px;font-size:10.5px;background:#F2F4F8;color:#7B8597">
                        {{q.topic}}
                      </span>
                    }
                    <span style="margin-left:auto;padding:3px 9px;border-radius:999px;font-size:10.5px;font-weight:600"
                      [style.background]="diffBg(q.difficulty)" [style.color]="diffColor(q.difficulty)">
                      {{q.difficulty}}
                    </span>
                  </div>

                  <!-- Statement (collapsed/expanded) -->
                  <p style="font-size:14px;line-height:1.65;color:#1E2535;margin:0 0 12px;white-space:pre-line"
                    [style.max-height]="expanded().has(q.id) ? 'none' : '72px'"
                    style="overflow:hidden;display:-webkit-box;-webkit-box-orient:vertical"
                    [style.-webkit-line-clamp]="expanded().has(q.id) ? 'unset' : '3'">
                    {{q.statement}}
                  </p>

                  <!-- Options (only when expanded) -->
                  @if (expanded().has(q.id)) {
                    <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:14px">
                      @for (opt of optionsList(q); track opt.key) {
                        <div style="display:flex;align-items:flex-start;gap:10px;padding:10px 12px;border-radius:8px;border:1px solid #ECEEF3;background:#FAFBFD">
                          <span style="width:24px;height:24px;border-radius:50%;border:1.5px solid #ECEEF3;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#7B8597;flex-shrink:0">{{opt.key}}</span>
                          <span style="font-size:13.5px;color:#1E2535;line-height:1.55;padding-top:2px">{{opt.text}}</span>
                        </div>
                      }
                    </div>
                  }

                  <!-- Toggle -->
                  <button (click)="toggleExpand(q.id)"
                    style="font-size:12.5px;color:#F26B3A;font-weight:600;background:none;border:none;cursor:pointer;padding:0;display:flex;align-items:center;gap:4px">
                    @if (expanded().has(q.id)) {
                      Recolher
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="18 15 12 9 6 15"/></svg>
                    } @else {
                      Ver questão completa
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
                    }
                  </button>
                </div>
              </div>
            </div>
          }

          @if (filtered().length === 0 && !loading()) {
            <div class="card" style="text-align:center;padding:40px 24px;color:#7B8597">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ECEEF3" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto 12px;display:block">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <div style="font-size:15px;font-weight:600;color:#0F1B3D;margin-bottom:6px">Nenhuma questão encontrada</div>
              <div style="font-size:13px">Tente ajustar os filtros</div>
            </div>
          }
        </div>

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-top:24px">
            <button class="btn btn-secondary btn-md" [disabled]="page() === 1" (click)="prevPage()">
              ← Anterior
            </button>
            <span style="font-size:13px;color:#7B8597;padding:0 12px">
              {{page()}} de {{totalPages()}}
            </span>
            <button class="btn btn-secondary btn-md" [disabled]="page() === totalPages()" (click)="nextPage()">
              Próxima →
            </button>
          </div>
        }
      }
    </div>
  `,
})
export class QuestoesComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private student = inject(StudentService);

  questions = signal<QuestionDto[]>([]);
  loading = signal(true);
  expanded = signal<Set<number>>(new Set());
  page = signal(1);

  search = signal('');
  selectedArea = signal('');
  selectedDifficulty = signal('');

  readonly areas = AREA_LIST;
  readonly perPage = 10;

  filtered = computed(() => {
    const q = this.questions();
    const s = this.search().toLowerCase();
    const a = this.selectedArea();
    const d = this.selectedDifficulty();
    return q.filter(item =>
      (!s || item.statement.toLowerCase().includes(s) || item.topic?.toLowerCase().includes(s) || item.subject.toLowerCase().includes(s)) &&
      (!a || item.area === a) &&
      (!d || item.difficulty === d)
    );
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.perPage)));
  paginated = computed(() => {
    const p = this.page() - 1;
    return this.filtered().slice(p * this.perPage, (p + 1) * this.perPage);
  });

  ngOnInit() {
    this.api.getQuestions().subscribe({
      next: qs => { this.questions.set(qs); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  clearFilters() { this.search.set(''); this.selectedArea.set(''); this.selectedDifficulty.set(''); this.page.set(1); }
  prevPage() { this.page.update(p => p - 1); }
  nextPage() { this.page.update(p => p + 1); }

  toggleExpand(id: number) {
    this.expanded.update(set => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  optionsList(q: QuestionDto) {
    return [
      { key: 'A', text: q.optionA },
      { key: 'B', text: q.optionB },
      { key: 'C', text: q.optionC },
      { key: 'D', text: q.optionD },
      { key: 'E', text: q.optionE },
    ];
  }

  areaColor(name: string) { return getAreaByName(name)?.color ?? '#888'; }
  areaSoft(name: string) { return getAreaByName(name)?.soft ?? '#F5F6FA'; }
  areaShort(name: string) { return getAreaByName(name)?.short ?? name; }

  diffBg(d: string) { return d === 'fácil' ? '#DCF5EB' : d === 'difícil' ? '#FEE2E2' : '#FEF3E2'; }
  diffColor(d: string) { return d === 'fácil' ? '#059669' : d === 'difícil' ? '#C73A1E' : '#B8841C'; }
}
