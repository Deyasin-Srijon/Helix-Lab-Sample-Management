/**
 * FILE: src/pages/AdminLoginPage.jsx
 *
 * PURPOSE:
 * Sign-in page for laboratory administrators. It renders a centered login form card,
 * manages controlled inputs for username/email and password, runs validation checks,
 * executes authentication through `AuthContext` (which calls the Spring Boot backend),
 * and redirects authenticated users.
 *
 * RESPONSIBILITIES:
 * - Displays a loading indicator while verifying existing backend session.
 * - Redirects already-authenticated administrators directly to the dashboard (`/`).
 * - Manages controlled component state for form inputs (`username` and `password`).
 * - Executes synchronous input validation using `validateLogin()` from `utils/validation.js`.
 * - Displays inline validation error messages beneath relevant inputs.
 * - Dispatches asynchronous login requests to `AuthContext.login()`.
 * - Displays an accessible alert banner if credentials or backend requests are rejected.
 * - Disables submit button and shows loading state during network transit.
 *
 * ARCHITECTURAL LAYER:
 * Presentation Layer / Page Component (Authentication Controller).
 *
 * AUTHENTICATION EXECUTION FLOW:
 * AdminLoginPage.jsx
 *   → User enters username/email & password
 *   → Form submit triggered -> handleSubmit(event)
 *   → event.preventDefault() suppresses default browser form submission
 *   → validateLogin(username, password)
 *       ├─ If errors found:
 *       │    → setFieldErrors(errors)
 *       │    → execution halts (invalid form)
 *       └─ If fields valid:
 *            → setSubmitting(true)
 *            → login(username, password) [AuthContext -> authService -> Spring Boot API]
 *            ├─ If invalid / error:
 *            │    → returns { success: false, message: '...' }
 *            │    → setAuthError(result.message)
 *            └─ If valid (HTTP 200 with session cookie):
 *                 → setAuth({ isAuthenticated: true, username })
 *                 → React re-renders with isAuthenticated === true
 *                 → <Navigate to="/" replace /> redirects to AdminDashboardPage.
 *
 * DEPENDENCIES / IMPORTS:
 * - `react`: `useState` for local form state.
 * - `react-router-dom`: `Navigate` component for automatic redirection.
 * - `lucide-react`: `FlaskConical` brand icon.
 * - `../components/LoadingSpinner.jsx`: Displays loading state during session check.
 * - `../config/adminConfig.js`: Imports `APP_NAME`.
 * - `../context/AuthContext.jsx`: Provides `useAuth` hook.
 * - `../utils/validation.js`: Provides `validateLogin` and `hasErrors`.
 *
 * CONSUMED BY:
 * - `src/App.jsx` (mounted on the public `/login` route).
 *
 * EXPORTS:
 * - `default function AdminLoginPage()`: The administrator sign-in page component.
 */

import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { FlaskConical } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { APP_NAME } from '../config/adminConfig';
import { useAuth } from '../context/AuthContext';
import { hasErrors, validateLogin } from '../utils/validation';

/**
 * AdminLoginPage Component
 *
 * @returns {JSX.Element} Login form view or automatic redirect if authenticated.
 */
export default function AdminLoginPage() {
  /** Global authentication status and dispatch function from AuthContext */
  const { isAuthenticated, loading, login } = useAuth();

  /** Controlled form state: username or email input */
  const [username, setUsername] = useState('');

  /** Controlled form state: password input */
  const [password, setPassword] = useState('');

  /** Validation error map: `{ username?: string, password?: string }` */
  const [fieldErrors, setFieldErrors] = useState({});

  /** Server / authentication failure message string */
  const [authError, setAuthError] = useState('');

  /** Form submission in-flight state */
  const [submitting, setSubmitting] = useState(false);

  /**
   * If checking session on startup, display loading indicator
   */
  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-100">
        <LoadingSpinner label="Checking session..." />
      </div>
    );
  }

  /**
   * If the administrator is already authenticated, immediately redirect them
   * to the root dashboard ('/') and replace browser history to prevent loops.
   */
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  /**
   * Handles form submission:
   * 1. Prevents default browser reload.
   * 2. Runs client-side validation rules.
   * 3. Calls `login()` on AuthContext asynchronously.
   * 4. Updates error state if credentials fail.
   *
   * @param {React.FormEvent<HTMLFormElement>} event - Form submission event.
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Step 1: Validate username and password presence
    const errors = validateLogin(username, password);
    setFieldErrors(errors);
    setAuthError('');

    // Step 2: Halt if validation errors are detected
    if (hasErrors(errors)) {
      return;
    }

    // Step 3: Attempt authentication through AuthContext (Spring Boot backend)
    setSubmitting(true);
    try {
      const result = await login(username, password);
      if (!result.success) {
        setAuthError(result.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-100 px-4 py-8">
      {/* Centered login modal card */}
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        {/* Brand header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-navy text-blue-200">
            <FlaskConical className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="text-xl font-semibold text-navy">{APP_NAME}</h1>
          <p className="mt-1 text-sm text-slate-500">Administrator sign in</p>
        </div>

        {/* Login form with noValidate to disable inconsistent browser default tooltips */}
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* General authentication error banner */}
          {authError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {authError}
            </div>
          )}

          {/* Username / Email Input Field */}
          <div>
            <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-slate-700">
              Username or Email
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              disabled={submitting}
              className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none transition-shadow duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400"
            />
            {fieldErrors.username && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.username}</p>
            )}
          </div>

          {/* Password Input Field */}
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={submitting}
              className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none transition-shadow duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-400"
            />
            {fieldErrors.password && (
              <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={submitting}
            className="flex h-11 w-full cursor-pointer items-center justify-center rounded-lg bg-blue-600 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
