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
  userMenuOpen = false;
  
  // ===========================================
  // # constructor - Inicializa o componente
  // ===========================================
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  // ===========================================
  // # currentUser - Getter para usuário atual
  // ===========================================
  get currentUser() {
    return this.authService.currentUser();
  }

  // ===========================================
  // # getUserInitials - Obtém iniciais do usuário
  // ===========================================
  getUserInitials(): string {
    const user = this.currentUser;
    if (!user?.name) return 'U';
    
    const names = user.name.split(' ');
    if (names.length === 1) {
      return names[0].substring(0, 2).toUpperCase();
    }
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }

  // ===========================================
  // # toggleMenu - Alterna estado do menu mobile
  // ===========================================
  toggleMenu(): void {
    this.menuAberto = !this.menuAberto;
    if (this.userMenuOpen) {
      this.userMenuOpen = false;
    }
  }

  // ===========================================
  // # toggleUserMenu - Alterna estado do menu do usuário
  // ===========================================
  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

  // ===========================================
  // # fecharMenu - Fecha o menu mobile
  // ===========================================
  fecharMenu(): void {
    this.menuAberto = false;
  }

  // ===========================================
  // # navigateToProfile - Navega para o perfil
  // ===========================================
  navigateToProfile(): void {
    this.userMenuOpen = false;
    // TODO: Implementar navegação para perfil
    console.log('Navegando para perfil...');
  }

  // ===========================================
  // # navigateToSettings - Navega para configurações
  // ===========================================
  navigateToSettings(): void {
    this.userMenuOpen = false;
    // TODO: Implementar navegação para configurações
    console.log('Navegando para configurações...');
  }

  // ===========================================
  // # logout - Faz logout do usuário
  // ===========================================
  logout(): void {
    this.userMenuOpen = false;
    this.menuAberto = false;
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}