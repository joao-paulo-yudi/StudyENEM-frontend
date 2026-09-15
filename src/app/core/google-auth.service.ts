import { Injectable } from '@angular/core';

const GSI_SRC = 'https://accounts.google.com/gsi/client';

/** Largura máxima aceita pelo botão do Google Identity Services. */
const MAX_BUTTON_WIDTH = 400;
const MIN_BUTTON_WIDTH = 200;

declare global {
  interface Window { google?: any; }
}

/**
 * Carrega o Google Identity Services sob demanda e desenha o botão oficial de login.
 * O botão devolve um ID token (credential), que o backend valida em POST /api/auth/google.
 */
@Injectable({ providedIn: 'root' })
export class GoogleAuthService {
  private loading?: Promise<void>;

  /** Injeta o script do Google uma única vez. */
  private load(): Promise<void> {
    this.loading ??= new Promise<void>((resolve, reject) => {
      if (window.google?.accounts?.id) { resolve(); return; }

      const script = document.createElement('script');
      script.src = GSI_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Não foi possível carregar o login do Google.'));
      document.head.appendChild(script);
    });
    return this.loading;
  }

  /** Desenha o botão dentro de `container` e chama `onCredential` a cada login concluído. */
  async renderButton(container: HTMLElement, clientId: string, onCredential: (credential: string) => void) {
    await this.load();

    const id = window.google?.accounts?.id;
    if (!id) throw new Error('Login do Google indisponível.');

    id.initialize({
      client_id: clientId,
      callback: (response: { credential?: string }) => {
        if (response?.credential) onCredential(response.credential);
      },
      ux_mode: 'popup',
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    // O contêiner fica oculto enquanto está vazio, então a largura vem do bloco que o contém.
    const available = container.clientWidth || container.parentElement?.clientWidth || MAX_BUTTON_WIDTH;
    const width = Math.min(MAX_BUTTON_WIDTH, Math.max(MIN_BUTTON_WIDTH, Math.round(available)));
    container.innerHTML = '';
    id.renderButton(container, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      shape: 'rectangular',
      text: 'continue_with',
      logo_alignment: 'left',
      locale: 'pt-BR',
      width,
    });
  }
}
