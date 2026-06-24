import { Injectable, signal } from '@angular/core';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class StudentService {
  private readonly KEY = 'studyenem_user';
  private readonly LEGACY_NAME_KEY = 'studyenem_student';

  /** Usuário autenticado (reativo). */
  readonly user = signal<AuthUser | null>(this.load());

  private load(): AuthUser | null {
    const raw = localStorage.getItem(this.KEY);
    if (raw) {
      try { return JSON.parse(raw) as AuthUser; } catch { /* ignore */ }
    }
    // Migração do formato antigo (apenas nome em localStorage).
    const legacy = localStorage.getItem(this.LEGACY_NAME_KEY);
    return legacy ? { id: 0, name: legacy, email: '' } : null;
  }

  get name(): string | null { return this.user()?.name ?? null; }
  get email(): string | null { return this.user()?.email ?? null; }
  get isLoggedIn(): boolean { return this.user() !== null; }

  setUser(u: AuthUser) {
    this.user.set(u);
    localStorage.setItem(this.KEY, JSON.stringify(u));
    // Mantém a chave antiga sincronizada para compatibilidade.
    localStorage.setItem(this.LEGACY_NAME_KEY, u.name);
  }

  /** Compatibilidade: login simples apenas por nome. */
  set name(v: string) { this.setUser({ id: 0, name: v, email: '' }); }

  clear() {
    this.user.set(null);
    localStorage.removeItem(this.KEY);
    localStorage.removeItem(this.LEGACY_NAME_KEY);
  }
}
