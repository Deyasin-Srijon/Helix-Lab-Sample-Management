import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from 'react-router-dom';
import { useEffect } from 'react';

import AppShell from './components/AppShell';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import ToastContainer from './components/ToastContainer';

import { AuthProvider } from './context/AuthContext';
import { SampleProvider } from './context/SampleContext';
import {
  ToastProvider,
  useToast,
} from './context/ToastContext';

import AddSamplePage from './pages/AddSamplePage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import EditSamplePage from './pages/EditSamplePage';
import ViewSamplesPage from './pages/ViewSamplesPage';

import { checkBackend } from './services/healthService';

function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <AppShell>
        <Outlet />
      </AppShell>
    </ProtectedRoute>
  );
}

function BackendAvailabilityChecker() {
  const { showToast } = useToast();

  useEffect(() => {
    let cancelled = false;

    const checkBackendStatus = async () => {
      const result = await checkBackend();

      if (cancelled) {
        return;
      }

      if (!result.success) {
        showToast(
          'The backend service is currently unavailable. Please make sure the Spring Boot server is running.',
          'error'
        );
      }
    };

    checkBackendStatus();

    return () => {
      cancelled = true;
    };
  }, [showToast]);

  return null;
}

function Application() {
  return (
    <ToastProvider>
      <BackendAvailabilityChecker />

      <AuthProvider>
        <SampleProvider>
          <BrowserRouter>
            <Routes>
              <Route
                path="/"
                element={
                  <PublicRoute>
                    <AuthPage />
                  </PublicRoute>
                }
              />

              <Route element={<ProtectedLayout />}>
                <Route
                  path="/dashboard"
                  element={<DashboardPage />}
                />

                <Route
                  path="/add-sample"
                  element={<AddSamplePage />}
                />

                <Route
                  path="/view-samples"
                  element={<ViewSamplesPage />}
                />

                <Route
                  path="/edit-sample/:id"
                  element={<EditSamplePage />}
                />
              </Route>

              <Route
                path="*"
                element={<Navigate to="/" replace />}
              />
            </Routes>
          </BrowserRouter>

          <ToastContainer />
        </SampleProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default function App() {
  return <Application />;
}