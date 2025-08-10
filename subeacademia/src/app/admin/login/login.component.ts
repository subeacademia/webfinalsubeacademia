import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <div class="min-h-dvh grid place-items-center p-6">
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="w-full max-w-sm space-y-4">
        <h1 class="text-2xl font-semibold text-center">Acceso Admin</h1>
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email" required />
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Contraseña</mat-label>
          <input matInput type="password" formControlName="password" required />
        </mat-form-field>

        <button mat-flat-button color="primary" class="w-full" [disabled]="loading()">Entrar</button>

        <p *ngIf="error()" class="text-sm text-red-600">{{ error() }}</p>
        <p class="text-xs text-gray-500 text-center">Protegido por reCAPTCHA • {{ siteKey }}</p>
      </form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly siteKey = environment.recaptchaV3SiteKey;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  loading = signal(false);
  error = signal<string | null>(null);

  async onSubmit() {
    if (this.form.invalid || this.loading()) return;
    this.error.set(null);
    this.loading.set(true);
    try {
      // Ejecutar reCAPTCHA v3 invisible
      await this.executeRecaptcha('admin_login');
      const { email, password } = this.form.getRawValue();
      await this.auth.loginWithEmailPassword(email!, password!);
      await this.router.navigateByUrl('/admin');
    } catch (e: any) {
      this.error.set(e?.message ?? 'Error al iniciar sesión');
    } finally {
      this.loading.set(false);
    }
  }

  private async executeRecaptcha(action: string): Promise<void> {
    if (typeof window === 'undefined') return; // SSR safety
    const siteKey = this.siteKey;
    if (!siteKey) return;
    // Cargar script si no existe
    if (!(window as any).grecaptcha) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => resolve();
        document.head.appendChild(script);
      });
    }
    const grecaptcha = (window as any).grecaptcha;
    if (!grecaptcha?.ready) return;
    await new Promise<void>((res) => grecaptcha.ready(res));
    try {
      await grecaptcha.execute(siteKey, { action });
    } catch (_) {
      // Si falla, no bloquear login, solo registrar
      console.warn('reCAPTCHA no disponible');
    }
  }
}

