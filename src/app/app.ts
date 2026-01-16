import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar';
import { ToastComponent } from './components/toast/toast';
import { AuthService } from './services/auth';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, ToastComponent, CommonModule],
  template: `
    <div class="app-container">
      @if (authService.isAuthenticated()) {
        <app-navbar></app-navbar>
      }
      <main class="main-content" [class.no-navbar]="!authService.isAuthenticated()">
        <router-outlet></router-outlet>
      </main>
      <app-toast></app-toast>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: #f9fafb;
    }

    .main-content {
      padding-top: 64px; /* Altura da navbar */
      min-height: calc(100vh - 64px);

      &.no-navbar {
        padding-top: 0;
        min-height: 100vh;
      }
    }
  `]
})
export class AppComponent {
  title = 'NutriControl';
  
  constructor(public authService: AuthService) {}
}