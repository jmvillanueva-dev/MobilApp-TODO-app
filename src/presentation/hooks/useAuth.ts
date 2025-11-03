import { useState, useEffect, useCallback } from "react";
import { container } from "@/src/di/container";
import { User } from "@/src/domain/entities/User";
import  { AuthContextType } from "../contexts/AuthContext";

export const useAuth = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Limpiar errores
  const clearError = useCallback(() => setError(null), []);

  // Observar cambios de autenticación
  useEffect(() => {
    const unsubscribe = container.authRepository.onAuthStateChanged(
      (authUser) => {
        setUser(authUser);
        setLoading(false);
        setError(null);
      }
    );

    return () => unsubscribe();
  }, []);

  // Registrar usuario
  const register = useCallback(
    async (
      email: string,
      password: string,
      displayName: string
    ): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);
        const newUser = await container.registerUser.execute(
          email,
          password,
          displayName
        );
        setUser(newUser);
        return true;
      } catch (err: any) {
        setError(err.message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Login
  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      try {
        setLoading(true);
        setError(null);
        const loggedUser = await container.loginUser.execute(email, password);
        setUser(loggedUser);
        return true;
      } catch (err: any) {
        setError(err.message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Logout
  const logout = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await container.logoutUser.execute();
      setUser(null);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actualizar perfil - ESTA ES LA CLAVE
  const updateProfile = useCallback(
    async (displayName: string): Promise<boolean> => {
      if (!user) return false;

      try {
        setLoading(true);
        setError(null);

        // Ejecutar el caso de uso
        await container.updateProfile.execute(user.id, { displayName });

        // 🔥 ACTUALIZAR EL ESTADO LOCAL INMEDIATAMENTE
        // Esto asegura que todos los componentes vean el cambio al instante
        setUser((prevUser) => (prevUser ? { ...prevUser, displayName } : null));

        return true;
      } catch (err: any) {
        setError(err.message);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  return {
    user,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    clearError,
    isAuthenticated: !!user,
  };
};
