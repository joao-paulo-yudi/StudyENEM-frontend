import { AfterViewInit, Component, ElementRef, NgZone, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, AuthResponseDto } from '../../core/api.service';
import { GoogleAuthService } from '../../core/google-auth.service';
import { StudentService } from '../../core/student.service';

/** Estado do botão do Google: carregando a configuração, pronto ou não configurado. */
type GoogleState = 'loading' | 'ready' | 'unavailable';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements AfterViewInit {
  private api = inject(ApiService);
  private student = inject(StudentService);
  private router = inject(Router);
  private google = inject(GoogleAuthService);
  private zone = inject(NgZone);

  @ViewChild('googleButton') private googleButton?: ElementRef<HTMLDivElement>;

  mode = signal<'login' | 'signup'>('login');
  email = 'joao@studyenem.com';
  password = '1234';
  name = '';
  showPw = signal(false);
  loading = signal(false);
  error = signal('');
  info = signal('');
  googleState = signal<GoogleState>('loading');

  ngAfterViewInit() {
    this.api.getAuthConfig().subscribe({
      next: config => config.googleClientId
        ? this.setupGoogle(config.googleClientId)
        : this.googleState.set('unavailable'),
      error: () => this.googleState.set('unavailable'),
    });
  }

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

  private setupGoogle(clientId: string) {
    const container = this.googleButton?.nativeElement;
    if (!container) { this.googleState.set('unavailable'); return; }

    // O callback do Google roda fora do Angular: NgZone.run devolve o fluxo para a aplicação.
    this.google
      .renderButton(container, clientId, credential => this.zone.run(() => this.loginWithGoogle(credential)))
      .then(() => this.googleState.set('ready'))
      .catch(() => this.googleState.set('unavailable'));
  }

  private loginWithGoogle(credential: string) {
    if (this.loading()) return;
    this.error.set('');
    this.info.set('');
    this.loading.set(true);
    this.api.googleLogin({ credential }).subscribe({
      next: u => this.onAuth(u),
      error: err => { this.loading.set(false); this.error.set(err?.error?.message ?? 'Não foi possível entrar com o Google.'); },
    });
  }

  private onAuth(response: AuthResponseDto) {
    this.student.setSession(response);
    this.loading.set(false);
    this.router.navigate(['/home']);
  }
}
