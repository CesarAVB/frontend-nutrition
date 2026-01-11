// src/app/interceptors/http-error.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Erro desconhecido!';
      
      if (error.error instanceof ErrorEvent) {
        // Erro do lado do cliente
        errorMessage = `Erro: ${error.error.message}`;
      } else {
        // Erro do lado do servidor
        if (error.status === 404) {
          errorMessage = 'Recurso não encontrado';
        } else if (error.status === 400) {
          errorMessage = error.error?.message || 'Dados inválidos';
        } else if (error.status === 500) {
          errorMessage = 'Erro interno do servidor';
        } else if (error.status === 0) {
          errorMessage = 'Sem conexão com o servidor';
        } else {
          errorMessage = `Erro ${error.status}: ${error.message}`;
        }
      }
      
      console.error('Erro HTTP:', errorMessage, error);
      
      // Aqui você pode adicionar um serviço de notificação/toast
      // this.toastService.error(errorMessage);
      
      return throwError(() => new Error(errorMessage));
    })
  );
};