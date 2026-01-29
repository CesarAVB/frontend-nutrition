import { Component, signal, ChangeDetectionStrategy, inject, OnDestroy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ToastService } from '../../services/toast';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule]
})
export class LoginComponent implements OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly toastService = inject(ToastService);

  private readonly REMEMBER_KEY = 'remember_credentials';

  isLoading = signal(false);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false]
  });

  constructor() {
    this.loadSavedCredentials();
    try { document.body.classList.add('no-navbar-padding'); } catch (e) {}
  }

  ngOnDestroy(): void {
    try { document.body.classList.remove('no-navbar-padding'); } catch (e) {}
  }

  // ===========================================
  // # onSubmit - Processa o formulário de login
  // ===========================================
  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const credentials = {
      email: this.loginForm.value.email!,
      password: this.loginForm.value.password!
    };

    if (this.loginForm.value.rememberMe) {
      this.saveCredentials(credentials.email, credentials.password);
    } else {
      this.clearSavedCredentials();
    }

    this.authService.login(credentials).subscribe({
      next: () => {
        this.toastService.success('Login realizado com sucesso!');
        this.router.navigate(['/dashboard']);
      },
      error: (error: any) => {
        this.isLoading.set(false);
        this.toastService.error(
          error.error?.message || 'Erro ao realizar login. Verifique suas credenciais.'
        );
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  // ===========================================
  // # emailControl - Getter para controle de email
  // ===========================================
  get emailControl() {
    return this.loginForm.get('email');
  }

  // ===========================================
  // # passwordControl - Getter para controle de senha
  // ===========================================
  get passwordControl() {
    return this.loginForm.get('password');
  }

  // ===========================================
  // # loadSavedCredentials - Carrega credenciais salvas
  // ===========================================
  private loadSavedCredentials() {
    const saved = localStorage.getItem(this.REMEMBER_KEY);
    if (saved) {
      try {
        const credentials = JSON.parse(saved);
        this.loginForm.patchValue({
          email: credentials.email,
          password: credentials.password,
          rememberMe: true
        });
      } catch (error) {
        this.clearSavedCredentials();
      }
    }
  }

  // ===========================================
  // # saveCredentials - Salva credenciais no localStorage
  // ===========================================
  private saveCredentials(email: string, password: string) {
    localStorage.setItem(this.REMEMBER_KEY, JSON.stringify({ email, password }));
  }

  // ===========================================
  // # clearSavedCredentials - Remove credenciais salvas
  // ===========================================
  private clearSavedCredentials() {
    localStorage.removeItem(this.REMEMBER_KEY);
  }
}
