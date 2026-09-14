import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ApiService, AreaCode, QuestionBankItemDto, QuestionCatalogDto } from '../../core/api.service';
import { AREA_LIST, areaColor, areaShort, areaSoft } from '../../core/areas.config';
import { MarkdownPipe } from '../../shared/markdown/markdown.pipe';

@Component({
  selector: 'app-questoes',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownPipe],
  templateUrl: './questoes.component.html',
  styleUrl: './questoes.component.css',
})
export class QuestoesComponent implements OnInit {
  private api = inject(ApiService);

  questions = signal<QuestionBankItemDto[]>([]);
  catalog = signal<QuestionCatalogDto | null>(null);
  loading = signal(true);
  loadError = signal(false);
  expanded = signal<Set<number>>(new Set());
  revealed = signal<Set<number>>(new Set());
  page = signal(1);

  search = signal('');
  areaCode = signal<AreaCode | ''>('');
  subjectId = signal(0);
  topicId = signal(0);
  year = signal(0);

  readonly areas = AREA_LIST;
  readonly perPage = 10;

  subjects = computed(() => this.catalog()?.areas.find(a => a.code === this.areaCode())?.subjects ?? []);
  topics = computed(() => this.subjects().find(s => s.id === this.subjectId())?.topics ?? []);

  filtered = computed(() => {
    const s = this.normalize(this.search());
    return this.questions().filter(q =>
      (!this.areaCode() || q.areaCode === this.areaCode()) &&
      (!this.subjectId() || q.subjectId === this.subjectId()) &&
      (!this.topicId() || q.topicId === this.topicId()) &&
      (!this.year() || q.year === this.year()) &&
      (!s || this.normalize(`${q.statement} ${q.topic} ${q.subject} q${q.number}`).includes(s))
    );
  });

  totalPages = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.perPage)));
  paginated = computed(() => {
    const p = this.page() - 1;
    return this.filtered().slice(p * this.perPage, (p + 1) * this.perPage);
  });

  ngOnInit() {
    forkJoin({ catalog: this.api.getCatalog(), questions: this.api.getQuestionBank() }).subscribe({
      next: ({ catalog, questions }) => {
        this.catalog.set(catalog);
        this.questions.set(questions);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.loadError.set(true); },
    });
  }

  setArea(code: AreaCode | '') { this.areaCode.set(code); this.subjectId.set(0); this.topicId.set(0); this.page.set(1); }
  setSubject(id: number) { this.subjectId.set(id); this.topicId.set(0); this.page.set(1); }
  setTopic(id: number) { this.topicId.set(id); this.page.set(1); }
  setYear(year: number) { this.year.set(year); this.page.set(1); }
  setSearch(text: string) { this.search.set(text); this.page.set(1); }

  clearFilters() {
    this.search.set(''); this.areaCode.set(''); this.subjectId.set(0); this.topicId.set(0); this.year.set(0); this.page.set(1);
  }
  prevPage() { this.page.update(p => p - 1); }
  nextPage() { this.page.update(p => p + 1); }

  isExpanded(id: number) { return this.expanded().has(id); }
  isRevealed(id: number) { return this.revealed().has(id); }
  toggleExpand(id: number) { this.expanded.update(set => this.toggle(set, id)); }
  toggleReveal(id: number) { this.revealed.update(set => this.toggle(set, id)); }

  private toggle(set: Set<number>, id: number) {
    const next = new Set(set);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  }

  private normalize(text: string) {
    return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }

  readonly areaColor = areaColor;
  readonly areaSoft = areaSoft;
  readonly areaShort = areaShort;

  /** Dificuldade TRI na escala do ENEM: até 600 fácil, até 750 média, acima difícil. */
  diffBg(b: number) { return b < 600 ? '#DCF5EB' : b < 750 ? '#FEF3E2' : '#FEE2E2'; }
  diffColor(b: number) { return b < 600 ? '#059669' : b < 750 ? '#B8841C' : '#C73A1E'; }
}
