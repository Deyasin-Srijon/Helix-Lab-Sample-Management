/**
 * FILE: src/components/Navbar.jsx
 *
 * PURPOSE:
 * Top navigation bar displayed across all authenticated administrator pages
 * (e.g., Dashboard, Edit Sample). Provides brand identity, user identification,
 * and session logout capability.
 *
 * RESPONSIBILITIES:
 * - Renders the application logo icon and brand title (`APP_NAME`).
 * - Displays the username of the active administrator retrieved from `AuthContext`.
 * - Provides a "Logout" button that invalidates the session and returns the user to the login page.
 * - Ensures accessibility with semantic `<header>` element, clear focus rings, and proper touch targets.
 *
 * ARCHITECTURAL LAYER:
 * Presentation Layer / Reusable Navigation Component.
 *
 * DATA FLOW:
 * AuthContext.jsx
 *   → supplies { username, logout } via useAuth() hook
 *   → Navbar renders username in header
 *   → User clicks "Logout" button
 *   → invokes logout()
 *   → invalidates backend session and resets auth state
 *   → ProtectedRoute.jsx detects isAuthenticated === false and redirects to /login.
 *
 * DEPENDENCIES / IMPORTS:
 * - `lucide-react`: `FlaskConical` (lab beaker icon), `LogOut` (exit door icon).
 * - `../config/adminConfig.js`: Imports `APP_NAME`.
 * - `../context/AuthContext.jsx`: Imports `useAuth` hook.
 *
 * CONSUMED BY:
 * - `src/pages/AdminDashboardPage.jsx`
 * - `src/pages/EditSamplePage.jsx`
 *
 * EXPORTS:
 * - `default function Navbar()`: The navigation bar component.
 */

import { FlaskConical, LogOut } from 'lucide-react';
import { APP_NAME } from '../config/adminConfig';
import { useAuth } from '../context/AuthContext';

/**
 * Navbar Component
 *
 * Renders the top navigation banner for authenticated administrators.
 *
 * @returns {JSX.Element} Semantic header containing branding, user badge, and logout control.
 */
export default function Navbar() {
  /** Extract authenticated username and logout callback from AuthContext */
  const { username, logout } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* Left section: Lab icon and application branding */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy text-blue-200">
            {/* aria-hidden="true" hides purely decorative icons from screen readers */}
            <FlaskConical className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-navy">{APP_NAME}</p>
            <p className="text-xs text-slate-500">Administrator</p>
          </div>
        </div>

        {/* Right section: Active user name and logout button */}
        <div className="flex items-center gap-3">
          {username && (
            <span className="hidden text-sm text-slate-500 sm:inline">{username}</span>
          )}
          <button
            type="button"
            onClick={logout}
            className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
