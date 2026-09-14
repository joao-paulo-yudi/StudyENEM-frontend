import { Injectable, signal } from '@angular/core';
import { AuthResponseDto, AuthUserDto } from './api.service';

interface Session {
  token: string;
  expiresAt: string;
  user: AuthUserDto;
}

/** Sessão do estudante: token JWT e dados do usuário, persistidos no localStorage. */
@Injectable({ providedIn: 'root' })
export class StudentService {
  private readonly KEY = 'studyenem_session';
  private readonly session = signal<Session | null>(this.load());

  private load(): Session | null {
    // Chaves da versão anterior, que não usava token.
    localStorage.removeItem('studyenem_user');
    localStorage.removeItem('studyenem_student');

    const raw = localStorage.getItem(this.KEY);
    if (!raw) return null;
    try {
      const session = JSON.parse(raw) as Session;
      return session.token && session.user ? session : null;
    } catch {
      return null;
    }
  }

  get token(): string | null { return this.isLoggedIn ? this.session()!.token : null; }
  get user(): AuthUserDto | null { return this.session()?.user ?? null; }
  get name(): string | null { return this.session()?.user.name ?? null; }
  get email(): string | null { return this.session()?.user.email ?? null; }

  get isLoggedIn(): boolean {
    const s = this.session();
    return !!s && new Date(s.expiresAt).getTime() > Date.now();
  }

  setSession(response: AuthResponseDto) {
    const session: Session = { token: response.token, expiresAt: response.expiresAt, user: response.user };
    this.session.set(session);
    localStorage.setItem(this.KEY, JSON.stringify(session));
  }

  clear() {
    this.session.set(null);
    localStorage.removeItem(this.KEY);
  }
}
