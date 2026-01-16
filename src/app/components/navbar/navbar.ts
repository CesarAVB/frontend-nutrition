import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class NavbarComponent {
  menuAberto = false;
  
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  get currentUser() {
    return this.authService.currentUser();
  }

  getUserInitials(): string {
    const user = this.currentUser;
    if (!user?.name) return 'U';
    
    const names = user.name.split(' ');
    if (names.length === 1) {
      return names[0].substring(0, 2).toUpperCase();
    }
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }

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
    this.authService.logout();
    this.fecharMenu();
  }
}