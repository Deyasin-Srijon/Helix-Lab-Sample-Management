import { Navigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import { useAuth } from '../context/AuthContext';

export default function PublicRoute({ children }) {
  const { isAuthenticated, isReady } = useAuth();

  if (!isReady) {
    return (
      <div className="min-h-dvh bg-background">
        <LoadingSpinner label="Restoring session" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
