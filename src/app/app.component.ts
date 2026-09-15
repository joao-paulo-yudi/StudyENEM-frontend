import { Component, ElementRef, HostListener, ViewChild, effect, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { LayoutService } from './core/layout.service';

const SECTION_TITLES: Record<string, string> = {
  home:       'Início',
  simulado:   'Simulados',
  desempenho: 'Desempenho',
  plano:      'Plano de Estudos',
  questoes:   'Banco de Questões',
  resultado:  'Resultado',
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, SidebarComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  private router = inject(Router);
  readonly layout = inject(LayoutService);
  activeRoute = '';
  fullscreen = false;

  @ViewChild('menuBtn') private menuBtn?: ElementRef<HTMLButtonElement>;
  private drawerWasOpen = false;

  constructor() {
    // Ao fechar a gaveta, devolve o foco ao botão que a abriu.
    effect(() => {
      const open = this.layout.drawerOpen();
      if (!open && this.drawerWasOpen) setTimeout(() => this.menuBtn?.nativeElement.focus());
      this.drawerWasOpen = open;
    });

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      const url: string = e.urlAfterRedirects;
      this.fullscreen = url.includes('/simulado/run') || url.startsWith('/login');
      this.activeRoute = url.replace(/^\//, '').split('/')[0] || 'home';
      this.layout.closeDrawer();
    });
  }

  get sectionTitle() { return SECTION_TITLES[this.activeRoute] ?? 'StudyENEM'; }

  @HostListener('document:keydown.escape')
  onEscape() { this.layout.closeDrawer(); }
}
