import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AuthCoreService } from '../../core/auth-core.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <div class="min-h-[70vh] grid place-items-center p-6">
      <form [formGroup]="form" (ngSubmit)="submit()" class="card w-full max-w-md p-6 space-y-4">
        <h1 class="text-2xl font-semibold text-center">Acceso admin</h1>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" type="email" required />
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Contraseña</mat-label>
          <input matInput formControlName="password" type="password" required />
        </mat-form-field>

        <button mat-raised-button color="primary" class="w-full" [disabled]="loading()">
          {{ loading() ? 'Ingresando…' : 'Ingresar' }}
        </button>

        <p *ngIf="error()" class="text-red-400 text-sm text-center">{{ error() }}</p>
      </form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly authCore = inject(AuthCoreService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  loading = signal(false);
  error = signal<string | null>(null);


  async submit() {
    if (this.form.invalid || this.loading()) return;
    this.error.set(null);
    this.loading.set(true);
    try {
      const { email, password } = this.form.getRawValue();
      await this.auth.loginWithEmailPassword(email!, password!);
      // Si no es admin, redirigimos a login con mensaje
      if (!this.authCore.isAdminSync()) {
        await this.router.navigate(['/admin/login'], { queryParams: { denied: 1 } });
        return;
      }
      await this.router.navigateByUrl('/admin');
    } catch (e: any) {
      const code: string | undefined = e?.code;
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
        this.error.set('Credenciales inválidas. Revisa tu email y contraseña.');
      } else if (code === 'auth/user-not-found') {
        this.error.set('No existe una cuenta con ese email.');
      } else {
        this.error.set(e?.message ?? 'No se pudo iniciar sesión');
      }
    } finally {
      this.loading.set(false);
    }
  }

  ngOnInit() {
    const denied = this.route.snapshot.queryParamMap.get('denied');
    if (denied) this.error.set('Tu cuenta no tiene permisos de administrador.');
  }
}

