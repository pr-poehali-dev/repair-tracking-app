import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type UserRole = 'director' | 'master' | 'accountant' | 'warranty_manager' | 'parts_manager' | 'reception_manager';

interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (...roles: UserRole[]) => boolean;
}

export type Permission = 
  | 'view_orders'
  | 'create_orders'
  | 'edit_orders'
  | 'delete_orders'
  | 'change_status'
  | 'assign_master'
  | 'view_finance'
  | 'edit_finance'
  | 'view_warranty'
  | 'manage_parts'
  | 'view_all'
  | 'edit_repair'
  | 'create_order'
  | 'manage_device_types'
  | 'view_clients'
  | 'approve_extensions';

const rolePermissions: Record<UserRole, Permission[]> = {
  director: [
    'view_orders', 'create_orders', 'edit_orders', 'delete_orders',
    'change_status', 'assign_master', 'view_finance', 'edit_finance',
    'view_warranty', 'manage_parts', 'view_all', 'edit_repair',
    'create_order', 'manage_device_types', 'view_clients', 'approve_extensions'
  ],
  master: [
    'view_orders', 'change_status', 'view_warranty', 'edit_repair'
  ],
  accountant: [
    'view_orders', 'view_finance', 'edit_finance', 'view_all', 'view_clients'
  ],
  warranty_manager: [
    'view_orders', 'create_orders', 'edit_orders', 'change_status', 'view_warranty',
    'create_order', 'view_clients'
  ],
  parts_manager: [
    'view_orders', 'manage_parts', 'view_all', 'view_clients'
  ],
  reception_manager: [
    'view_orders', 'create_orders', 'edit_orders', 'change_status', 'assign_master',
    'create_order', 'manage_device_types', 'view_clients'
  ],
};

export const roleLabels: Record<UserRole, string> = {
  director: 'Директор',
  master: 'Мастер',
  accountant: 'Бухгалтер',
  warranty_manager: 'Менеджер гарантия',
  parts_manager: 'Менеджер запчасти',
  reception_manager: 'Менеджер приёма',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_API_URL = 'https://functions.poehali.dev/40ac4257-e65a-4139-9f49-415c6ed50616';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(AUTH_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const userData = await response.json();
        const user: User = {
          id: String(userData.id),
          username: userData.username,
          fullName: userData.fullName,
          role: userData.role as UserRole,
        };
        setUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const hasPermission = (permission: Permission): boolean => {
    if (!user) return false;
    const permissions = rolePermissions[user.role] || [];
    return permissions.includes(permission);
  };

  const hasRole = (...roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isAuthenticated: !!user,
      hasPermission,
      hasRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}