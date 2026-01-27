import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  name: string;
  token: string;
  perfil: string;
  email: string;
}

export interface User {
  name: string;
  email: string;
  perfil: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly loginUrl = environment.loginUrl;

  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  isAuthenticated = signal(this.hasToken());
  currentUser = signal<User | null>(this.getUserFromStorage());

  // =======================================
  // # login - Realiza login do usuário
  // =======================================
  login(credentials: LoginRequest) {
    return this.http.post<LoginResponse>(`${this.loginUrl}/auth/login`, credentials).pipe(
      tap(response => {
        this.setSession(response);
      })
    );
  }

  // =======================================
  // # logout - Realiza logout do usuário
  // =======================================
  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  // =======================================
  // # getToken - Retorna o token de autenticação
  // =======================================
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // ===========================================
  // # hasToken - Verifica se há token armazenado
  // ===========================================
  private hasToken(): boolean {
    return !!this.getToken();
  }

  // ===========================================
  // # setSession - Armazena sessão de autenticação
  // ===========================================
  private setSession(authResult: LoginResponse) {
    localStorage.setItem(this.TOKEN_KEY, authResult.token);
    const user: User = {
      name: authResult.name,
      email: authResult.email,
      perfil: authResult.perfil
    };
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.isAuthenticated.set(true);
    this.currentUser.set(user);
  }

  // ===========================================
  // # getUserFromStorage - Recupera usuário do localStorage
  // ===========================================
  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr || userStr === 'undefined' || userStr === 'null') {
      return null;
    }
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error('Erro ao fazer parse do usuário:', error);
      localStorage.removeItem(this.USER_KEY);
      return null;
    }
  }
}
