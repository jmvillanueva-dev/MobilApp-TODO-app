import React, { createContext, useContext, ReactNode } from "react";
import { User } from "@/src/domain/entities/User";

// Estado de autenticación
interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Acciones disponibles
interface AuthActions {
  register: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
  updateProfile: (displayName: string) => Promise<boolean>;
  clearError: () => void;
}

// Context completo
export interface AuthContextType extends AuthState, AuthActions {
  isAuthenticated: boolean;
}

// Context inicial
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props del provider
interface AuthProviderProps {
  children: ReactNode;
  useAuthHook: () => AuthContextType;
}

// Provider component (inyectamos el hook para mejor testabilidad)
export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  useAuthHook,
}) => {
  const auth = useAuthHook();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

// Hook para usar el contexto
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};



