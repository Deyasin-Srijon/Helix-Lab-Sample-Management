/**
 * FILE: src/App.jsx
 *
 * PURPOSE:
 * This is the central root component of the Helix Lab Management application.
 * It establishes the top-level React context hierarchy and configures the client-side
 * declarative routing tree using React Router DOM.
 *
 * RESPONSIBILITIES:
 * - Mounts global state providers (`AuthProvider` and `SampleProvider`) so that all
 *   descendant components have access to authentication state and sample data.
 * - Initializes `BrowserRouter` to enable HTML5 browser history manipulation without
 *   full-page reloads.
 * - Declares the route map connecting URL paths to their corresponding page components:
 *   - `/login` -> Public `AdminLoginPage`.
 *   - `/` -> Protected `AdminDashboardPage` (wrapped in `ProtectedRoute`).
 *   - `/samples/:id/edit` -> Protected `EditSamplePage` (wrapped in `ProtectedRoute`).
 *   - `*` -> Catch-all route that redirects any unmatched path back to `/`.
 *
 * ARCHITECTURAL LAYER:
 * Presentation Layer / Application Root & Routing Configuration.
 *
 * CONTEXT PROVIDER HIERARCHY:
 * <AuthProvider>
 *   └── Manages administrator authentication state and backend sessions.
 *   <SampleProvider>
 *     └── Manages laboratory samples list, CRUD methods, filtering, and toast notifications.
 *     <BrowserRouter>
 *       └── Manages URL routing, history, and route parameters.
 *
 * DEPENDENCIES / IMPORTS:
 * - `react-router-dom`:
 *   - `BrowserRouter`: Uses the HTML5 history API to synchronize the UI with the URL.
 *   - `Routes`: Container for a nested tree of `<Route>` elements.
 *   - `Route`: Maps a URL path pattern to a React element.
 *   - `Navigate`: Declarative redirect component used for catch-all redirection.
 * - `./components/ProtectedRoute.jsx`: Higher-order route guard checking authentication.
 * - `./context/AuthContext.jsx`: Global authentication state provider (`AuthProvider`).
 * - `./context/SampleContext.jsx`: Global sample state & operations provider (`SampleProvider`).
 * - `./pages/AdminLoginPage.jsx`: Sign-in screen for lab administrators.
 * - `./pages/AdminDashboardPage.jsx`: Main administrative view displaying samples, stats, and filters.
 * - `./pages/EditSamplePage.jsx`: Form screen for editing an existing sample's details.
 *
 * CONSUMED BY:
 * - `src/main.jsx` (rendered directly inside React's DOM root).
 *
 * EXPORTS:
 * - `default function App()`: The top-level React component.
 */

import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SampleProvider, useSamples } from './context/SampleContext';
import Toast from './components/Toast';
import { checkBackend } from './services/healthService';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminLoginPage from './pages/AdminLoginPage';
import EditSamplePage from './pages/EditSamplePage';

/**
 * Checks backend availability once whenever the admin website is loaded.
 * This mirrors the user frontend's startup health check by requesting GET /api/health.
 * The authentication toast host is global, so the warning is visible on every route,
 * including the login page.
 */
function BackendAvailabilityChecker() {
  const { showToast } = useAuth();

  useEffect(() => {
    let cancelled = false;

    async function checkServer() {
      try {
        await checkBackend();
      } catch {
        if (!cancelled) {
          showToast(
            'Backend is not connected. Please start the Spring Boot server and try again.',
            'error'
          );
        }
      }
    }

    checkServer();

    return () => {
      cancelled = true;
    };
  }, [showToast]);

  return null;
}


/**
 * Displays login/logout notifications outside the route pages.
 * This keeps the toast visible while login/logout redirects are happening.
 */
function AuthenticationToast() {
  const { toast, clearToast } = useAuth();

  return <Toast toast={toast} onClose={clearToast} />;
}

/**
 * App Component
 *
 * The root component that stitches together state management and client-side routing.
 *
 * DESIGN DECISIONS:
 * 1. Provider Nesting Order:
 *    `AuthProvider` is placed on the outside because authentication is the most fundamental
 *    application state. `SampleProvider` is placed inside `AuthProvider`, allowing sample
 *    operations to access auth credentials if needed in future extensions.
 * 2. Protected Routes:
 *    Routes that require administrator authorization are wrapped in `<ProtectedRoute>`,
 *    which inspects `AuthContext`. If the user is unauthenticated, they are seamlessly
 *    redirected to `/login`.
 * 3. Wildcard Redirection:
 *    The `<Route path="*" element={<Navigate to="/" replace />} />` acts as a 404 guard,
 *    redirecting any mistyped or unrecognized URL to the home dashboard.
 *
 * @returns {JSX.Element} The composed application component tree.
 */
export default function App() {
  return (
    /* Provides authentication state (login, logout, isAuthenticated, username) */
    <AuthProvider>
      {/* Provides sample data state (samples list, CRUD actions, statistics, toast alerts) */}
      <SampleProvider>
        <AuthenticationToast />
        <BackendAvailabilityChecker />
        {/* Enables HTML5 history API client-side routing */}
        <BrowserRouter>
          <Routes>
            {/* Public route: Administrator login page */}
            <Route path="/login" element={<AdminLoginPage />} />

            {/* Protected route: Main dashboard showing stats, filter pills, and sample table */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Protected route: Edit sample form, accepting dynamic URL parameter :id */}
            <Route
              path="/samples/:id/edit"
              element={
                <ProtectedRoute>
                  <EditSamplePage />
                </ProtectedRoute>
              }
            />

            {/* Catch-all fallback route: Redirect any unknown path to the home dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SampleProvider>
    </AuthProvider>
  );
}
