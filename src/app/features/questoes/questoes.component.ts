import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, QuestionDto } from '../../core/api.service';
import { AREA_LIST, getAreaByName } from '../../core/areas.config';

@Component({
  selector: 'app-questoes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './questoes.component.html',
  styleUrl: './questoes.component.css',
})
export class QuestoesComponent implements OnInit {
  private api = inject(ApiService);

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
