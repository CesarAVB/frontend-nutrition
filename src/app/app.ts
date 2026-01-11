import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <div class="app-container">
      <app-navbar></app-navbar>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
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
    }
  `]
})
export class AppComponent {
  title = 'NutriControl';
}