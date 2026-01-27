import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

// ===========================================
// # httpErrorInterceptor - Intercepta erros HTTP
// ===========================================
export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Erro desconhecido!';

      if (error.error instanceof ErrorEvent) {
        errorMessage = `Erro: ${error.error.message}`;
      } else {
        if (error.status === 404) {
          errorMessage = 'Recurso não encontrado';
        } else if (error.status === 400) {
          errorMessage = error.error?.message || 'Dados inválidos';
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