import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import * as authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const restoreUser = async () => {
      try {
        const user =
          await authService.getCurrentUser();

        if (cancelled) {
          return;
        }

        setCurrentUser(user || null);
      } catch {
        if (!cancelled) {
          setCurrentUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsReady(true);
        }
      }
    };

    restoreUser();

    return () => {
      cancelled = true;
    };
  }, []);

  const register = useCallback(
    async ({
      username,
      email,
      password,
      phone,
    }) => {
      const result =
        await authService.register({
          username,
          email,
          password,
          phone,
        });

      if (result.success) {
        setCurrentUser(result.user);
      }

      return result;
    },
    []
  );

  const login = useCallback(
    async ({ email, password }) => {
      const result =
        await authService.login({
          email,
          password,
        });

      if (result.success) {
        setCurrentUser(result.user);
      }

      return result;
    },
    []
  );

  const logout = useCallback(async () => {
    const result =
      await authService.logout();

    if (result.success) {
      setCurrentUser(null);
    }

    return result;
  }, []);

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated:
        Boolean(currentUser),
      isReady,
      register,
      login,
      logout,
    }),
    [
      currentUser,
      isReady,
      register,
      login,
      logout,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within AuthProvider'
    );
  }

  return context;
}