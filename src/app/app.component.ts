import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { SidebarComponent } from './shared/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, SidebarComponent],
  templateUrl: './app.component.html',
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
      this.fullscreen = url.includes('/simulado/run') || url.startsWith('/login');
      this.activeRoute = url.replace(/^\//, '').split('/')[0] || 'home';
    });
  }
}
