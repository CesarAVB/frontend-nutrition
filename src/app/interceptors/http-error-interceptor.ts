import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';
import { Router } from '@angular/router';
import { ToastService } from '../services/toast';

// ===========================================
// # httpErrorInterceptor - Intercepta erros HTTP
// ===========================================
export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Erro desconhecido!';

      if (error.error instanceof ErrorEvent) {
        errorMessage = `Erro: ${error.error.message}`;
      } else {
        // Tratamento específico para erro de autenticação (token expirado)
        if (error.status === 401) {
          errorMessage = 'Sessão expirada. Faça login novamente.';
          toastService.warning('Sua sessão expirou. Redirecionando para o login...');

          // Logout automático e redirecionamento
          authService.logout();

          // Pequeno delay para mostrar a mensagem antes do redirecionamento
          setTimeout(() => {
            router.navigate(['/login']);
          }, 2000);

          return throwError(() => error);
        }

        if (error.status === 404) {
          errorMessage = 'Recurso não encontrado';
        } else if (error.status === 400) {
          errorMessage = error.error?.message || 'Dados inválidos';
        } else if (error.status === 403) {
          errorMessage = 'Acesso negado. Você não tem permissão para esta ação.';
        } else if (error.status === 500) {
          errorMessage = error.error?.message || 'Erro interno do servidor';
        } else if (error.status === 0) {
          errorMessage = 'Sem conexão com o servidor';
        } else {
          errorMessage = `Erro ${error.status}: ${error.message}`;
        }
      }

      return throwError(() => error);
    })
  );
};