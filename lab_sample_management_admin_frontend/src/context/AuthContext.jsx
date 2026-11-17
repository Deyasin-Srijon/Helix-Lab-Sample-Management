/**
 * FILE: src/context/AuthContext.jsx
 *
 * PURPOSE:
 * Provides application-wide authentication state management using React Context API.
 * Authentication is fully backend-driven: credentials and session validation rely exclusively
 * on Spring Boot session endpoints (`/api/users/login`, `/api/users/logout`, `/api/users/me`)
 * via secure HttpOnly session cookies (`JSESSIONID`).
 *
 * RESPONSIBILITIES:
 * - Maintains active administrator authentication state in memory via React Context.
 * - On application startup, verifies whether an active session exists by querying the backend.
 * - Dispatches login requests to the backend authentication endpoint.
 * - Dispatches logout requests to the backend and resets in-memory React authentication state.
 * - Exposes `isAuthenticated`, `username`, `loading`, `login`, and `logout` via `useAuth()`.
 * - Strictly avoids any client-side browser storage (no browser-based data persistence, no client-side cookies).
 *
 * ARCHITECTURAL LAYER:
 * State Management Layer (React Context API).
 *
 * AUTHENTICATION DATA FLOW:
 * 1. App Startup:
 *    `AuthProvider` mounts in `App.jsx`
 *      → initiates backend session check: `authService.getCurrentUser()` (GET /api/users/me)
 *      ├─ If session active (HTTP 200) -> sets `isAuthenticated = true, username = user.username`
 *      └─ If unauthenticated (HTTP 401) or network error -> sets `isAuthenticated = false, username = null`
 *      → sets `loading = false`
 * 2. Login Flow:
 *    User submits form on `AdminLoginPage.jsx`
 *      → calls `login(username, password)`
 *      → dispatches `authService.login()` (POST /api/users/login)
 *      ├─ If invalid credentials / error -> returns `{ success: false, message }`
 *      └─ If valid (HTTP 200) -> updates React state to `{ isAuthenticated: true, username }`
 *           → returns `{ success: true }`
 *           → `AdminLoginPage.jsx` redirects to `/`
 * 3. Route Guarding Flow:
 *    User visits protected routes (`/`, `/samples/:id/edit`)
 *      → `ProtectedRoute.jsx` checks `loading` and `isAuthenticated`
 *      → if `loading`: displays accessible loading spinner
 *      → if `!isAuthenticated`: redirects to `/login`
 *      → if authenticated: renders protected view.
 * 4. Logout Flow:
 *    User clicks "Logout" in `Navbar.jsx`
 *      → calls `logout()`
 *      → dispatches `authService.logout()` (POST /api/users/logout)
 *      → resets `auth` state to `{ isAuthenticated: false, username: null }`
 *      → `ProtectedRoute.jsx` immediately redirects to `/login`.
 *
 * DEPENDENCIES / IMPORTS:
 * - `react` (`createContext`, `useCallback`, `useContext`, `useEffect`, `useMemo`, `useState`): Core React APIs.
 * - `../services/authService.js`: Network authentication service communicating with Spring Boot.
 *
 * CONSUMED BY:
 * - `src/App.jsx` (wraps the route tree in `<AuthProvider>`).
 * - `src/components/ProtectedRoute.jsx` (checks `isAuthenticated` and `loading`).
 * - `src/components/Navbar.jsx` (displays administrator username and triggers `logout()`).
 * - `src/pages/AdminLoginPage.jsx` (triggers `login()` and redirects when authenticated).
 *
 * EXPORTS:
 * - `AuthProvider({ children })`: Context provider component.
 * - `useAuth()`: Custom hook returning `{ isAuthenticated, username, loading, login, logout }`.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';

/**
 * React Context object holding authentication state.
 * Defaults to `null` to allow detecting when `useAuth()` is mistakenly called outside `<AuthProvider>`.
 */
const AuthContext = createContext(null);

/**
 * AuthProvider Component
 *
 * Supplies in-memory authentication state and dispatchers to all child components.
 * Restores session on mount by checking the Spring Boot backend session.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child elements requiring access to AuthContext.
 * @returns {JSX.Element} The Context Provider wrapping children.
 */
export function AuthProvider({ children }) {
  /**
   * Main authentication state:
   * - `isAuthenticated` (boolean): Whether an administrator session is currently active.
   * - `username` (string | null): The username or email of the authenticated administrator.
   */
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    username: null,
  });

  /**
   * Indicates whether the initial session check against the backend is still pending.
   * Starts as true on application load; switches to false once the backend responds.
   */
  const [loading, setLoading] = useState(true);

  // Authentication notifications are kept here so they remain visible
  // while React Router changes between the login page and dashboard.
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  }, []);

  const clearToast = useCallback(() => {
    setToast(null);
  }, []);

  /**
   * On initial mount, verifies active session with the Spring Boot backend.
   *
   * WHY THIS IS DONE VIA BACKEND INSTEAD OF BROWSER STORAGE:
   * By querying GET /api/users/me with credentials: 'include', the browser transmits
   * the HttpOnly JSESSIONID cookie. The backend validates the session. If valid,
   * authentication is confirmed; if expired or absent, authentication state remains false.
   */
  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      try {
        const user = await authService.getCurrentUser();
        if (isMounted && user) {
          setAuth({
            isAuthenticated: true,
            username: user.username || user.email || 'Administrator',
          });
        }
      } catch {
        // Backend returned 401 (not logged in) or network error
        if (isMounted) {
          setAuth({
            isAuthenticated: false,
            username: null,
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    checkSession();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Authenticates the administrator against the Spring Boot backend.
   *
   * @param {string} username - User input username or email.
   * @param {string} password - User input password.
   * @returns {Promise<{ success: boolean, message?: string }>} Result indicating success or error reason.
   */
  const login = useCallback(async (username, password) => {
    try {
      const response = await authService.login(username, password);
      const authenticatedUsername =
        response?.username || (username || '').trim() || 'Administrator';

      setAuth({
        isAuthenticated: true,
        username: authenticatedUsername,
      });

      showToast('Login successful. Welcome to the admin panel.', 'success');
      return { success: true };
    } catch (err) {
      const message =
        err.message || 'Invalid username or password. Please verify your credentials.';

      showToast(message, 'error');
      return { success: false, message };
    }
  }, [showToast]);

  /**
   * Logs out the administrator by terminating the session on the Spring Boot backend
   * and resetting in-memory React state.
   */
  const logout = useCallback(async () => {
    let logoutSucceeded = false;

    try {
      await authService.logout();
      logoutSucceeded = true;
    } catch (err) {
      // The local admin state is cleared even if the backend session has expired.
      console.error('Logout error on backend:', err);
    } finally {
      setAuth({ isAuthenticated: false, username: null });

      if (logoutSucceeded) {
        showToast('Logout successful. You have been signed out.', 'success');
      } else {
        showToast('You have been signed out, but the server session could not be confirmed.', 'error');
      }
    }
  }, [showToast]);

  /**
   * Memoize the context value object so consumers only re-render when
   * `auth` or `loading` state actually changes.
   */
  const value = useMemo(
    () => ({
      isAuthenticated: auth.isAuthenticated,
      username: auth.username,
      loading,
      login,
      logout,
      toast,
      showToast,
      clearToast,
    }),
    [auth, loading, login, logout, toast, showToast, clearToast]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom React hook for consuming AuthContext.
 *
 * @returns {{ isAuthenticated: boolean, username: string | null, loading: boolean, login: Function, logout: Function, toast: Object|null, showToast: Function, clearToast: Function }}
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.');
  }
  return context;
}
