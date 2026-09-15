import { Injectable, effect, signal } from '@angular/core';

/** Abaixo desta largura a barra lateral vira uma gaveta sobreposta. */
const MOBILE_QUERY = '(max-width: 960px)';
const COLLAPSED_KEY = 'studyenem:sidebar-collapsed';

/**
 * Estado compartilhado do layout: largura da tela, gaveta lateral (mobile)
 * e modo retraído da barra lateral (desktop, persistido no localStorage).
 */
@Injectable({ providedIn: 'root' })
export class LayoutService {
  /** true quando a viewport está em modo mobile/tablet estreito. */
  readonly isMobile = signal(false);
  /** Gaveta lateral aberta sobre o conteúdo (apenas mobile). */
  readonly drawerOpen = signal(false);
  /** Barra lateral reduzida a um trilho de ícones (apenas desktop). */
  readonly collapsed = signal(readCollapsed());

  constructor() {
    const mq = window.matchMedia(MOBILE_QUERY);
    this.isMobile.set(mq.matches);
    mq.addEventListener('change', e => {
      this.isMobile.set(e.matches);
      if (!e.matches) this.drawerOpen.set(false);
    });

    // Trava a rolagem de fundo enquanto a gaveta estiver aberta.
    effect(() => document.body.classList.toggle('drawer-open', this.drawerOpen()));

    effect(() => {
      try { localStorage.setItem(COLLAPSED_KEY, this.collapsed() ? '1' : '0'); } catch { /* storage indisponível */ }
    });
  }

  /** No mobile abre/fecha a gaveta; no desktop retrai/expande o trilho. */
  toggleSidebar() {
    if (this.isMobile()) this.drawerOpen.update(v => !v);
    else this.collapsed.update(v => !v);
  }

  openDrawer() { this.drawerOpen.set(true); }
  closeDrawer() { this.drawerOpen.set(false); }
}

function readCollapsed(): boolean {
  try { return localStorage.getItem(COLLAPSED_KEY) === '1'; } catch { return false; }
}
