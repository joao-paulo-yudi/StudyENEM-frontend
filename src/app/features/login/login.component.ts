import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, AuthResponseDto } from '../../core/api.service';
import { StudentService } from '../../core/student.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private api = inject(ApiService);
  private student = inject(StudentService);
  private router = inject(Router);

  mode = signal<'login' | 'signup'>('login');
  email = 'joao@studyenem.com';
  password = '1234';
  name = '';
  showPw = signal(false);
  loading = signal(false);
  error = signal('');
  info = signal('');

  toggleMode() {
    this.mode.set(this.mode() === 'login' ? 'signup' : 'login');
    this.error.set('');
    this.info.set('');
  }

  socialUnavailable() {
    this.info.set('Login social estará disponível em breve. Use a conta de teste para entrar.');
  }

  submit() {
    this.error.set('');
    this.info.set('');
    if (this.loading()) return;

    if (this.mode() === 'login') {
      if (!this.email.trim() || !this.password) { this.error.set('Informe e-mail e senha.'); return; }
      this.loading.set(true);
      this.api.login({ identifier: this.email.trim(), password: this.password }).subscribe({
        next: u => this.onAuth(u),
        error: err => { this.loading.set(false); this.error.set(err?.error?.message ?? 'Não foi possível entrar. Tente novamente.'); },
      });
    } else {
      if (!this.name.trim() || !this.email.trim() || !this.password) { this.error.set('Preencha nome, e-mail e senha.'); return; }
      this.loading.set(true);
      this.api.register({ name: this.name.trim(), email: this.email.trim(), password: this.password }).subscribe({
        next: u => this.onAuth(u),
        error: err => { this.loading.set(false); this.error.set(err?.error?.message ?? 'Não foi possível criar a conta.'); },
      });
    }
  }

  private onAuth(response: AuthResponseDto) {
    this.student.setSession(response);
    this.loading.set(false);
    this.router.navigate(['/home']);
  }
}
