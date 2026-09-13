import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthCard from '../components/AuthCard';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  TOAST_MESSAGES,
  TOAST_TYPES,
} from '../utils/constants';

const GENERIC_REQUEST_ERROR =
  "We couldn't complete your request right now. Please try again later.";

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [submitting, setSubmitting] = useState(false);

  const { login, register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (credentials) => {
    setSubmitting(true);

    try {
      const result = await login(credentials);

      if (!result.success) {
        showToast(
          result.error || GENERIC_REQUEST_ERROR,
          TOAST_TYPES.ERROR
        );

        return;
      }

      showToast(
        TOAST_MESSAGES.loginSuccess(
          result.user.username
        ),
        TOAST_TYPES.SUCCESS
      );

      navigate('/dashboard', {
        replace: true,
      });
    } catch {
      showToast(
        GENERIC_REQUEST_ERROR,
        TOAST_TYPES.ERROR
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (payload) => {
    setSubmitting(true);

    try {
      const result = await register(payload);

      if (!result.success) {
        showToast(
          result.error || GENERIC_REQUEST_ERROR,
          TOAST_TYPES.ERROR
        );

        return;
      }

      showToast(
        TOAST_MESSAGES.registerSuccess(
          result.user.username
        ),
        TOAST_TYPES.SUCCESS
      );

      navigate('/dashboard', {
        replace: true,
      });
    } catch {
      showToast(
        GENERIC_REQUEST_ERROR,
        TOAST_TYPES.ERROR
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-dvh overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(5,150,105,0.16),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.16),transparent_28%)]" />

      <div className="relative mx-auto flex min-h-dvh max-w-6xl items-center justify-center px-4 py-10">
        <AuthCard
          title={
            mode === 'login'
              ? 'Sign in'
              : 'Create account'
          }
          subtitle={
            mode === 'login'
              ? 'Access the laboratory sample workspace.'
              : 'Register to start tracking laboratory samples.'
          }
        >
          {mode === 'login' ? (
            <LoginForm
              onSubmit={handleLogin}
              submitting={submitting}
            />
          ) : (
            <RegisterForm
              onSubmit={handleRegister}
              submitting={submitting}
            />
          )}

          <p className="mt-6 text-center text-sm text-slate-600">
            {mode === 'login'
              ? 'Need an account?'
              : 'Already registered?'}
            {' '}
            <button
              type="button"
              className="min-h-11 cursor-pointer px-1 font-semibold text-primary hover:underline"
              onClick={() =>
                setMode(
                  mode === 'login'
                    ? 'register'
                    : 'login'
                )
              }
            >
              {mode === 'login'
                ? 'Register'
                : 'Sign in'}
            </button>
          </p>
        </AuthCard>
      </div>
    </div>
  );
}