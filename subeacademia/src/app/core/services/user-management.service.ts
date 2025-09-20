import { Injectable, PLATFORM_ID, Inject, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, BehaviorSubject, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Auth, createUserWithEmailAndPassword, updateProfile } from '@angular/fire/auth';
import { 
  AppUser, 
  UserRole, 
  UserStatus, 
  CreateUserRequest, 
  UpdateUserRequest, 
  DEFAULT_PERMISSIONS,
  isSuperUser 
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private readonly STORAGE_KEY = 'subeacademia_users';
  private usersSubject = new BehaviorSubject<AppUser[]>([]);
  public users$ = this.usersSubject.asObservable();
  private auth = inject(Auth);

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    this.initializeUsers();
  }

  private initializeUsers(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const stored = localStorage.getItem(this.STORAGE_KEY);
    let users: AppUser[] = [];

    if (stored) {
      try {
        users = JSON.parse(stored);
        // Convertir fechas de string a Date
        users = users.map(user => ({
          ...user,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt),
          lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt) : undefined
        }));
      } catch (error) {
        console.error('Error parsing stored users:', error);
        users = [];
      }
    }

    // Si no hay usuarios, crear el superadministrador por defecto
    if (users.length === 0) {
      const superAdmin: AppUser = {
        id: 'super_admin_001',
        email: 'bruno@subeia.tech',
        displayName: 'Bruno Villalobos',
        photoURL: 'https://placehold.co/150x150/1e293b/ffffff?text=BV',
        role: 'superadmin',
        status: 'active',
        permissions: DEFAULT_PERMISSIONS.superadmin,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'system'
      };
      users = [superAdmin];
      this.saveUsers(users);
    }

    this.usersSubject.next(users);
  }

  private saveUsers(users: AppUser[]): void {
    if (!isPlatformBrowser(this.platformId)) return;
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Error saving users:', error);
    }
  }

  // Obtener todos los usuarios
  getUsers(): Observable<AppUser[]> {
    return this.users$;
  }

  // Obtener usuario por ID
  getUserById(id: string): Observable<AppUser | undefined> {
    return this.users$.pipe(
      map(users => users.find(user => user.id === id))
    );
  }

  // Obtener usuario por email
  getUserByEmail(email: string): Observable<AppUser | undefined> {
    return this.users$.pipe(
      map(users => users.find(user => user.email === email))
    );
  }

  // Crear nuevo usuario
  createUser(request: CreateUserRequest, createdBy: string): Observable<AppUser> {
    return from(this.performCreateUser(request, createdBy));
  }

  private async performCreateUser(request: CreateUserRequest, createdBy: string): Promise<AppUser> {
    const users = this.usersSubject.value;
    
    // Verificar que el email no exista
    if (users.some(user => user.email === request.email)) {
      throw new Error('Ya existe un usuario con este email');
    }

    try {
      // Crear usuario en Firebase Authentication
      console.log('🔐 Creando usuario en Firebase Auth:', request.email);
      const userCredential = await createUserWithEmailAndPassword(
        this.auth, 
        request.email, 
        request.password
      );

      // Actualizar el perfil del usuario en Firebase
      await updateProfile(userCredential.user, {
        displayName: request.displayName
      });

      console.log('✅ Usuario creado en Firebase Auth:', userCredential.user.uid);

      // Crear registro en nuestro sistema local
      const newUser: AppUser = {
        id: userCredential.user.uid, // Usar el UID de Firebase
        email: request.email,
        displayName: request.displayName,
        photoURL: userCredential.user.photoURL || undefined,
        role: request.role,
        status: 'active',
        permissions: request.permissions || DEFAULT_PERMISSIONS[request.role],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy
      };

      const updatedUsers = [...users, newUser];
      this.saveUsers(updatedUsers);
      this.usersSubject.next(updatedUsers);

      console.log('✅ Usuario registrado en sistema local:', newUser);
      return newUser;

    } catch (firebaseError: any) {
      console.error('❌ Error creando usuario en Firebase:', firebaseError);
      
      // Traducir errores de Firebase a mensajes más amigables
      let errorMessage = 'Error al crear el usuario';
      
      if (firebaseError.code === 'auth/email-already-in-use') {
        errorMessage = 'Ya existe un usuario registrado con este email';
      } else if (firebaseError.code === 'auth/weak-password') {
        errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      } else if (firebaseError.code === 'auth/invalid-email') {
        errorMessage = 'El formato del email no es válido';
      } else if (firebaseError.message) {
        errorMessage = firebaseError.message;
      }
      
      throw new Error(errorMessage);
    }
  }

  // Actualizar usuario
  updateUser(id: string, request: UpdateUserRequest, updatedBy: string): Observable<AppUser> {
    return from(this.performUpdateUser(id, request, updatedBy));
  }

  private async performUpdateUser(id: string, request: UpdateUserRequest, updatedBy: string): Promise<AppUser> {
    const users = this.usersSubject.value;
    const userIndex = users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      throw new Error('Usuario no encontrado');
    }

    const currentUser = users[userIndex];
    
    // No permitir cambiar el rol del superusuario principal
    if (isSuperUser(currentUser.email) && request.role && request.role !== 'superadmin') {
      throw new Error('No se puede cambiar el rol del superadministrador principal');
    }

    // Actualizar usuario
    const updatedUser: AppUser = {
      ...currentUser,
      displayName: request.displayName || currentUser.displayName,
      role: request.role || currentUser.role,
      status: request.status || currentUser.status,
      permissions: request.permissions || (request.role ? DEFAULT_PERMISSIONS[request.role] : currentUser.permissions),
      updatedAt: new Date()
    };

    const updatedUsers = [...users];
    updatedUsers[userIndex] = updatedUser;
    
    this.saveUsers(updatedUsers);
    this.usersSubject.next(updatedUsers);

    console.log('✅ Usuario actualizado:', updatedUser);
    return updatedUser;
  }

  // Eliminar usuario
  deleteUser(id: string, deletedBy: string): Observable<boolean> {
    return from(this.performDeleteUser(id, deletedBy));
  }

  private async performDeleteUser(id: string, deletedBy: string): Promise<boolean> {
    const users = this.usersSubject.value;
    const user = users.find(u => u.id === id);
    
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // No permitir eliminar el superusuario principal
    if (isSuperUser(user.email)) {
      throw new Error('No se puede eliminar el superadministrador principal');
    }

    const updatedUsers = users.filter(u => u.id !== id);
    this.saveUsers(updatedUsers);
    this.usersSubject.next(updatedUsers);

    console.log('✅ Usuario eliminado:', user.email);
    return true;
  }

  // Cambiar estado de usuario
  changeUserStatus(id: string, status: UserStatus, changedBy: string): Observable<AppUser> {
    return this.updateUser(id, { status }, changedBy);
  }

  // Registrar último login
  updateLastLogin(email: string): Observable<AppUser | null> {
    return from(this.performUpdateLastLogin(email));
  }

  private async performUpdateLastLogin(email: string): Promise<AppUser | null> {
    const users = this.usersSubject.value;
    const userIndex = users.findIndex(user => user.email === email);
    
    if (userIndex === -1) {
      console.warn('⚠️ Usuario no encontrado para actualizar último login:', email);
      return null;
    }

    const now = new Date();
    const updatedUser: AppUser = {
      ...users[userIndex],
      lastLoginAt: now,
      updatedAt: now
    };

    const updatedUsers = [...users];
    updatedUsers[userIndex] = updatedUser;
    
    this.saveUsers(updatedUsers);
    this.usersSubject.next(updatedUsers);

    console.log('✅ Último login actualizado para:', email, 'a las', now.toLocaleString());
    return updatedUser;
  }

  // Obtener estadísticas de usuarios
  getUserStats(): Observable<{
    total: number;
    active: number;
    inactive: number;
    suspended: number;
    byRole: Record<UserRole, number>;
  }> {
    return this.users$.pipe(
      map(users => {
        const stats = {
          total: users.length,
          active: users.filter(u => u.status === 'active').length,
          inactive: users.filter(u => u.status === 'inactive').length,
          suspended: users.filter(u => u.status === 'suspended').length,
          byRole: {
            superadmin: users.filter(u => u.role === 'superadmin').length,
            admin: users.filter(u => u.role === 'admin').length,
            usuario: users.filter(u => u.role === 'usuario').length
          } as Record<UserRole, number>
        };
        return stats;
      })
    );
  }
}
