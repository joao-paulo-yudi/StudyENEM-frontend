import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { StudentService } from '../../core/student.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-wrap">
      <!-- Painel de marca (esquerda) -->
      <div class="login-brand">
        <div aria-hidden="true" class="login-blob login-blob-orange"></div>
        <div aria-hidden="true" class="login-blob login-blob-yellow"></div>

        <div style="position:relative;z-index:1;display:flex;align-items:center;gap:12px">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect x="2" y="2" width="36" height="36" rx="10" fill="#fff"/>
            <path d="M11 26 L11 14 L17 14 L17 26 Z" fill="#F26B3A"/>
            <path d="M20 26 L20 18 L26 18 L26 26 Z" fill="#FFD166"/>
            <path d="M29 26 L29 10 L31 10 L31 26 Z" fill="#8DD5C0"/>
          </svg>
          <div>
            <div style="font-size:19px;font-weight:700;letter-spacing:-.02em">StudyENEM</div>
            <div style="font-size:11px;opacity:.6;text-transform:uppercase;letter-spacing:.08em;font-weight:600">Learning Analytics</div>
          </div>
        </div>

        <div style="flex:1;display:flex;flex-direction:column;justify-content:center;max-width:460px;position:relative;z-index:1">
          <div style="font-size:12px;color:#FFD166;text-transform:uppercase;letter-spacing:.12em;font-weight:600">Estude com inteligência</div>
          <h1 style="margin:14px 0 0;font-size:40px;font-weight:700;letter-spacing:-.025em;line-height:1.1">
            Seu plano de estudos, <span style="color:#F26B3A">guiado por dados</span>.
          </h1>
          <p style="font-size:15px;opacity:.75;margin-top:20px;line-height:1.6">
            Faça simulados do ENEM, acompanhe seu desempenho em dashboards interativos e receba
            recomendações personalizadas para cada área do conhecimento.
          </p>

          <div style="margin-top:36px;display:flex;flex-direction:column;gap:12px">
            @for (f of features; track f.text) {
              <div style="display:flex;align-items:center;gap:14px">
                <div style="width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,.08);display:grid;place-items:center;flex-shrink:0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFD166" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" [innerHTML]="f.icon"></svg>
                </div>
                <div style="font-size:14px;opacity:.85">{{ f.text }}</div>
              </div>
            }
          </div>
        </div>

        <div style="position:relative;z-index:1;font-size:11.5px;opacity:.5;letter-spacing:.02em">
          TCC · TAC1 2026 · StudyENEM
        </div>
      </div>

      <!-- Painel do formulário (direita) -->
      <div style="flex:1;display:flex;align-items:center;justify-content:center;padding:40px 32px">
        <form (ngSubmit)="submit()" style="width:100%;max-width:400px">
          <h2 style="margin:0;font-size:26px;font-weight:700;color:#0F1B3D;letter-spacing:-.02em">
            {{ mode() === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta' }}
          </h2>
          <p style="font-size:14px;color:#7B8597;margin-top:8px;margin-bottom:28px">
            {{ mode() === 'login'
              ? 'Acesse sua conta para continuar de onde parou.'
              : 'Comece sua jornada rumo ao ENEM em poucos passos.' }}
          </p>

          <!-- Social (decorativo) -->
          <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:22px">
            <button type="button" class="login-social" (click)="socialUnavailable()">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar com Google
            </button>
            <button type="button" class="login-social" (click)="socialUnavailable()">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <rect x="2" y="2" width="9" height="9" fill="#F25022"/>
                <rect x="13" y="2" width="9" height="9" fill="#7FBA00"/>
                <rect x="2" y="13" width="9" height="9" fill="#00A4EF"/>
                <rect x="13" y="13" width="9" height="9" fill="#FFB900"/>
              </svg>
              Continuar com Microsoft
            </button>
          </div>

          <div style="display:flex;align-items:center;gap:12px;color:#9AA3B5;font-size:11.5px;font-weight:500;text-transform:uppercase;letter-spacing:.06em">
            <div style="flex:1;height:1px;background:#ECEEF3"></div>
            <span>ou com e-mail</span>
            <div style="flex:1;height:1px;background:#ECEEF3"></div>
          </div>

          <div style="display:flex;flex-direction:column;gap:14px;margin-top:22px">
            @if (mode() === 'signup') {
              <label style="display:block">
                <span style="font-size:12.5px;font-weight:600;color:#0F1B3D;display:block;margin-bottom:6px">Nome completo</span>
                <input class="login-input" type="text" [(ngModel)]="name" name="name" placeholder="Como devemos te chamar?" autocomplete="name"/>
              </label>
            }

            <label style="display:block">
              <span style="font-size:12.5px;font-weight:600;color:#0F1B3D;display:block;margin-bottom:6px">E-mail</span>
              <input class="login-input" type="email" [(ngModel)]="email" name="email" placeholder="voce@email.com" autocomplete="email"/>
            </label>

            <label style="display:block">
              <span style="font-size:12.5px;font-weight:600;color:#0F1B3D;display:block;margin-bottom:6px">Senha</span>
              <div style="position:relative">
                <input class="login-input" [type]="showPw() ? 'text' : 'password'" [(ngModel)]="password" name="password" placeholder="••••••••" autocomplete="current-password"/>
                <button type="button" (click)="showPw.set(!showPw())"
                        [attr.aria-label]="showPw() ? 'Ocultar senha' : 'Mostrar senha'"
                        style="position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;padding:6px;color:#7B8597;display:grid;place-items:center">
                  @if (showPw()) {
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3 L21 21"/><path d="M10.6 6.1 A10 10 0 0 1 12 6 c5 0 9 4 10 6 a16 16 0 0 1 -3.4 4.3"/><path d="M6.6 6.6 C3.8 8.1 2 11 2 12 c1 2 5 6 10 6 a10 10 0 0 0 4.4 -1"/><circle cx="12" cy="12" r="2.5"/></svg>
                  } @else {
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12 C4 8 8 5 12 5 s8 3 10 7 c-2 4 -6 7 -10 7 s-8 -3 -10 -7Z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </label>
          </div>

          @if (error()) {
            <div style="margin-top:16px;padding:11px 14px;background:#FDE3DA;border-radius:10px;color:#C73A1E;font-size:13px">
              {{ error() }}
            </div>
          }
          @if (info()) {
            <div style="margin-top:16px;padding:11px 14px;background:#FFF4DA;border-radius:10px;color:#B8841C;font-size:13px">
              {{ info() }}
            </div>
          }

          <button class="btn btn-primary btn-lg" type="submit" [disabled]="loading()" style="width:100%;margin-top:22px">
            @if (loading()) { {{ mode() === 'login' ? 'Entrando...' : 'Criando conta...' }} }
            @else { {{ mode() === 'login' ? 'Entrar' : 'Criar conta' }} }
          </button>

          <div style="text-align:center;margin-top:22px;font-size:13.5px;color:#7B8597">
            {{ mode() === 'login' ? 'Não tem uma conta? ' : 'Já tem uma conta? ' }}
            <button type="button" (click)="toggleMode()" style="background:none;border:none;cursor:pointer;color:#F26B3A;font-weight:600;font-size:13.5px;padding:0">
              {{ mode() === 'login' ? 'Cadastre-se grátis' : 'Fazer login' }}
            </button>
          </div>

          @if (mode() === 'login') {
            <div style="text-align:center;margin-top:18px;font-size:12px;color:#9AA3B5">
              Conta de teste: <b style="color:#4B5468">joao&#64;studyenem.com</b> · senha <b style="color:#4B5468">1234</b>
            </div>
          }
        </form>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private api = inject(ApiService);
  private student = inject(StudentService);
  private router = inject(Router);

  mode = signal<'login' | 'signup'>('login');
  // Pré-preenchido com a conta de teste para facilitar a demonstração.
  email = 'joao@studyenem.com';
  password = '1234';
  name = '';
  showPw = signal(false);
  loading = signal(false);
  error = signal('');
  info = signal('');

  readonly features = [
    { icon: '<path d="M3 21 H21 M6 17 V11 M11 17 V7 M16 17 V13"/>', text: 'Análise de acertos por área e por tópico' },
    { icon: '<path d="M9 12 L11 14 L15 9 M5 4 H19 V20 H5 Z"/>', text: 'Plano de estudos personalizado e adaptativo' },
    { icon: '<path d="M3 17 L9 11 L13 15 L21 7 M15 7 H21 V13"/>', text: 'Evolução temporal e comparação entre simulados' },
  ];

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

  private onAuth(u: { id: number; name: string; email: string }) {
    this.student.setUser(u);
    this.loading.set(false);
    this.router.navigate(['/home']);
  }
}
