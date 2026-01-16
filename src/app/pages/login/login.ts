import { Component, signal, ChangeDetectionStrategy, inject } from '@angular/core';
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
export class LoginComponent {
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
  }

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

    // Salvar ou limpar credenciais baseado no checkbox
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

  get emailControl() {
    return this.loginForm.get('email');
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }

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
        console.error('Erro ao carregar credenciais salvas:', error);
        this.clearSavedCredentials();
      }
    }
  }

  private saveCredentials(email: string, password: string) {
    localStorage.setItem(this.REMEMBER_KEY, JSON.stringify({ email, password }));
  }

  private clearSavedCredentials() {
    localStorage.removeItem(this.REMEMBER_KEY);
  }
}
