import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class NavbarComponent {
  menuAberto = false;
  
  constructor(private router: Router) {}

  toggleMenu(): void {
    this.menuAberto = !this.menuAberto;
  }

  fecharMenu(): void {
    this.menuAberto = false;
  }

  navegarPara(rota: string): void {
    this.router.navigate([rota]);
    this.fecharMenu();
  }

  logout(): void {
    // Implementar lógica de logout
    console.log('Logout');
    this.router.navigate(['/login']);
  }
}