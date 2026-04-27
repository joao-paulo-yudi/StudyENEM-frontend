import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StudentService } from '../../core/student.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="container">
      <div class="hero card mt-8">
        <h1>Bem-vindo ao <span class="highlight">StudyENEM</span></h1>
        <p class="subtitle">Analise seu desempenho, identifique pontos fracos e melhore sua preparação para o ENEM.</p>

        <div class="name-form">
          <div class="form-group">
            <label for="name">Digite seu nome</label>
            <input id="name" type="text" [(ngModel)]="name" placeholder="Ex: João Silva" maxlength="60" />
          </div>
          <button class="btn btn-primary btn-lg" (click)="save()" [disabled]="!name.trim()">
            Começar
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hero { text-align: center; padding: 3rem 2rem; }
    h1 { font-size: 2.25rem; font-weight: 800; margin-bottom: 1rem; }
    .highlight { color: var(--primary); }
    .subtitle { color: var(--text-muted); font-size: 1.125rem; max-width: 560px; margin: 0 auto 2rem; }
    .name-form { max-width: 400px; margin: 0 auto; display: flex; flex-direction: column; gap: .75rem; }
    .feature-card { text-align: center; padding: 2rem 1.5rem; }
    .feature-icon { font-size: 2rem; margin-bottom: 1rem; }
    h3 { font-size: 1.125rem; font-weight: 600; margin-bottom: .5rem; }
    p { color: var(--text-muted); font-size: .875rem; }
  `]
})
export class HomeComponent {
  name = inject(StudentService).name ?? '';
  private router = inject(Router);
  private studentService = inject(StudentService);

  save() {
    if (this.name.trim()) {
      this.studentService.name = this.name.trim();
      this.router.navigate(['/exam']);
    }
  }
}
