// src/app/interceptors/http-error.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Erro desconhecido!';
      
      console.error('🔴 INTERCEPTOR - ERRO HTTP CAPTURADO:');
      console.error('URL:', req.url);
      console.error('Método:', req.method);
      console.error('Status:', error.status);
      console.error('Status Text:', error.statusText);
      
      if (error.error instanceof ErrorEvent) {
        // Erro do lado do cliente
        errorMessage = `Erro: ${error.error.message}`;
        console.error('Erro do Cliente:', error.error.message);
      } else {
        // Erro do lado do servidor
        console.error('Resposta do servidor:', error.error);
        
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
          
      console.error('Mensagem de erro final:', errorMessage);
      console.error('='.repeat(60));
      
      return throwError(() => error);
    })
  );
};