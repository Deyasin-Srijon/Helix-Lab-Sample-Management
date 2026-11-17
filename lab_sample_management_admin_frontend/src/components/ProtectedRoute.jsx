/**
 * FILE: src/components/ProtectedRoute.jsx
 *
 * PURPOSE:
 * A security route-guard wrapper component. It intercepts navigation attempts to private
 * routes, checks administrator authentication status via `AuthContext`, and redirects
 * unauthenticated visitors to the `/login` route.
 *
 * RESPONSIBILITIES:
 * - Displays a loading spinner while the initial backend session verification is in progress.
 * - Checks whether an administrator session is currently active (`isAuthenticated`).
 * - Allows authenticated requests to pass through and render child page components.
 * - Enforces redirection to `/login` using React Router's `<Navigate replace />` when unauthenticated.
 *
 * ARCHITECTURAL LAYER:
 * Routing & Authorization Layer (Route Guard / Higher-Order Component).
 *
 * DATA FLOW:
 * App.jsx (Routes table)
 *   → Evaluates <Route element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />
 *   → ProtectedRoute calls useAuth()
 *   → If loading === true:
 *       Renders <LoadingSpinner label="Verifying session..." />
 *   → If isAuthenticated === false:
 *       Renders <Navigate to="/login" replace />
 *   → If isAuthenticated === true:
 *       Renders <AdminDashboardPage /> or other child components normally.
 *
 * DEPENDENCIES / IMPORTS:
 * - `react-router-dom`: `Navigate` component for declarative client-side redirection.
 * - `../context/AuthContext.jsx`: Provides `useAuth` hook to query authentication state.
 * - `./LoadingSpinner.jsx`: Displays loading feedback during initial session check.
 *
 * CONSUMED BY:
 * - `src/App.jsx` (wraps `/` and `/samples/:id/edit` routes).
 *
 * EXPORTS:
 * - `default function ProtectedRoute({ children })`: The route guard component.
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

/**
 * ProtectedRoute Component
 *
 * Wraps protected views to ensure only authenticated administrators can view them.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - The protected page component(s) to render if authenticated.
 * @returns {JSX.Element} The child components, loading spinner, or a redirect to the login screen.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // Await initial session check against the backend before deciding whether to redirect
  if (loading) {
    return <LoadingSpinner label="Verifying session..." />;
  }

  // If unauthenticated, redirect to /login and replace the history entry
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the protected children
  return children;
}
