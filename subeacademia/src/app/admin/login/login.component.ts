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

        <button mat-stroked-button color="accent" class="w-full mt-2" [disabled]="creating()" (click)="createTestUser()">
          {{ creating() ? 'Creando…' : 'Crear Usuario de Prueba (mario@subeia.tech)' }}
        </button>

        <p *ngIf="error()" class="text-red-400 text-sm text-center">{{ error() }}</p>
        <p *ngIf="success()" class="text-green-400 text-sm text-center">{{ success() }}</p>
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
  creating = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);


  async submit() {
    if (this.form.invalid || this.loading()) return;
    this.error.set(null);
    this.loading.set(true);
    try {
      const { email, password } = this.form.getRawValue();
      await this.authCore.loginWithEmailPassword(email!, password!);
      // Tras login, revalidamos admin de forma síncrona y navegamos
      const isAdmin = this.authCore.isAdminSync();
      await this.router.navigateByUrl(isAdmin ? '/admin' : '/admin/login?denied=1');
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

  async createTestUser() {
    this.creating.set(true);
    this.error.set(null);
    this.success.set(null);
    
    try {
      const { createUserWithEmailAndPassword, updateProfile } = await import('@angular/fire/auth');
      const auth = this.authCore['auth']; // Acceso directo al auth de Firebase
      
      console.log('🔧 Creando usuario de prueba...');
      
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, 'mario@subeia.tech', 'mario123');
      
      // Actualizar perfil
      await updateProfile(userCredential.user, {
        displayName: 'Mario Muñoz'
      });
      
      console.log('✅ Usuario de prueba creado:', userCredential.user.email);
      
      // Crear usuario en el sistema local
      const userManagement = this.authCore['userManagement']; // Acceso al servicio de gestión
      
      const createRequest = {
        email: 'mario@subeia.tech',
        displayName: 'Mario Muñoz',
        password: 'mario123',
        role: 'superadmin' as const
      };
      
      await userManagement.createUser(createRequest, 'system').toPromise();
      
      this.success.set('✅ Usuario de prueba creado exitosamente. Ahora puedes hacer login con mario@subeia.tech / mario123');
      
      // Llenar automáticamente el formulario
      this.form.patchValue({
        email: 'mario@subeia.tech',
        password: 'mario123'
      });
      
    } catch (error: any) {
      console.error('❌ Error creando usuario de prueba:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        this.success.set('✅ El usuario ya existe. Puedes hacer login con mario@subeia.tech / mario123');
        this.form.patchValue({
          email: 'mario@subeia.tech',
          password: 'mario123'
        });
      } else {
        this.error.set('Error creando usuario: ' + (error.message || error.code));
      }
    } finally {
      this.creating.set(false);
    }
  }

  ngOnInit() {
    const denied = this.route.snapshot.queryParamMap.get('denied');
    if (denied) this.error.set('Tu cuenta no tiene permisos de administrador.');
  }
}

