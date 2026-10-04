import { Component, ElementRef, NgZone, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, AuthResponseDto, SocialProvider } from '../../core/api.service';
import { GoogleAuthService } from '../../core/google-auth.service';
import { StudentService } from '../../core/student.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent implements OnInit {
  private api = inject(ApiService);
  private student = inject(StudentService);
  private router = inject(Router);
  private google = inject(GoogleAuthService);
  private zone = inject(NgZone);

  private googleClientId: string | null = null;

  /** O contêiner do Google só existe depois que a configuração o habilita; aí o botão é desenhado. */
  @ViewChild('googleButton') private set googleButton(ref: ElementRef<HTMLDivElement> | undefined) {
    if (ref && this.googleClientId) this.setupGoogle(ref.nativeElement, this.googleClientId);
  }

  mode = signal<'login' | 'signup'>('login');
  email = environment.loginPrefill?.email ?? '';
  password = environment.loginPrefill?.password ?? '';
  name = '';
  showPw = signal(false);
  loading = signal(false);
  error = signal('');
  /**
   * Provedores de login social exibidos: só os que o servidor informa como configurados.
   * Sem nenhum, a tela mostra apenas o formulário de e-mail e senha.
   */
  providers = signal<SocialProvider[]>([]);

  ngOnInit() {
    this.api.getAuthConfig().subscribe({
      next: config => {
        this.googleClientId = config.googleClientId;
        this.providers.set(config.providers.filter(p => p !== 'google' || !!config.googleClientId));
      },
      // Sem a configuração, a tela fica só com e-mail e senha.
      error: () => this.providers.set([]),
    });
  }

  toggleMode() {
    this.mode.set(this.mode() === 'login' ? 'signup' : 'login');
    this.error.set('');
  }

  submit() {
    this.error.set('');
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

  private setupGoogle(container: HTMLElement, clientId: string) {
    // O callback do Google roda fora do Angular: NgZone.run devolve o fluxo para a aplicação.
    // Se o script do Google não carregar (rede, bloqueador), o botão some em vez de ficar quebrado.
    this.google
      .renderButton(container, clientId, credential => this.zone.run(() => this.loginWithGoogle(credential)))
      .catch(() => this.providers.update(list => list.filter(p => p !== 'google')));
  }

  private loginWithGoogle(credential: string) {
    if (this.loading()) return;
    this.error.set('');
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
