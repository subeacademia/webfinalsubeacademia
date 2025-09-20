import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { UserManagementService } from '../../core/services/user-management.service';
import { AuthCoreService } from '../../core/auth-core.service';
import { ToastService } from '../../core/services/ui/toast/toast.service';
import { 
  AppUser, 
  UserRole, 
  UserStatus, 
  CreateUserRequest, 
  UpdateUserRequest,
  hasPermission,
  isSuperUser
} from '../../core/models/user.model';

@Component({
  selector: 'app-users-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-semibold text-gray-800 dark:text-white">👥 Gestión de Usuarios</h1>
        <button 
          *ngIf="canManageUsers()"
          class="btn btn-primary"
          (click)="showCreateModal = true">
          ➕ Nuevo Usuario
        </button>
      </div>

      <!-- Estadísticas -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6" *ngIf="stats()">
        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div class="text-2xl font-bold text-blue-600">{{ stats()!.total }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Total Usuarios</div>
        </div>
        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div class="text-2xl font-bold text-green-600">{{ stats()!.active }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Activos</div>
        </div>
        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div class="text-2xl font-bold text-yellow-600">{{ stats()!.byRole.admin }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Administradores</div>
        </div>
        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div class="text-2xl font-bold text-purple-600">{{ stats()!.byRole.usuario }}</div>
          <div class="text-sm text-gray-600 dark:text-gray-400">Usuarios</div>
        </div>
      </div>

      <!-- Tabla de usuarios -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Usuario
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Rol
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Estado
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Último Login
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr *ngFor="let user of users(); trackBy: trackByUserId">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <img class="h-10 w-10 rounded-full" [src]="user.photoURL || getDefaultAvatar(user.displayName)" [alt]="user.displayName">
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900 dark:text-white">{{ user.displayName }}</div>
                      <div class="text-sm text-gray-500 dark:text-gray-400">{{ user.email }}</div>
                      <div *ngIf="isSuperUser(user.email)" class="text-xs text-purple-600 font-semibold">👑 SUPERADMIN</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full" 
                        [ngClass]="getRoleClass(user.role)">
                    {{ getRoleLabel(user.role) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                        [ngClass]="getStatusClass(user.status)">
                    {{ getStatusLabel(user.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ user.lastLoginAt ? (user.lastLoginAt | date:'short') : 'Nunca' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-2">
                    <button 
                      *ngIf="canEditUser(user)"
                      class="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                      (click)="editUser(user)">
                      ✏️ Editar
                    </button>
                    <button 
                      *ngIf="canDeleteUser(user)"
                      class="text-red-600 hover:text-red-900 dark:text-red-400"
                      (click)="confirmDelete(user)">
                      🗑️ Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal de crear/editar usuario -->
      <div *ngIf="showCreateModal || showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
          <h3 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            {{ showCreateModal ? '➕ Crear Usuario' : '✏️ Editar Usuario' }}
          </h3>
          
          <form [formGroup]="userForm" (ngSubmit)="saveUser()">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input 
                  type="email" 
                  class="w-full ui-input"
                  formControlName="email"
                  [readonly]="showEditModal"
                  placeholder="usuario@ejemplo.com">
                <div *ngIf="userForm.get('email')?.errors?.['required'] && userForm.get('email')?.touched" 
                     class="text-red-500 text-xs mt-1">
                  El email es requerido
                </div>
                <div *ngIf="userForm.get('email')?.errors?.['email'] && userForm.get('email')?.touched" 
                     class="text-red-500 text-xs mt-1">
                  El email no es válido
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre
                </label>
                <input 
                  type="text" 
                  class="w-full ui-input"
                  formControlName="displayName"
                  placeholder="Nombre completo">
                <div *ngIf="userForm.get('displayName')?.errors?.['required'] && userForm.get('displayName')?.touched" 
                     class="text-red-500 text-xs mt-1">
                  El nombre es requerido
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rol
                </label>
                <select class="w-full ui-input" formControlName="role">
                  <option value="usuario">Usuario</option>
                  <option value="admin">Administrador</option>
                  <option *ngIf="isSuperAdmin()" value="superadmin">Superadministrador</option>
                </select>
              </div>

              <div *ngIf="showEditModal">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Estado
                </label>
                <select class="w-full ui-input" formControlName="status">
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                  <option value="suspended">Suspendido</option>
                </select>
              </div>
            </div>

            <div class="flex justify-end space-x-3 mt-6">
              <button 
                type="button" 
                class="btn btn-secondary"
                (click)="cancelEdit()">
                Cancelar
              </button>
              <button 
                type="submit" 
                class="btn btn-primary"
                [disabled]="userForm.invalid || saving()">
                {{ saving() ? 'Guardando...' : 'Guardar' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal de confirmación de eliminación -->
      <div *ngIf="showDeleteModal && userToDelete" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
          <h3 class="text-lg font-semibold mb-4 text-red-600">🗑️ Confirmar Eliminación</h3>
          <p class="text-gray-700 dark:text-gray-300 mb-6">
            ¿Estás seguro de que deseas eliminar al usuario <strong>{{ userToDelete.displayName }}</strong> ({{ userToDelete.email }})?
          </p>
          <p class="text-sm text-red-600 mb-6">
            Esta acción no se puede deshacer.
          </p>
          <div class="flex justify-end space-x-3">
            <button 
              type="button" 
              class="btn btn-secondary"
              (click)="cancelDelete()">
              Cancelar
            </button>
            <button 
              type="button" 
              class="btn btn-danger"
              (click)="deleteUser()"
              [disabled]="deleting()">
              {{ deleting() ? 'Eliminando...' : 'Eliminar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .btn {
      @apply px-4 py-2 rounded-lg font-medium transition-colors;
    }
    .btn-primary {
      @apply bg-blue-600 text-white hover:bg-blue-700;
    }
    .btn-secondary {
      @apply bg-gray-300 text-gray-700 hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500;
    }
    .btn-danger {
      @apply bg-red-600 text-white hover:bg-red-700;
    }
    .ui-input {
      @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white;
    }
  `]
})
export class UsersManagementComponent implements OnInit, OnDestroy {
  private userManagement = inject(UserManagementService);
  private auth = inject(AuthCoreService);
  private toast = inject(ToastService);
  private fb = inject(FormBuilder);
  private destroy$ = new Subject<void>();

  users = signal<AppUser[]>([]);
  stats = signal<any>(null);
  currentUser = signal<AppUser | null>(null);
  
  showCreateModal = false;
  showEditModal = false;
  showDeleteModal = false;
  userToDelete: AppUser | null = null;
  editingUser: AppUser | null = null;
  
  saving = signal(false);
  deleting = signal(false);

  userForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    displayName: ['', Validators.required],
    role: ['usuario' as UserRole, Validators.required],
    status: ['active' as UserStatus]
  });

  ngOnInit(): void {
    this.loadUsers();
    this.loadStats();
    this.loadCurrentUser();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUsers(): void {
    this.userManagement.getUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe(users => {
        this.users.set(users);
      });
  }

  private loadStats(): void {
    this.userManagement.getUserStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe(stats => {
        this.stats.set(stats);
      });
  }

  private loadCurrentUser(): void {
    this.auth.authState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(authUser => {
        if (authUser?.email) {
          this.userManagement.getUserByEmail(authUser.email)
            .pipe(takeUntil(this.destroy$))
            .subscribe(user => {
              this.currentUser.set(user || null);
              // Refrescar la lista de usuarios cuando cambia el usuario actual
              // para mostrar el último login actualizado
              setTimeout(() => {
                this.loadUsers();
              }, 100);
            });
        }
      });
  }

  trackByUserId(index: number, user: AppUser): string {
    return user.id;
  }

  getDefaultAvatar(name: string): string {
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
    return `https://placehold.co/150x150/4F46E5/FFFFFF?text=${initials}`;
  }

  getRoleClass(role: UserRole): string {
    const classes = {
      superadmin: 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100',
      admin: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100',
      usuario: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };
    return classes[role];
  }

  getRoleLabel(role: UserRole): string {
    const labels = {
      superadmin: '👑 Superadmin',
      admin: '🛡️ Admin',
      usuario: '👤 Usuario'
    };
    return labels[role];
  }

  getStatusClass(status: UserStatus): string {
    const classes = {
      active: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
      inactive: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100',
      suspended: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
    };
    return classes[status];
  }

  getStatusLabel(status: UserStatus): string {
    const labels = {
      active: '✅ Activo',
      inactive: '⏸️ Inactivo',
      suspended: '🚫 Suspendido'
    };
    return labels[status];
  }

  isSuperUser(email: string): boolean {
    return isSuperUser(email);
  }

  isSuperAdmin(): boolean {
    return this.currentUser()?.role === 'superadmin';
  }

  canManageUsers(): boolean {
    const user = this.currentUser();
    return user ? hasPermission(user, 'users', 'create') : false;
  }

  canEditUser(user: AppUser): boolean {
    const currentUser = this.currentUser();
    if (!currentUser) return false;
    
    // Superadmin puede editar a todos excepto a sí mismo si es el principal
    if (currentUser.role === 'superadmin') {
      return !isSuperUser(user.email) || currentUser.email === user.email;
    }
    
    // Admin puede editar usuarios normales
    if (currentUser.role === 'admin') {
      return user.role === 'usuario';
    }
    
    return false;
  }

  canDeleteUser(user: AppUser): boolean {
    const currentUser = this.currentUser();
    if (!currentUser) return false;
    
    // No se puede eliminar el superusuario principal
    if (isSuperUser(user.email)) return false;
    
    // No se puede eliminar a sí mismo
    if (currentUser.email === user.email) return false;
    
    return hasPermission(currentUser, 'users', 'delete');
  }

  editUser(user: AppUser): void {
    this.editingUser = user;
    this.userForm.patchValue({
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      status: user.status
    });
    this.showEditModal = true;
  }

  confirmDelete(user: AppUser): void {
    this.userToDelete = user;
    this.showDeleteModal = true;
  }

  async saveUser(): Promise<void> {
    if (this.userForm.invalid) return;

    const formValue = this.userForm.value;
    const currentUser = this.currentUser();
    if (!currentUser) return;

    this.saving.set(true);

    try {
      if (this.showCreateModal) {
        // Crear usuario
        const request: CreateUserRequest = {
          email: formValue.email!,
          displayName: formValue.displayName!,
          role: formValue.role as UserRole
        };

        await this.userManagement.createUser(request, currentUser.id).toPromise();
        this.toast.success('Usuario creado correctamente');
      } else if (this.showEditModal && this.editingUser) {
        // Actualizar usuario
        const request: UpdateUserRequest = {
          displayName: formValue.displayName!,
          role: formValue.role as UserRole,
          status: formValue.status as UserStatus
        };

        await this.userManagement.updateUser(this.editingUser.id, request, currentUser.id).toPromise();
        this.toast.success('Usuario actualizado correctamente');
      }

      this.cancelEdit();
    } catch (error: any) {
      console.error('Error saving user:', error);
      this.toast.error(error.message || 'Error al guardar el usuario');
    } finally {
      this.saving.set(false);
    }
  }

  async deleteUser(): Promise<void> {
    if (!this.userToDelete) return;

    const currentUser = this.currentUser();
    if (!currentUser) return;

    this.deleting.set(true);

    try {
      await this.userManagement.deleteUser(this.userToDelete.id, currentUser.id).toPromise();
      this.toast.success('Usuario eliminado correctamente');
      this.cancelDelete();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      this.toast.error(error.message || 'Error al eliminar el usuario');
    } finally {
      this.deleting.set(false);
    }
  }

  cancelEdit(): void {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.editingUser = null;
    this.userForm.reset({
      email: '',
      displayName: '',
      role: 'usuario',
      status: 'active'
    });
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.userToDelete = null;
  }
}
