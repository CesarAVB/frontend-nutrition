import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';

// ===========================================
// # authGuard - Guarda rota para usuários autenticados
// ===========================================
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Redireciona para o login e salva a URL de origem
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url }
  });
  
  return false;
};
