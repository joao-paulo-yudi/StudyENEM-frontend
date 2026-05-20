import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { SidebarComponent } from './shared/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, SidebarComponent],
  template: `
    <div class="app-shell">
      @if (!fullscreen) {
        <app-sidebar [activeRoute]="activeRoute" />
      }
      <div class="main-scroll">
        <router-outlet />
      </div>
    </div>
  `,
})
export class AppComponent {
  private router = inject(Router);
  activeRoute = '';
  fullscreen = false;

  constructor() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      const url: string = e.urlAfterRedirects;
      this.fullscreen = url.includes('/simulado/run');
      this.activeRoute = url.replace(/^\//, '').split('/')[0] || 'home';
    });
  }
}
