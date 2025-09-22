export interface AppUser {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  status: UserStatus;
  permissions: Permission[];
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  createdBy: string; // ID del usuario que lo creó
}

export type UserRole = 'superadmin' | 'admin' | 'usuario';

export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface Permission {
  module: string; // 'posts', 'productos', 'settings', 'users', etc.
  actions: PermissionAction[];
}

export type PermissionAction = 'read' | 'create' | 'update' | 'delete' | 'manage';

export interface CreateUserRequest {
  email: string;
  displayName: string;
  password: string;
  role: UserRole;
  permissions?: Permission[];
}

export interface UpdateUserRequest {
  displayName?: string;
  role?: UserRole;
  status?: UserStatus;
  permissions?: Permission[];
}

// Definición de permisos por rol
export const DEFAULT_PERMISSIONS: Record<UserRole, Permission[]> = {
  superadmin: [
    { module: '*', actions: ['read', 'create', 'update', 'delete', 'manage'] }
  ],
  admin: [
    { module: 'posts', actions: ['read', 'create', 'update', 'delete'] },
    { module: 'productos', actions: ['read', 'create', 'update', 'delete'] },
    { module: 'projects', actions: ['read', 'create', 'update', 'delete'] },
    { module: 'certificados', actions: ['read', 'create', 'update', 'delete'] },
    { module: 'media', actions: ['read', 'create', 'update', 'delete'] },
    { module: 'logos', actions: ['read', 'create', 'update', 'delete'] },
    { module: 'history', actions: ['read', 'create', 'update', 'delete'] },
    { module: 'collaborators', actions: ['read', 'create', 'update', 'delete'] },
    { module: 'leads', actions: ['read'] },
    { module: 'settings', actions: ['read', 'update'] }
  ],
  usuario: [
    { module: 'posts', actions: ['read'] },
    { module: 'productos', actions: ['read'] },
    { module: 'projects', actions: ['read'] },
    { module: 'leads', actions: ['read'] }
  ]
};

// Función para verificar permisos
export function hasPermission(user: AppUser, module: string, action: PermissionAction): boolean {
  // Superadmin siempre tiene todos los permisos
  if (user.role === 'superadmin') return true;
  
  // Verificar permisos específicos
  return user.permissions.some(permission => 
    (permission.module === module || permission.module === '*') &&
    (permission.actions.includes(action) || permission.actions.includes('manage'))
  );
}

// Función para verificar si es el usuario principal (bruno@subeia.tech)
export function isSuperUser(email: string): boolean {
  return email === 'bruno@subeia.tech';
}
